import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกบัญชีผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      )
    }

    // 📌 ค้นหาผู้ใช้สิทธิ์ ADMIN หรือ OFFICER
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

    // 🔒 1. ลองตรวจเช็กด้วย bcrypt compare ก่อน (สำหรับรหัสผ่านที่แฮชแล้ว)
    let isPasswordValid = false
    try {
      isPasswordValid = await bcrypt.compare(password, user.password)
    } catch (e) {
      isPasswordValid = false
    }

    // 🔄 2. Fallback: กรณีรหัสใน DB ยังเป็น Plaintext
    if (!isPasswordValid && user.password === password) {
      isPasswordValid = true

      // แฮชรหัสผ่านใหม่ แล้วอัปเดตลงตาราง D1_Users ใน DB ทันที
      try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.update({
          where: { Usersid: user.Usersid },
          data: { password: hashedPassword },
        })
      } catch (updateErr) {
        console.error('Auto-hash password error:', updateErr)
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.Usersid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 วัน
    }

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