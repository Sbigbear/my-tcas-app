'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Search, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'

export interface CourseItem {
  id: string
  programName: string
  faculty: string
  minGpax: string | number
  round: string | number
  quota: number
}

interface CourseClientProps {
  initialCourses: CourseItem[]
}

export default function CourseClient({ initialCourses }: CourseClientProps) {
  const router = useRouter()
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses)
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ระบบค้นหาหลักสูตร
  const filteredCourses = courses.filter(
    (c) =>
      c.programName.toLowerCase().includes(search.toLowerCase()) ||
      c.faculty.toLowerCase().includes(search.toLowerCase())
  )

  // ฟังก์ชันลบหลักสูตร
  const handleDelete = async () => {
    if (!selectedCourse) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/admin/courses?id=${selectedCourse.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setCourses((prev) => prev.filter((item) => item.id !== selectedCourse.id))
        setSelectedCourse(null)
        router.refresh()
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการลบหลักสูตร')
      }
    } catch (err) {
      console.error('Error deleting course:', err)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 font-medium">ระบบวิเคราะห์คุณสมบัติ TCAS</p>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#063b2c]" /> จัดการหลักสูตร
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          กำหนดรอบรับสมัคร จำนวนที่รับ และเกณฑ์คุณสมบัติขั้นต่ำของแต่ละหลักสูตร
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหลักสูตร หรือคณะ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] focus:bg-white text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-semibold">
                <th className="py-3 px-4">ชื่อหลักสูตร / คณะ</th>
                <th className="py-3 px-4 text-center">รอบรับสมัคร</th>
                <th className="py-3 px-4 text-center">GPAX ขั้นต่ำ</th>
                <th className="py-3 px-4 text-center">จำนวนที่รับ</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{c.programName}</div>
                      <div className="text-xs text-slate-400">{c.faculty}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-emerald-50 text-[#063b2c] text-xs font-semibold px-2.5 py-1 rounded-lg">
                        รอบที่ {c.round}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                      {c.minGpax}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                      {c.quota} ที่นั่ง
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCourse(c)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบหลักสูตร"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    ยังไม่มีหลักสูตรในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ยืนยันการลบ */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">ยืนยันการลบหลักสูตร</h3>
            </div>

            <p className="text-sm text-slate-600">
              คุณต้องการลบหลักสูตร{' '}
              <span className="font-bold text-slate-800">{selectedCourse.programName}</span>{' '}
              ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-2"
              >
                {isDeleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}