import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import SelectedProgramsList from './SelectedProgramsList'

function evaluateProgram(student: any, criteria: any) {
  const scores = student?.tcasScores

  let failedReqs = 0

  if (criteria.minGpax && criteria.minGpax > 0) {
    if ((student.gpax || 0) < criteria.minGpax) failedReqs++
  }

  const gpaKeys = ['minMathGpa', 'minSciGpa', 'minEngGpa', 'minThaiGpa', 'minSocialGpa', 'minHealthGpa', 'minArtGpa', 'minCareerGpa']
  const studentGpas = [student.mathGpa, student.sciGpa, student.engGpa, student.thaiGpa, student.socialGpa, student.healthGpa, student.artGpa, student.careerGpa]

  gpaKeys.forEach((key, idx) => {
    const target = criteria[key]
    if (target && target > 0) {
      if ((studentGpas[idx] || 0) < target) failedReqs++
    }
  })

  if (criteria.minTgat && criteria.minTgat > 0) {
    if ((scores?.tgat || 0) < criteria.minTgat) failedReqs++
  }

  for (let i = 1; i <= 5; i++) {
    const target = criteria[`minTpat${i}`]
    if (target && target > 0) {
      if ((scores?.[`tpat${i}`] || 0) < target) failedReqs++
    }
  }

  return failedReqs === 0 ? 'PASSED' : 'FAILED'
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('student_id')?.value

  if (!studentId) {
    redirect('/login')
  }

  const student = await prisma.student.findUnique({
    where: { Studentsid: studentId },
    include: { tcasScores: true },
  })

  if (!student) {
    redirect('/login')
  }

  // ดึงหลักสูตรทั้งหมดเพื่อส่งให้ระบบเลือกประเมิน
  const allCriteria = await prisma.programCriteria.findMany({
    include: { university: true },
  })

  const evaluatedPrograms = allCriteria.map((c: any) => ({
    id: c.Program_Criteriaid || c.id,
    programName: c.programName,
    faculty: c.university?.faculty || '-',
    department: c.university?.department || '-',
    campus: c.university?.campus || 'บางเขน',
    universityName: c.university?.name || 'มหาวิทยาลัยเกษตรศาสตร์',
    recruitAmount: c.capacity || 0,
    evalStatus: evaluateProgram(student, c),
  }))

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="text-xl font-bold text-emerald-600">ตรวจสอบแล้ว</span>
      case 'FLAGGED':
        return <span className="text-xl font-bold text-rose-600">พบข้อผิดพลาด</span>
      case 'PENDING':
      default:
        return <span className="text-xl font-bold text-amber-600">กำลังรอการตรวจสอบ</span>
    }
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
      <div className="p-8 rounded-2xl bg-[#07382B] text-white space-y-2 relative overflow-hidden">
        <h3 className="text-3xl font-bold">สวัสดี, {student.name}</h3>
        <p className="text-slate-200">
          ยินดีต้อนรับสู่ระบบตรวจสอบข้อมูลผลการเรียนและคะแนนสอบสำหรับสิทธิ์ TCAS ของคุณ
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">เกรดเฉลี่ยสะสม (GPAX)</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {student.gpax ? Number(student.gpax).toFixed(2) : '-'}
          </p>
          <p className="text-xs text-slate-400 mt-2">ยืนยันจากเอกสาร ปพ.1</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">คะแนน TGAT รวม</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {student.tcasScores?.tgat ? Number(student.tcasScores.tgat).toFixed(2) : '-'}
          </p>
          <p className="text-xs text-slate-400 mt-2">ดึงจากฐานข้อมูล TCAS</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">สถานะเอกสาร</p>
          <div className="mt-2">{getVerificationBadge(student.verificationStatus)}</div>
          <p className="text-xs text-slate-400 mt-2">ระเบียนผลการเรียน (ปพ.1)</p>
        </div>
      </div>

      {/* แสดงรายการสาขาวิชาที่คุณสนใจ/เลือกไว้ */}
      <SelectedProgramsList allPrograms={evaluatedPrograms} />
    </div>
  )
}