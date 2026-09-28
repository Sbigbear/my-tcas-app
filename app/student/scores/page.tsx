import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export default async function ScoresPage() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('student_id')?.value

  // ดึงข้อมูลนักเรียนพร้อมคะแนน TCAS และโรงเรียนจริงจาก DB
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      tcasScores: true,
      school: true,
    },
  })

  const scores = student?.tcasScores

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">คะแนนของฉัน</h2>
          <p className="text-sm text-slate-500">ข้อมูลผลการเรียนระดับมัธยมปลายและคะแนนสอบวัดผลระดับชาติ</p>
        </div>
      </div>

      {/* 1. เกรดเฉลี่ยสะสม (GPAX) & กลุ่มสาระ */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">1. ผลการเรียนเฉลี่ยสะสม (ปพ.1)</h3>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
            ✓ ยืนยันโดย {student?.school?.name || 'โรงเรียน'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">GPAX (รวม)</p>
            <p className="text-2xl font-bold text-[#07382B] mt-1">
              {student?.gpax ? Number(student.gpax).toFixed(2) : '-'}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">กลุ่มสาระคณิตศาสตร์</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {student?.mathGpa ? Number(student.mathGpa).toFixed(2) : '-'}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">กลุ่มสาระวิทยาศาสตร์</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {student?.sciGpa ? Number(student.sciGpa).toFixed(2) : '-'}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">กลุ่มสาระภาษาอังกฤษ</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {student?.engGpa ? Number(student.engGpa).toFixed(2) : '-'}
            </p>
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">TGAT (ความถนัดทั่วไป)</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">
              {scores?.tgat ? Number(scores.tgat).toFixed(2) : '-'}
            </p>
            <p className="text-xs text-slate-400 mt-1">เต็ม 100 คะแนน</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">TPAT2 (ศิลปวัฒนธรรม)</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">
              {scores?.tpat2 ? Number(scores.tpat2).toFixed(2) : '-'}
            </p>
            <p className="text-xs text-slate-400 mt-1">เต็ม 100 คะแนน</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">TPAT3 (วิทยาศาสตร์/วิศวะ)</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">
              {scores?.tpat3 ? Number(scores.tpat3).toFixed(2) : '-'}
            </p>
            <p className="text-xs text-slate-400 mt-1">เต็ม 100 คะแนน</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level Math 1</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">
              {scores?.alevelMath1 ? Number(scores.alevelMath1).toFixed(2) : '-'}
            </p>
            <p className="text-xs text-slate-400 mt-1">เต็ม 100 คะแนน</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold">A-Level Sci (วิทยาศาสตร์)</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">
              {scores?.alevelSci ? Number(scores.alevelSci).toFixed(2) : '-'}
            </p>
            <p className="text-xs text-slate-400 mt-1">เต็ม 100 คะแนน</p>
          </div>
        </div>
      </div>
    </div>
  )
}