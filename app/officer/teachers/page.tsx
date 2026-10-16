import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import TeacherClient from './TeacherClient'

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
    console.error('Error fetching officer:', err)
    return null
  }
}

export default async function OfficerTeachersPage() {
  const officer = await getOfficerInfo()

  if (!officer || officer.role !== 'OFFICER') {
    redirect('/login')
  }

  // 📌 1. ดึงชื่อคณะของเจ้าหน้าที่
  let officerFaculty = officer.university?.faculty || ''

  if (!officerFaculty) {
    const latestUniv = await prisma.university.findFirst({
      where: { faculty: { not: '' } },
      orderBy: { createdAt: 'desc' },
    })

    if (latestUniv) {
      officerFaculty = latestUniv.faculty

      if (!officer.universityId) {
        try {
          await prisma.user.update({
            where: { Usersid: officer.Usersid },
            data: { universityId: latestUniv.Universitiesid },
          })
        } catch (e) {
          console.error('Auto-link officer university error:', e)
        }
      }
    }
  }

  // 📌 2. ดึงอาจารย์เฉพาะที่อยู่ในคณะเดียวกับเจ้าหน้าที่คนนี้
  const teachers = officerFaculty
    ? await prisma.user.findMany({
        where: {
          role: 'TEACHER',
          university: {
            faculty: officerFaculty,
          },
        },
        include: {
          university: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  // 📌 3. ดึงรายชื่อสาขาวิชาทั้งหมดในคณะนี้เพื่อทำ Dropdown
  const facultyDepartments = officerFaculty
    ? await prisma.university.findMany({
        where: { faculty: officerFaculty },
        select: { department: true },
        distinct: ['department'],
      })
    : []

  const departmentsList = facultyDepartments
    .map((d) => d.department)
    .filter((d) => d && d !== '-' && d !== 'ประจำคณะ')

  const formattedTeachers = teachers.map((t) => ({
    id: t.Usersid,
    name: t.name || 'ไม่ระบุชื่อ',
    email: t.email,
    teacherId: t.teacherId || '-',
    department: t.university?.department || '-',
  }))

  return (
    <TeacherClient
      initialTeachers={formattedTeachers}
      facultyName={officerFaculty}
      existingDepartments={departmentsList}
      officerUserId={officer.Usersid}
    />
  )
}