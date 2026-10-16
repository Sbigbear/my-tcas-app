import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { applicationId, officerId, note } = await req.json()

    if (!applicationId || !officerId) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบถ้วน (Missing applicationId or officerId)' },
        { status: 400 }
      )
    }

    // 1. สร้าง Record ในตาราง D9_FacultyConfirmations
    const confirmation = await prisma.facultyConfirmation.create({
      data: {
        applicationId,
        confirmedBy: officerId,
        confirmedRole: 'OFFICER',
        note: note || null,
      },
    })

    // 2. ปรับสถานะ Application เป็น CONFIRMED
    await prisma.application.update({
      where: { Applicationsid: applicationId },
      data: { status: 'CONFIRMED' },
    })

    return NextResponse.json({ success: true, data: confirmation })
  } catch (error: any) {
    console.error('Faculty confirmation error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกยืนยันผล' },
      { status: 500 }
    )
  }
}