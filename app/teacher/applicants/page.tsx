import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import ApplicantsClient from './ApplicantsClient'

async function getTeacherInfo() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let userEmail: string | undefined
    let userId: string | undefined

    if (token) {
      try {
        const decoded = jwt.decode(token) as any
        if (decoded) {
          userEmail = decoded?.email || decoded?.userEmail
          userId = decoded?.id || decoded?.userId || decoded?.sub
        }
      } catch (e) {
        console.error('JWT Decode Error:', e)
      }
    }

    if (!userEmail) {
      userEmail = cookieStore.get('user_email')?.value || cookieStore.get('email')?.value
    }

    const cookieUserId =
      cookieStore.get('teacher_id')?.value ||
      cookieStore.get('userId')?.value ||
      cookieStore.get('user_id')?.value

    const orConditions = [
      userEmail ? { email: userEmail } : null,
      userId ? { Usersid: userId } : null,
      cookieUserId ? { Usersid: cookieUserId } : null,
    ].filter(Boolean) as any[]

    if (orConditions.length === 0) return null

    const user = await prisma.user.findFirst({
      where: { OR: orConditions },
      select: { Usersid: true, universityId: true, name: true, email: true },
    })

    return user
  } catch (err) {
    console.error('Error fetching teacher session:', err)
    return null
  }
}

function evaluateApplicant(app: any) {
  const student = app.student || {}
  const scores = student.tcasScores || {}
  const criteria = app.criteria || {}

  const checksConfig = [
    { label: 'GPAX', minKey: 'minGpax', getVal: () => student.gpax },
    { label: 'GPA คณิต', minKey: 'minMathGpa', getVal: () => student.mathGpa ?? student.gpaMath },
    { label: 'GPA วิทย์', minKey: 'minSciGpa', getVal: () => student.sciGpa ?? student.gpaSci },
    { label: 'GPA อังกฤษ', minKey: 'minEngGpa', getVal: () => student.engGpa ?? student.gpaEng },
    { label: 'GPA ไทย', minKey: 'minThaiGpa', getVal: () => student.thaiGpa ?? student.gpaThai },
    { label: 'GPA สังคม', minKey: 'minSocialGpa', getVal: () => student.socialGpa ?? student.gpaSocial },
    { label: 'GPA สุขศึกษา', minKey: 'minHealthGpa', getVal: () => student.healthGpa ?? student.gpaHealth },
    { label: 'TGAT', minKey: 'minTgat', getVal: () => scores.tgat },
    { label: 'TPAT1', minKey: 'minTpat1', getVal: () => scores.tpat1 },
    { label: 'TPAT2', minKey: 'minTpat2', getVal: () => scores.tpat2 },
    { label: 'TPAT3', minKey: 'minTpat3', getVal: () => scores.tpat3 },
    { label: 'TPAT4', minKey: 'minTpat4', getVal: () => scores.tpat4 },
    { label: 'TPAT5', minKey: 'minTpat5', getVal: () => scores.tpat5 },
    { label: 'A-Level Math1', minKey: 'minAlevelMath1', getVal: () => scores.alevelMath1 },
    { label: 'A-Level Math2', minKey: 'minAlevelMath2', getVal: () => scores.alevelMath2 },
    { label: 'A-Level วิทย์', minKey: 'minAlevelSci', getVal: () => scores.alevelSci },
    { label: 'A-Level ฟิสิกส์', minKey: 'minAlevelPhy', getVal: () => scores.alevelPhy },
    { label: 'A-Level เคมี', minKey: 'minAlevelChem', getVal: () => scores.alevelChem },
    { label: 'A-Level ชีวะ', minKey: 'minAlevelBio', getVal: () => scores.alevelBio },
    { label: 'A-Level สังคม', minKey: 'minAlevelSoc', getVal: () => scores.alevelSoc },
    { label: 'A-Level ไทย', minKey: 'minAlevelThai', getVal: () => scores.alevelThai },
    { label: 'A-Level อังกฤษ', minKey: 'minAlevelEng', getVal: () => scores.alevelEng },
    { label: 'A-Level ตปท.', minKey: 'minAlevelForeign', getVal: () => scores.alevelForeign },
  ]

  const activeScoreChecks: {
    label: string
    studentVal: number | null
    minVal: number
    isFail: boolean
  }[] = []

  const failedReasons: string[] = []

  for (const cfg of checksConfig) {
    const rawMin = criteria[cfg.minKey]
    if (rawMin !== null && rawMin !== undefined) {
      const minVal = Number(rawMin)
      const rawStudentVal = cfg.getVal()
      const studentVal = rawStudentVal !== null && rawStudentVal !== undefined ? Number(rawStudentVal) : null

      const isFail = studentVal === null || studentVal < minVal

      activeScoreChecks.push({
        label: cfg.label,
        studentVal,
        minVal,
        isFail,
      })

      if (isFail) {
        failedReasons.push(
          `${cfg.label} (${studentVal !== null ? studentVal.toFixed(2) : 'ไม่มีข้อมูล'}) ต่ำกว่าขั้นต่ำ (${minVal.toFixed(2)})`
        )
      }
    }
  }

  return {
    activeScoreChecks,
    failedReasons,
    isEligible: failedReasons.length === 0,
  }
}

export default async function ApplicantsPage() {
  const teacher = await getTeacherInfo()
  const universityId = teacher?.universityId

  const applications = await prisma.application.findMany({
    where: universityId
      ? {
          criteria: {
            universityId: universityId,
          },
        }
      : { Applicationsid: 'no-match' },
    include: {
      student: {
        include: {
          tcasScores: true,
        },
      },
      criteria: {
        include: {
          university: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const formattedApplications = applications.map((app: any) => {
    const evalRes = evaluateApplicant(app)
    const appliedAt =
      new Date(app.createdAt).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' น.'

    return {
      id: app.Applicationsid,
      studentName: app.student?.name || 'ไม่ระบุชื่อ',
      studentCode: app.student?.studentCode || app.student?.nationalId || '-',
      programName: app.criteria?.programName || '-',
      faculty: app.criteria?.university?.faculty || '-',
      department: app.criteria?.university?.department || '-',
      status: app.status,
      appliedAt,
      gpax: app.student?.gpax,
      evalRes,
    }
  })

  return <ApplicantsClient initialApplications={formattedApplications} />
}