'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createUserData(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const roleType = formData.get('role') as 'STUDENT' | 'OFFICER' | 'ADMIN'

  if (!name || !email || !password || !roleType) return

  if (roleType === 'STUDENT') {
    // หา School ตัวแรกในระบบมารองรับการสร้างข้อมูล Student ชั่วคราว
    const defaultSchool = await prisma.school.findFirst()
    if (!defaultSchool) {
      throw new Error('กรุณาสร้างข้อมูล School ในระบบอย่างน้อย 1 รายการก่อน')
    }

    const mockCode = Date.now().toString().slice(-8)
    const mockNationalId = '1' + Date.now().toString().padStart(12, '0').slice(-12)

    const student = await prisma.student.create({
      data: {
        studentCode: `STD${mockCode}`,
        nationalId: mockNationalId,
        name: name,
        gpax: 0.0,
        schoolId: defaultSchool.Schoolsid, // อ้างอิง Primary Key ใหม่ของ School
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_STUDENT',
        details: `เพิ่มนักเรียนใหม่: ${name} (${email})`,
        studentId: student.Studentsid, // อ้างอิง Primary Key ใหม่ของ Student
      },
    })
  } else {
    // เพิ่มอาจารย์/เจ้าหน้าที่/ผู้ดูแลระบบลงตาราง User (บทบาท: ADMIN หรือ OFFICER)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password,
        role: roleType,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_USER',
        details: `เพิ่มผู้ใช้งานใหม่ บทบาท: ${roleType} (${name})`,
        userId: user.Usersid, // อ้างอิง Primary Key ใหม่ของ User
      },
    })
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin/dashboard')
}

export async function deleteUserData(id: string, type: 'USER' | 'STUDENT') {
  if (type === 'STUDENT') {
    await prisma.student.delete({
      where: { Studentsid: id }, // ลบด้วย Primary Key ใหม่
    })
  } else {
    await prisma.user.delete({
      where: { Usersid: id }, // ลบด้วย Primary Key ใหม่
    })
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin/dashboard')
}