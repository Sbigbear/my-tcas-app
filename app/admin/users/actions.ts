'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createUserData(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const roleType = formData.get('role') as 'OFFICER' | 'TEACHER' | 'ADMIN'
  const teacherId = formData.get('teacherId') as string | null

  const universityMode = formData.get('universityMode') as string // 'SELECT' หรือ 'CUSTOM'
  let universityId = formData.get('universityId') as string | null
  const faculty = formData.get('faculty') as string | null
  const rawDepartment = formData.get('department') as string | null
  const campus = formData.get('campus') as string | null

  if (!name || !email || !password || !roleType) return

  // 📌 ถ้าเป็นเจ้าหน้าที่คณะ (OFFICER) สาขาวิชาจะถูกกำหนดเป็น "ประจำคณะ" หรือ "-" โดยอัตโนมัติ
  const department = roleType === 'OFFICER' ? 'ประจำคณะ' : rawDepartment

  if (roleType === 'OFFICER' || roleType === 'TEACHER') {
    if (universityMode === 'CUSTOM' || (!universityId && faculty)) {
      const cleanFaculty = faculty?.trim() || ''
      const cleanDept = department?.trim() || 'ประจำคณะ'
      const cleanCampus = campus?.trim() || 'บางเขน'

      if (cleanFaculty) {
        let existingUniv = await prisma.university.findFirst({
          where: {
            faculty: cleanFaculty,
            department: cleanDept,
            campus: cleanCampus,
          },
        })

        if (existingUniv) {
          universityId = existingUniv.Universitiesid
        } else {
          const univCount = await prisma.university.count()
          const allUnivs = await prisma.university.findMany({
            select: { Universitiesid: true },
          })

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

          const newUniv = await prisma.university.create({
            data: {
              Universitiesid: newUnivId,
              code: newCode,
              name: 'มหาวิทยาลัยเกษตรศาสตร์',
              campus: cleanCampus,
              faculty: cleanFaculty,
              department: cleanDept,
            },
          })
          universityId = newUniv.Universitiesid
        }
      }
    }
  }

  // 📌 สร้าง ID ผู้ใช้แยกตามบทบาท (usr-oXX สำหรับ Officer, usr-tXX สำหรับ Teacher)
  const userCount = await prisma.user.count()
  const prefix = roleType === 'OFFICER' ? 'usr-o' : roleType === 'TEACHER' ? 'usr-t' : 'usr-a'
  const customUserId = `${prefix}${String(userCount + 1).padStart(2, '0')}`

  const user = await prisma.user.create({
    data: {
      Usersid: customUserId,
      name,
      email,
      password: password,
      role: roleType,
      teacherId: (roleType === 'TEACHER' || roleType === 'OFFICER') ? teacherId || null : null,
      universityId: (roleType === 'TEACHER' || roleType === 'OFFICER') ? universityId || null : null,
    },
  })

  // บันทึก AuditLog
  await prisma.auditLog.create({
    data: {
      action: 'CREATE_USER',
      details: `เพิ่มผู้ใช้งานใหม่ บทบาท: ${roleType} (${name})`,
      userId: user.Usersid,
    },
  })

  revalidatePath('/admin/users')
  revalidatePath('/admin/dashboard')
}

export async function deleteUserData(id: string, type: 'USER' | 'STUDENT') {
  if (type === 'STUDENT') {
    await prisma.application.deleteMany({
      where: { studentId: id },
    })
    await prisma.student.delete({
      where: { Studentsid: id },
    })
  } else {
    await prisma.auditLog.deleteMany({
      where: { userId: id },
    })
    await prisma.user.delete({
      where: { Usersid: id },
    })
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin/dashboard')
}