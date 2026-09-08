'use server'

import prisma from '../lib/prisma'; // หรือ '@/lib/prisma' ขึ้นอยู่กับชื่อไฟล์ที่คุณตั้งไว้ใน lib
import { Role, StudyPlan } from '@prisma/client'

// 1. ลงทะเบียนผู้ใช้งานใหม่ (User: School, University, TCAS)
export async function registerUser(data: FormData | any) {
  try {
    let email = ''
    let password = ''
    let confirmPassword = ''
    let fullName = ''
    let roleStr = ''
    let schoolName = ''
    let orgId = ''

    if (data instanceof FormData) {
      email = (data.get('email') as string) || ''
      password = (data.get('password') as string) || ''
      confirmPassword = (data.get('confirmPassword') as string) || ''
      fullName = (data.get('fullName') as string) || (data.get('name') as string) || ''
      roleStr = (data.get('role') as string) || 'SCHOOL'
      schoolName = (data.get('schoolName') as string) || ''
      orgId = (data.get('orgId') as string) || ''
    } else {
      email = data.email
      password = data.password || data.passwordHash
      confirmPassword = data.confirmPassword || ''
      fullName = data.fullName || data.name
      roleStr = data.role
      schoolName = data.schoolName
      orgId = data.orgId || data.schoolCode
    }

    if (password && confirmPassword && password !== confirmPassword) {
      return { success: false, message: 'รหัสผ่าน และ ยืนยันรหัสผ่าน ไม่ตรงกัน' }
    }

    const role = roleStr.toUpperCase() as Role

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' }
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: password,
        name: fullName,
        role,
        isVerified: true,
      },
    })

    if (role === 'SCHOOL') {
      await prisma.school.create({
        data: {
          userId: newUser.id,
          schoolCode: orgId || `SCH-${Date.now().toString().slice(-6)}`,
          name: schoolName || fullName,
        },
      })
    }

    if (role === 'UNIVERSITY') {
      await prisma.university.create({
        data: {
          userId: newUser.id,
          name: schoolName || fullName,
          abbreviation: orgId || 'UNIV',
        },
      })
    }

    return { success: true, message: 'ลงทะเบียนสำเร็จเข้าสู่ระบบเรียบร้อย!' }
  } catch (error: any) {
    console.error('Error in registerUser:', error)
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' }
  }
}

// 2. เข้าสู่ระบบ (Login)
export async function loginUser(data: FormData | any) {
  try {
    let email = ''
    let password = ''

    if (data instanceof FormData) {
      email = (data.get('email') as string) || ''
      password = (data.get('password') as string) || ''
    } else {
      email = data.email
      password = data.password
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, message: 'ไม่พบผู้ใช้งานนี้ในระบบ' }
    }

    if (user.passwordHash !== password) {
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' }
    }

    return {
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  } catch (error: any) {
    console.error('Error in loginUser:', error)
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }
  }
}

