import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import SampleApplyClient from './SampleApplyClient'

export default async function StudentSampleApplyPage() {
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

  // 📌 ซิงก์สถานะและรวบรวมเกณฑ์การรับสมัครทั้งหมดที่มีในระบบ
  const formattedCourses = await Promise.all(
    rawCourses.map(async (c: any) => {
      const criteriaId = c.Program_Criteriaid || c.ProgramCriteriaid || c.id
      const apps = c.applications || []

      const activeApplications = apps.filter((app: any) => app.status !== 'CANCELLED')
      const totalAppliedCount = activeApplications.length

      const passedCount = apps.filter(
        (app: any) => app.status === 'PASSED' || app.status === 'CONFIRMED'
      ).length

      const capacity = c.capacity || c.recruitAmount || 0
      const isFull = capacity > 0 && passedCount >= capacity
      let currentIsOpen = c.isOpen ?? true

      // ซิงก์สถานะ isOpen อัตโนมัติ
      if (criteriaId) {
        if (isFull && c.isOpen) {
          try {
            await prisma.programCriteria.update({
              where: { Program_Criteriaid: criteriaId },
              data: { isOpen: false },
            })
            currentIsOpen = false
          } catch (e) {
            try {
              await (prisma.programCriteria as any).update({
                where: { ProgramCriteriaid: criteriaId },
                data: { isOpen: false },
              })
              currentIsOpen = false
            } catch (err) {}
          }
        } else if (!isFull && !c.isOpen && capacity > 0) {
          try {
            await prisma.programCriteria.update({
              where: { Program_Criteriaid: criteriaId },
              data: { isOpen: true },
            })
            currentIsOpen = true
          } catch (e) {
            try {
              await (prisma.programCriteria as any).update({
                where: { ProgramCriteriaid: criteriaId },
                data: { isOpen: true },
              })
              currentIsOpen = true
            } catch (err) {}
          }
        }
      }

      const hasApplied = currentStudent
        ? activeApplications.some((app: any) => app.studentId === currentStudent.Studentsid)
        : false

      // 📌 รวบรวมเกณฑ์คุณสมบัติขั้นต่ำทั้งหมดที่มีใน DB
      const criteriaList = [
        // 1. เกรดเฉลี่ย (GPA)
        c.minGpax ? `GPAX ขั้นต่ำ: ${Number(c.minGpax).toFixed(2)}` : null,
        c.minMathGpa ? `GPA คณิต: ${Number(c.minMathGpa).toFixed(2)}` : null,
        c.minSciGpa ? `GPA วิทย์: ${Number(c.minSciGpa).toFixed(2)}` : null,
        c.minEngGpa ? `GPA อังกฤษ: ${Number(c.minEngGpa).toFixed(2)}` : null,
        c.minThaiGpa ? `GPA ไทย: ${Number(c.minThaiGpa).toFixed(2)}` : null,
        c.minSocialGpa ? `GPA สังคม: ${Number(c.minSocialGpa).toFixed(2)}` : null,
        c.minHealthGpa ? `GPA สุขศึกษา: ${Number(c.minHealthGpa).toFixed(2)}` : null,
        c.minArtGpa ? `GPA ศิลปะ: ${Number(c.minArtGpa).toFixed(2)}` : null,
        c.minCareerGpa ? `GPA การงาน: ${Number(c.minCareerGpa).toFixed(2)}` : null,

        // 2. TGAT / TPAT
        c.minTgat ? `TGAT ขั้นต่ำ: ${Number(c.minTgat).toFixed(2)}` : null,
        c.minTpat1 ? `TPAT1: ${Number(c.minTpat1).toFixed(2)}` : null,
        c.minTpat2 ? `TPAT2: ${Number(c.minTpat2).toFixed(2)}` : null,
        c.minTpat3 ? `TPAT3: ${Number(c.minTpat3).toFixed(2)}` : null,
        c.minTpat4 ? `TPAT4: ${Number(c.minTpat4).toFixed(2)}` : null,
        c.minTpat5 ? `TPAT5: ${Number(c.minTpat5).toFixed(2)}` : null,

        // 3. A-Level
        c.minAlevelMath1 ? `A-Level คณิต 1: ${Number(c.minAlevelMath1).toFixed(2)}` : null,
        c.minAlevelMath2 ? `A-Level คณิต 2: ${Number(c.minAlevelMath2).toFixed(2)}` : null,
        c.minAlevelSci ? `A-Level วิทย์ทั่วไป: ${Number(c.minAlevelSci).toFixed(2)}` : null,
        c.minAlevelPhy ? `A-Level ฟิสิกส์: ${Number(c.minAlevelPhy).toFixed(2)}` : null,
        c.minAlevelChem ? `A-Level เคมี: ${Number(c.minAlevelChem).toFixed(2)}` : null,
        c.minAlevelBio ? `A-Level ชีวะ: ${Number(c.minAlevelBio).toFixed(2)}` : null,
        c.minAlevelSoc ? `A-Level สังคม: ${Number(c.minAlevelSoc).toFixed(2)}` : null,
        c.minAlevelThai ? `A-Level ภาษาไทย: ${Number(c.minAlevelThai).toFixed(2)}` : null,
        c.minAlevelEng ? `A-Level อังกฤษ: ${Number(c.minAlevelEng).toFixed(2)}` : null,
        c.minAlevelForeign
          ? `A-Level ต่างประเทศ${c.foreignLanguageSubject ? ` (${c.foreignLanguageSubject})` : ''}: ${Number(c.minAlevelForeign).toFixed(2)}`
          : null,
      ].filter(Boolean) as string[]

      return {
        id: criteriaId,
        programName: c.programName || c.name || 'หลักสูตรไม่ระบุชื่อ',
        faculty: c.university?.faculty || '-',
        department: c.university?.department || '-',
        campus: c.university?.campus || '-',
        universityName: c.university?.name || 'มหาวิทยาลัยเกษตรศาสตร์',
        capacity,
        totalAppliedCount,
        passedCount,
        criteriaList,
        additionals: c.additionals ?? null,
        isOpen: currentIsOpen,
        isFull,
        hasApplied,
      }
    })
  )

  return (
    <SampleApplyClient
      courses={formattedCourses}
      studentName={currentStudent?.name || 'นักเรียน'}
    />
  )
}