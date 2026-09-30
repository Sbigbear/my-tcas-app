import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, criteriaId, status = 'ELIGIBLE' } = body

    if (!studentId || !criteriaId) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบถ้วน (ขาด studentId หรือ criteriaId)' },
        { status: 400 }
      )
    }

    // 1. ค้นหา student จาก id หรือ studentId จริงในระบบ
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: studentId }, { studentId: studentId }],
      },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลนักเรียนในระบบ' },
        { status: 404 }
      )
    }

    // 2. บันทึกข้อมูลลงตาราง Application
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        criteriaId: criteriaId,
        status: status,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'สมัครเรียนเรียบร้อยแล้ว',
      data: application,
    })
  } catch (error: any) {
    console.error('Apply Error:', error)
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาด: ${error?.message || 'Server Error'}` },
      { status: 500 }
    )
  }
}