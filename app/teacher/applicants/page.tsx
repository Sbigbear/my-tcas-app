import prisma from '@/lib/prisma'

export default async function ApplicantsPage() {
  // ดึงข้อมูล Application เชื่อมกับ Student (ข้อมูลนักเรียน) และ Criteria (สาขา)
  const applications = await prisma.application.findMany({
    include: {
      student: {
        include: {
          tcasScores: true,
        },
      },
      criteria: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">รายชื่อผู้สมัคร</h1>
        <p className="text-xs text-slate-500">
          ตรวจสอบคะแนน เอกสาร และผลการคัดกรองคุณสมบัติ
        </p>
      </div>

      <div className="space-y-3">
        {applications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            ยังไม่มีข้อมูลผู้สมัครในระบบ
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#07382B] flex items-center justify-center font-bold text-sm">
                  {app.student.name?.[0] || 'น'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {app.student.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {app.criteria.programName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right text-xs space-x-3">
                  <span className="text-slate-400">
                    GPAX <strong className="text-slate-800">{app.student.gpax}</strong>
                  </span>
                  {app.student.tcasScores?.tgat && (
                    <span className="text-slate-400">
                      TGAT <strong className="text-slate-800">{app.student.tcasScores.tgat}</strong>
                    </span>
                  )}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    app.status === 'ELIGIBLE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {app.status === 'ELIGIBLE'
                    ? 'ผ่านเกณฑ์'
                    : app.status === 'PENDING'
                    ? 'รอตรวจสอบ'
                    : 'ไม่ผ่านเกณฑ์'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}