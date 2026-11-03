import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { VerificationStatus } from '@prisma/client'
import studentsData from '@/data/mock_students.json'

// GET: ส่งคืนข้อมูลนักเรียนและโรงเรียนจำลองให้หน้าเว็บดู (Mock API)
export async function GET() {
  return NextResponse.json(studentsData)
}

// POST: ซิงก์ข้อมูลโรงเรียนและนักเรียนลง MySQL (TiDB Cloud)
export async function POST() {
  try {
    let students: any[] = []
    let schoolInfo: any = null

    const parsedData: any = studentsData

    if (Array.isArray(parsedData)) {
      students = parsedData
    } else {
      students = parsedData.students || []
      schoolInfo = parsedData.schoolInfo || null
    }

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลนักเรียน' }, { status: 400 })
    }

    // 1. จัดการบันทึกโรงเรียนลงตาราง D2_Schools
    const schoolMap = new Map<string, string>()

    // กรณีมี schoolInfo แบบก้อนเดี่ยว
    if (schoolInfo && schoolInfo.code) {
      const school = await prisma.school.upsert({
        where: { code: schoolInfo.code },
        update: { name: schoolInfo.name, province: schoolInfo.province },
        create: { code: schoolInfo.code, name: schoolInfo.name, province: schoolInfo.province },
      })
      schoolMap.set(schoolInfo.code, school.Schoolsid)
    }

    // กรณีสุ่มโรงเรียนกระจายติดมาในตัวนักเรียนแต่ละคน (สุ่ม 12 โรงเรียน)
    for (const st of students) {
      if (st.schoolCode && !schoolMap.has(st.schoolCode)) {
        const school = await prisma.school.upsert({
          where: { code: st.schoolCode },
          update: {
            name: st.schoolName || st.schoolCode,
            province: st.schoolProvince || 'ไม่ระบุ',
          },
          create: {
            code: st.schoolCode,
            name: st.schoolName || st.schoolCode,
            province: st.schoolProvince || 'ไม่ระบุ',
          },
        })
        schoolMap.set(st.schoolCode, school.Schoolsid)
      }
    }

    // 2. บันทึกข้อมูลนักเรียนลงตาราง D3_Students
    const savedStudents = []
    for (const st of students) {
      // ค้นหา schoolId จาก schoolCode หรือใช้ schoolInfo
      const schoolId = st.schoolCode
        ? schoolMap.get(st.schoolCode) || null
        : schoolInfo?.code
        ? schoolMap.get(schoolInfo.code) || null
        : null

      const studentData = {
        nationalId: st.nationalId,
        studentCode: st.studentCode || null,
        name: st.name,
        schoolId: schoolId,
        gpax: st.gpax !== undefined ? Number(st.gpax) : null,
        mathGpa: st.mathGpa !== undefined ? Number(st.mathGpa) : null,
        sciGpa: st.sciGpa !== undefined ? Number(st.sciGpa) : null,
        engGpa: st.engGpa !== undefined ? Number(st.engGpa) : null,
        thaiGpa: st.thaiGpa !== undefined ? Number(st.thaiGpa) : null,
        socialGpa: st.socialGpa !== undefined ? Number(st.socialGpa) : null,
        healthGpa: st.healthGpa !== undefined ? Number(st.healthGpa) : null,
        artGpa: st.artGpa !== undefined ? Number(st.artGpa) : null,
        careerGpa: st.careerGpa !== undefined ? Number(st.careerGpa) : null,
        verificationStatus: (st.verificationStatus as VerificationStatus) || VerificationStatus.VERIFIED,
      }

      const result = await prisma.student.upsert({
        where: { nationalId: st.nationalId },
        update: studentData,
        create: studentData,
      })
      savedStudents.push(result)
    }

    return NextResponse.json({
      success: true,
      message: `นำเข้าข้อมูลโรงเรียน ${schoolMap.size} แห่ง และนักเรียนสำเร็จ ${savedStudents.length} รายการ`,
      data: savedStudents,
    })
  } catch (error: any) {
    console.error('School API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}