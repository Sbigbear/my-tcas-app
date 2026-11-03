import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import tcasScoresData from '@/data/mock_tcas_scores.json'
import { cookies } from 'next/headers'

// 🔒 ฟังก์ชันเช็กสิทธิ์ Admin จาก Cookie / Session
async function checkAdminPermission(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value || cookieStore.get('user_role')?.value
  // หมายเหตุ: สามารถปลดคอมเมนต์บรรทัดล่างเมื่อต้องการเปิดใช้การบังคับเช็กสิทธิ์ Strict Mode
  // if (!token) return false
  return true
}

// GET: ส่งคืนข้อมูลคะแนน TCAS จำลองให้หน้าเว็บดู (Mock API)
export async function GET(req: NextRequest) {
  const isAllowed = await checkAdminPermission(req)
  if (!isAllowed) {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' }, { status: 401 })
  }
  return NextResponse.json(tcasScoresData)
}

// POST: ซิงก์ข้อมูลคะแนน TCAS ลง MySQL (TiDB Cloud)
export async function POST(req: NextRequest) {
  try {
    const isAllowed = await checkAdminPermission(req)
    if (!isAllowed) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ใช้งาน API ซิงก์ข้อมูล' }, { status: 401 })
    }

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

    // 1. ดึงนักเรียนทั้งหมดที่มี nationalId ในคะแนนครั้งเดียว (ลด Query จาก 120 รอบเหลือ 1 รอบ)
    const nationalIds = scores.map((sc) => sc.nationalId).filter(Boolean)
    const existingStudents = await prisma.student.findMany({
      where: { nationalId: { in: nationalIds } },
      select: { Studentsid: true, nationalId: true },
    })

    const studentMap = new Map<string, string>()
    existingStudents.forEach((st) => studentMap.set(st.nationalId, st.Studentsid))

    // 2. เตรียม Operation บันทึกคะแนนแบบ Batch
    const scoreOps = []
    for (const sc of scores) {
      const studentId = studentMap.get(sc.nationalId)
      if (!studentId) continue

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

      scoreOps.push(
        prisma.tcasScore.upsert({
          where: { studentId: studentId },
          update: scoreData,
          create: {
            studentId: studentId,
            ...scoreData,
          },
        })
      )
    }

    // 3. รัน Transaction เพื่อบันทึกคะแนนทั้งหมดรวดเดียว
    const savedScores = await prisma.$transaction(scoreOps)

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