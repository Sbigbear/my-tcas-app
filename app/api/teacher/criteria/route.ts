import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const toNumber = (val: any) => {
  if (val === null || val === undefined || val === '') return null
  const parsed = Number(val)
  return isNaN(parsed) ? null : parsed
}

// ฟังก์ชันช่วยดึง userId ของผู้ใช้งานปัจจุบันจาก Cookie หรือ Token
async function getCurrentUserId() {
  try {
    const cookieStore = await cookies()
    let userId = cookieStore.get('userId')?.value || cookieStore.get('teacher_id')?.value
    const token = cookieStore.get('token')?.value

    if (!userId && token) {
      const decoded = jwt.decode(token) as any
      if (decoded) {
        userId = decoded?.id || decoded?.userId || decoded?.sub
      }
    }
    return userId || null
  } catch (e) {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let universityId = searchParams.get('universityId')

    if (!universityId) {
      const cookieStore = await cookies()
      
      let userEmail = cookieStore.get('email')?.value || cookieStore.get('user_email')?.value
      let userId = cookieStore.get('userId')?.value || cookieStore.get('teacher_id')?.value
      const token = cookieStore.get('token')?.value

      if (token) {
        try {
          const decoded = jwt.decode(token) as any
          if (decoded) {
            userEmail = userEmail || decoded?.email || decoded?.userEmail
            userId = userId || decoded?.id || decoded?.userId || decoded?.sub
          }
        } catch (e) {
          console.error('JWT Decode Error:', e)
        }
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

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.universityId) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลมหาวิทยาลัย/สาขา (universityId)' },
        { status: 400 }
      )
    }

    if (!body.programName) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุชื่อหลักสูตร/โครงการ' },
        { status: 400 }
      )
    }

    // 📌 อ่านค่าไอดีจาก Input ที่ผู้ใช้พิมพ์เข้ามา
    let criteriaId = body.Program_Criteriaid || body.criteriaId || ''
    criteriaId = typeof criteriaId === 'string' ? criteriaId.trim() : ''

    // 📌 กรณีถ้าผู้ใช้ปล่อยว่างไว้ ไม่ได้พิมพ์รหัสมา -> ระบบจะรัน crit-XXX ให้อัตโนมัติ
    if (!criteriaId) {
      const allCriteria = await prisma.programCriteria.findMany({
        where: {
          Program_Criteriaid: {
            startsWith: 'crit-',
          },
        },
        select: {
          Program_Criteriaid: true,
        },
      })

      const numbers = allCriteria
        .map((item) => {
          const numStr = item.Program_Criteriaid.replace('crit-', '')
          const parsed = parseInt(numStr, 10)
          return isNaN(parsed) ? null : parsed
        })
        .filter((num): num is number => num !== null)

      const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0
      const nextNum = maxNum + 1
      criteriaId = `crit-${String(nextNum).padStart(3, '0')}`
    }

    // บันทึกหลักสูตรใหม่ลงฐานข้อมูล
    const newCriteria = await prisma.programCriteria.create({
      data: {
        Program_Criteriaid: criteriaId,
        universityId: body.universityId,
        programName: body.programName,
        capacity: toNumber(body.capacity) ?? 0,
        isOpen: body.isOpen ?? true,
        additionals: body.additionals || null,
        minGpax: toNumber(body.minGpax),
        minMathGpa: toNumber(body.minMathGpa),
        minSciGpa: toNumber(body.minSciGpa),
        minEngGpa: toNumber(body.minEngGpa),
        minThaiGpa: toNumber(body.minThaiGpa),
        minSocialGpa: toNumber(body.minSocialGpa),
        minHealthGpa: toNumber(body.minHealthGpa),
        minArtGpa: toNumber(body.minArtGpa),
        minCareerGpa: toNumber(body.minCareerGpa),
        minTgat: toNumber(body.minTgat),
        minTpat1: toNumber(body.minTpat1),
        minTpat2: toNumber(body.minTpat2),
        minTpat3: toNumber(body.minTpat3),
        minTpat4: toNumber(body.minTpat4),
        minTpat5: toNumber(body.minTpat5),
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

    // 📌 บันทึกประวัติการทำงานลงตาราง D8_AuditLogs เพื่อแสดงใน System Logs
    const currentUserId = await getCurrentUserId()
    await prisma.auditLog.create({
      data: {
        action: 'เพิ่มหลักสูตรใหม่',
        details: `เพิ่มหลักสูตร/เกณฑ์ใหม่: ${criteriaId} (${body.programName})`,
        userId: currentUserId,
      },
    })

    return NextResponse.json({ success: true, data: newCriteria })
  } catch (error: any) {
    console.error('Error creating criteria:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create criteria' },
      { status: 500 }
    )
  }
}

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

    // 📌 บันทึกประวัติการอัปเดตสถานะลงตาราง D8_AuditLogs
    const currentUserId = await getCurrentUserId()
    await prisma.auditLog.create({
      data: {
        action: 'แก้ไขสถานะหลักสูตร',
        details: `อัปเดตสถานะหลักสูตร ${id} เป็น ${isOpen ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}`,
        userId: currentUserId,
      },
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