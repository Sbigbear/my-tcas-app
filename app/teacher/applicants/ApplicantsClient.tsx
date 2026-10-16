'use client'

import { useState } from 'react'
import { updateApplicationStatus } from './actions'
import { Clock, AlertCircle, Search, CheckCircle2, XCircle, RefreshCw, UserCheck, RotateCcw } from 'lucide-react'

interface ApplicantData {
  id: string
  studentName: string
  studentCode: string
  programName: string
  faculty: string
  department: string
  status: string
  appliedAt: string
  gpax?: number | null
  evalRes: {
    activeScoreChecks: {
      label: string
      studentVal: number | null
      minVal: number
      isFail: boolean
    }[]
    failedReasons: string[]
    isEligible: boolean
  }
}

export default function ApplicantsClient({
  initialApplications,
}: {
  initialApplications: ApplicantData[]
}) {
  const [applications, setApplications] = useState<ApplicantData[]>(initialApplications)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'ALL' | 'ELIGIBLE' | 'PASSED' | 'INELIGIBLE'>('ALL')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // ฟังก์ชันจัดการกดรับผู้สมัคร / ยกเลิกผล
  const handleStatusChange = async (appId: string, newStatus: 'PASSED' | 'PENDING' | 'REJECTED') => {
    setLoadingId(appId)
    const res = await updateApplicationStatus(appId, newStatus)
    setLoadingId(null)

    if (res.success) {
      setApplications((prev) =>
        prev.map((item) => (item.id === appId ? { ...item, status: newStatus } : item))
      )
    } else {
      alert(res.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    }
  }

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(search.toLowerCase()) ||
      app.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      app.programName.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (tab === 'ELIGIBLE') return app.evalRes.isEligible && app.status !== 'PASSED' && app.status !== 'CONFIRMED' && app.status !== 'CANCELLED'
    if (tab === 'PASSED') return app.status === 'PASSED' || app.status === 'CONFIRMED'
    if (tab === 'INELIGIBLE') return !app.evalRes.isEligible || app.status === 'CANCELLED'

    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">รายชื่อผู้สมัคร</h1>
        <p className="text-xs text-slate-500">
          ตรวจสอบคะแนน เอกสาร และผลการคัดกรองคุณสมบัติเฉพาะสังกัดของคุณ
        </p>
      </div>

      {/* แถบค้นหาและสลับแท็บ */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ รหัสนักเรียน หรือหลักสูตร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07382B]"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              tab === 'ALL' ? 'bg-[#07382B] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({applications.length})
          </button>
          <button
            onClick={() => setTab('ELIGIBLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              tab === 'ELIGIBLE' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ผ่านเกณฑ์ขั้นต่ำ
          </button>
          <button
            onClick={() => setTab('PASSED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              tab === 'PASSED' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ผ่านการคัดเลือก
          </button>
          <button
            onClick={() => setTab('INELIGIBLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              tab === 'INELIGIBLE' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ไม่ผ่านเกณฑ์
          </button>
        </div>
      </div>

      {/* รายการการ์ดผู้สมัคร */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            ไม่พบข้อมูลผู้สมัครที่ตรงตามเงื่อนไข
          </div>
        ) : (
          filtered.map((app) => {
            const isLoading = loadingId === app.id
            const isPassed = app.status === 'PASSED' || app.status === 'CONFIRMED'
            const isEligible = app.evalRes.isEligible
            const isCancelled = app.status === 'CANCELLED'

            return (
              <div
                key={app.id}
                className={`bg-white p-5 rounded-2xl border transition shadow-sm space-y-3 ${
                  isPassed
                    ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                    : isEligible
                    ? 'border-emerald-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1.5 text-slate-500 text-[11px] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    สมัครเมื่อ: {app.appliedAt}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    รหัสการสมัคร: {app.id}
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3.5 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#07382B] flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {app.studentName[0] || 'น'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{app.studentName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.programName}{' '}
                        <span className="text-slate-400">
                          ({app.faculty} {app.department})
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* ฝั่งป้ายคะแนน + ปุ่มสถานะการคัดเลือก */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center justify-end gap-3">
                    {/* ป้ายคะแนน GPAX หรือ คะแนนหลัก */}
                    {app.gpax !== undefined && app.gpax !== null && (
                      <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-600 flex items-center gap-1">
                        <span>GPAX</span>
                        <span className="text-slate-900 text-sm">{Number(app.gpax).toFixed(2)}</span>
                      </div>
                    )}

                    {/* Badge และปุ่มคัดเลือก */}
                    <div className="flex-shrink-0">
                      {isCancelled ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          ยกเลิกการสมัคร
                        </span>
                      ) : isPassed ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ผ่านการคัดเลือกแล้ว
                          </span>
                          <button
                            onClick={() => handleStatusChange(app.id, 'PENDING')}
                            disabled={isLoading}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                            title="ยกเลิกผลการคัดเลือก"
                          >
                            {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                            ยกเลิกผล
                          </button>
                        </div>
                      ) : isEligible ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            ผ่านเกณฑ์ขั้นต่ำ
                          </span>
                          <button
                            onClick={() => handleStatusChange(app.id, 'PASSED')}
                            disabled={isLoading}
                            className="px-3.5 py-1.5 bg-[#07382B] hover:bg-[#05281f] text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                            รับผ่านการคัดเลือก
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          ไม่ผ่านเกณฑ์
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* แสดงรายละเอียดเกณฑ์คะแนนแต่ละวิชา */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {app.evalRes.activeScoreChecks.map((check, idx) => (
                    <div
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                        check.isFail
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="text-[11px] opacity-80">{check.label}</span>
                      <span className={`font-bold ${check.isFail ? 'text-rose-700' : 'text-slate-900'}`}>
                        {check.studentVal !== null ? Number(check.studentVal).toFixed(2) : '-'}
                      </span>
                    </div>
                  ))}
                </div>

                {app.evalRes.failedReasons.length > 0 && app.status !== 'CANCELLED' && (
                  <div className="pt-2.5 border-t border-slate-100 flex items-start gap-2 text-xs bg-rose-50/70 p-3 rounded-xl border border-rose-100 text-rose-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-rose-800">เหตุผลที่ไม่ผ่านเกณฑ์: </span>
                      {app.evalRes.failedReasons.map((reason, idx) => (
                        <span key={idx}>
                          {idx > 0 && <span className="mx-1.5 text-rose-300">|</span>}
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}