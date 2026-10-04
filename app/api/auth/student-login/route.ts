import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { nationalId, password } = await request.json()

    if (!nationalId || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { nationalId: nationalId },
    })

    // ตรวจสอบรหัสนักเรียน (studentCode) กับ Password
    if (!student || student.studentCode !== password) {
      return NextResponse.json(
        { success: false, message: 'เลขบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: student.Studentsid,
        studentId: student.studentCode ?? '',
        name: student.name,
        nationalId: student.nationalId,
        role: 'student',
      },
    })

    // 📌 ตัวเลือก Cookie มาตรฐาน (ตั้งอายุไว้ 1 วัน)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 วัน
    }

    // 📌 ฝัง Cookie โดยใช้ ?? '' ป้องกันค่า null
    response.cookies.set('student_id', student.Studentsid, cookieOptions)
    response.cookies.set('userId', student.Studentsid, cookieOptions)
    response.cookies.set('studentCode', student.studentCode ?? '', cookieOptions)
    response.cookies.set('nationalId', student.nationalId ?? '', cookieOptions)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดทางเซิร์ฟเวอร์' },
      { status: 500 }
    )
  }
}