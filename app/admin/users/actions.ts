'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function createUserData(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const rawPassword = formData.get('password') as string
    const roleType = formData.get('role') as 'OFFICER' | 'TEACHER' | 'ADMIN'
    const teacherId = formData.get('teacherId') as string | null

    const universityMode = formData.get('universityMode') as string // 'SELECT' หรือ 'CUSTOM'
    let universityId = formData.get('universityId') as string | null
    const faculty = formData.get('faculty') as string | null
    const rawDepartment = formData.get('department') as string | null
    const campus = formData.get('campus') as string | null

    if (!name || !email || !rawPassword || !roleType) {
      return { success: false, message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' }
    }

    // 🔒 1. เข้ารหัสรหัสผ่าน (Hash Password) ก่อนบันทึกลงฐานข้อมูล
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    // 📌 ถ้าเป็นเจ้าหน้าที่คณะ (OFFICER) สาขาวิชาจะถูกกำหนดเป็น "ประจำคณะ" โดยอัตโนมัติ
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

    // 📌 2. คำนวณรหัสผู้ใช้แบบปลอดภัย ป้องกัน ID ชนกันเมื่อมีผู้ใช้ถูกลบ
    const allUsers = await prisma.user.findMany({
      select: { Usersid: true },
    })

    const prefix = roleType === 'OFFICER' ? 'usr-o' : roleType === 'TEACHER' ? 'usr-t' : 'usr-a'
    const numbers = allUsers
      .map((u) => {
        const numStr = u.Usersid.replace(/usr-[ota]/g, '')
        const parsed = parseInt(numStr, 10)
        return isNaN(parsed) ? null : parsed
      })
      .filter((n): n is number => n !== null)

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0
    const customUserId = `${prefix}${String(maxNum + 1).padStart(2, '0')}`

    // 🔒 3. สร้างบัญชีผู้ใช้งาน (ใช้รหัสผ่านที่ถูกแฮชแล้ว)
    const user = await prisma.user.create({
      data: {
        Usersid: customUserId,
        name,
        email,
        password: hashedPassword,
        role: roleType,
        teacherId: roleType === 'TEACHER' || roleType === 'OFFICER' ? teacherId || null : null,
        universityId: roleType === 'TEACHER' || roleType === 'OFFICER' ? universityId || null : null,
      },
    })

    // 📌 4. บันทึก AuditLog / SystemLog
    try {
      const roleLabel = roleType === 'OFFICER' ? 'เจ้าหน้าที่คณะ' : roleType === 'TEACHER' ? 'อาจารย์' : 'ผู้ดูแลระบบ'
      const logDetails = `เพิ่มผู้ใช้งานใหม่ บทบาท: ${roleLabel} (${name} - ${email})`

      if ((prisma as any).auditLog) {
        await (prisma as any).auditLog.create({
          data: {
            action: 'CREATE_USER',
            details: logDetails,
            userId: user.Usersid,
          },
        })
      }

      if ((prisma as any).systemLog) {
        await (prisma as any).systemLog.create({
          data: {
            action: 'CREATE_USER',
            performedBy: 'System Admin',
            role: 'ADMIN',
            details: logDetails,
          },
        })
      }
    } catch (logErr) {
      console.error('AuditLog Error:', logErr)
    }

    revalidatePath('/admin/users')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/logs')

    return { success: true, data: user }
  } catch (error: any) {
    console.error('Create user error:', error)
    if (error.code === 'P2002') {
      return { success: false, message: 'อีเมลนี้มีอยู่ในระบบแล้ว' }
    }
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้งาน' }
  }
}

export async function deleteUserData(id: string, type: 'USER' | 'STUDENT') {
  try {
    if (type === 'STUDENT') {
      await prisma.application.deleteMany({
        where: { studentId: id },
      })

      await prisma.student.deleteMany({
        where: { Studentsid: id },
      })
    } else {
      try {
        if ((prisma as any).auditLog) {
          await (prisma as any).auditLog.deleteMany({
            where: { userId: id },
          })
        }
        if ((prisma as any).facultyConfirmation) {
          await (prisma as any).facultyConfirmation.deleteMany({
            where: { confirmedBy: id },
          })
        }
      } catch (relErr) {
        console.error('Error clearing user relations:', relErr)
      }

      await prisma.user.deleteMany({
        where: { Usersid: id },
      })
    }

    revalidatePath('/admin/users')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/logs')

    return { success: true, message: 'ลบข้อมูลสำเร็จ' }
  } catch (error: any) {
    console.error('Delete data error:', error)
    revalidatePath('/admin/users')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/logs')
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล' }
  }
}