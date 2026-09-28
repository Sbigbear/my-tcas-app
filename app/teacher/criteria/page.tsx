import prisma from '@/lib/prisma'

export default async function CriteriaPage() {
  // ดึงข้อมูล ProgramCriteria เชื่อมกับ University
  const criteriaList = await prisma.programCriteria.findMany({
    include: {
      university: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">เกณฑ์หลักสูตร</h1>
        <p className="text-xs text-slate-500">
          กำหนดรอบรับสมัคร จำนวนที่รับ และเกณฑ์คุณสมบัติขั้นต่ำ
        </p>
      </div>

      <div className="space-y-4">
        {criteriaList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            ยังไม่มีข้อมูลเกณฑ์หลักสูตรในระบบ
          </div>
        ) : (
          criteriaList.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {item.university.faculty} ({item.university.name})
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {item.programName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    รับสมัคร {item.capacity} คน | GPAX ขั้นต่ำ {item.minGpax}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                  เปิดรับสมัคร
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}