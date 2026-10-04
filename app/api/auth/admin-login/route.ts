import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกบัญชีผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      )
    }

    // 📌 ค้นหาจากทั้ง ADMIN และ OFFICER
    const user = await prisma.user.findFirst({
      where: {
        email: username,
        role: {
          in: ['ADMIN', 'OFFICER'],
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบบัญชีผู้ดูแลระบบหรือเจ้าหน้าที่ในระบบ' },
        { status: 404 }
      )
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.Usersid, // อ้างอิง Primary Key ใหม่ของ User
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // 📌 ตัวเลือก Cookie มาตรฐาน (ตั้งอายุไว้ 1 วัน)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 วัน
    }

    // 📌 ฝัง Cookie ให้ครบทุกคีย์สำหรับฝั่ง Admin / Officer
    response.cookies.set('admin_id', user.Usersid, cookieOptions)
    response.cookies.set('userId', user.Usersid, cookieOptions)
    response.cookies.set('email', user.email ?? '', cookieOptions)
    response.cookies.set('role', user.role ?? '', cookieOptions)

    return response
  } catch (error) {
    console.error('Admin Login Error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    )
  }
}