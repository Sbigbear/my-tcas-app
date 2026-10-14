'use client'

import { useState } from 'react'
import { Printer, Search, CheckCircle, XCircle, Users } from 'lucide-react'

export interface ReportApplication {
  id: string
  studentName: string
  studentCode: string
  programName: string
  faculty: string
  department: string
  universityName: string
  campus: string
  gpax: string
  tgat: string
  scoresSummary: string
  status: string
  isEligible: boolean
  failedReasons: string[]
  createdAt: string
}

interface ReportsClientProps {
  applications: ReportApplication[]
  teacherName: string
  facultyName: string
  departmentName: string
  universityName: string
}

export default function ReportsClient({
  applications,
  teacherName,
  facultyName,
  departmentName,
  universityName,
}: ReportsClientProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'ELIGIBLE' | 'INELIGIBLE'>('ALL')
  const [search, setSearch] = useState('')

  // คำนวณจำนวนแต่ละหมวด
  const totalCount = applications.length
  const eligibleCount = applications.filter((a) => a.isEligible && a.status !== 'CANCELLED').length
  const ineligibleCount = applications.filter((a) => !a.isEligible || a.status === 'CANCELLED').length

  // กรองข้อมูลผู้สมัครตามการค้นหาและฟิลเตอร์
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(search.toLowerCase()) ||
      app.programName.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (filterType === 'ELIGIBLE') {
      return app.isEligible && app.status !== 'CANCELLED'
    }
    if (filterType === 'INELIGIBLE') {
      return !app.isEligible || app.status === 'CANCELLED'
    }

    return true
  })

  // สั่งพิมพ์เป็น PDF
  const handlePrint = (type: 'ALL' | 'ELIGIBLE' | 'INELIGIBLE') => {
    setFilterType(type)
    setTimeout(() => {
      window.print()
    }, 150)
  }

  const getReportTitle = () => {
    switch (filterType) {
      case 'ELIGIBLE':
        return 'รายงานรายชื่อผู้สมัครที่ผ่านเกณฑ์คุณสมบัติ (Eligible)'
      case 'INELIGIBLE':
        return 'รายงานรายชื่อผู้สมัครที่ไม่ผ่านเกณฑ์คุณสมบัติ (Ineligible)'
      default:
        return 'รายงานสรุปรายชื่อผู้สมัครทั้งหมด'
    }
  }

  return (
    <div className="space-y-6">
      {/* สไตล์การจัดหน้ากระดาษ A4 สำหรับพิมพ์ PDF */}
      <style jsx global>{`
        @media print {
          aside, nav, header, button, .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-size: 12px;
          }
          .print-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 6px 8px !important;
          }
          th {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Header หน้าจอหลัก */}
      <div className="no-print">
        <h1 className="text-2xl font-bold text-slate-900">รายงานผลการคัดกรอง TCAS</h1>
        <p className="text-xs text-slate-500">
          สรุปข้อมูลผู้สมัครจริงจากฐานข้อมูล พร้อมส่งออกรายงาน PDF เสนอคณะกรรมการ
        </p>
      </div>

      {/* การ์ดสรุปตัวเลข 3 หมวด */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-800 text-sm">ผู้สมัครทั้งหมด</p>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-4xl font-black text-slate-900">{totalCount} <span className="text-sm font-normal text-slate-500">ราย</span></p>
          <button
            onClick={() => handlePrint('ALL')}
            className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> ส่งออก PDF (ผู้สมัครทั้งหมด)
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-800 text-sm">ผ่านเกณฑ์ (Eligible)</p>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-4xl font-black text-emerald-700">{eligibleCount} <span className="text-sm font-normal text-slate-500">ราย</span></p>
          <button
            onClick={() => handlePrint('ELIGIBLE')}
            className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> ส่งออก PDF (เฉพาะผู้ผ่านเกณฑ์)
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-800 text-sm">ไม่ผ่านเกณฑ์ (Ineligible)</p>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-4xl font-black text-rose-600">{ineligibleCount} <span className="text-sm font-normal text-slate-500">ราย</span></p>
          <button
            onClick={() => handlePrint('INELIGIBLE')}
            className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold hover:underline cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> ส่งออก PDF (เฉพาะผู้ไม่ผ่านเกณฑ์)
          </button>
        </div>
      </div>

      {/* แถบค้นหาและตัวกรองตารางบนหน้าจอ */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้สมัคร หรือสาขาวิชา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07382B]"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterType === 'ALL' ? 'bg-[#07382B] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ทั้งหมด ({totalCount})
          </button>
          <button
            onClick={() => setFilterType('ELIGIBLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterType === 'ELIGIBLE' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ผ่านเกณฑ์ ({eligibleCount})
          </button>
          <button
            onClick={() => setFilterType('INELIGIBLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterType === 'INELIGIBLE' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ไม่ผ่านเกณฑ์ ({ineligibleCount})
          </button>
        </div>
      </div>

      {/* ส่วนโครงสร้างตารางที่จะพิมพ์ลงใน PDF */}
      <div className="print-container bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {/* หัวกระดาษที่จะแสดงในเอกสาร PDF เท่านั้น */}
        <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold text-slate-900">{universityName}</h1>
              <p className="text-xs text-slate-700">
                {facultyName} {departmentName}
              </p>
              <h2 className="text-base font-bold text-[#07382B] mt-2">{getReportTitle()}</h2>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>วันที่พิมพ์รายงาน: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>ผู้พิมพ์รายงาน: {teacherName}</p>
            </div>
          </div>
        </div>

        {/* ตารางแสดงข้อมูลผู้สมัคร */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-3 text-center w-12">ลำดับ</th>
                <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                <th className="py-3 px-4">หลักสูตร / โครงการ</th>
                <th className="py-3 px-3 text-center">ผลการวิเคราะห์</th>
                <th className="py-3 px-4">หมายเหตุ / เหตุผลที่ไม่ผ่านเกณฑ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApps.length > 0 ? (
                filteredApps.map((app, index) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center font-medium text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{app.studentName}</td>
                    <td className="py-3 px-4 text-slate-600">{app.programName}</td>
                    <td className="py-3 px-3 text-center">
                      {app.isEligible && app.status !== 'CANCELLED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ผ่านเกณฑ์
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          ไม่ผ่านเกณฑ์
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {app.failedReasons.length > 0 ? (
                        <div className="text-rose-600 font-medium leading-relaxed">
                          {app.failedReasons.join(' | ')}
                        </div>
                      ) : (
                        <span className="text-emerald-700">คุณสมบัติครบถ้วนตามเกณฑ์</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลผู้สมัครในหมวดหมู่นี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ส่วนลงชื่อท้ายเอกสาร PDF สำหรับกรรมการ */}
        <div className="hidden print:block mt-12 pt-6 border-t border-slate-200">
          <div className="flex justify-between items-end text-xs text-slate-700">
            <div>
              <p>จำนวนผู้สมัครในรายงานนี้ทั้งสิ้น: <strong>{filteredApps.length}</strong> ราย</p>
            </div>
            <div className="text-center space-y-8">
              <p>ลงชื่อ................................................................... ผู้ตรวจสอบ</p>
              <p>( {teacherName} )</p>
              <p>ตำแหน่ง กรรมการประเมินคุณสมบัติผู้สมัคร TCAS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}