import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุ studentId' },
        { status: 400 }
      )
    }

    // 1. ค้นหา student จาก id หรือ studentId
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: studentId }, { studentId: studentId }],
      },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลนักเรียน' },
        { status: 404 }
      )
    }

    // 2. ดึงข้อมูลการสมัครของนักเรียนคนนี้
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