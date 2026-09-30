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

    // ค้นหาข้อมูลนักเรียนจาก id หรือ studentId
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: studentIdParam }, { studentId: studentIdParam }],
      },
    })

    // 📌 หากไม่พบข้อมูลนักเรียน ให้ตอบกลับว่าไม่มีรายการสมัคร (Data: []) ไม่โยน Error 404
    if (!student) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // ดึงเฉพาะรายการสมัครของนักเรียนคนนี้เท่านั้น
    const applications = await prisma.application.findMany({
      where: {
        studentId: student.id,
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

    return NextResponse.json({
      success: true,
      data: applications,
    })
  } catch (error: any) {
    console.error('Fetch Applications Error:', error)
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาด: ${error?.message || 'Server Error'}` },
      { status: 500 }
    )
  }
}