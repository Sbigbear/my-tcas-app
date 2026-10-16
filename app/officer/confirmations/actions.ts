'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 📌 1. บันทึกยืนยันผลทีละคน
export async function confirmFacultyOfficer(
  applicationId: string,
  officerUserId: string,
  note?: string
) {
  try {
    const application = await prisma.application.findUnique({
      where: { Applicationsid: applicationId },
      include: {
        student: true,
        criteria: { include: { university: true } },
      },
    })

    const officer = await prisma.user.findUnique({
      where: { Usersid: officerUserId },
      include: { university: true },
    })

    const studentName = application?.student?.name || 'ไม่ระบุชื่อนักเรียน'
    const studentCode = application?.student?.nationalId || application?.student?.studentCode || ''
    const officerName = officer?.name || 'เจ้าหน้าที่คณะ'
    const programName = application?.criteria?.programName || 'หลักสูตร'
    const facultyName = application?.criteria?.university?.faculty || ''

    await prisma.facultyConfirmation.upsert({
      where: { applicationId: applicationId },
      update: {
        confirmedBy: officerUserId,
        confirmedRole: 'OFFICER' as any,
        note: note || `เจ้าหน้าที่บันทึกยืนยันผลของ ${studentName} ส่งมหาวิทยาลัย`,
      },
      create: {
        applicationId: applicationId,
        confirmedBy: officerUserId,
        confirmedRole: 'OFFICER' as any,
        note: note || `เจ้าหน้าที่บันทึกยืนยันผลของ ${studentName} ส่งมหาวิทยาลัย`,
      },
    })

    await prisma.application.update({
      where: { Applicationsid: applicationId },
      data: { status: 'CONFIRMED' as any },
    })

    try {
      const logDetails = `เจ้าหน้าที่คณะ (${officerName}) บันทึกยืนยันผลการคัดเลือกของนักเรียน: ${studentName} (${studentCode}) ในหลักสูตร ${programName} (${facultyName}) ส่งไปยังมหาวิทยาลัยเรียบร้อยแล้ว`

      if ((prisma as any).auditLog) {
        await (prisma as any).auditLog.create({
          data: {
            action: 'CONFIRM_STUDENT',
            details: logDetails,
            userId: officerUserId,
            studentId: application?.studentId || null,
          },
        })
      }
    } catch (logErr) {
      console.error('AuditLog Error:', logErr)
    }

    revalidatePath('/officer/confirmations')
    revalidatePath('/admin/logs')
    revalidatePath('/teacher/applicants')
    revalidatePath('/student/search')

    return { success: true }
  } catch (err: any) {
    console.error('Faculty Confirmation Error:', err)
    return { success: false, message: err?.message || 'เกิดข้อผิดพลาดในการบันทึกยืนยันผล' }
  }
}

// 📌 2. บันทึกยืนยันผลยกแพ็กหลายรายการพร้อมกัน (Bulk Confirm)
export async function confirmBulkFacultyOfficer(
  applicationIds: string[],
  officerUserId: string,
  note?: string
) {
  try {
    if (!applicationIds || applicationIds.length === 0) {
      return { success: false, message: 'กรุณาเลือกรายชื่อนักเรียนที่ต้องการยืนยันผล' }
    }

    const officer = await prisma.user.findUnique({
      where: { Usersid: officerUserId },
      include: { university: true },
    })

    const officerName = officer?.name || 'เจ้าหน้าที่คณะ'
    const facultyName = officer?.university?.faculty || ''

    // ดึงข้อมูลผู้สมัครที่ถูกเลือกทั้งหมด
    const applications = await prisma.application.findMany({
      where: { Applicationsid: { in: applicationIds } },
      include: { student: true, criteria: true },
    })

    // บันทึกยืนยันผลลงตาราง FacultyConfirmation และเปลี่ยนสถานะเป็น CONFIRMED
    for (const app of applications) {
      const studentName = app.student?.name || 'นักเรียน'
      
      await prisma.facultyConfirmation.upsert({
        where: { applicationId: app.Applicationsid },
        update: {
          confirmedBy: officerUserId,
          confirmedRole: 'OFFICER' as any,
          note: note || `เจ้าหน้าที่บันทึกยืนยันผลส่งมหาวิทยาลัย (อนุมัติยกแพ็ก)`,
        },
        create: {
          applicationId: app.Applicationsid,
          confirmedBy: officerUserId,
          confirmedRole: 'OFFICER' as any,
          note: note || `เจ้าหน้าที่บันทึกยืนยันผลส่งมหาวิทยาลัย (อนุมัติยกแพ็ก)`,
        },
      })

      await prisma.application.update({
        where: { Applicationsid: app.Applicationsid },
        data: { status: 'CONFIRMED' as any },
      })
    }

    // บันทึก AuditLog รวบยอด
    try {
      const logDetails = `เจ้าหน้าที่คณะ (${officerName}) บันทึกยืนยันผลการคัดเลือกนักเรียนแบบอนุมัติยกแพ็ก จำนวนทั้งหมด ${applications.length} รายการ ส่งไปยังมหาวิทยาลัยเรียบร้อยแล้ว (${facultyName})`

      if ((prisma as any).auditLog) {
        await (prisma as any).auditLog.create({
          data: {
            action: 'CONFIRM_STUDENT',
            details: logDetails,
            userId: officerUserId,
          },
        })
      }
    } catch (logErr) {
      console.error('Bulk AuditLog Error:', logErr)
    }

    revalidatePath('/officer/confirmations')
    revalidatePath('/admin/logs')
    revalidatePath('/teacher/applicants')
    revalidatePath('/student/search')

    return { success: true, count: applications.length }
  } catch (err: any) {
    console.error('Bulk Confirmation Error:', err)
    return { success: false, message: err?.message || 'เกิดข้อผิดพลาดในการยืนยันผลยกแพ็ก' }
  }
}