import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'

export async function POST() {
  try {
    // 1. อ่านไฟล์จากโฟลเดอร์ D:\DATA\mock_tcas.json
    const filePath = 'D:/DATA/mock_tcas.json'
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบไฟล์ D:\\DATA\\mock_tcas.json' },
        { status: 404 }
      )
    }

    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { scores } = JSON.parse(fileContent)

    if (!scores || !Array.isArray(scores)) {
      return NextResponse.json({ success: false, message: 'รูปแบบข้อมูลคะแนนไม่ถูกต้อง' }, { status: 400 })
    }

    // 2. แมปคะแนนด้วย nationalId 13 หลักเพื่อดึง studentId แล้วบันทึกลง D4_Tcas_Scores
    const savedScores = []
    for (const sc of scores) {
      // ค้นหานักเรียนด้วย nationalId 13 หลัก
      const student = await prisma.student.findUnique({
        where: { nationalId: sc.nationalId },
      })

      // ถ้านักเรียนคนนี้ยังไม่มีในฐานข้อมูล ให้ข้ามไปก่อน
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
      message: `อ่านไฟล์ mock_tcas.json นำเข้าคะแนนแมปด้วยเลข 13 หลัก ลง MySQL สำเร็จ ${savedScores.length} รายการ`,
      data: savedScores,
    })
  } catch (error: any) {
    console.error('TCAS API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}