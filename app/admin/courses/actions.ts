'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteCourseAction(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'กรุณาระบุ ID หลักสูตร' }
    }

    // 📌 1. เคลียร์การสมัครของนักเรียน (ใช้ Program_Criteriaid ให้ตรงกับ Schema)
    await prisma.application.deleteMany({
      where: { Program_Criteriaid: id } as any,
    })

    // 📌 2. ลบเกณฑ์หลักสูตร
    await prisma.programCriteria.deleteMany({
      where: { Program_Criteriaid: id },
    })

    // 📌 3. Revalidate เคลียร์ Cache ทุกหน้าที่เกี่ยวข้อง
    revalidatePath('/admin/courses')
    revalidatePath('/officer/courses')
    revalidatePath('/teacher/courses')
    revalidatePath('/student/search')

    return { success: true, message: 'ลบหลักสูตรเรียบร้อยแล้ว' }
  } catch (error: any) {
    console.error('Delete admin course error:', error)
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการลบหลักสูตร' }
  }
}