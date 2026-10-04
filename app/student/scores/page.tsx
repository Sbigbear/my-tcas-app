import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function ScoresPage() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('student_id')?.value

  if (!studentId) {
    redirect('/login')
  }

  // ค้นหาข้อมูลนักเรียนด้วย Primary Key ตัวใหม่ (Studentsid)
  const student = await prisma.student.findUnique({
    where: { Studentsid: studentId },
    include: {
      tcasScores: true,
      school: true,
    },
  })

  if (!student) {
    redirect('/login')
  }

  const scores = student?.tcasScores

  const formatScore = (val: number | null | undefined) =>
    val !== null && val !== undefined ? Number(val).toFixed(2) : '-'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">คะแนนของฉัน</h2>
          <p className="text-sm text-slate-500">
            ข้อมูลผลการเรียนระดับมัธยมปลายและคะแนนสอบวัดผลระดับชาติ
          </p>
        </div>
      </div>

      {/* 1. เกรดเฉลี่ยสะสม (GPAX) & กลุ่มสาระการเรียนรู้ */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">1. ผลการเรียนเฉลี่ยสะสม (ปพ.1)</h3>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
            ✓ ยืนยันโดย {student?.school?.name || 'โรงเรียนต้นสังกัด'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl col-span-2 md:col-span-3 lg:col-span-1">
            <p className="text-xs text-emerald-700 font-semibold">GPAX (เฉลี่ยรวม)</p>
            <p className="text-2xl font-bold text-[#07382B] mt-1">
              {formatScore(student?.gpax)}
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">คณิตศาสตร์</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatScore(student?.mathGpa)}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">วิทยาศาสตร์ฯ</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatScore(student?.sciGpa)}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">ภาษาอังกฤษ</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatScore(student?.engGpa)}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">ภาษาไทย</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatScore(student?.thaiGpa)}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">สังคมศึกษาฯ</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatScore(student?.socialGpa)}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">สุขศึกษา-พลศึกษา</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatScore(student?.healthGpa)}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">ศิลปะ</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatScore(student?.artGpa)}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">การงานอาชีพ</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatScore(student?.careerGpa)}</p>
          </div>
        </div>
      </div>

      {/* 2. คะแนนสอบ TGAT / TPAT / A-Level */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">2. คะแนนสอบ TGAT / TPAT / A-Level</h3>
          <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
            ดึงข้อมูลจากระบบ MyTCAS
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* TGAT / TPAT */}
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">TGAT (ทั่วไป)</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.tgat)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">TPAT1 (แพทย์)</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.tpat1)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">TPAT2 (ศิลปกรรม)</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.tpat2)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">TPAT3 (วิทย์-วิศวะ)</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.tpat3)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">TPAT4 (สถาปัตย์)</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.tpat4)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">TPAT5 (ครุศาสตร์)</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.tpat5)}</p>
          </div>

          {/* A-Level */}
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level Math 1</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.alevelMath1)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level Math 2</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.alevelMath2)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level วิทย์ประยุกต์</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.alevelSci)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level ฟิสิกส์</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.alevelPhy)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level เคมี</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.alevelChem)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level ชีววิทยา</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.alevelBio)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level สังคมศึกษา</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.alevelSoc)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level ภาษาไทย</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.alevelThai)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level ภาษาอังกฤษ</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.alevelEng)}</p>
          </div>
          <div className="p-3.5 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level ภาษาต่างประเทศ</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatScore(scores?.alevelForeign)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}