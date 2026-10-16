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

  // ดึงหลักสูตรทั้งหมด พร้อมประวัติการสมัครเพื่อคำนวณจำนวนรวม
  const rawCourses = await prisma.programCriteria.findMany({
    include: {
      university: true,
      applications: {
        select: { studentId: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // 📌 ซิงก์สถานะลง MySQL แบบ 2 ทาง (Auto Close เมื่ออาจารย์กดรับครบเต็มจำนวน & Auto Re-open เมื่อมีที่นั่งว่าง)
  const formattedCourses = await Promise.all(
    rawCourses.map(async (c) => {
      const apps = c.applications || []

      // 1. นับจำนวนผู้สมัครที่ไม่ถูกยกเลิก (สำหรับนับยอดสมัครรวม)
      const activeApplications = apps.filter((app) => app.status !== 'CANCELLED')
      const totalAppliedCount = activeApplications.length

      // 2. 📌 นับเฉพาะจำนวนคนที่อาจารย์กด "รับผ่านการคัดเลือก" แล้วจริง (PASSED หรือ CONFIRMED)
      const passedCount = apps.filter(
        (app) => app.status === 'PASSED' || app.status === 'CONFIRMED'
      ).length

      // 3. 📌 หลักสูตรจะถือว่าเต็ม (isFull) ก็ต่อเมื่อ "จำนวนผู้ผ่านการคัดเลือก" >= จำนวนรับ (capacity)
      const isFull = c.capacity > 0 && passedCount >= c.capacity

      let currentIsOpen = c.isOpen

      // 4. ซิงก์สถานะ isOpen ลงในฐานข้อมูลจริง
      // ถ้าอาจารย์กดรับครบเต็มจำนวนโควตา -> สั่งปิดรับสมัคร (isOpen = false)
      if (isFull && c.isOpen) {
        await prisma.programCriteria.update({
          where: { Program_Criteriaid: c.Program_Criteriaid },
          data: { isOpen: false },
        })
        currentIsOpen = false
      }
      // ถ้าอาจารย์ยังกดรับไม่ครบ (เช่น รับแล้ว 1/2) แต่ DB ปิดอยู่ -> สั่งเปิดรับสมัครคืน (isOpen = true) อัตโนมัติ!
      else if (!isFull && !c.isOpen && c.capacity > 0) {
        await prisma.programCriteria.update({
          where: { Program_Criteriaid: c.Program_Criteriaid },
          data: { isOpen: true },
        })
        currentIsOpen = true
      }

      // ตรวจสอบว่านักเรียนคนนี้สมัครหลักสูตรนี้ไปแล้วหรือยัง
      const hasApplied = currentStudent
        ? activeApplications.some((app) => app.studentId === currentStudent.Studentsid)
        : false

      return {
        id: c.Program_Criteriaid,
        programName: c.programName,
        faculty: c.university?.faculty || '-',
        department: c.university?.department || '-',
        campus: c.university?.campus || '-',
        universityName: c.university?.name || '-',
        capacity: c.capacity,
        totalAppliedCount,
        passedCount,
        minGpax: c.minGpax,
        minTgat: c.minTgat,
        additionals: c.additionals,
        isOpen: currentIsOpen,
        isFull,
        hasApplied,
      }
    })
  )

  return (
    <SearchClient
      courses={formattedCourses}
      studentName={currentStudent?.name || 'นักเรียน'}
    />
  )
}