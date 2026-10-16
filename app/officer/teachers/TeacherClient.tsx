'use client'

import { useState } from 'react'
import { createTeacherData, deleteTeacherData } from './actions'
import { UserPlus, Search, Trash2, GraduationCap, Building } from 'lucide-react'

type TeacherItem = {
  id: string
  name: string
  email: string
  teacherId: string
  department: string
}

export default function TeacherClient({
  initialTeachers,
  facultyName,
  existingDepartments,
}: {
  initialTeachers: TeacherItem[]
  facultyName: string
  existingDepartments: string[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedDeptMode, setSelectedDeptMode] = useState<'SELECT' | 'CUSTOM'>(
    existingDepartments.length > 0 ? 'SELECT' : 'CUSTOM'
  )

  const filteredTeachers = initialTeachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase()) ||
      t.teacherId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการอาจารย์ประจำสาขา</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            เพิ่มและดูแลบัญชีอาจารย์/กรรมการคัดเลือก ประจำสังกัด <span className="font-bold text-[#07382B]">{facultyName}</span> ({initialTeachers.length} ท่าน)
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-[#07382B] text-white text-xs font-bold rounded-xl hover:bg-[#05281f] transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          + เพิ่มอาจารย์ประจำสาขา
        </button>
      </div>

      {/* ค้นหา */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          placeholder="ค้นหาชื่ออาจารย์ อีเมล รหัส หรือสาขาวิชา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs outline-none text-slate-800 font-medium"
        />
      </div>

      {/* ตารางรายชื่ออาจารย์ */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
            <tr>
              <th className="p-4">ชื่ออาจารย์ / กรรมการ</th>
              <th className="p-4">รหัสประจำตัว</th>
              <th className="p-4">อีเมล</th>
              <th className="p-4">สาขาวิชาสังกัด</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  ไม่พบข้อมูลอาจารย์ประจำสาขาในคณะนี้
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-50/50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0">
                      👨‍🏫
                    </div>
                    <span className="font-bold text-slate-800">{teacher.name}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{teacher.teacherId}</td>
                  <td className="p-4 text-slate-500">{teacher.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                      {teacher.department}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={async () => {
                        if (confirm(`คุณต้องการลบบัญชีอาจารย์ "${teacher.name}" หรือไม่?`)) {
                          await deleteTeacherData(teacher.id)
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="ลบบัญชีอาจารย์"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal เพิ่มอาจารย์ */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">เพิ่มอาจารย์ประจำสาขา</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await createTeacherData(formData)
                setIsOpen(false)
              }}
              className="space-y-4 text-xs"
            >
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#07382B]" />
                <span>สังกัดคณะ: <strong className="text-slate-900">{facultyName}</strong></span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="ผศ.ดร. สมชาย ใจดี"
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="teacher@ku.ac.th"
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รหัสผ่านเริ่มต้น <span className="text-red-500">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="กำหนดรหัสผ่านอย่างน้อย 6 หลัก"
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รหัสประจำตัวอาจารย์ (Teacher ID)
                </label>
                <input
                  name="teacherId"
                  type="text"
                  placeholder="เช่น T67014"
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B] font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">
                    สาขาวิชา <span className="text-red-500">*</span>
                  </label>
                  {existingDepartments.length > 0 && (
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                      <button
                        type="button"
                        onClick={() => setSelectedDeptMode('SELECT')}
                        className={`px-2 py-0.5 rounded ${selectedDeptMode === 'SELECT' ? 'bg-white shadow-sm font-bold text-[#07382B]' : 'text-slate-500'}`}
                      >
                        เลือกที่มีอยู่
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDeptMode('CUSTOM')}
                        className={`px-2 py-0.5 rounded ${selectedDeptMode === 'CUSTOM' ? 'bg-white shadow-sm font-bold text-[#07382B]' : 'text-slate-500'}`}
                      >
                        พิมพ์เอง
                      </button>
                    </div>
                  )}
                </div>

                {selectedDeptMode === 'SELECT' && existingDepartments.length > 0 ? (
                  <select
                    name="department"
                    required
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B] bg-white cursor-pointer"
                  >
                    <option value="">-- เลือกสาขาวิชา --</option>
                    {existingDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="department"
                    type="text"
                    required
                    placeholder="เช่น วิศวกรรมซอฟต์แวร์, ภาษาเกาหลี"
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B]"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#07382B] text-white rounded-xl font-semibold hover:bg-[#05281f] cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}