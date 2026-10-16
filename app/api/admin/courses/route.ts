import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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

    // 📌 Step 1: ลบรายการสมัครของนักเรียนที่ผูกกับหลักสูตรนี้ก่อน (ใช้ชื่อฟิลด์ Program_Criteriaid ตาม Schema)
    await prisma.application.deleteMany({
      where: {
        Program_Criteriaid: id,
      } as any,
    })

    // 📌 Step 2: ลบข้อมูลหลักสูตรออกจากตาราง ProgramCriteria (ใช้ deleteMany ป้องกัน Error P2025)
    await prisma.programCriteria.deleteMany({
      where: {
        Program_Criteriaid: id,
      },
    })

    // 📌 Step 3: Revalidate เคลียร์ Cache ให้ข้อมูลทุกหน้าอัปเดตเรียลไทม์ทันที
    revalidatePath('/admin/courses')
    revalidatePath('/officer/courses')
    revalidatePath('/teacher/courses')
    revalidatePath('/student/search')

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