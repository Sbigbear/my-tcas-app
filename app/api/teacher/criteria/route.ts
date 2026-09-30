import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// บังคับไม่ให้ Next.js Cache ข้อมูล API นี้
export const dynamic = 'force-dynamic'

// GET: ดึงรายการหลักสูตรทั้งหมด
export async function GET() {
  try {
    const courses = await prisma.programCriteria.findMany({
      include: {
        university: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json({ success: true, data: courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { success: false, message: 'ไม่สามารถดึงข้อมูลหลักสูตรได้' },
      { status: 500 }
    )
  }
}

// POST: เพิ่มหลักสูตรใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json()

    let university = await prisma.university.findFirst()
    if (!university) {
      university = await prisma.university.create({
        data: {
          code: 'KU01',
          name: 'มหาวิทยาลัยเกษตรศาสตร์',
          campus: 'บางเขน',
          faculty: body.faculty || 'คณะวิทยาศาสตร์',
        },
      })
    }

    const newCourse = await prisma.programCriteria.create({
      data: {
        programName: body.programName,
        minGpax: parseFloat(body.minGpax) || 0.0,
        capacity: parseInt(body.capacity) || 0,
        isOpen: body.isOpen !== undefined ? Boolean(body.isOpen) : true,
        
        minMathGpa: body.minMathGpa ? parseFloat(body.minMathGpa) : null,
        minSciGpa: body.minSciGpa ? parseFloat(body.minSciGpa) : null,
        minEngGpa: body.minEngGpa ? parseFloat(body.minEngGpa) : null,
        minTgat: body.minTgat ? parseFloat(body.minTgat) : null,
        minTpat2: body.minTpat2 ? parseFloat(body.minTpat2) : null,
        minTpat3: body.minTpat3 ? parseFloat(body.minTpat3) : null,
        minAlevelMath1: body.minAlevelMath1 ? parseFloat(body.minAlevelMath1) : null,
        minAlevelSci: body.minAlevelSci ? parseFloat(body.minAlevelSci) : null,
        
        universityId: university.id,
      },
    })

    return NextResponse.json({ success: true, data: newCourse })
  } catch (error) {
    console.error('Error adding course:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    )
  }
}

// PATCH: อัปเดตสถานะ isOpen ลง DB
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, isOpen } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบ ID ของหลักสูตร' },
        { status: 400 }
      )
    }

    const updatedCourse = await prisma.programCriteria.update({
      where: { id },
      data: {
        isOpen: Boolean(isOpen),
      },
    })

    return NextResponse.json({ success: true, data: updatedCourse })
  } catch (error) {
    console.error('Error updating isOpen status:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกสถานะ' },
      { status: 500 }
    )
  }
}