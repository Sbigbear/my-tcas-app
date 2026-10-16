'use client'

import { useState } from 'react'
import { Printer, Search, CheckCircle, Award, Users } from 'lucide-react'

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
  const [filterType, setFilterType] = useState<'ALL' | 'PASSED' | 'CONFIRMED'>('ALL')
  const [search, setSearch] = useState('')

  // สรุปยอดตามสถานะ
  const totalQualifiedCount = applications.length
  const passedCount = applications.filter((a) => a.status === 'PASSED' || a.status === 'CONFIRMED').length
  const confirmedCount = applications.filter((a) => a.status === 'CONFIRMED').length

  // กรองตารางตามคำค้นหาและแท็บที่เลือก
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(search.toLowerCase()) ||
      app.programName.toLowerCase().includes(search.toLowerCase()) ||
      app.studentCode.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (filterType === 'PASSED') {
      return app.status === 'PASSED' || app.status === 'CONFIRMED'
    }
    if (filterType === 'CONFIRMED') {
      return app.status === 'CONFIRMED'
    }

    return true
  })

  // สั่งพิมพ์ออกทาง PDF
  const handlePrint = (type: 'ALL' | 'PASSED' | 'CONFIRMED') => {
    setFilterType(type)
    setTimeout(() => {
      window.print()
    }, 150)
  }

  const getReportTitle = () => {
    switch (filterType) {
      case 'PASSED':
        return 'รายงานรายชื่อผู้สมัครที่ผ่านการคัดเลือก (Passed Selection)'
      case 'CONFIRMED':
        return 'รายงานรายชื่อผู้สมัครที่ได้รับการยืนยันผลระดับคณะ (Confirmed Selection)'
      default:
        return 'รายงานสรุปรายชื่อผู้สมัครที่ผ่านเกณฑ์คุณสมบัติขั้นต่ำทั้งหมด'
    }
  }

  return (
    <div className="space-y-6">
      {/* CSS สไตล์สำหรับหน้าพิมพ์ A4 */}
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
          แสดงเฉพาะผู้สมัครที่ผ่านเกณฑ์คุณสมบัติขั้นต่ำ และผู้ที่ผ่านการคัดเลือก/ยืนยันผลแล้ว
        </p>
      </div>

      {/* การ์ดสรุปยอด 3 หมวด */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-800 text-sm">ผ่านเกณฑ์ขั้นต่ำทั้งหมด</p>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-4xl font-black text-slate-900">{totalQualifiedCount} <span className="text-sm font-normal text-slate-500">ราย</span></p>
          <button
            onClick={() => handlePrint('ALL')}
            className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> ส่งออก PDF (ผู้ผ่านเกณฑ์ทั้งหมด)
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-800 text-sm">อาจารย์คัดเลือกผ่านแล้ว</p>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-4xl font-black text-blue-700">{passedCount} <span className="text-sm font-normal text-slate-500">ราย</span></p>
          <button
            onClick={() => handlePrint('PASSED')}
            className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> ส่งออก PDF (เฉพาะผู้คัดเลือกผ่าน)
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-800 text-sm">ยืนยันส่งมหาวิทยาลัยแล้ว</p>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-4xl font-black text-purple-700">{confirmedCount} <span className="text-sm font-normal text-slate-500">ราย</span></p>
          <button
            onClick={() => handlePrint('CONFIRMED')}
            className="flex items-center gap-1.5 text-xs text-purple-700 font-semibold hover:underline cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> ส่งออก PDF (เฉพาะผู้ยืนยันผลแล้ว)
          </button>
        </div>
      </div>

      {/* แถบค้นหาและปุ่มสลับแท็บ */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้สมัคร หรือหลักสูตร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07382B]"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
              filterType === 'ALL' ? 'bg-[#07382B] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ผ่านเกณฑ์ทั้งหมด ({totalQualifiedCount})
          </button>
          <button
            onClick={() => setFilterType('PASSED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
              filterType === 'PASSED' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ผ่านการคัดเลือก ({passedCount})
          </button>
          <button
            onClick={() => setFilterType('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
              filterType === 'CONFIRMED' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ยืนยันผลแล้ว ({confirmedCount})
          </button>
        </div>
      </div>

      {/* โครงสร้างตารางและส่วนพิมพ์เอกสาร PDF */}
      <div className="print-container bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {/* หัวกระดาษสำหรับ PDF */}
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
                <th className="py-3 px-3 text-center">GPAX</th>
                <th className="py-3 px-3 text-center">สถานะการคัดเลือก</th>
                <th className="py-3 px-4">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApps.length > 0 ? (
                filteredApps.map((app, index) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center font-medium text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {app.studentName}
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">{app.studentCode}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{app.programName}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{app.gpax}</td>
                    <td className="py-3 px-3 text-center">
                      {app.status === 'CONFIRMED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          ยืนยันส่งมหาวิทยาลัยแล้ว
                        </span>
                      ) : app.status === 'PASSED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          ผ่านการคัดเลือก
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ผ่านเกณฑ์ขั้นต่ำ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      <span className="text-emerald-700 font-medium">คุณสมบัติครบถ้วนตามเกณฑ์</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลผู้สมัครที่ตรงตามเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ส่วนท้ายเอกสารสำหรับพิมพ์ลงชื่อ */}
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