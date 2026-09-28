'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, X, BookOpen, Layers } from 'lucide-react'

interface Course {
  id: string
  programName: string
  minGpax: number
  capacity: number
  university?: {
    faculty: string
    name: string
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // State สำหรับเก็บข้อมูลในฟอร์ม
  const [formData, setFormData] = useState({
    programName: '',
    faculty: 'คณะวิทยาศาสตร์',
    minGpax: '',
    capacity: '',
    minMathGpa: '',
    minSciGpa: '',
    minEngGpa: '',
    minTgat: '',
    minTpat2: '',
    minTpat3: '',
    minAlevelMath1: '',
    minAlevelSci: '',
  })

  // โหลดรายการหลักสูตร
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      if (data.success) {
        setCourses(data.data)
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  // ฟังก์ชันบันทึกข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        alert('เพิ่มหลักสูตรเรียบร้อยแล้ว!')
        setIsModalOpen(false)
        // ล้างค่าฟอร์ม
        setFormData({
          programName: '',
          faculty: 'คณะวิทยาศาสตร์',
          minGpax: '',
          capacity: '',
          minMathGpa: '',
          minSciGpa: '',
          minEngGpa: '',
          minTgat: '',
          minTpat2: '',
          minTpat3: '',
          minAlevelMath1: '',
          minAlevelSci: '',
        })
        fetchCourses() // โหลดข้อมูลใหม่มาโชว์ในรายการ
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล')
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 font-medium">ระบบวิเคราะห์คุณสมบัติ TCAS</p>
          <h1 className="text-2xl font-bold text-slate-800">จัดการหลักสูตร</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดรอบรับสมัคร จำนวนที่รับ และเกณฑ์คุณสมบัติขั้นต่ำ
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#063b2c] hover:bg-[#04291e] text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> เพิ่มหลักสูตร
        </button>
      </div>

      {/* Course List Section (ตามแบบ Figma) */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            กำลังโหลดข้อมูลหลักสูตร...
          </div>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#063b2c] font-bold flex items-center justify-center text-sm border border-emerald-100">
                  KU
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-800">
                    {course.university?.faculty || 'คณะวิทยาศาสตร์'}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900">{course.programName}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>รอบ 3 Admission</span>
                    <span>•</span>
                    <span>GPAX ขั้นต่ำ {course.minGpax.toFixed(2)}</span>
                    <span>•</span>
                    <span>รับ {course.capacity} คน</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                  เปิดรับสมัคร
                </span>
                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm">
            ยังไม่มีหลักสูตรในระบบ กดปุ่ม <b>"+ เพิ่มหลักสูตร"</b> ด้านบนเพื่อเพิ่มข้อมูล
          </div>
        )}
      </div>

      {/* Modal ป๊อปอัปเพิ่มหลักสูตร พร้อมการกรอกคะแนนครบถ้วน */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">เพิ่มหลักสูตรและเกณฑ์คะแนน</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* ข้อมูลทั่วไป */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ข้อมูลหลักสูตร</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อหลักสูตร *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น วิทยาการข้อมูล"
                    value={formData.programName}
                    onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">คณะ</label>
                  <input
                    type="text"
                    placeholder="เช่น คณะวิทยาศาสตร์"
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">GPAX ขั้นต่ำ *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="เช่น 2.50"
                      value={formData.minGpax}
                      onChange={(e) => setFormData({ ...formData, minGpax: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวนที่รับ (คน) *</label>
                    <input
                      type="number"
                      required
                      placeholder="เช่น 30"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* เกณฑ์ GPA กลุ่มสาระ */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">เกณฑ์ GPA กลุ่มสาระวิชา</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">คณิตศาสตร์</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="เช่น 2.50"
                      value={formData.minMathGpa}
                      onChange={(e) => setFormData({ ...formData, minMathGpa: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">วิทยาศาสตร์</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="เช่น 2.50"
                      value={formData.minSciGpa}
                      onChange={(e) => setFormData({ ...formData, minSciGpa: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">ภาษาอังกฤษ</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="เช่น 2.00"
                      value={formData.minEngGpa}
                      onChange={(e) => setFormData({ ...formData, minEngGpa: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* เกณฑ์ TGAT / TPAT */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">เกณฑ์คะแนน TGAT / TPAT</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">TGAT</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="ขั้นต่ำ"
                      value={formData.minTgat}
                      onChange={(e) => setFormData({ ...formData, minTgat: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">TPAT 2</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="ขั้นต่ำ"
                      value={formData.minTpat2}
                      onChange={(e) => setFormData({ ...formData, minTpat2: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">TPAT 3</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="ขั้นต่ำ"
                      value={formData.minTpat3}
                      onChange={(e) => setFormData({ ...formData, minTpat3: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* เกณฑ์ A-Level */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">เกณฑ์คะแนน A-Level</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">A-Level Math 1</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="ขั้นต่ำ"
                      value={formData.minAlevelMath1}
                      onChange={(e) => setFormData({ ...formData, minAlevelMath1: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">A-Level Sci</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="ขั้นต่ำ"
                      value={formData.minAlevelSci}
                      onChange={(e) => setFormData({ ...formData, minAlevelSci: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#063b2c] hover:bg-[#04291e] text-white text-sm font-bold rounded-xl shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}