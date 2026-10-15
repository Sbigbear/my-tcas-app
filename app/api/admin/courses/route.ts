import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ ID ของหลักสูตร' },
        { status: 400 }
      )
    }

    // 📌 Step 1: ลบรายการสมัครของนักเรียนที่ผูกกับหลักสูตรนี้ออกก่อน
    await prisma.application.deleteMany({
      where: {
        criteriaId: id,
      },
    })

    // 📌 Step 2: ลบข้อมูลหลักสูตรออกจากตาราง ProgramCriteria
    await prisma.programCriteria.delete({
      where: {
        Program_Criteriaid: id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'ลบหลักสูตรและข้อมูลการสมัครที่เกี่ยวข้องเรียบร้อยแล้ว',
    })
  } catch (error: any) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการลบหลักสูตร' },
      { status: 500 }
    )
  }
}