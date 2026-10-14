import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

// 📌 ฟังก์ชันคำนวณและประมวลผลคุณสมบัติแบบอัตโนมัติอิงจากเกรดและคะแนนจริง
function evaluateEligibility(student: any, criteria: any) {
  const failedReasons: string[] = []

  // 1. ตรวจสอบเกรดเฉลี่ย (GPA)
  const gpaChecks = [
    { field: 'gpax', minField: 'minGpax', name: 'GPAX' },
    { field: 'mathGpa', minField: 'minMathGpa', name: 'GPA คณิต', altField: 'gpaMath' },
    { field: 'sciGpa', minField: 'minSciGpa', name: 'GPA วิทย์', altField: 'gpaSci' },
    { field: 'engGpa', minField: 'minEngGpa', name: 'GPA อังกฤษ', altField: 'gpaEng' },
    { field: 'thaiGpa', minField: 'minThaiGpa', name: 'GPA ไทย', altField: 'gpaThai' },
    { field: 'socialGpa', minField: 'minSocialGpa', name: 'GPA สังคม', altField: 'gpaSocial' },
    { field: 'healthGpa', minField: 'minHealthGpa', name: 'GPA สุขศึกษา', altField: 'gpaHealth' },
    { field: 'artGpa', minField: 'minArtGpa', name: 'GPA ศิลปะ', altField: 'gpaArt' },
    { field: 'careerGpa', minField: 'minCareerGpa', name: 'GPA การงาน', altField: 'gpaCareer' },
  ]

  for (const check of gpaChecks) {
    const minVal = criteria[check.minField]
    if (minVal !== null && minVal !== undefined) {
      const rawVal = student[check.field] ?? (check.altField ? student[check.altField] : null)
      const studentVal =
        rawVal !== null && rawVal !== undefined && rawVal !== ''
          ? Number(rawVal)
          : null

      if (studentVal === null || studentVal < Number(minVal)) {
        const currentStr =
          studentVal !== null ? studentVal.toFixed(2) : 'ไม่มีข้อมูล'
        failedReasons.push(
          `${check.name} (${currentStr}) ต่ำกว่าขั้นต่ำ (${Number(minVal).toFixed(2)})`
        )
      }
    }
  }

  // 2. ตรวจสอบคะแนนสอบ (TGAT / TPAT / A-Level)
  const scores = student.tcasScores || {}
  const tcasChecks = [
    { field: 'tgat', minField: 'minTgat', name: 'TGAT' },
    { field: 'tpat1', minField: 'minTpat1', name: 'TPAT1' },
    { field: 'tpat2', minField: 'minTpat2', name: 'TPAT2' },
    { field: 'tpat3', minField: 'minTpat3', name: 'TPAT3' },
    { field: 'tpat4', minField: 'minTpat4', name: 'TPAT4' },
    { field: 'tpat5', minField: 'minTpat5', name: 'TPAT5' },
    { field: 'alevelMath1', minField: 'minAlevelMath1', name: 'A-Level Math1' },
    { field: 'alevelMath2', minField: 'minAlevelMath2', name: 'A-Level Math2' },
    { field: 'alevelSci', minField: 'minAlevelSci', name: 'A-Level Sci' },
    { field: 'alevelPhy', minField: 'minAlevelPhy', name: 'A-Level Phy' },
    { field: 'alevelChem', minField: 'minAlevelChem', name: 'A-Level Chem' },
    { field: 'alevelBio', minField: 'minAlevelBio', name: 'A-Level Bio' },
    { field: 'alevelSoc', minField: 'minAlevelSoc', name: 'A-Level Soc' },
    { field: 'alevelThai', minField: 'minAlevelThai', name: 'A-Level Thai' },
    { field: 'alevelEng', minField: 'minAlevelEng', name: 'A-Level Eng' },
    { field: 'alevelForeign', minField: 'minAlevelForeign', name: 'A-Level ตปท.' },
  ]

  for (const check of tcasChecks) {
    const minVal = criteria[check.minField]
    if (minVal !== null && minVal !== undefined) {
      const rawVal = scores[check.field]
      const studentVal =
        rawVal !== null && rawVal !== undefined && rawVal !== ''
          ? Number(rawVal)
          : null

      if (studentVal === null || studentVal < Number(minVal)) {
        const currentStr =
          studentVal !== null ? studentVal.toFixed(2) : 'ไม่มีข้อมูล'
        failedReasons.push(
          `${check.name} (${currentStr}) ต่ำกว่าขั้นต่ำ (${Number(minVal).toFixed(2)})`
        )
      }
    }
  }

  // หากมีวิชาที่ไม่ผ่านเกณฑ์
  if (failedReasons.length > 0) {
    return {
      status: 'INELIGIBLE' as const,
      remark: failedReasons.join(' | '),
    }
  }

  // หากผ่านเกณฑ์ครบทุกข้อ
  return {
    status: 'ELIGIBLE' as const,
    remark: 'ผ่านเกณฑ์คุณสมบัติขั้นต่ำทั้งหมด',
  }
}

