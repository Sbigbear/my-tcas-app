import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import SearchClient from './SearchClient'

async function getStudentInfo() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let studentId: string | undefined
    let nationalId: string | undefined

    if (token) {
      try {
        const decoded = jwt.decode(token) as any
        studentId = decoded?.id || decoded?.studentId || decoded?.sub
        nationalId = decoded?.nationalId
      } catch (e) {}
    }

    if (!studentId) {
      studentId =
        cookieStore.get('student_id')?.value ||
        cookieStore.get('studentId')?.value ||
        cookieStore.get('userId')?.value
    }

    const orConditions = [
      studentId ? { Studentsid: studentId } : null,
      nationalId ? { nationalId: nationalId } : null,
    ].filter(Boolean) as any[]

    if (orConditions.length === 0) return null

    return await prisma.student.findFirst({
      where: { OR: orConditions },
      include: {
        tcasScores: true,
      },
    })
  } catch (err) {
    console.error('Fetch student error:', err)
    return null
  }
}

// 📌 ฟังก์ชันประเมินเกณฑ์เหลือ 2 สถานะ: PASSED และ FAILED
function evaluateProgram(student: any, criteria: any): {
  status: 'PASSED' | 'FAILED'
  passedCount: number
  totalCount: number
  failedReasons: string[]
} {
  const scores = student?.tcasScores

  if (!student) {
    return { status: 'FAILED', passedCount: 0, totalCount: 0, failedReasons: ['ไม่มีข้อมูลนักเรียนในระบบ'] }
  }

  let totalReqs = 0
  let passedReqs = 0
  let failedReqs = 0
  const failedReasons: string[] = []

  // 1. ตรวจสอบ GPAX สะสม
  if (criteria.minGpax && criteria.minGpax > 0) {
    totalReqs++
    const studentGpax = student.gpax || 0
    if (studentGpax >= criteria.minGpax) {
      passedReqs++
    } else {
      failedReqs++
      failedReasons.push(`GPAX ไม่ถึงขั้นต่ำ (ต้องการ ${criteria.minGpax.toFixed(2)}, มี ${studentGpax.toFixed(2)})`)
    }
  }

  // 2. ตรวจสอบ GPAX รายกลุ่มสาระ
  const gpaChecks = [
    { key: 'minMathGpa', label: 'GPA คณิตศาสตร์', val: student.mathGpa },
    { key: 'minSciGpa', label: 'GPA วิทยาศาสตร์', val: student.sciGpa },
    { key: 'minEngGpa', label: 'GPA ภาษาอังกฤษ', val: student.engGpa },
    { key: 'minThaiGpa', label: 'GPA ภาษาไทย', val: student.thaiGpa },
    { key: 'minSocialGpa', label: 'GPA สังคมศึกษา', val: student.socialGpa },
    { key: 'minHealthGpa', label: 'GPA สุขศึกษา', val: student.healthGpa },
    { key: 'minArtGpa', label: 'GPA ศิลปะ', val: student.artGpa },
    { key: 'minCareerGpa', label: 'GPA การงานอาชีพ', val: student.careerGpa },
  ]

  gpaChecks.forEach((c) => {
    const targetGpa = criteria[c.key]
    if (targetGpa && targetGpa > 0) {
      totalReqs++
      const currentVal = c.val || 0
      if (currentVal >= targetGpa) {
        passedReqs++
      } else {
        failedReqs++
        failedReasons.push(`${c.label} ไม่ถึงขั้นต่ำ (ต้องการ ${targetGpa.toFixed(2)}, มี ${currentVal.toFixed(2)})`)
      }
    }
  })

  // 3. ตรวจสอบ TGAT
  if (criteria.minTgat && criteria.minTgat > 0) {
    totalReqs++
    const studentTgat = scores?.tgat || 0
    if (studentTgat >= criteria.minTgat) {
      passedReqs++
    } else {
      failedReqs++
      failedReasons.push(`TGAT ไม่ถึงขั้นต่ำ (ต้องการ ${criteria.minTgat.toFixed(2)}, มี ${studentTgat.toFixed(2)})`)
    }
  }

  // 4. ตรวจสอบ TPAT1 - TPAT5
  for (let i = 1; i <= 5; i++) {
    const key = `minTpat${i}`
    const targetTpat = criteria[key]
    if (targetTpat && targetTpat > 0) {
      totalReqs++
      const studentVal = scores?.[`tpat${i}`] || 0
      if (studentVal >= targetTpat) {
        passedReqs++
      } else {
        failedReqs++
        failedReasons.push(`TPAT${i} ไม่ถึงขั้นต่ำ (ต้องการ ${targetTpat.toFixed(2)}, มี ${studentVal.toFixed(2)})`)
      }
    }
  }

  // 5. ตรวจสอบ A-Level
  const alevelChecks = [
    { key: 'minAlevelMath1', label: 'A-Level Math1', valKey: 'alevelMath1' },
    { key: 'minAlevelMath2', label: 'A-Level Math2', valKey: 'alevelMath2' },
    { key: 'minAlevelSci', label: 'A-Level วิทย์ทั่วไป', valKey: 'alevelSci' },
    { key: 'minAlevelPhy', label: 'A-Level ฟิสิกส์', valKey: 'alevelPhy' },
    { key: 'minAlevelChem', label: 'A-Level เคมี', valKey: 'alevelChem' },
    { key: 'minAlevelBio', label: 'A-Level ชีววิทยา', valKey: 'alevelBio' },
    { key: 'minAlevelSoc', label: 'A-Level สังคม', valKey: 'alevelSoc' },
    { key: 'minAlevelThai', label: 'A-Level ภาษาไทย', valKey: 'alevelThai' },
    { key: 'minAlevelEng', label: 'A-Level ภาษาอังกฤษ', valKey: 'alevelEng' },
  ]

  alevelChecks.forEach((al) => {
    const target = criteria[al.key]
    if (target && target > 0) {
      totalReqs++
      const studentVal = scores?.[al.valKey] || 0
      if (studentVal >= target) {
        passedReqs++
      } else {
        failedReqs++
        failedReasons.push(`${al.label} ไม่ถึงขั้นต่ำ (ต้องการ ${target.toFixed(2)}, มี ${studentVal.toFixed(2)})`)
      }
    }
  })

  // 📌 ผ่านทุกข้อ = PASSED / มีไม่ผ่านแม้แต่ข้อเดียว = FAILED
  const status: 'PASSED' | 'FAILED' = failedReqs === 0 ? 'PASSED' : 'FAILED'

  return { status, passedCount: passedReqs, totalCount: totalReqs, failedReasons }
}

