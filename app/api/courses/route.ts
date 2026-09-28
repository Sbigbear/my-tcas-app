import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

// POST: เพิ่มหลักสูตรใหม่พร้อมเกณฑ์คะแนน
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // ดึง มหาวิทยาลัยแรกในระบบมาใช้ชั่วคราว (หรือสร้างใหม่ถ้ายังไม่มี)
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
        
        // เกณฑ์คะแนนกลุ่มสาระวิชา
        minMathGpa: body.minMathGpa ? parseFloat(body.minMathGpa) : null,
        minSciGpa: body.minSciGpa ? parseFloat(body.minSciGpa) : null,
        minEngGpa: body.minEngGpa ? parseFloat(body.minEngGpa) : null,
        
        // เกณฑ์คะแนน TGAT / TPAT
        minTgat: body.minTgat ? parseFloat(body.minTgat) : null,
        minTpat2: body.minTpat2 ? parseFloat(body.minTpat2) : null,
        minTpat3: body.minTpat3 ? parseFloat(body.minTpat3) : null,
        
        // เกณฑ์คะแนน A-Level
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