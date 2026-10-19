import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

    // 📌 ค้นหาผู้ใช้จาก email และระบุ role ต้องเป็น TEACHER เท่านั้น
    const teacher = await prisma.user.findFirst({
      where: {
        email: username,
        role: 'TEACHER',
      },
    })

    if (!teacher) {
      return NextResponse.json(
        {
          success: false,
          message: 'บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานในส่วนของอาจารย์ หรือรหัสผ่านไม่ถูกต้อง',
        },
        { status: 401 }
      )
    }

    // 🔒 ตรวจสอบรหัสผ่านแฮชด้วย bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, teacher.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานในส่วนของอาจารย์ หรือรหัสผ่านไม่ถูกต้อง',
        },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: teacher.Usersid,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        universityId: teacher.universityId,
      },
    })

    // 📌 บันทึก Cookie สำหรับใช้ตรวจสอบสิทธิ์ในฝั่ง Server
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 วัน
    }

    response.cookies.set('teacher_id', teacher.Usersid, cookieOptions)
    response.cookies.set('userId', teacher.Usersid, cookieOptions)
    response.cookies.set('email', teacher.email, cookieOptions)
    response.cookies.set('user_email', teacher.email, cookieOptions)

    return response
  } catch (error: any) {
    console.error('Teacher Login Error:', error)
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาด: ${error?.message || 'Server Error'}` },
      { status: 500 }
    )
  }
}