import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import ReportsClient, { ReportApplication } from './ReportsClient'

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
      where: {
        OR: orConditions,
      },
      include: {
        university: true,
      },
    })

    return user
  } catch (err) {
    console.error('Error fetching teacher info:', err)
    return null
  }
}

export default async function ReportsPage() {
  const teacher = await getTeacherInfo()

  if (!teacher) {
    redirect('/login')
  }

  const universityId = teacher.universityId

  // 📌 กรองเฉพาะผู้สมัครที่อยู่ในสังกัด (universityId) ของอาจารย์คนนี้เท่านั้น
  const applications = universityId
    ? await prisma.application.findMany({
        where: {
          criteria: {
            universityId: universityId,
          },
        },
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
    : []

  // แปลงและวิเคราะห์ข้อมูลผู้สมัครเฉพาะสาขานี้
  const formattedApplications: ReportApplication[] = applications.map((app: any) => {
    const student: any = app.student || {}
    const scores: any = student.tcasScores || {}
    const criteria: any = app.criteria || {}

    // แมปชื่อฟิลด์ให้ตรงตาม Schema D3_Students และ D4_Tcas_Scores
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

    const failedReasons: string[] = []
    const scoreSummary: string[] = []

    for (const cfg of checksConfig) {
      const rawMin = criteria[cfg.minKey]
      if (rawMin !== null && rawMin !== undefined) {
        const minVal = Number(rawMin)
        const rawStudentVal = cfg.getVal()
        const studentVal = rawStudentVal !== null && rawStudentVal !== undefined ? Number(rawStudentVal) : null

        const isFail = studentVal === null || studentVal < minVal

        scoreSummary.push(`${cfg.label}: ${studentVal !== null ? studentVal.toFixed(2) : '-'}`)

        if (isFail) {
          failedReasons.push(
            `${cfg.label} (${studentVal !== null ? studentVal.toFixed(2) : 'ไม่มีข้อมูล'}) ต่ำกว่าขั้นต่ำ (${minVal.toFixed(2)})`
          )
        }
      }
    }

    const isEligible = failedReasons.length === 0 && app.status !== 'CANCELLED'

    return {
      id: app.Applicationsid,
      studentName: student.name || 'ไม่ระบุชื่อ',
      studentCode: student.studentCode || student.nationalId || '-',
      programName: criteria.programName || '-',
      faculty: criteria.university?.faculty || teacher?.university?.faculty || '-',
      department: criteria.university?.department || teacher?.university?.department || '-',
      universityName: criteria.university?.name || teacher?.university?.name || 'มหาวิทยาลัยเกษตรศาสตร์',
      campus: criteria.university?.campus || teacher?.university?.campus || '-',
      gpax: student.gpax ? Number(student.gpax).toFixed(2) : '-',
      tgat: scores.tgat !== null && scores.tgat !== undefined ? Number(scores.tgat).toFixed(2) : '-',
      scoresSummary: scoreSummary.join(', '),
      status: app.status,
      isEligible,
      failedReasons,
      createdAt: new Date(app.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    }
  })

  return (
    <ReportsClient
      applications={formattedApplications}
      teacherName={teacher.name || 'อาจารย์ประจำสาขา'}
      facultyName={teacher.university?.faculty || 'คณะ'}
      departmentName={teacher.university?.department || 'สาขาวิชา'}
      universityName={teacher.university?.name || 'มหาวิทยาลัยเกษตรศาสตร์'}
    />
  )
}