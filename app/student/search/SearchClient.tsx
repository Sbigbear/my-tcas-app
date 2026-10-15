'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CheckCircle2, Send, AlertCircle, Building2, XCircle, RefreshCw } from 'lucide-react'

interface Course {
  id: string
  programName: string
  faculty: string
  department: string
  campus: string
  universityName: string
  capacity: number
  totalAppliedCount: number
  minGpax: number | null
  minTgat: number | null
  additionals: string | null
  isOpen: boolean
  isFull: boolean
  hasApplied: boolean
}

export default function SearchClient({
  courses,
  studentName,
}: {
  courses: Course[]
  studentName: string
}) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const filteredCourses = courses.filter(
    (c) =>
      c.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleApply = async (criteriaId: string) => {
    setLoadingId(criteriaId)
    setMessage(null)

    try {
      const res = await fetch('/api/student/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteriaId }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'สมัครหลักสูตรสำเร็จแล้ว!' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.message || 'ไม่สามารถสมัครได้' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ค้นหาหลักสูตรที่เปิดรับสมัคร</h1>
        <p className="text-xs text-slate-500">
          ยินดีต้อนรับคุณ <span className="font-semibold text-slate-800">{studentName}</span> - เลือกระบุหลักสูตรที่คุณต้องการสมัคร
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* แถบค้นหา */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อหลักสูตร, คณะ หรือสาขาวิชา..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07382B]"
        />
      </div>

      {/* รายการหลักสูตร */}
      <div className="space-y-3">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            ไม่พบหลักสูตรที่เปิดรับสมัครในขณะนี้
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">
                    {course.id}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{course.programName}</h3>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {course.faculty} - {course.department} ({course.universityName} {course.campus})
                  </span>
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  <span className="bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200">
                    รับจำนวน: <strong>{course.capacity} คน</strong>
                  </span>
                  {course.minGpax && (
                    <span className="bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200">
                      GPAX ขั้นต่ำ: <strong>{course.minGpax.toFixed(2)}</strong>
                    </span>
                  )}
                  {course.minTgat && (
                    <span className="bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200">
                      TGAT ขั้นต่ำ: <strong>{course.minTgat.toFixed(2)}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* 📌 ควบคุมปุ่มกดสมัคร / ปิดรับสมัคร / เต็มแล้ว */}
              <div className="flex-shrink-0">
                {course.hasApplied ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> สมัครแล้ว
                  </button>
                ) : course.isFull ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 cursor-not-allowed flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-rose-500" /> ปิดรับสมัคร (เต็มแล้ว)
                  </button>
                ) : !course.isOpen ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-slate-400" /> ปิดรับสมัคร
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(course.id)}
                    disabled={loadingId === course.id}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#07382B] text-white hover:bg-[#052920] transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {loadingId === course.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> กำลังสมัคร...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> สมัครหลักสูตรนี้
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}