// app/api/auth/officer-login/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    // ค้นหาผู้ใช้จาก email และตรวจ role ต้องเป็น OFFICER
    const user = await prisma.user.findFirst({
      where: {
        email: username,
        role: 'OFFICER',
      },
    })

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือไม่มีสิทธิ์เจ้าหน้าที่คณะ' },
        { status: 401 }
      )
    }

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.Usersid,
        name: user.name,
        email: user.email,
        role: user.role,
        universityId: user.universityId,
      },
    })

    // ฝัง Cookie สำหรับ Server-Side อ่านค่า
    res.cookies.set('officer_id', user.Usersid, { httpOnly: true, path: '/' })
    res.cookies.set('user_email', user.email, { httpOnly: true, path: '/' })

    return res
  } catch (error) {
    console.error('Officer login error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ' },
      { status: 500 }
    )
  }
}