import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import SearchClient from './SearchClient'

export default async function StudentSearchPage() {
  const cookieStore = await cookies()
  const studentIdCookie =
    cookieStore.get('student_id')?.value ||
    cookieStore.get('userId')?.value ||
    cookieStore.get('user_id')?.value

  // ดึงข้อมูลนักเรียนปัจจุบัน
  let currentStudent = null
  if (studentIdCookie) {
    currentStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { Studentsid: studentIdCookie },
          { studentCode: studentIdCookie },
          { nationalId: studentIdCookie },
        ],
      },
    })
  }

  if (!currentStudent) {
    currentStudent = await prisma.student.findFirst({
      orderBy: { createdAt: 'asc' },
    })
  }

  // ดึงหลักสูตรที่เปิดรับสมัครอยู่
  const openCourses = await prisma.programCriteria.findMany({
    where: { isOpen: true },
    include: {
      university: true,
      applications: currentStudent
        ? {
            where: { studentId: currentStudent.Studentsid },
          }
        : false,
    },
    orderBy: { createdAt: 'desc' },
  })

  const formattedCourses = openCourses.map((c) => ({
    id: c.Program_Criteriaid,
    programName: c.programName,
    faculty: c.university.faculty,
    department: c.university.department,
    campus: c.university.campus,
    universityName: c.university.name,
    capacity: c.capacity,
    minGpax: c.minGpax,
    minTgat: c.minTgat,
    additionals: c.additionals,
    hasApplied: c.applications ? c.applications.length > 0 : false,
  }))

  return (
    <SearchClient
      courses={formattedCourses}
      studentName={currentStudent?.name || 'นักเรียน'}
    />
  )
}