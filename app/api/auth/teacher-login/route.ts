import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกบัญชีผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      )
    }

    // 📌 เพิ่มการเช็ก role: ต้องเป็น TEACHER หรือ OFFICER เท่านั้น
    const teacher = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { teacherId: username }
        ],
        role: {
          in: ['OFFICER']
        }
      }
    })

    if (!teacher || teacher.password !== password) {
      return NextResponse.json(
        { success: false, message: 'บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานในส่วนของอาจารย์ หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role
      }
    })

    response.cookies.set('teacher_id', teacher.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24
    })

    return response

  } catch (error: any) {
    console.error('Teacher Login Error:', error)
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาด: ${error?.message || 'Server Error'}` },
      { status: 500 }
    );
  }
}