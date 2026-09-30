'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Program {
  id: string
  programName: string
  minGpax: number
  capacity: number
  isOpen: boolean
  isEligible: boolean
  matchPercentage: number
  failedReasons: string[]
  university: {
    name: string
    faculty: string
  }
}

export default function SearchPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const studentId = typeof window !== 'undefined' 
          ? localStorage.getItem('studentId') || '66010001' 
          : '66010001'

        const res = await fetch(`/api/student/matching?studentId=${studentId}`, {
          cache: 'no-store'
        })

        // เช็กว่า Response เป็น JSON หรือไม่
        const contentType = res.headers.get('content-type')
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json()
          if (data.success && data.data) {
            setPrograms(data.data)
            return
          }
        }
        console.error('API Error or Not Found, Status:', res.status)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const handleApply = async (criteriaId: string, programName: string) => {
    setApplyingId(criteriaId)
    try {
      const studentId = typeof window !== 'undefined' 
        ? localStorage.getItem('studentId') || '66010001' 
        : '66010001'

      const res = await fetch('/api/student/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          criteriaId,
          status: 'ELIGIBLE',
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert(`สมัครหลักสูตร "${programName}" เรียบร้อยแล้ว!`)
        router.push('/student/applications')
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.message}`)
      }
    } catch (err) {
      console.error('Apply Error:', err)
      alert('ไม่สามารถส่งข้อมูลการสมัครได้')
    } finally {
      setApplyingId(null)
    }
  }

  const filteredPrograms = programs.filter(
    (p) =>
      p.programName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.university?.faculty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.university?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">ค้นหาหลักสูตร</h2>
        <p className="text-sm text-slate-500">
          ค้นหาและตรวจสอบคุณสมบัติกับหลักสูตรที่เปิดรับสมัคร
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="ค้นหาชื่อหลักสูตร, คณะ หรือสาขาวิชา..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#07382B]"
        />
        <svg
          className="w-5 h-5 absolute left-3 top-3.5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">
          กำลังประมวลผลคะแนนและค้นหาหลักสูตร...
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
          ไม่พบหลักสูตรที่ค้นหา (กรุณาเช็ก API หรือ Database)
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrograms.map((program) => {
            const canApply = program.isOpen && program.isEligible
            const isSubmitting = applyingId === program.id

            return (
              <div
                key={program.id}
                className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-200 transition"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                        {program.university?.faculty}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 mt-2">
                        {program.programName}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {program.university?.name}
                      </p>
                    </div>

                    {!program.isOpen ? (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full whitespace-nowrap">
                        ปิดรับสมัคร
                      </span>
                    ) : program.isEligible ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full whitespace-nowrap">
                        ผ่านเกณฑ์ ({program.matchPercentage}%)
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full whitespace-nowrap">
                        ไม่ผ่านเกณฑ์
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 space-y-1">
                    <p>
                      • GPAX ขั้นต่ำ:{' '}
                      <span className="font-semibold">{program.minGpax}</span>
                    </p>
                    <p>
                      • จำนวนที่รับ:{' '}
                      <span className="font-semibold">
                        {program.capacity} คน
                      </span>
                    </p>

                    {!program.isOpen && (
                      <p className="text-xs text-rose-500 mt-2 font-medium">
                        ⚠️ หลักสูตรนี้ปิดรับสมัครแล้ว
                      </p>
                    )}

                    {program.isOpen &&
                      !program.isEligible &&
                      program.failedReasons?.length > 0 && (
                        <div className="text-xs text-red-500 mt-2 space-y-0.5">
                          <p className="font-semibold">⚠️ เหตุผลที่ไม่ผ่านเกณฑ์:</p>
                          {program.failedReasons.map((reason, idx) => (
                            <p key={idx} className="pl-2">• {reason}</p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                <button
                  disabled={!canApply || isSubmitting}
                  onClick={() => handleApply(program.id, program.programName)}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition ${
                    canApply && !isSubmitting
                      ? 'bg-[#07382B] text-white hover:bg-[#052920] active:scale-[0.99]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting
                    ? 'กำลังส่งข้อมูลสมัคร...'
                    : !program.isOpen
                    ? 'ปิดรับสมัคร'
                    : program.isEligible
                    ? 'เลือกสมัครหลักสูตรนี้'
                    : 'คุณสมบัติไม่ตรงตามเกณฑ์'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}