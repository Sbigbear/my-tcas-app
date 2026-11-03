// app/api/teacher/applications/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { ApplicationStatus } from '@prisma/client'

// GET: ดึงข้อมูลรายการ/เกณฑ์สำหรับอาจารย์ใช้อ่านและคัดเลือก
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
        // กรองเฉพาะเงื่อนไขที่มีค่า ป้องกัน Object ว่าง {} ดึง User คนแรกสุด
        const orConditions = []
        if (userEmail) orConditions.push({ email: userEmail })
        if (userId) orConditions.push({ Usersid: userId })

        const user = await prisma.user.findFirst({
          where: { OR: orConditions },
          select: { universityId: true },
        })
        universityId = user?.universityId || null
      }
    }

    // กรองตาม universityId
    const whereCondition = universityId ? { universityId } : {}

    const criteria = await prisma.programCriteria.findMany({
      where: whereCondition,
      include: { university: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: criteria })
  } catch (error) {
    console.error('Error fetching applications/criteria for teacher:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// POST / PUT: สำหรับอาจารย์กดประเมินสถานะผู้สมัคร (ผ่าน / ไม่ผ่าน)
export async function PUT(req: Request) {
  try {
    const { applicationId, status, remark } = await req.json()

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบถ้วน (applicationId หรือ status)' },
        { status: 400 }
      )
    }

    // 💡 ป้องกัน Error ข้อ 1: ตรวจสอบและแปลง Status ให้ตรงตาม Prisma Enum
    // ใน Schema Enum มี: PENDING, ELIGIBLE, INELIGIBLE, PASSED, CONFIRMED, CANCELLED (ไม่มี REJECTED)
    let updatedStatus: ApplicationStatus

    if (status === 'PASSED' || status === ApplicationStatus.PASSED) {
      updatedStatus = ApplicationStatus.PASSED
    } else if (status === 'REJECTED' || status === 'INELIGIBLE' || status === ApplicationStatus.INELIGIBLE) {
      // หากฝั่ง Frontend ส่ง 'REJECTED' หรือ 'INELIGIBLE' มา ให้แมปเป็น INELIGIBLE เสมอ
      updatedStatus = ApplicationStatus.INELIGIBLE
    } else {
      updatedStatus = status as ApplicationStatus
    }

    const updatedApplication = await prisma.application.update({
      where: { Applicationsid: applicationId },
      data: {
        status: updatedStatus,
        remark: remark || null,
        evaluatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: updatedApplication })
  } catch (error: any) {
    console.error('Teacher evaluation error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการบันทึกผลการประเมิน' },
      { status: 500 }
    )
  }
}