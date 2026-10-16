// app/api/teacher/criteria/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// GET: ดึงข้อมูลเกณฑ์ (สำหรับอาจารย์ใช้อ่าน/ดูเกณฑ์อ้างอิงในการคัดเลือก)
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

    // กรองตาม universityId
    const whereCondition = universityId ? { universityId } : {}

    const criteria = await prisma.programCriteria.findMany({
      where: whereCondition,
      include: { university: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: criteria })
  } catch (error) {
    console.error('Error fetching criteria for teacher:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch criteria' },
      { status: 500 }
    )
  }
}