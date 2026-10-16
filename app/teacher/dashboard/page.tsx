import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

async function getTeacherInfo() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let userEmail: string | undefined
    let userId: string | undefined

    if (token) {
      try {
        const decoded = jwt.decode(token) as any
        if (decoded) {
          userEmail = decoded?.email || decoded?.userEmail
          userId = decoded?.id || decoded?.userId || decoded?.sub
        }
      } catch (e) {
        console.error('JWT Decode Error:', e)
      }
    }

    if (!userEmail) {
      userEmail = cookieStore.get('user_email')?.value || cookieStore.get('email')?.value
    }

    const cookieUserId =
      cookieStore.get('teacher_id')?.value ||
      cookieStore.get('userId')?.value ||
      cookieStore.get('user_id')?.value

    const orConditions = [
      userEmail ? { email: userEmail } : null,
      userId ? { Usersid: userId } : null,
      cookieUserId ? { Usersid: cookieUserId } : null,
    ].filter(Boolean) as any[]

    if (orConditions.length === 0) return null

    const user = await prisma.user.findFirst({
      where: { OR: orConditions },
      include: { university: true },
    })

    return user
  } catch (err) {
    console.error('Error fetching teacher info:', err)
    return null
  }
}

export default async function TeacherDashboard() {
  const teacher = await getTeacherInfo()

  if (!teacher) {
    redirect('/login')
  }

  const teacherUnivId = teacher.universityId
  const faculty = teacher.university?.faculty || ''
  const department = teacher.university?.department || ''

  // 📌 ดึงเฉพาะรายการสมัครของ "สาขาวิชา" เดียวกับอาจารย์
  const applications = teacherUnivId
    ? await prisma.application.findMany({
        where: {
          criteria: {
            universityId: teacherUnivId,
          },
          status: { not: 'CANCELLED' },
        },
        include: {
          student: { include: { tcasScores: true } },
          criteria: true,
        },
      })
    : []

  const totalApplicants = applications.length
  let eligibleApplicants = 0
  let ineligibleApplicants = 0

  applications.forEach((app: any) => {
    const student: any = app.student || {}
    const scores: any = student.tcasScores || {}
    const criteria: any = app.criteria || {}

    let isFail = false

    if (criteria.minGpax && Number(student.gpax || 0) < Number(criteria.minGpax)) isFail = true
    if (criteria.minTgat && Number(scores.tgat || 0) < Number(criteria.minTgat)) isFail = true

    if (!isFail) eligibleApplicants++
    else ineligibleApplicants++
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">ภาพรวม</h1>

      {/* Banner ต้อนรับ */}
      <div className="bg-[#07382B] text-white p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold">
            สวัสดี, {teacher.name || 'อาจารย์'}
          </h2>
          <p className="text-emerald-200 text-sm">
            สรุปผลการคัดกรองคุณสมบัติผู้สมัคร TCAS สังกัด {faculty} ({department})
          </p>
        </div>
        <Link
          href="/teacher/applicants"
          className="px-5 py-2.5 bg-white text-[#07382B] text-sm font-bold rounded-xl hover:bg-slate-100 transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          ตรวจสอบผู้สมัคร <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* สถิติหลัก */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">ผู้สมัครทั้งหมด</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{totalApplicants}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">ผ่านเกณฑ์ (Eligible)</p>
            <p className="text-3xl font-black text-emerald-700 mt-1">{eligibleApplicants}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500">ไม่ผ่านเกณฑ์ (Ineligible)</p>
            <p className="text-3xl font-black text-rose-600 mt-1">{ineligibleApplicants}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  )
}