// 1. ฟังก์ชัน GET (ดึงรายการสมัคร + คำนวณและสั่ง UPDATE ซิงก์ลง MySQL ทันที)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentIdParam = searchParams.get('studentId')

    if (!studentIdParam) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุ studentId' },
        { status: 400 }
      )
    }

    const student = await prisma.student.findFirst({
      where: {
        OR: [{ Studentsid: studentIdParam }, { studentCode: studentIdParam }],
      },
      include: {
        tcasScores: true,
      },
    })

    if (!student) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // ดึงข้อมูลการสมัคร พร้อม student (และคะแนน) + criteria (และมหาวิทยาลัย)
    const applications = await prisma.application.findMany({
      where: {
        studentId: student.Studentsid,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 📌 ประมวลผลและซิงก์ค่า status / remark ลง MySQL หากข้อมูลเดิมใน DB ไม่ถูกต้อง
    const updatedApplications = await Promise.all(
      applications.map(async (app: any) => {
        if (app.status !== 'CANCELLED') {
          const evalRes = evaluateEligibility(app.student || student, app.criteria)

          if (app.status !== evalRes.status || app.remark !== evalRes.remark) {
            await prisma.application.update({
              where: { Applicationsid: app.Applicationsid },
              data: {
                status: evalRes.status,
                remark: evalRes.remark,
              },
            })
            app.status = evalRes.status
            app.remark = evalRes.remark
          }
        }

        return {
          ...app,
          id: app.Applicationsid || app.id,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: updatedApplications,
    })
  } catch (error: any) {
    console.error('Fetch Applications Error:', error)
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาด: ${error?.message || 'Server Error'}` },
      { status: 500 }
    )
  }
}

// 2. ฟังก์ชัน POST (บันทึกการสมัคร + คำนวณผลการตรวจผ่าน/ไม่ผ่าน อัตโนมัติลง DB ทันที)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { criteriaId, studentId: bodyStudentId } = body

    if (!criteriaId) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุรหัสหลักสูตรที่ต้องการสมัคร (criteriaId)' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const cookieStudentId =
      cookieStore.get('student_id')?.value ||
      cookieStore.get('userId')?.value ||
      cookieStore.get('user_id')?.value

    const targetStudentId = bodyStudentId || cookieStudentId

    // ดึงข้อมูลนักเรียนพร้อมคะแนน TCAS
    let student = null
    if (targetStudentId) {
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { Studentsid: targetStudentId },
            { studentCode: targetStudentId },
            { nationalId: targetStudentId },
          ],
        },
        include: { tcasScores: true },
      })
    }

    if (!student) {
      student = await prisma.student.findFirst({
        orderBy: { createdAt: 'asc' },
        include: { tcasScores: true },
      })
    }

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลนักเรียนในฐานข้อมูล' },
        { status: 404 }
      )
    }

    // ดึงเกณฑ์ของหลักสูตรที่จะสมัคร
    const criteria = await prisma.programCriteria.findUnique({
      where: { Program_Criteriaid: criteriaId },
    })

    if (!criteria) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลเกณฑ์หลักสูตรนี้' },
        { status: 404 }
      )
    }

    // ตรวจสอบการสมัครซ้ำ
    const existingApp = await prisma.application.findUnique({
      where: {
        studentId_criteriaId: {
          studentId: student.Studentsid,
          criteriaId: criteriaId,
        },
      },
    })

    if (existingApp) {
      return NextResponse.json(
        { success: false, message: 'คุณได้ทำการสมัครหลักสูตรนี้ไปแล้ว' },
        { status: 400 }
      )
    }

    // คำนวณ ID ลำดับถัดไป (app-XXX)
    const allApps = await prisma.application.findMany({
      where: {
        Applicationsid: {
          startsWith: 'app-',
        },
      },
      select: { Applicationsid: true },
    })

    const numbers = allApps
      .map((app) => {
        const numStr = app.Applicationsid.replace('app-', '')
        const parsed = parseInt(numStr, 10)
        return isNaN(parsed) ? null : parsed
      })
      .filter((num): num is number => num !== null)

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0
    const newAppId = `app-${String(maxNum + 1).padStart(3, '0')}`

    // 📌 ประมวลผลคุณสมบัติจริงเปรียบเทียบเกรด/คะแนน กับ เกณฑ์ทันที
    const evaluation = evaluateEligibility(student, criteria)

    // บันทึกการสมัครลงฐานข้อมูลพร้อมสถานะ ELIGIBLE / INELIGIBLE และเหตุผล
    const newApplication = await prisma.application.create({
      data: {
        Applicationsid: newAppId,
        studentId: student.Studentsid,
        criteriaId: criteriaId,
        status: evaluation.status,
        remark: evaluation.remark,
        evaluatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'สมัครหลักสูตรและประมวลผลเรียบร้อยแล้ว',
      data: newApplication,
    })
  } catch (error: any) {
    console.error('Create Application Error:', error)
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาดในการสมัคร: ${error?.message || 'Server Error'}` },
      { status: 500 }
    )
  }
}