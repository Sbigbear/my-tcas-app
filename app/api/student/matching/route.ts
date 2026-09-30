import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId') || '66010001'

    // 1. ดึงข้อมูลนักเรียน
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id: studentId },
          { studentId: studentId }
        ]
      },
      include: { tcasScores: true },
    })

    // 2. ดึงหลักสูตรทั้งหมดพร้อมข้อมูลมหาวิทยาลัย
    const programs = await prisma.programCriteria.findMany({
      include: {
        university: true
      }
    })

    // 3. Map ข้อมูลและเช็กสถานะเปิด/ปิดจริงจาก DB
    const matchedPrograms = programs.map((program: any) => {
      let isEligible = true
      let failedReasons: string[] = []

      if (student) {
        if (student.gpax < program.minGpax) {
          isEligible = false
          failedReasons.push(`GPAX ไม่ถึงเกณฑ์ (ต้องการขั้นต่ำ ${program.minGpax})`)
        }
      }

      // 📌 อ่านค่าการเปิด/ปิดจริงจาก DB
      // ถ้าใน DB ใช้ฟิลด์ isOpen (boolean) หรือ status (string)
      let isOpenStatus = true
      if (typeof program.isOpen === 'boolean') {
        isOpenStatus = program.isOpen
      } else if (program.status) {
        isOpenStatus = program.status === 'OPEN' || program.status === 'ACTIVE'
      }

      return {
        id: program.id,
        programName: program.programName,
        minGpax: program.minGpax,
        capacity: program.capacity ?? 30,
        isOpen: isOpenStatus, // 👈 สถานะจริงจาก DB
        isEligible,
        matchPercentage: isEligible ? 95 : 45,
        failedReasons,
        university: {
          name: program.university?.name || 'มหาวิทยาลัย',
          faculty: program.university?.faculty || 'คณะ'
        }
      }
    })

    return NextResponse.json({ success: true, data: matchedPrograms })
  } catch (error) {
    console.error('Matching API Error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}