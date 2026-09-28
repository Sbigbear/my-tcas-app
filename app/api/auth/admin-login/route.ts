import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    // ค้นหา Admin จากตาราง user ที่มี role เป็น ADMIN
    const user = await prisma.user.findFirst({
      where: {
        email: username,
        role: 'ADMIN',
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบบัญชีผู้ดูแลระบบนี้' },
        { status: 404 }
      )
    }

    // เช็ครหัสผ่าน
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Admin Login Error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    )
  }
}