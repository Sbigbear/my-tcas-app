import prisma from '@/lib/prisma'

export default async function ReportsPage() {
  const total = await prisma.application.count()
  const eligible = await prisma.application.count({
    where: { status: 'ELIGIBLE' },
  })
  const pending = await prisma.application.count({
    where: { status: 'PENDING' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">รายงานผล</h1>
        <p className="text-xs text-slate-500">
          สรุปผลการคัดกรองและดาวน์โหลดรายงานสำหรับคณะกรรมการ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <p className="font-bold text-slate-800 text-sm">สรุปผู้สมัครทั้งหมด</p>
          <p className="text-4xl font-black text-slate-900">{total} ราย</p>
          <button className="text-xs text-emerald-700 font-semibold hover:underline">
            ↓ ส่งออกรายงาน PDF
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <p className="font-bold text-slate-800 text-sm">ผลการผ่านเกณฑ์ (Eligible)</p>
          <p className="text-4xl font-black text-slate-900">{eligible} ราย</p>
          <button className="text-xs text-emerald-700 font-semibold hover:underline">
            ↓ ส่งออกรายงาน PDF
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <p className="font-bold text-slate-800 text-sm">เอกสารที่ต้องตรวจสอบ</p>
          <p className="text-4xl font-black text-slate-900">{pending} ราย</p>
          <button className="text-xs text-emerald-700 font-semibold hover:underline">
            ↓ ส่งออกรายงาน PDF
          </button>
        </div>
      </div>
    </div>
  )
}