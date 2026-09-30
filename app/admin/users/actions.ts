'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createUserData(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string // 📌 ดึงค่า password จาก Form
  const roleType = formData.get('role') as 'STUDENT' | 'OFFICER' | 'ADMIN'

  if (!name || !email || !password || !roleType) return

  if (roleType === 'STUDENT') {
    // หา School ตัวแรกในระบบมารองรับการสร้างข้อมูล Student ชั่วคราว
    const defaultSchool = await prisma.school.findFirst()
    if (!defaultSchool) {
      throw new Error('กรุณาสร้างข้อมูล School ในระบบอย่างน้อย 1 รายการก่อน')
    }

    const mockId = Date.now().toString().slice(-8)
    const mockNationalId = '1' + Date.now().toString().padStart(12, '0').slice(-12)

    const student = await prisma.student.create({
      data: {
        studentId: `STD${mockId}`,
        nationalId: mockNationalId,
        name: name,
        gpax: 0.0,
        transcriptUrl: '',
        schoolId: defaultSchool.id,
        // password: password, // 👈 ถ้าใน schema.prisma ของ Student มีฟิลด์ password สามารถปลดคอมเมนต์ตรงนี้ได้ครับ
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_STUDENT',
        details: `เพิ่มนักเรียนใหม่: ${name} (${email})`,
        studentId: student.id,
      },
    })
  } else {
    // เพิ่มอาจารย์/เจ้าหน้าที่/ผู้ดูแลระบบลงตาราง User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password, // 📌 บันทึก password จากฟอร์มแทนค่า Default เดิม ('Password123!')
        role: roleType,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_USER',
        details: `เพิ่มผู้ใช้งานใหม่ บทบาท: ${roleType} (${name})`,
        userId: user.id,
      },
    })
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin/dashboard')
}

export async function deleteUserData(id: string, type: 'USER' | 'STUDENT') {
  if (type === 'STUDENT') {
    await prisma.student.delete({ where: { id } })
  } else {
    await prisma.user.delete({ where: { id } })
  }
  revalidatePath('/admin/users')
  revalidatePath('/admin/dashboard')
}