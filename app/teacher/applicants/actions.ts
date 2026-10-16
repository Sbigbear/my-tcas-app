'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: 'PASSED' | 'PENDING' | 'REJECTED'
) {
  try {
    // 1. อัปเดตสถานะการคัดเลือกของผู้สมัคร
    const app: any = await prisma.application.update({
      where: { Applicationsid: applicationId },
      data: { status: newStatus as any },
      include: { criteria: true },
    })

    const criteriaId = app.criteriaId

    if (criteriaId) {
      // 2. นับจำนวนผู้ผ่านการคัดเลือกจริงในปัจจุบัน
      const passedCount = await prisma.application.count({
        where: {
          criteriaId: criteriaId,
          status: { in: ['PASSED', 'CONFIRMED'] as any },
        },
      })

      const criteria = app.criteria

      if (criteria) {
        // 3. ปรับ isOpen ในตาราง ProgramCriteria ให้ตรงตามความจริงใน DB
        const shouldBeOpen = passedCount < criteria.capacity

        await prisma.programCriteria.update({
          where: { Program_Criteriaid: criteriaId },
          data: { isOpen: shouldBeOpen },
        })
      }
    }

    // 4. ล้าง Cache ทุกหน้า (ทั้งฝั่งนักเรียน อาจารย์ และเจ้าหน้าที่คณะ)
    revalidatePath('/student/search')
    revalidatePath('/teacher/applicants')
    revalidatePath('/teacher/courses')
    revalidatePath('/teacher/dashboard')
    revalidatePath('/officer/courses')
    revalidatePath('/officer/confirmations')

    return { success: true, newStatus }
  } catch (err: any) {
    console.error('Update Status Error:', err)
    return { success: false, message: err?.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' }
  }
}