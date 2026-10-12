'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createUserData(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const roleType = formData.get('role') as 'OFFICER' | 'ADMIN'

  if (!name || !email || !password || !roleType) return

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
      userId: user.Usersid,
    },
  })

  revalidatePath('/admin/users')
  revalidatePath('/admin/dashboard')
}

export async function deleteUserData(id: string, type: 'USER' | 'STUDENT') {
  if (type === 'STUDENT') {
    await prisma.student.delete({
      where: { Studentsid: id },
    })
  } else {
    await prisma.user.delete({
      where: { Usersid: id },
    })
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin/dashboard')
}