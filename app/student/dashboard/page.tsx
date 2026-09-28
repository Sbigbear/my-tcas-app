import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('student_id')?.value

  if (!studentId) {
    redirect('/login')
  }

  // ดึงข้อมูลนักเรียน
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { tcasScores: true },
  })

  // หากไม่พบข้อมูลใน DB ให้ redirect ไปหน้า login ใหม่
  if (!student) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-500">ระบบวิเคราะห์คุณสมบัติ TCAS</p>
          <h2 className="text-2xl font-bold text-slate-800">ภาพรวม</h2>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> ระบบพร้อมใช้งาน
        </span>
      </div>

      {/* Banner ต้อนรับ */}
      <div className="p-8 rounded-2xl bg-[#07382B] text-white space-y-4 relative overflow-hidden">
        <h3 className="text-3xl font-bold">สวัสดี, {student.name}</h3>
        <p className="text-slate-200">ข้อมูลคะแนนและผลการเรียนของคุณพร้อมแล้วสำหรับวิเคราะห์สิทธิ์</p>
        <button className="px-5 py-2.5 bg-white text-[#07382B] rounded-xl font-bold text-sm shadow">
          ดูหลักสูตรที่แนะนำ &gt;
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">เกรดเฉลี่ยสะสม (GPAX)</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {student.gpax ? Number(student.gpax).toFixed(2) : '-'}
          </p>
          <p className="text-xs text-slate-400 mt-2">ยืนยันโดยโรงเรียนแล้ว</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">คะแนน TGAT</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {student.tcasScores?.tgat ? Number(student.tcasScores.tgat).toFixed(2) : '-'}
          </p>
          <p className="text-xs text-slate-400 mt-2">ดึงจากระบบ TCAS</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">สถานะเอกสาร</p>
          <p className="text-xl font-bold text-[#07382B] mt-2">
            {student.verificationStatus === 'VERIFIED' ? 'ตรวจสอบแล้ว' : 'รอตรวจสอบ'}
          </p>
          <p className="text-xs text-slate-400 mt-2">ระเบียนผลการเรียน ปพ.1</p>
        </div>
      </div>
    </div>
  )
}