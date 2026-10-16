'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'

async function getOfficerInfo() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let userEmail: string | undefined
    let userId: string | undefined

    if (token) {
      try {
        const decoded = jwt.decode(token) as any
        userEmail = decoded?.email || decoded?.userEmail
        userId = decoded?.id || decoded?.userId || decoded?.sub
      } catch (e) {}
    }

    if (!userEmail) {
      userEmail = cookieStore.get('user_email')?.value || cookieStore.get('email')?.value
    }

    const cookieUserId =
      cookieStore.get('officer_id')?.value ||
      cookieStore.get('userId')?.value ||
      cookieStore.get('user_id')?.value

    const orConditions = [
      userEmail ? { email: userEmail } : null,
      userId ? { Usersid: userId } : null,
      cookieUserId ? { Usersid: cookieUserId } : null,
    ].filter(Boolean) as any[]

    if (orConditions.length === 0) return null

    return await prisma.user.findFirst({
      where: { OR: orConditions },
      include: { university: true },
    })
  } catch (err) {
    return null
  }
}

export async function createTeacherData(formData: FormData) {
  try {
    const officer = await getOfficerInfo()

    const name = (formData.get('name') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    const password = (formData.get('password') as string)?.trim()
    const teacherId = (formData.get('teacherId') as string)?.trim()
    const department = (formData.get('department') as string)?.trim()
    const formFaculty = (formData.get('faculty') as string)?.trim()

    if (!name || !email || !password || !department) {
      return { success: false, message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' }
    }

    // 📌 ยึดคณะที่ Client ส่งมาเป็นหลัก
    let faculty = formFaculty || officer?.university?.faculty

    if (!faculty) {
      return { success: false, message: 'ไม่พบข้อมูลคณะสังกัด กรุณาระบุชื่อคณะ' }
    }

    const campus = officer?.university?.campus || 'บางเขน'

    // 📌 ค้นหาสังกัดในตาราง University (คณะ + สาขา)
    let universityTarget = await prisma.university.findFirst({
      where: {
        faculty: faculty,
        department: department,
      },
    })

    if (!universityTarget) {
      const allUnivs = await prisma.university.findMany({ select: { Universitiesid: true } })
      const numbers = allUnivs
        .map((u) => {
          const numStr = u.Universitiesid.replace('univ-', '')
          const parsed = parseInt(numStr, 10)
          return isNaN(parsed) ? null : parsed
        })
        .filter((n): n is number => n !== null)

      const maxNum = numbers.length > 0 ? Math.max(...numbers) : allUnivs.length
      const newUnivId = `univ-${String(maxNum + 1).padStart(3, '0')}`

      universityTarget = await prisma.university.create({
        data: {
          Universitiesid: newUnivId,
          code: `KU${String(maxNum + 1).padStart(3, '0')}`,
          name: officer?.university?.name || 'มหาวิทยาลัยเกษตรศาสตร์',
          campus,
          faculty,
          department,
        },
      })
    }

    // 📌 สร้าง Usersid แบบหาตัวเลขสูงสุด + 1 ป้องกัน PK ชน
    const allUsers = await prisma.user.findMany({ select: { Usersid: true } })
    const userNumbers = allUsers
      .map((u) => {
        const match = u.Usersid.match(/\d+/)
        return match ? parseInt(match[0], 10) : null
      })
      .filter((n): n is number => n !== null)

    const maxUserNum = userNumbers.length > 0 ? Math.max(...userNumbers) : 0
    const customUserId = `usr-t${String(maxUserNum + 1).padStart(2, '0')}`

    const newTeacher = await prisma.user.create({
      data: {
        Usersid: customUserId,
        name,
        email,
        password,
        role: 'TEACHER',
        teacherId: teacherId || null,
        universityId: universityTarget.Universitiesid,
      },
    })

    revalidatePath('/officer/teachers')
    revalidatePath('/admin/users')

    return { success: true, data: newTeacher }
  } catch (error: any) {
    console.error('Create teacher error:', error)
    if (error.code === 'P2002') {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' }
    }
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการเพิ่มอาจารย์' }
  }
}

// 📌 Export ฟังก์ชันลบอาจารย์ให้เรียกใช้งานจาก Client ได้
export async function deleteTeacherData(teacherUserId: string) {
  try {
    const officer = await getOfficerInfo()
    if (!officer) return { success: false, message: 'ไม่พบสิทธิ์ผู้ใช้งาน' }

    try {
      await prisma.auditLog.deleteMany({
        where: { userId: teacherUserId },
      })
    } catch (e) {}

    await prisma.user.deleteMany({
      where: { Usersid: teacherUserId },
    })

    revalidatePath('/officer/teachers')
    revalidatePath('/admin/users')

    return { success: true, message: 'ลบข้อมูลอาจารย์เรียบร้อยแล้ว' }
  } catch (error: any) {
    console.error('Delete teacher error:', error)
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการลบ' }
  }
}