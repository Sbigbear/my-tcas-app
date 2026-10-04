import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TeacherDashboard() {
  const cookieStore = await cookies()
  const teacherId = cookieStore.get('teacher_id')?.value || cookieStore.get('userId')?.value

  if (!teacherId) {
    redirect('/login')
  }

  // ดึงข้อมูลอาจารย์ที่ Login อยู่
  const teacher = await prisma.user.findUnique({
    where: { Usersid: teacherId },
  })

  if (!teacher) {
    redirect('/login')
  }

  // เงื่อนไขสำหรับกรองผู้สมัครเฉพาะสังกัด (universityId) ของอาจารย์ท่านนี้
  const whereClause = teacher.universityId
    ? { criteria: { universityId: teacher.universityId } }
    : { Applicationsid: 'no-match' }

  // นับจำนวนสถิติผู้สมัครเฉพาะสังกัดอาจารย์
  const totalApplicants = await prisma.application.count({
    where: whereClause,
  })
  const pendingApplicants = await prisma.application.count({
    where: { ...whereClause, status: 'PENDING' },
  })
  const eligibleApplicants = await prisma.application.count({
    where: { ...whereClause, status: 'ELIGIBLE' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">ภาพรวม</h1>

      {/* Banner ต้อนรับ */}
      <div className="bg-[#07382B] text-white p-8 rounded-2xl flex justify-between items-center shadow-sm">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold">
            สวัสดี, {teacher.name || 'อาจารย์'}
          </h2>
          <p className="text-emerald-200 text-sm">
            มีผู้สมัคร {pendingApplicants} รายที่รอการตรวจสอบคุณสมบัติและเอกสารประกอบ
          </p>
        </div>
        <Link
          href="/teacher/applicants"
          className="px-5 py-2.5 bg-white text-[#07382B] text-sm font-bold rounded-xl hover:bg-slate-100 transition"
        >
          ตรวจสอบผู้สมัคร &gt;
        </Link>
      </div>

      {/* สถิติหลัก */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-slate-500">ผู้สมัครทั้งหมด</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{totalApplicants}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl text-xl">👤</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-slate-500">รอตรวจสอบ</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{pendingApplicants}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl text-xl">🕒</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-slate-500">ผ่านเกณฑ์ (Eligible)</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{eligibleApplicants}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">✓</div>
        </div>
      </div>
    </div>
  )
}