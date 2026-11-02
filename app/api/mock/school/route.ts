import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import { VerificationStatus } from '@prisma/client'

export async function POST() {
  try {
    // 1. อ่านไฟล์จากโฟลเดอร์ D:\DATA\mock_school.json
    const filePath = 'D:/DATA/mock_school.json'
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบไฟล์ D:\\DATA\\mock_school.json' },
        { status: 404 }
      )
    }

    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { schoolInfo, students } = JSON.parse(fileContent)

    // 2. บันทึกข้อมูลโรงเรียนลงตาราง D2_Schools ใน MySQL
    let schoolId: string | undefined = undefined
    if (schoolInfo && schoolInfo.code) {
      const school = await prisma.school.upsert({
        where: { code: schoolInfo.code },
        update: {
          name: schoolInfo.name,
          province: schoolInfo.province,
        },
        create: {
          code: schoolInfo.code,
          name: schoolInfo.name,
          province: schoolInfo.province,
        },
      })
      schoolId = school.Schoolsid
    }

    // 3. บันทึกข้อมูลนักเรียนและเกรด ปพ.1 ลงตาราง D3_Students ใน MySQL
    const savedStudents = []
    for (const st of students) {
      const studentData = {
        nationalId: st.nationalId,
        studentCode: st.studentCode || null,
        name: st.name,
        schoolId: schoolId || null,
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
      message: `อ่านไฟล์ mock_school.json นำเข้า MySQL สำเร็จ ${savedStudents.length} รายการ`,
      data: savedStudents,
    })
  } catch (error: any) {
    console.error('School API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}