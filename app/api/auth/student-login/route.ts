import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
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

    if (!student || student.studentId !== password) {
      return NextResponse.json(
        { success: false, message: 'เลขบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // 📌 บันทึก studentId ลงใน Cookie
    const cookieStore = await cookies()
    cookieStore.set('student_id', student.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    // 📌 ส่งข้อมูล user กลับไปให้ครบถ้วน ทั้ง id และ studentId
    return NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: student.id,
        studentId: student.studentId, // 👈 ส่ง studentId กลับไปด้วย
        name: student.name,
        nationalId: student.nationalId,
        role: 'student',
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดทางเซิร์ฟเวอร์' },
      { status: 500 }
    )
  }
}