import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { VerificationStatus } from '@prisma/client'
import studentsData from '@/data/mock_students.json'
import { cookies } from 'next/headers'

// 🔒 ฟังก์ชันเช็กสิทธิ์ Admin จาก Cookie / Session
async function checkAdminPermission(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value || cookieStore.get('user_role')?.value
  // หมายเหตุ: สามารถปลดคอมเมนต์บรรทัดล่างเมื่อต้องการเปิดใช้การบังคับเช็กสิทธิ์ Strict Mode
  // if (!token) return false
  return true
}

// GET: ส่งคืนข้อมูลนักเรียนและโรงเรียนจำลองให้หน้าเว็บดู (Mock API)
export async function GET(req: NextRequest) {
  const isAllowed = await checkAdminPermission(req)
  if (!isAllowed) {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' }, { status: 401 })
  }
  return NextResponse.json(studentsData)
}

// POST: ซิงก์ข้อมูลโรงเรียนและนักเรียนลง MySQL (TiDB Cloud)
export async function POST(req: NextRequest) {
  try {
    const isAllowed = await checkAdminPermission(req)
    if (!isAllowed) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ใช้งาน API ซิงก์ข้อมูล' }, { status: 401 })
    }

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

    // 1. จัดกลุ่มโรงเรียนที่ไม่ซ้ำกันเพื่อเตรียมบันทึกแบบ Batch
    const uniqueSchools = new Map<string, { code: string; name: string; province: string }>()

    if (schoolInfo && schoolInfo.code) {
      uniqueSchools.set(schoolInfo.code, {
        code: schoolInfo.code,
        name: schoolInfo.name,
        province: schoolInfo.province,
      })
    }

    for (const st of students) {
      if (st.schoolCode && !uniqueSchools.has(st.schoolCode)) {
        uniqueSchools.set(st.schoolCode, {
          code: st.schoolCode,
          name: st.schoolName || st.schoolCode,
          province: st.schoolProvince || 'ไม่ระบุ',
        })
      }
    }

    // บันทึกโรงเรียนทั้งหมดพร้อมกันผ่าน $transaction
    const schoolOps = Array.from(uniqueSchools.values()).map((sch) =>
      prisma.school.upsert({
        where: { code: sch.code },
        update: { name: sch.name, province: sch.province },
        create: { code: sch.code, name: sch.name, province: sch.province },
      })
    )
    const savedSchools = await prisma.$transaction(schoolOps)

    // แมป schoolCode กับ Schoolsid
    const schoolIdMap = new Map<string, string>()
    savedSchools.forEach((sch) => schoolIdMap.set(sch.code, sch.Schoolsid))

    // 2. เตรียม Operation บันทึกนักเรียน 120 คน
    const studentOps = students.map((st) => {
      const schoolId = st.schoolCode
        ? schoolIdMap.get(st.schoolCode) || null
        : schoolInfo?.code
        ? schoolIdMap.get(schoolInfo.code) || null
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

      return prisma.student.upsert({
        where: { nationalId: st.nationalId },
        update: studentData,
        create: studentData,
      })
    })

    // รันการบันทึกนักเรียนทั้งหมดใน 1 Round-trip
    const savedStudents = await prisma.$transaction(studentOps)

    return NextResponse.json({
      success: true,
      message: `นำเข้าข้อมูลโรงเรียน ${savedSchools.length} แห่ง และนักเรียนสำเร็จ ${savedStudents.length} รายการ`,
      data: savedStudents,
    })
  } catch (error: any) {
    console.error('School API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}