'use client'

import { useState } from 'react'
import { Search, CheckCircle2, XCircle, Building2, Users, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

type ProgramItem = {
  id: string
  code: string
  programName: string
  faculty: string
  department: string
  campus: string
  universityName: string
  recruitAmount: number
  evalStatus: 'PASSED' | 'FAILED'
  passedCount: number
  totalCount: number
  failedReasons: string[]
}

export default function SearchClient({
  programs,
  hasScore,
  studentName,
}: {
  programs: ProgramItem[]
  hasScore: boolean
  studentName: string
}) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL')

  // 📌 State สำหรับเก็บสถานะ เปิด-ปิด ดูเงื่อนไขของแต่ละการ์ดหลักสูตร (แยกกันอิสระ)
  const [openCardIds, setOpenCardIds] = useState<Record<string, boolean>>({})

  const toggleCard = (id: string) => {
    setOpenCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const countAll = programs.length
  const countPassed = programs.filter((p) => p.evalStatus === 'PASSED').length
  const countFailed = programs.filter((p) => p.evalStatus === 'FAILED').length

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.programName.toLowerCase().includes(search.toLowerCase()) ||
      p.faculty.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())

    const matchesTab = activeTab === 'ALL' ? true : p.evalStatus === activeTab

    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ค้นหาและประเมินเกณฑ์การสมัคร</h1>
        <p className="text-xs text-slate-500 mt-1">
          ระบบวิเคราะห์เกณฑ์การคัดเลือกของคุณ (<span className="font-semibold text-[#07382B]">{studentName}</span>) กับสาขาวิชาทั้งหมดในระบบ
        </p>
      </div>

      {!hasScore && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>คุณยังไม่มีข้อมูลคะแนนในระบบ ผลการประเมินจึงยังไม่สามารถคำนวณได้ กรุณาอัปเดตคะแนนที่เมนู "คะแนนของฉัน"</span>
        </div>
      )}

      {/* แท็บตัวเลือกกรองสถานะ */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-[#07382B] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ทั้งหมด
          <span className={`px-2 py-0.5 text-[10px] rounded-full ${activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {countAll}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PASSED')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'PASSED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          ผ่านเกณฑ์
          <span className={`px-2 py-0.5 text-[10px] rounded-full ${activeTab === 'PASSED' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            {countPassed}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('FAILED')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'FAILED'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <XCircle className="w-4 h-4" />
          ไม่ผ่านเกณฑ์
          <span className={`px-2 py-0.5 text-[10px] rounded-full ${activeTab === 'FAILED' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'}`}>
            {countFailed}
          </span>
        </button>
      </div>

      {/* ช่องค้นหา */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          placeholder="ค้นหาชื่อหลักสูตร, คณะ หรือสาขาวิชา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs outline-none text-slate-800 font-medium"
        />
      </div>

      {/* รายการการ์ดหลักสูตร */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {filteredPrograms.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            ไม่พบรายการสาขาวิชาในหมวดหมู่นี้
          </div>
        ) : (
          filteredPrograms.map((program) => {
            const isOpenDetails = !!openCardIds[program.id]

            return (
              <div
                key={program.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono font-bold rounded">
                      {program.id}
                    </span>

                    {program.evalStatus === 'PASSED' ? (
                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> ไม่ผ่านเกณฑ์
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{program.programName}</h3>

                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#07382B]" />
                      <span>คณะ: <strong className="text-slate-700">{program.faculty}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px]">📍 สาขา: <strong className="text-slate-700">{program.department}</strong> ({program.campus})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>รับจำนวน: <strong className="text-slate-900">{program.recruitAmount}</strong> คน</span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-medium">
                    ตรงตามเกณฑ์ {program.passedCount}/{program.totalCount} ข้อ
                  </span>
                </div>

                {/* 📌 ปุ่มกด เปิด-ปิด แสดงรายละเอียดเงื่อนไข */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleCard(program.id)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      program.evalStatus === 'PASSED'
                        ? 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200/60'
                        : 'bg-rose-50/70 text-rose-800 hover:bg-rose-100/80 border border-rose-200/60'
                    }`}
                  >
                    <span>
                      {isOpenDetails
                        ? 'ซ่อนรายละเอียดเงื่อนไข'
                        : program.evalStatus === 'PASSED'
                        ? 'ดูรายละเอียดการผ่านเกณฑ์'
                        : `ดูสาเหตุที่ไม่ผ่านเกณฑ์ (${program.failedReasons.length} ข้อ)`}
                    </span>
                    {isOpenDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* 📌 รายละเอียดเงื่อนไข (แสดงเฉพาะตอนที่เปิด) */}
                  {isOpenDetails && (
                    <div className="mt-2.5">
                      {program.evalStatus === 'PASSED' ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>คุณสมบัติและเกรด/คะแนนสอบของคุณ ผ่านเกณฑ์ขั้นต่ำของหลักสูตรนี้ครบถ้วนทุกข้อ</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 space-y-1.5">
                          <p className="font-bold border-b border-rose-200/80 pb-1 text-rose-900">
                            เกณฑ์คุณสมบัติที่ไม่ผ่าน ({program.failedReasons.length} รายการ):
                          </p>
                          {program.failedReasons.map((reason, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="shrink-0 font-bold">•</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}