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
      ...criteriaScores
    } = body

    if (!Program_Criteriaid || !programName || !capacity) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // 1. ดึงข้อมูลเจ้าหน้าที่คณะเพื่อเอาคณะ (faculty) และ วิทยาเขต (campus)
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

    const officer = await prisma.user.findFirst({
      where: {
        OR: [
          userEmail ? { email: userEmail } : null,
          userId ? { Usersid: userId } : null,
        ].filter(Boolean) as any[],
      },
      include: { university: true },
    })

    if (!officer || !officer.university) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลสังกัดคณะของเจ้าหน้าที่' },
        { status: 403 }
      )
    }

    const faculty = officer.university.faculty
    const campus = officer.university.campus || 'บางเขน'
    let targetUniversityId = selectedUnivId

    // 2. ค้นหา หรือ สร้างสาขาวิชาใหม่ในตาราง University จากชื่อสาขาที่กรอกเข้ามา
    if (departmentName?.trim()) {
      const cleanDept = departmentName.trim()

      let existingUniv = await prisma.university.findFirst({
        where: {
          faculty,
          department: cleanDept,
          campus,
        },
      })

      if (existingUniv) {
        targetUniversityId = (existingUniv as any).Universitiesid || (existingUniv as any).Universityid
      } else {
        const univCount = await prisma.university.count()
        const allUnivs = await prisma.university.findMany({
          select: { Universitiesid: true } as any,
        })

        const numbers = allUnivs
          .map((u: any) => {
            const idStr = u.Universitiesid || u.Universityid || ''
            const numStr = idStr.replace('univ-', '')
            const parsed = parseInt(numStr, 10)
            return isNaN(parsed) ? null : parsed
          })
          .filter((n: number | null): n is number => n !== null)

        const maxNum = numbers.length > 0 ? Math.max(...numbers) : univCount
        const newUnivId = `univ-${String(maxNum + 1).padStart(3, '0')}`
        const newCode = `KU${String(maxNum + 1).padStart(3, '0')}`

        const newUniv = await prisma.university.create({
          data: {
            Universitiesid: newUnivId,
            code: newCode,
            name: officer.university.name || 'มหาวิทยาลัยเกษตรศาสตร์',
            campus,
            faculty,
            department: cleanDept,
          } as any,
        })
        targetUniversityId = (newUniv as any).Universitiesid || (newUniv as any).Universityid
      }
    }

    if (!targetUniversityId) {
      targetUniversityId = officer.universityId
    }

    // 3. บันทึกเกณฑ์หลักสูตรลงตาราง ProgramCriteria
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

    // 📌 4. บันทึกประวัติการทำงานลงตาราง AuditLog / SystemLog (สำหรับแสดงใน /admin/logs)
    const officerName = officer.name || 'เจ้าหน้าที่คณะ'
    const deptDisplay = departmentName?.trim() || officer.university.department || '-'
    const logDetails = `${officer.role === 'OFFICER' ? 'เจ้าหน้าที่คณะ' : 'อาจารย์'} (${officerName}) เพิ่มหลักสูตรใหม่: ${programName} (${deptDisplay}) รับจำนวน ${capacity} คน`

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

    // 📌 5. Revalidate ล้าง Cache ให้ข้อมูลอัปเดตเรียลไทม์ทันทีทุกหน้า
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
      { success: false, message: `เกิดข้อผิดพลาด: ${error.message}` },
      { status: 500 }
    )
  }
}