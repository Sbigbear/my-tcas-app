'use server'

import prisma from '@/lib/prisma'

export async function logReportExportAction(teacherUserId: string, reportType: 'ALL' | 'PASSED' | 'CONFIRMED') {
  try {
    const teacher = await prisma.user.findUnique({
      where: { Usersid: teacherUserId },
      include: { university: true },
    })

    let typeText = 'ผู้ผ่านเกณฑ์ทั้งหมด'
    if (reportType === 'PASSED') typeText = 'เฉพาะผู้ผ่านการคัดเลือก'
    if (reportType === 'CONFIRMED') typeText = 'เฉพาะผู้ยืนยันผลแล้ว'

    await prisma.auditLog.create({
      data: {
        action: 'EXPORT_REPORT',
        details: `อาจารย์ (${teacher?.name || 'ไม่ระบุชื่อ'}) กดพิมพ์/ส่งออกรายงาน PDF (${typeText}) สังกัด ${teacher?.university?.faculty || ''} (${teacher?.university?.department || ''})`,
        userId: teacherUserId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Log Report Export Error:', error)
    return { success: false }
  }
}