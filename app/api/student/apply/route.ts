import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, criteriaId, status = 'ELIGIBLE' } = body

    if (!studentId || !criteriaId) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำการสมัคร (ไม่พบ studentId)' },
        { status: 401 }
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
        { success: false, message: 'ไม่พบข้อมูลนักเรียนคนนี้ในฐานข้อมูล' },
        { status: 404 }
      )
    }

    // 2. เช็กว่านักเรียนคนนี้เคยสมัครหลักสูตรนี้ไปแล้วหรือยัง
    const existingApplication = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        criteriaId: criteriaId,
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'คุณได้ยื่นสมัครหลักสูตรนี้ไปเรียบร้อยแล้ว' },
        { status: 400 }
      )
    }

    // 3. บันทึกข้อมูลลงตาราง Application
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