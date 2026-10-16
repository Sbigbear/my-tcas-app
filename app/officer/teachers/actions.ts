'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'

// ดึงข้อมูลเจ้าหน้าที่คณะที่ล็อกอินอยู่
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
      } catch (e) {
        console.error('JWT Decode Error:', e)
      }
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

    const user = await prisma.user.findFirst({
      where: { OR: orConditions },
      include: { university: true },
    })

    return user
  } catch (err) {
    console.error('Error getting officer info:', err)
    return null
  }
}

// 📌 ฟังก์ชันสร้างอาจารย์ประจำสาขาในคณะ
export async function createTeacherData(formData: FormData) {
  const officer = await getOfficerInfo()
  if (!officer || !officer.university) {
    throw new Error('ไม่พบสิทธิ์ของเจ้าหน้าที่ประจำคณะ')
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const teacherId = formData.get('teacherId') as string
  const department = (formData.get('department') as string)?.trim()

  if (!name || !email || !password || !department) return

  const faculty = officer.university.faculty
  const campus = officer.university.campus || 'บางเขน'

  // 1. ค้นหาว่าสาขาวิชานี้ในคณะนี้มีในตาราง University หรือยัง
  let universityTarget = await prisma.university.findFirst({
    where: {
      faculty,
      department,
      campus,
    },
  })

  // 2. ถ้ายังไม่มี ให้สร้างสาขาวิชาใหม่ในคณะนี้
  if (!universityTarget) {
    const univCount = await prisma.university.count()
    const allUnivs = await prisma.university.findMany({ select: { Universitiesid: true } })

    const numbers = allUnivs
      .map((u) => {
        const numStr = u.Universitiesid.replace('univ-', '')
        const parsed = parseInt(numStr, 10)
        return isNaN(parsed) ? null : parsed
      })
      .filter((n): n is number => n !== null)

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : univCount
    const newUnivId = `univ-${String(maxNum + 1).padStart(3, '0')}`
    const newCode = `KU${String(maxNum + 1).padStart(3, '0')}`

    universityTarget = await prisma.university.create({
      data: {
        Universitiesid: newUnivId,
        code: newCode,
        name: officer.university.name || 'มหาวิทยาลัยเกษตรศาสตร์',
        campus,
        faculty,
        department,
      },
    })
  }

  // 3. สร้าง User สำหรับอาจารย์ (role: TEACHER)
  const userCount = await prisma.user.count()
  const customUserId = `usr-t${String(userCount + 1).padStart(2, '0')}`

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

  // 4. บันทึก Audit Log
  await prisma.auditLog.create({
    data: {
      action: 'CREATE_TEACHER',
      details: `เจ้าหน้าที่คณะ (${officer.name}) เพิ่มอาจารย์ใหม่: ${name} (${department})`,
      userId: officer.Usersid,
    },
  })

  revalidatePath('/officer/teachers')
}

// 📌 ฟังก์ชันลบอาจารย์
export async function deleteTeacherData(teacherUserId: string) {
  const officer = await getOfficerInfo()
  if (!officer) return

  await prisma.auditLog.deleteMany({
    where: { userId: teacherUserId },
  })

  await prisma.user.delete({
    where: { Usersid: teacherUserId },
  })

  revalidatePath('/officer/teachers')
}