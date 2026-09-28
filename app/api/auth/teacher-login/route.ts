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

    // ค้นหาอาจารย์/เจ้าหน้าที่ในตาราง User
    const teacher = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { teacherId: username }
        ]
      }
    })

    if (!teacher || teacher.password !== password) {
      return NextResponse.json(
        { success: false, message: 'อีเมล/บัญชีผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email
      }
    })

    // ฝาก Cookie บันทึกการเข้าสู่ระบบ
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
    )
  }
}