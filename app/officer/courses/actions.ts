'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCourseAction(courseData: any, userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { Usersid: userId },
      include: { university: true },
    })

    // 1. สร้างหลักสูตรในตาราง ProgramCriteria
    const newCourse = await prisma.programCriteria.create({
      data: {
        programName: courseData.programName,
        capacity: Number(courseData.capacity),
        minGpax: courseData.minGpax ? Number(courseData.minGpax) : null,
        minTgat: courseData.minTgat ? Number(courseData.minTgat) : null,
        additionals: courseData.additionals || null,
        universityId: courseData.universityId || user?.universityId,
        isOpen: true,
      },
      include: {
        university: true,
      },
    })

    // 📌 2. บันทึกประวัติการสร้างหลักสูตรลง SystemLog (แสดงในแท็บ "หลักสูตร")
    try {
      const performerName = user?.name || 'ผู้ใช้งาน'
      const userRole = user?.role || 'TEACHER'
      const faculty = newCourse.university?.faculty || ''
      const dept = newCourse.university?.department || ''

      await (prisma as any).systemLog.create({
        data: {
          action: 'CREATE_COURSE',
          performedBy: performerName,
          role: userRole,
          details: `${userRole === 'OFFICER' ? 'เจ้าหน้าที่คณะ' : 'อาจารย์'} (${performerName}) เพิ่มหลักสูตรใหม่: ${newCourse.programName} สังกัด ${faculty} (${dept}) รับจำนวน ${newCourse.capacity} คน`,
        },
      })
    } catch (logErr) {
      console.error('SystemLog Error:', logErr)
    }

    revalidatePath('/officer/courses')
    revalidatePath('/teacher/courses')
    revalidatePath('/student/search')
    revalidatePath('/admin/logs')

    return { success: true, course: newCourse }
  } catch (err: any) {
    console.error('Create Course Error:', err)
    return { success: false, message: err?.message || 'เกิดข้อผิดพลาดในการสร้างหลักสูตร' }
  }
}