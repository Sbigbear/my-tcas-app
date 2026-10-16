import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    const {
      Program_Criteriaid,
      universityId: selectedUnivId,
      departmentName,
      programName,
      capacity,
      isOpen,
      additionals,
      foreignLanguageSubject,
      facultyName: bodyFacultyName,
      campusName: bodyCampusName,
      universityMode,
      ...criteriaScores
    } = body

    if (!Program_Criteriaid || !programName || !capacity) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (รหัสเกณฑ์, ชื่อหลักสูตร, และจำนวนที่รับ)' },
        { status: 400 }
      )
    }

    // 1. ดึงข้อมูลเจ้าหน้าที่ผู้ใช้งาน
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    let userEmail = cookieStore.get('email')?.value || cookieStore.get('user_email')?.value
    let userId = cookieStore.get('officer_id')?.value || cookieStore.get('userId')?.value || cookieStore.get('user_id')?.value

    if (token) {
      try {
        const decoded = jwt.decode(token) as any
        if (decoded) {
          userEmail = decoded?.email || decoded?.userEmail || userEmail
          userId = decoded?.id || decoded?.userId || decoded?.sub || userId
        }
      } catch (e) {}
    }

    const orConditions = [
      userEmail ? { email: userEmail } : null,
      userId ? { Usersid: userId } : null,
    ].filter(Boolean) as any[]

    if (orConditions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่อีกครั้ง' },
        { status: 401 }
      )
    }

    const officer = await prisma.user.findFirst({
      where: { OR: orConditions },
      include: { university: true },
    })

    if (!officer) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลบัญชีผู้ใช้เจ้าหน้าที่ในระบบ' },
        { status: 404 }
      )
    }

    // 📌 2. ดึงชื่อคณะและสาขาจาก Request Payload เป็นหลัก
    const cleanFaculty = bodyFacultyName?.trim() || officer.university?.faculty?.trim()
    const cleanDept = departmentName?.trim() || 'ประจำคณะ'
    const cleanCampus = bodyCampusName?.trim() || officer.university?.campus?.trim() || 'บางเขน'

    if (!cleanFaculty) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุชื่อคณะสังกัดให้ถูกต้อง' },
        { status: 400 }
      )
    }

    // 📌 3. ค้นหาใน DB ว่ามี (คณะ + สาขา) ตรงกันอยู่แล้วหรือไม่
    let targetUniv = await prisma.university.findFirst({
      where: {
        faculty: cleanFaculty,
        department: cleanDept,
      },
    })

    // 📌 4. หากยังไม่มีใน DB ค่อยสร้าง University Record ใหม่ให้สาขานี้
    if (!targetUniv) {
      const sameFacultyUniv = await prisma.university.findFirst({
        where: { faculty: cleanFaculty },
      })

      const finalName = sameFacultyUniv?.name || officer.university?.name || 'มหาวิทยาลัยเกษตรศาสตร์'
      const finalCampus = cleanCampus || sameFacultyUniv?.campus || 'บางเขน'

      const allUnivs = await prisma.university.findMany({ select: { Universitiesid: true } })
      const numbers = allUnivs
        .map((u) => {
          const numStr = u.Universitiesid.replace('univ-', '')
          const parsed = parseInt(numStr, 10)
          return isNaN(parsed) ? null : parsed
        })
        .filter((n): n is number => n !== null)

      const maxNum = numbers.length > 0 ? Math.max(...numbers) : allUnivs.length
      const newUnivId = `univ-${String(maxNum + 1).padStart(3, '0')}`
      const newCode = `KU${String(maxNum + 1).padStart(3, '0')}`

      targetUniv = await prisma.university.create({
        data: {
          Universitiesid: newUnivId,
          code: newCode,
          name: finalName,
          campus: finalCampus,
          faculty: cleanFaculty,
          department: cleanDept,
        },
      })
    }

    // 📌 5. ผูก universityId กลับเข้าบัญชีเจ้าหน้าที่หากยังเป็น NULL
    if (!officer.universityId) {
      await prisma.user.update({
        where: { Usersid: officer.Usersid },
        data: { universityId: targetUniv.Universitiesid },
      })
    }

    // 📌 6. บันทึกหลักสูตรใหม่
    const createdCriteria = await prisma.programCriteria.create({
      data: {
        Program_Criteriaid: Program_Criteriaid.trim(),
        universityId: targetUniv.Universitiesid,
        programName,
        capacity: Number(capacity),
        isOpen: Boolean(isOpen),
        additionals: additionals || null,
        foreignLanguageSubject: foreignLanguageSubject || null,
        ...criteriaScores,
      },
    })

    // 📌 7. Revalidate เคลียร์ Cache ให้ข้อมูลอัปเดตเรียลไทม์
    revalidatePath('/admin/logs')
    revalidatePath('/officer/courses')
    revalidatePath('/teacher/courses')
    revalidatePath('/student/search')

    return NextResponse.json({ success: true, data: createdCriteria })
  } catch (error: any) {
    console.error('Create criteria error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'รหัสเกณฑ์หลักสูตรนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}` },
      { status: 500 }
    )
  }
}