import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // 1. ดึง query parameter เช่น studentId (ในระบบจริงดึงจาก Session/Cookie ได้)
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ success: false, message: 'ไม่พบรหัสนักเรียน' }, { status: 400 })
    }

    // 2. ดึงข้อมูลนักเรียนพร้อมคะแนน TCAS
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { tcasScores: true },
    })

    if (!student) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลนักเรียน' }, { status: 404 })
    }

    // 3. ดึงหลักสูตรทั้งหมดพร้อมข้อมูลมหาวิทยาลัย
    const programs = await prisma.programCriteria.findMany({
      include: { university: true },
    })

    // 4. คำนวณคุณสมบัติและเปอร์เซ็นต์ความเหมาะสม (Matching Logic)
    const matchedPrograms = programs.map((program) => {
      let isEligible = true
      let failedReasons: string[] = []

      // ตรวจสอบเกรดเฉลี่ย (GPAX)
      if (student.gpax < program.minGpax) {
        isEligible = false
        failedReasons.push(`GPAX ไม่ถึงเกณฑ์ (ต้องการขั้นต่ำ ${program.minGpax})`)
      }

      // ตรวจสอบเกรดเฉพาะวิชา
      if (program.minMathGpa && (student.mathGpa ?? 0) < program.minMathGpa) {
        isEligible = false
        failedReasons.push(`เกรดคณิตศาสตร์ไม่ถึง ${program.minMathGpa}`)
      }
      if (program.minSciGpa && (student.sciGpa ?? 0) < program.minSciGpa) {
        isEligible = false
        failedReasons.push(`เกรดวิทยาศาสตร์ไม่ถึง ${program.minSciGpa}`)
      }
      if (program.minEngGpa && (student.engGpa ?? 0) < program.minEngGpa) {
        isEligible = false
        failedReasons.push(`เกรดภาษาอังกฤษไม่ถึง ${program.minEngGpa}`)
      }

      // ตรวจสอบคะแนน TCAS
      const scores = student.tcasScores
      if (program.minTgat && (scores?.tgat ?? 0) < program.minTgat) {
        isEligible = false
        failedReasons.push(`TGAT ไม่ถึง ${program.minTgat}`)
      }
      if (program.minTpat3 && (scores?.tpat3 ?? 0) < program.minTpat3) {
        isEligible = false
        failedReasons.push(`TPAT3 ไม่ถึง ${program.minTpat3}`)
      }

      // คำนวณ Score Matching (ตัวอย่างการคำนวณอย่างง่าย)
      const matchPercentage = isEligible ? 90 + Math.floor(Math.random() * 8) : 50 + Math.floor(Math.random() * 20)

      return {
        ...program,
        isEligible,
        failedReasons,
        matchPercentage,
      }
    })

    return NextResponse.json({ success: true, data: matchedPrograms })
  } catch (error) {
    console.error('Matching Error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการประมวลผล' }, { status: 500 })
  }
}