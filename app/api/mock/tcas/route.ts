import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import tcasScoresData from '@/data/mock_tcas_scores.json'

// GET: ส่งคืนข้อมูลคะแนน TCAS จำลองให้หน้าเว็บดู (Mock API)
export async function GET() {
  return NextResponse.json(tcasScoresData)
}

// POST: ซิงก์ข้อมูลคะแนน TCAS ลง MySQL (TiDB Cloud)
export async function POST() {
  try {
    let scores: any[] = []
    const parsedData: any = tcasScoresData

    if (Array.isArray(parsedData)) {
      scores = parsedData
    } else {
      scores = parsedData.scores || []
    }

    if (!Array.isArray(scores) || scores.length === 0) {
      return NextResponse.json({ success: false, message: 'รูปแบบข้อมูลคะแนนไม่ถูกต้อง หรือไม่พบข้อมูล' }, { status: 400 })
    }

    // แมปคะแนนด้วย nationalId 13 หลัก แล้วบันทึกลงตาราง D4_Tcas_Scores
    const savedScores = []
    for (const sc of scores) {
      const student = await prisma.student.findUnique({
        where: { nationalId: sc.nationalId },
      })

      if (!student) continue

      const scoreData = {
        tgat: sc.tgat !== undefined ? Number(sc.tgat) : null,
        tpat1: sc.tpat1 !== undefined ? Number(sc.tpat1) : null,
        tpat2: sc.tpat2 !== undefined ? Number(sc.tpat2) : null,
        tpat3: sc.tpat3 !== undefined ? Number(sc.tpat3) : null,
        tpat4: sc.tpat4 !== undefined ? Number(sc.tpat4) : null,
        tpat5: sc.tpat5 !== undefined ? Number(sc.tpat5) : null,
        alevelMath1: sc.alevelMath1 !== undefined ? Number(sc.alevelMath1) : null,
        alevelMath2: sc.alevelMath2 !== undefined ? Number(sc.alevelMath2) : null,
        alevelSci: sc.alevelSci !== undefined ? Number(sc.alevelSci) : null,
        alevelPhy: sc.alevelPhy !== undefined ? Number(sc.alevelPhy) : null,
        alevelChem: sc.alevelChem !== undefined ? Number(sc.alevelChem) : null,
        alevelBio: sc.alevelBio !== undefined ? Number(sc.alevelBio) : null,
        alevelSoc: sc.alevelSoc !== undefined ? Number(sc.alevelSoc) : null,
        alevelThai: sc.alevelThai !== undefined ? Number(sc.alevelThai) : null,
        alevelEng: sc.alevelEng !== undefined ? Number(sc.alevelEng) : null,
        alevelForeign: sc.alevelForeign !== undefined ? Number(sc.alevelForeign) : null,
      }

      const result = await prisma.tcasScore.upsert({
        where: { studentId: student.Studentsid },
        update: scoreData,
        create: {
          studentId: student.Studentsid,
          ...scoreData,
        },
      })
      savedScores.push(result)
    }

    return NextResponse.json({
      success: true,
      message: `นำเข้าคะแนน TCAS สำเร็จ ${savedScores.length} รายการ`,
      data: savedScores,
    })
  } catch (error: any) {
    console.error('TCAS API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}