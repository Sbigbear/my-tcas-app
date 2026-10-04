import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentIdParam = searchParams.get('studentId')

    if (!studentIdParam) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุ studentId' },
        { status: 400 }
      )
    }

    // ค้นหาข้อมูลนักเรียนจาก Studentsid หรือ studentCode
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ Studentsid: studentIdParam }, { studentCode: studentIdParam }],
      },
    })

    // หากไม่พบข้อมูลนักเรียน ให้ตอบกลับว่าไม่มีรายการสมัคร
    if (!student) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // ดึงเฉพาะรายการสมัครของนักเรียนคนนี้
    const applications = await prisma.application.findMany({
      where: {
        studentId: student.Studentsid,
      },
      include: {
        criteria: {
          include: {
            university: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Map ข้อมูลเพื่อเปลี่ยน Applicationsid ให้กลายเป็น id ที่ Frontend เรียกใช้งาน
    const formattedApplications = applications.map((app) => ({
      ...app,
      id: app.Applicationsid || (app as any).id,
    }))

    return NextResponse.json({
      success: true,
      data: formattedApplications,
    })
  } catch (error: any) {
    console.error('Fetch Applications Error:', error)
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาด: ${error?.message || 'Server Error'}` },
      { status: 500 }
    )
  }
}