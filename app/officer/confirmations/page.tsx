import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import ConfirmationsClient from './ConfirmationsClient'

async function getLoggedInOfficer() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let userEmail: string | undefined
    let userId: string | undefined

    if (token) {
      try {
        const decoded = jwt.decode(token) as any
        if (decoded) {
          userEmail = decoded?.email || decoded?.userEmail
          userId = decoded?.id || decoded?.userId || decoded?.sub
        }
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
      select: { Usersid: true, universityId: true, name: true, email: true, university: true },
    })

    return user
  } catch (e) {
    console.error('Error fetching officer:', e)
    return null
  }
}

export default async function OfficerConfirmationsPage() {
  const officer = await getLoggedInOfficer()

  if (!officer) {
    redirect('/login')
  }

  const faculty = officer.university?.faculty || ''

  // 📌 ดึงรายการผู้สมัครที่ผ่านการคัดเลือก (PASSED / CONFIRMED) ภายใต้คณะนี้
  const applications = faculty
    ? await prisma.application.findMany({
        where: {
          criteria: {
            university: {
              faculty: faculty,
            },
          },
          status: {
            in: ['PASSED', 'CONFIRMED'] as any,
          },
        },
        include: {
          student: true,
          criteria: {
            include: {
              university: true,
            },
          },
          facultyConfirmation: true,
        },
        orderBy: { updatedAt: 'desc' },
      })
    : []

  // 📌 แมปโครงสร้างข้อมูลให้ตรงกับที่ ConfirmationsClient.tsx เรียกใช้ทุกช่อง
  const formattedApplications = applications.map((app: any) => ({
    id: app.Applicationsid,
    applicationId: app.Applicationsid,
    studentName: app.student?.name || 'ไม่ระบุชื่อนักเรียน',
    studentNationalId: app.student?.nationalId || app.student?.studentCode || app.Applicationsid,
    programName: app.criteria?.programName || '-',
    departmentName: app.criteria?.university?.department || '-',
    facultyName: app.criteria?.university?.faculty || faculty || '-',
    criteriaCode: app.criteria?.Program_Criteriaid || '-',
    status: app.status,
    confirmedAt: app.facultyConfirmation?.createdAt
      ? new Date(app.facultyConfirmation.createdAt).toLocaleString('th-TH', {
          timeZone: 'Asia/Bangkok',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' น.'
      : undefined,
    confirmedBy: app.facultyConfirmation?.confirmedBy || undefined,
  }))

  return (
    <ConfirmationsClient
      confirmations={formattedApplications}
      officerUserId={officer.Usersid}
    />
  )
}