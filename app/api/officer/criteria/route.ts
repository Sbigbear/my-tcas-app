import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // 1. แยกฟิลด์ที่ไม่เกี่ยวกับตาราง ProgramCriteria ออก เพื่อป้องกัน Unknown Argument Error
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
      universityMode,
      ...criteriaScores
    } = body

    if (!Program_Criteriaid || !programName || !capacity) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (รหัสเกณฑ์, ชื่อหลักสูตร, และจำนวนที่รับ)' },
        { status: 400 }
      )
    }

    // 2. ดึงข้อมูลเจ้าหน้าที่ผู้ใช้งานจาก Cookie หรือ JWT Token
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
      } catch (e) {
        console.error('JWT Decode Error:', e)
      }
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

    // 📌 3. ดึงชื่อคณะแบบ Dynamic (ใช้จาก DB ของผู้ใช้ หรือจากหน้าฟอร์ม)
    const faculty = officer.university?.faculty || bodyFacultyName?.trim()
    const campus = officer.university?.campus || 'บางเขน'
    const cleanDept = departmentName?.trim() || 'ประจำคณะ'

    if (!faculty) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลสังกัดคณะของผู้ใช้งาน กรุณาตรวจสอบข้อมูลบัญชีผู้ใช้' },
        { status: 400 }
      )
    }

    let targetUniversityId = selectedUnivId

    // 📌 4. ค้นหา หรือ สร้างสาขาวิชาใหม่ในตาราง University
    let existingUniv = await prisma.university.findFirst({
      where: {
        faculty,
        department: cleanDept,
        campus,
      },
    })

    if (existingUniv) {
      targetUniversityId = existingUniv.Universitiesid
    } else {
      const univCount = await prisma.university.count()
      const allUnivs = await prisma.university.findMany({ select: { Universitiesid: true } })

      const numbers = allUnivs
        .map((u) => {
          const numStr = u.Universitiesid.replace('univ-', '')
          const parsed = parseInt(numStr, 10)
          return isNaN(parsed) ? null : parsed
        })
        .filter((n): n is number => n !== null)

      const maxNum = numbers.length > 0 ? Math.max(...numbers) : univCount
      const newUnivId = `univ-${String(maxNum + 1).padStart(3, '0')}`
      const newCode = `KU${String(maxNum + 1).padStart(3, '0')}`

      const newUniv = await prisma.university.create({
        data: {
          Universitiesid: newUnivId,
          code: newCode,
          name: officer.university?.name || 'มหาวิทยาลัยเกษตรศาสตร์',
          campus,
          faculty,
          department: cleanDept,
        },
      })
      targetUniversityId = newUniv.Universitiesid
    }

    // ผูก universityId ให้เจ้าหน้าที่หากใน DB ยังไม่มี
    if (!officer.universityId) {
      await prisma.user.update({
        where: { Usersid: officer.Usersid },
        data: { universityId: targetUniversityId },
      })
    }

    // 📌 5. บันทึกเกณฑ์หลักสูตรลงตาราง ProgramCriteria
    const createdCriteria = await prisma.programCriteria.create({
      data: {
        Program_Criteriaid: Program_Criteriaid.trim(),
        universityId: targetUniversityId,
        programName,
        capacity: Number(capacity),
        isOpen: Boolean(isOpen),
        additionals: additionals || null,
        foreignLanguageSubject: foreignLanguageSubject || null,
        ...criteriaScores,
      },
    })

    // 📌 6. บันทึกประวัติการทำงานลง AuditLog / SystemLog
    const officerName = officer.name || 'เจ้าหน้าที่คณะ'
    const logDetails = `เจ้าหน้าที่คณะ (${officerName}) เพิ่มหลักสูตรใหม่: ${programName} (${faculty} - ${cleanDept}) รับจำนวน ${capacity} คน`

    try {
      if ((prisma as any).auditLog) {
        await (prisma as any).auditLog.create({
          data: {
            action: 'CREATE_COURSE',
            details: logDetails,
            userId: officer.Usersid,
          },
        })
      }

      if ((prisma as any).systemLog) {
        await (prisma as any).systemLog.create({
          data: {
            action: 'CREATE_COURSE',
            performedBy: officerName,
            role: officer.role || 'OFFICER',
            details: logDetails,
          },
        })
      }
    } catch (logErr) {
      console.error('AuditLog Error:', logErr)
    }

    // 📌 7. Revalidate ล้าง Cache ให้ข้อมูลอัปเดตเรียลไทม์ทันทีทุกหน้า
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