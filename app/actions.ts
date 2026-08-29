'use server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// 1. ฟังก์ชันสำหรับฝั่งโรงเรียน (School)
export async function addStudentBySchool(formData: FormData) {
  const nationalId = String(formData.get('nationalId') || formData.get('national_id') || '')
  const studentId = String(formData.get('studentId') || formData.get('student_id') || '')
  const name = String(formData.get('name') || '')
  const schoolName = String(formData.get('schoolName') || formData.get('school_name') || '')
  const gpax = parseFloat(String(formData.get('gpax') || '0'))
  const studyPlan = String(formData.get('studyPlan') || formData.get('study_plan') || '')

  try {
    // @ts-ignore
    await sql`
      INSERT INTO students (national_id, student_id, name, school_name, gpax, study_plan)
      VALUES (${nationalId}, ${studentId}, ${name}, ${schoolName}, ${gpax}, ${studyPlan})
      ON CONFLICT (national_id) 
      DO UPDATE SET 
        student_id = ${studentId},
        name = ${name},
        school_name = ${schoolName},
        gpax = ${gpax},
        study_plan = ${studyPlan}
    `
    return { success: true, message: 'บันทึกข้อมูลนักเรียนเรียบร้อยแล้ว' }
  } catch (error) {
    console.error('Database Error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล' }
  }
}

// 2. ฟังก์ชันสำหรับฝั่ง myTCAS (คะแนนสอบ)
export async function addExamScoresByTCAS(formData: FormData) {
  const nationalId = String(formData.get('nationalId') || formData.get('national_id') || '')
  const scoreTgat = parseFloat(String(formData.get('scoreTgat') || formData.get('score_tgat') || '0'))
  const scoreTpat = parseFloat(String(formData.get('scoreTpat') || formData.get('score_tpat') || '0'))

  try {
    // @ts-ignore
    await sql`
      UPDATE students 
      SET score_tgat = ${scoreTgat}, score_tpat = ${scoreTpat}
      WHERE national_id = ${nationalId}
    `
    return { success: true, message: 'บันทึกคะแนนสอบ TCAS เรียบร้อยแล้ว' }
  } catch (error) {
    console.error('TCAS Score Error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกคะแนน' }
  }
}

// 3. ฟังก์ชันสำหรับฝั่งมหาวิทยาลัย (เกณฑ์การรับ)
export async function addUniversityRequirement(formData: FormData) {
  const universityName = String(formData.get('universityName') || formData.get('university_name') || '')
  const facultyName = String(formData.get('facultyName') || formData.get('faculty_name') || '')
  const majorName = String(formData.get('majorName') || formData.get('major_name') || '')
  const tcasRound = parseInt(String(formData.get('tcasRound') || formData.get('tcas_round') || '1'))
  const minGpax = parseFloat(String(formData.get('minGpax') || formData.get('min_gpax') || '0'))
  const minTgat = parseFloat(String(formData.get('minTgat') || formData.get('min_tgat') || '0'))
  const allowedPlan = String(formData.get('allowedPlan') || formData.get('allowed_plan') || '')
  const quota = parseInt(String(formData.get('quota') || '0'))

  try {
    // @ts-ignore
    await sql`
      INSERT INTO university_requirements 
      (university_name, faculty_name, major_name, tcas_round, min_gpax, min_tgat, allowed_plan, quota)
      VALUES (${universityName}, ${facultyName}, ${majorName}, ${tcasRound}, ${minGpax}, ${minTgat}, ${allowedPlan}, ${quota})
    `
    return { success: true, message: 'บันทึกเกณฑ์รับสมัครเรียบร้อยแล้ว' }
  } catch (error) {
    console.error('Uni Req Error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกเกณฑ์รับสมัคร' }
  }
}

// 4. ฟังก์ชันค้นหาและจับคู่สาขาที่สมัครได้สำหรับนักเรียน (Student)
export async function matchStudentEligibility(nationalId: string, studentId: string) {
  try {
    // @ts-ignore
    const students = await sql`
      SELECT * FROM students 
      WHERE national_id = ${nationalId} AND student_id = ${studentId}
      LIMIT 1
    `

    if (!students || students.length === 0) {
      return { success: false, message: 'ไม่พบข้อมูลนักเรียน กรุณาตรวจสอบเลขบัตรและรหัสนักเรียน' }
    }

    const student = students[0]

    // @ts-ignore
    const eligibleMajors = await sql`
      SELECT * FROM university_requirements
      WHERE min_gpax <= ${student.gpax}
        AND min_tgat <= ${student.score_tgat}
        AND (allowed_plan = 'ทุกสาย' OR allowed_plan = ${student.study_plan})
    `

    return {
      success: true,
      student,
      eligibleMajors
    }
  } catch (error) {
    console.error('Match Error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล' }
  }
}

// 5.ฟังก์ชันสมัครสมาชิกผู้ใช้งานระบบ (โรงเรียน / มหาวิทยาลัย / TCAS)
export async function registerUser(formData: FormData) {
  const role = String(formData.get('role') || 'school')
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const orgName = String(formData.get('schoolName') || formData.get('orgName') || '')

  try {
    // @ts-ignore
    await sql`
      INSERT INTO system_users (role, username, password, org_name)
      VALUES (${role}, ${email}, ${password}, ${orgName})
      ON CONFLICT (username) DO NOTHING
    `
    return { success: true, message: 'ลงทะเบียนเข้าสู่ระบบเรียบร้อยแล้ว!' }
  } catch (error) {
    console.error('Register Error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการลงทะเบียน' }
  }
}

// 6.ฟังก์ชันสำหรับเข้าสู่ระบบ (Login)
export async function loginUser(formData: FormData) {
  const username = String(formData.get('username') || formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const role = String(formData.get('role') || 'school').trim();

  try {
    // @ts-ignore
    const users = await sql`
      SELECT * FROM system_users 
      WHERE username = ${username} AND password = ${password} AND role = ${role}
      LIMIT 1
    `;

    if (users && users.length > 0) {
      return { success: true, user: users[0], message: 'เข้าสู่ระบบสำเร็จ' };
    } else {
      return { success: false, message: 'อีเมล รหัสผ่าน ไม่ถูกต้อง หรือบทบาทไม่ตรงกับที่ลงทะเบียนไว้' };
    }
  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' };
  }
}