export default async function StudentSearchPage() {
  const student = await getStudentInfo()

  if (!student) {
    redirect('/login')
  }

  const allCriteria = await prisma.programCriteria.findMany({
    include: {
      university: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const evaluatedPrograms = allCriteria.map((c: any) => {
    const evalResult = evaluateProgram(student, c)

    return {
      id: c.Program_Criteriaid || c.ProgramCriteriaid || c.id,
      code: c.Program_Criteriaid || '-',
      programName: c.programName || 'ไม่ระบุชื่อหลักสูตร',
      faculty: c.university?.faculty || 'ไม่ระบุคณะ',
      department: c.university?.department || 'ไม่ระบุสาขา',
      campus: c.university?.campus || 'บางเขน',
      universityName: c.university?.name || 'มหาวิทยาลัยเกษตรศาสตร์',
      recruitAmount: c.capacity || 0,
      evalStatus: evalResult.status as 'PASSED' | 'FAILED',
      passedCount: evalResult.passedCount,
      totalCount: evalResult.totalCount,
      failedReasons: evalResult.failedReasons,
    }
  })

  return (
    <SearchClient
      programs={evaluatedPrograms}
      hasScore={!!student.tcasScores || !!student.gpax}
      studentName={student.name || 'นักเรียน'}
    />
  )
}