// 3. ฝั่งโรงเรียน: เพิ่มข้อมูลนักเรียนลงฐานข้อมูล
export async function addStudentBySchool(data: FormData | any) {
  try {
    let citizenId = ''
    let studentCode = ''
    let fullName = ''
    let studyPlanStr = ''
    let gpax = 0
    let gradYear = new Date().getFullYear() + 543
    let pdfPor1Url = ''
    let schoolId = ''

    if (data instanceof FormData) {
      citizenId = ((data.get('citizenId') || data.get('cid')) as string || '').trim()
      studentCode = ((data.get('studentCode') || data.get('code')) as string || '').trim()
      fullName = ((data.get('fullName') || data.get('name') || data.get('studentName')) as string || '').trim()
      studyPlanStr = ((data.get('studyPlan') || data.get('plan')) as string || '').trim()
      gpax = parseFloat((data.get('gpax') as string) || '0')
      gradYear = parseInt((data.get('gradYear') as string) || `${gradYear}`)
      pdfPor1Url = (data.get('pdfPor1Url') as string) || ''
      schoolId = (data.get('schoolId') as string) || ''
    } else {
      citizenId = (data.citizenId || data.cid || '').trim()
      studentCode = (data.studentCode || data.code || '').trim()
      fullName = (data.fullName || data.name || data.studentName || '').trim()
      studyPlanStr = (data.studyPlan || data.plan || '').trim()
      gpax = parseFloat(data.gpax || 0)
      gradYear = parseInt(data.gradYear || gradYear)
      pdfPor1Url = data.pdfPor1Url || ''
      schoolId = data.schoolId || ''
    }

    // กรณีไม่ได้ส่ง citizenId มา หรือเป็นค่าว่าง ให้สุ่ม ID ชั่วคราว ป้องกัน Unique Constraint Error
    if (!citizenId) {
      citizenId = `TEMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }

    // กรณีไม่ได้ส่ง studentCode มา
    if (!studentCode) {
      studentCode = `STU-${Date.now().toString().slice(-6)}`
    }

    // แปลงภาษาไทย/ข้อความจาก UI ให้ตรงกับ Enum ใน Prisma Schema
    let studyPlan: StudyPlan = StudyPlan.SCIENCE_MATH
    if (studyPlanStr.includes('วิทย์') || studyPlanStr.includes('SCIENCE')) {
      studyPlan = StudyPlan.SCIENCE_MATH
    } else if (studyPlanStr.includes('คำนวณ') || studyPlanStr.includes('MATH')) {
      studyPlan = StudyPlan.ARTS_MATH
    } else if (studyPlanStr.includes('ภาษา') || studyPlanStr.includes('LANG')) {
      studyPlan = StudyPlan.ARTS_LANGUAGE
    } else if (studyPlanStr.includes('ทั่วไป') || studyPlanStr.includes('GENERAL')) {
      studyPlan = StudyPlan.GENERAL
    } else if (Object.values(StudyPlan).includes(studyPlanStr as StudyPlan)) {
      studyPlan = studyPlanStr as StudyPlan
    }

    if (!schoolId) {
      const defaultSchool = await prisma.school.findFirst()
      if (!defaultSchool) {
        return { success: false, message: 'ยังไม่มีข้อมูลโรงเรียนในระบบ กรุณาลงทะเบียนโรงเรียนก่อน' }
      }
      schoolId = defaultSchool.id
    }

    // ตรวจสอบว่ามี citizenId นี้ในระบบแล้วหรือยัง
    const existingStudent = await prisma.student.findUnique({
      where: { citizenId },
    })

    if (existingStudent) {
      return { success: false, message: 'เลขบัตรประชาชนนี้ถูกลงทะเบียนในระบบแล้ว' }
    }

    const newStudent = await prisma.student.create({
      data: {
        schoolId,
        studentCode,
        citizenId,
        fullName,
        studyPlan,
        gpax,
        gradYear,
        pdfPor1Url: pdfPor1Url || null,
      },
    })

    return { success: true, message: 'บันทึกข้อมูลนักเรียนสำเร็จ!', student: newStudent }
  } catch (error: any) {
    console.error('Error in addStudentBySchool:', error)
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการบันทึกนักเรียน' }
  }
}

// 4. ฝั่ง TCAS: บันทึก/อัปเดตคะแนนสอบด้วยเลขบัตรประชาชน
export async function updateTcasScore(data: {
  citizenId: string
  tgatScore?: number
  tpat1?: number
}) {
  try {
    const student = await prisma.student.findUnique({
      where: { citizenId: data.citizenId },
    })

    if (!student) {
      return { success: false, message: 'ไม่พบข้อมูลนักเรียนที่มีเลขบัตรประชาชนนี้ในระบบ' }
    }

    const tcasScore = await prisma.tcasScore.upsert({
      where: { citizenId: data.citizenId },
      update: {
        tgatScore: data.tgatScore ?? 0,
        tpat1: data.tpat1,
      },
      create: {
        citizenId: data.citizenId,
        tgatScore: data.tgatScore ?? 0,
        tpat1: data.tpat1,
      },
    })

    return { success: true, message: 'บันทึกคะแนนสอบ TCAS สำเร็จ!', data: tcasScore }
  } catch (error: any) {
    console.error('Error in updateTcasScore:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกคะแนนสอบ' }
  }
}

// 5. ฝั่งนักเรียน: ค้นหาและ Matching คณะที่ผ่านเกณฑ์
export async function matchStudentEligibility(citizenId: string, studentCode: string) {
  try {
    const student = await prisma.student.findFirst({
      where: {
        citizenId: citizenId.trim(),
        studentCode: studentCode.trim(),
      },
      include: {
        school: true,
        tcasScore: true,
      },
    })

    if (!student) {
      return { success: false, message: 'ไม่พบข้อมูลนักเรียน กรุณาตรวจสอบเลขบัตรประชาชนและรหัสนักเรียน' }
    }

    const criteriaList = await prisma.programCriteria.findMany({
      include: {
        university: true,
      },
    })

    const studentTgat = student.tcasScore?.tgatScore ?? 0

    const matchedUniversities = criteriaList
      .filter((item) => {
        if (student.gpax < item.minGpax) return false
        if (studentTgat < item.minTgat) return false
        if (item.studyPlan !== student.studyPlan) return false // เงื่อนไขเดิม ไม่ได้แก้ไข
        return true
      })
      .map((item) => ({
        universityName: item.university.name,
        campus: item.campus,
        facultyName: item.faculty,
        majorName: item.major,
        minGpax: item.minGpax,
        minTgat: item.minTgat,
        allowedPlan: item.studyPlan,
        quota: item.seats,
        tcasRound: 1,
      }))

    return {
      success: true,
      student: {
        fullName: student.fullName,
        studentCode: student.studentCode,
        gpax: student.gpax,
        studyPlan: student.studyPlan,
        schoolName: student.school.name,
        // ✅ ปรับให้อ่านฟิลด์ tgatScore และ tpat1 จาก tcasScore
        tgat: student.tcasScore?.tgatScore ?? null,
        tpat: student.tcasScore?.tpat1 ?? null,
      },
      universities: matchedUniversities,
    }
  } catch (error: any) {
    console.error('Error in matchStudentEligibility:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการคำนวณ Matching' }
  }
}

// 6. ฝั่งมหาวิทยาลัย: บันทึกข้อมูลหลักสูตรและเกณฑ์การรับสมัคร (ProgramCriteria)
export async function addProgramCriteriaByUniversity(data: FormData | any) {
  try {
    let faculty = ''
    let major = ''
    let seats = 0
    let minGpax = 0.0
    let minTgat = 0.0
    let studyPlanStr = ''
    let universityId = ''

    if (data instanceof FormData) {
      faculty = (data.get('faculty') as string) || ''
      major = (data.get('major') as string) || ''
      seats = parseInt((data.get('seats') as string) || '0')
      minGpax = parseFloat((data.get('minGpax') as string) || '0')
      minTgat = parseFloat((data.get('minTgat') as string) || '0')
      studyPlanStr = (data.get('studyPlan') as string) || 'SCIENCE_MATH'
      universityId = (data.get('universityId') as string) || ''
    } else {
      faculty = data.faculty || ''
      major = data.major || ''
      seats = parseInt(data.seats || 0)
      minGpax = parseFloat(data.minGpax || 0)
      minTgat = parseFloat(data.minTgat || 0)
      studyPlanStr = data.studyPlan || 'SCIENCE_MATH'
      universityId = data.universityId || ''
    }

    if (!faculty || !major) {
      return { success: false, message: 'กรุณากรอกชื่อคณะและสาขาวิชาให้ครบถ้วน' }
    }

    // หากไม่มี universityId ให้ค้นหาจากมหาวิทยาลัยแรกในฐานข้อมูล หรือสร้างตั้งต้นไว้
    if (!universityId) {
      const defaultUni = await prisma.university.findFirst()
      if (defaultUni) {
        universityId = defaultUni.id
      } else {
        const newUni = await prisma.university.create({
          data: {
            name: 'มหาวิทยาลัยส่วนกลาง',
            abbreviation: 'UNIV',
            user: {
              create: {
                email: 'univ_admin@tcas.ac.th',
                passwordHash: 'defaultpassword',
                name: 'เจ้าหน้าที่มหาวิทยาลัยส่วนกลาง',
                role: Role.UNIVERSITY,
              },
            },
          },
        })
        universityId = newUni.id
      }
    }

    // แปลงสายการเรียนให้ตรงกับ Enum
    let studyPlan: StudyPlan = StudyPlan.SCIENCE_MATH
    if (studyPlanStr.includes('วิทย์') || studyPlanStr.includes('SCIENCE')) {
      studyPlan = StudyPlan.SCIENCE_MATH
    } else if (studyPlanStr.includes('คำนวณ') || studyPlanStr.includes('MATH')) {
      studyPlan = StudyPlan.ARTS_MATH
    } else if (studyPlanStr.includes('ภาษา') || studyPlanStr.includes('LANG')) {
      studyPlan = StudyPlan.ARTS_LANGUAGE
    } else if (studyPlanStr.includes('ทั่วไป') || studyPlanStr.includes('GENERAL')) {
      studyPlan = StudyPlan.GENERAL
    } else if (Object.values(StudyPlan).includes(studyPlanStr as StudyPlan)) {
      studyPlan = studyPlanStr as StudyPlan
    }

    const newCriteria = await prisma.programCriteria.create({
      data: {
        faculty,
        major,
        seats,
        minGpax,
        minTgat,
        studyPlan,
        campus: 'ศูนย์หลัก',
        tuitionFee: 0,
        university: {
          connect: { id: universityId }
        }
      },
    })

    return { success: true, message: 'บันทึกข้อมูลหลักสูตรสำเร็จ!', data: newCriteria }
  } catch (error: any) {
    console.error('Error in addProgramCriteriaByUniversity:', error)
    return { success: false, message: error.message || 'เกิดข้อผิดพลาดในการบันทึกหลักสูตร' }
  }
}