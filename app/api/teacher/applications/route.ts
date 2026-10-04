// app/api/teacher/criteria/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// ช่วยแปลงค่า String/Empty จาก Form เป็น Number หรือ null
const toNumber = (val: any) => {
  if (val === null || val === undefined || val === '') return null
  const parsed = Number(val)
  return isNaN(parsed) ? null : parsed
}

// GET: ดึงข้อมูลเกณฑ์ (กรองตาม universityId ของอาจารย์)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let universityId = searchParams.get('universityId')

    // ถ้าไม่ได้ส่ง universityId มา ให้พยายามอ่านจาก Cookie/Token ของอาจารย์ที่ล็อกอิน
    if (!universityId) {
      const cookieStore = await cookies()
      const token = cookieStore.get('token')?.value

      let userEmail: string | undefined
      let userId: string | undefined

      if (token) {
        const decoded = jwt.decode(token) as any
        userEmail = decoded?.email || decoded?.userEmail
        userId = decoded?.id || decoded?.userId || decoded?.sub
      }

      if (!userEmail) {
        userEmail = cookieStore.get('user_email')?.value
      }

      if (userEmail || userId) {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              userEmail ? { email: userEmail } : {},
              userId ? { Usersid: userId } : {},
            ],
          },
          select: { universityId: true },
        })
        universityId = user?.universityId || null
      }
    }

    // กรองตาม universityId (ถ้าเจอ)
    const whereCondition = universityId ? { universityId } : {}

    const criteria = await prisma.programCriteria.findMany({
      where: whereCondition,
      include: { university: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: criteria })
  } catch (error) {
    console.error('Error fetching criteria:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch criteria' },
      { status: 500 }
    )
  }
}

// POST: บันทึกเกณฑ์หลักสูตรใหม่
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 1. ตรวจสอบว่าส่ง universityId มาหรือไม่
    if (!body.universityId) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลมหาวิทยาลัย/สาขา (universityId)' },
        { status: 400 }
      )
    }

    // 2. บันทึก ProgramCriteria โดยผูกกับ universityId และแปลงข้อมูลตัวเลขให้ถูกต้อง
    const newCriteria = await prisma.programCriteria.create({
      data: {
        universityId: body.universityId,
        programName: body.programName,
        capacity: toNumber(body.capacity) ?? 0,
        minGpax: toNumber(body.minGpax),
        isOpen: body.isOpen ?? true,

        // GPA
        minMathGpa: toNumber(body.minMathGpa),
        minSciGpa: toNumber(body.minSciGpa),
        minEngGpa: toNumber(body.minEngGpa),
        minThaiGpa: toNumber(body.minThaiGpa),
        minSocialGpa: toNumber(body.minSocialGpa),
        minHealthGpa: toNumber(body.minHealthGpa),
        minArtGpa: toNumber(body.minArtGpa),
        minCareerGpa: toNumber(body.minCareerGpa),

        // TGAT / TPAT
        minTgat: toNumber(body.minTgat),
        minTpat1: toNumber(body.minTpat1),
        minTpat2: toNumber(body.minTpat2),
        minTpat3: toNumber(body.minTpat3),
        minTpat4: toNumber(body.minTpat4),
        minTpat5: toNumber(body.minTpat5),

        // A-Level
        minAlevelMath1: toNumber(body.minAlevelMath1),
        minAlevelMath2: toNumber(body.minAlevelMath2),
        minAlevelSci: toNumber(body.minAlevelSci),
        minAlevelPhy: toNumber(body.minAlevelPhy),
        minAlevelChem: toNumber(body.minAlevelChem),
        minAlevelBio: toNumber(body.minAlevelBio),
        minAlevelSoc: toNumber(body.minAlevelSoc),
        minAlevelThai: toNumber(body.minAlevelThai),
        minAlevelEng: toNumber(body.minAlevelEng),
        minAlevelForeign: toNumber(body.minAlevelForeign),
        foreignLanguageSubject: body.foreignLanguageSubject || null,
      },
    })

    return NextResponse.json({ success: true, data: newCriteria })
  } catch (error) {
    console.error('Error creating criteria:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create criteria' },
      { status: 500 }
    )
  }
}

// PATCH: อัปเดตสถานะ เปิด/ปิด รับสมัคร
export async function PATCH(req: Request) {
  try {
    const { id, isOpen } = await req.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing criteria ID' },
        { status: 400 }
      )
    }

    const updated = await prisma.programCriteria.update({
      where: { Program_Criteriaid: id },
      data: { isOpen },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update status' },
      { status: 500 }
    )
  }
}