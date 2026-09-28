import prisma from '@/lib/prisma'

export default async function AdminProgramsPage() {
  const programs = await prisma.programCriteria.findMany({
    include: { university: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการหลักสูตร</h1>
          <p className="text-xs text-slate-500">
            กำหนดรอบรับสมัคร จำนวนที่รับ และเกณฑ์คุณสมบัติขั้นต่ำ
          </p>
        </div>
        <button className="px-4 py-2 bg-[#07382B] text-white text-sm font-bold rounded-xl">
          + เพิ่มหลักสูตร
        </button>
      </div>

      <div className="space-y-4">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                {prog.university.faculty}
              </span>
              <h3 className="text-lg font-bold text-slate-900">{prog.programName}</h3>
              <p className="text-xs text-slate-500">
                GPAX ขั้นต่ำ {prog.minGpax} | รับ {prog.capacity} คน
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                เปิดรับสมัคร
              </span>
              <button className="text-red-500">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}