'use client'

import { useState, useEffect } from 'react'

interface Program {
  id: string
  programName: string
  minGpax: number
  capacity: number
  isEligible: boolean
  matchPercentage: number
  failedReasons: string[]
  university: {
    name: string
    faculty: string
  }
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ในที่นี้ดึงข้อมูล mockup/API โดยใช้ ID นักเรียนทดสอบ
    async function fetchPrograms() {
      try {
        const res = await fetch('/api/student/matching?studentId=YOUR_STUDENT_UUID')
        const data = await res.json()
        if (data.success) {
          setPrograms(data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPrograms()
  }, [])

  const filteredPrograms = programs.filter(
    (p) =>
      p.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.university.faculty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">ค้นหาหลักสูตร</h2>
        <p className="text-sm text-slate-500">ค้นหาและตรวจสอบคุณสมบัติกับหลักสูตรที่เปิดรับสมัคร</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="ค้นหาชื่อหลักสูตร, คณะ หรือสาขาวิชา..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#07382B]"
        />
        <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Program Grid List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">กำลังประมวลผลคะแนนและค้นหาหลักสูตร...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrograms.map((program) => (
            <div key={program.id} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      {program.university.faculty}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2">{program.programName}</h3>
                    <p className="text-sm text-slate-500">{program.university.name}</p>
                  </div>
                  {/* Badge คุณสมบัติ */}
                  {program.isEligible ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                      ผ่านเกณฑ์ ({program.matchPercentage}%)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                      ไม่ผ่านเกณฑ์
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 space-y-1">
                  <p>• GPAX ขั้นต่ำ: <span className="font-semibold">{program.minGpax}</span></p>
                  <p>• จำนวนที่รับ: <span className="font-semibold">{program.capacity} คน</span></p>
                  {!program.isEligible && program.failedReasons.length > 0 && (
                    <p className="text-xs text-red-500 mt-2">
                      ⚠️ เหตุผล: {program.failedReasons.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <button
                disabled={!program.isEligible}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition ${
                  program.isEligible
                    ? 'bg-[#07382B] text-white hover:bg-[#052920]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {program.isEligible ? 'เลือกสมัครหลักสูตรนี้' : 'คุณสมบัติไม่ตรงตามเกณฑ์'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}