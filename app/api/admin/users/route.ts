import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: ดึงจำนวนผู้ใช้งาน
export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const studentCount = await prisma.student.count()
    const total = userCount + studentCount

    return NextResponse.json({ success: true, total })
  } catch (error: any) {
    console.error('Error fetching user count:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลจำนวนผู้ใช้งาน' },
      { status: 500 }
    )
  }
}

// POST: เพิ่มผู้ใช้งานใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role, teacherId, universityId } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกชื่อและอีเมลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    if (role === 'STUDENT' || role === 'นักเรียน') {
      const codeFromEmail = email.split('@')[0] || Date.now().toString()

      const newStudent = await prisma.student.create({
        data: {
          name,
          studentCode: codeFromEmail,
          nationalId: codeFromEmail,
        },
      })

      return NextResponse.json({ success: true, data: newStudent })
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกรหัสผ่าน' },
        { status: 400 }
      )
    }

    let userRole: 'ADMIN' | 'OFFICER' = 'OFFICER'
    if (role === 'ADMIN' || role === 'ผู้ดูแลระบบ') {
      userRole = 'ADMIN'
    }

    const userCount = await prisma.user.count()
    const customUserId = `usr-t${String(userCount + 1).padStart(2, '0')}`

    const newUser = await prisma.user.create({
      data: {
        Usersid: customUserId,
        name,
        email,
        password,
        role: userRole,
        teacherId: userRole === 'OFFICER' ? teacherId || null : null,
        universityId: userRole === 'OFFICER' ? universityId || null : null,
      },
    })

    return NextResponse.json({ success: true, data: newUser })
  } catch (error: any) {
    console.error('Error creating user/student:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'อีเมล หรือ รหัสนักเรียนนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้' },
      { status: 500 }
    )
  }
}