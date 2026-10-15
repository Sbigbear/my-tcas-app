'use client'

import { useState } from 'react'
import { createUserData, deleteUserData } from './actions'

type FormattedUser = {
  id: string
  name: string | null
  email: string
  role: string
  type: 'USER' | 'STUDENT'
  department?: string
}

type UniversityItem = {
  Universitiesid: string
  code: string
  name: string
  campus: string
  faculty: string
  department: string
}

export default function UserListClient({
  initialUsers,
  universities,
}: {
  initialUsers: FormattedUser[]
  universities: UniversityItem[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<'OFFICER' | 'ADMIN'>('OFFICER')
  const [activeTab, setActiveTab] = useState<'ALL' | 'OFFICER' | 'STUDENT' | 'ADMIN'>('ALL')

  // 📌 ตัวสลับโหมดการเลือก/กรอก คณะ-สาขาวิชา: 'SELECT' (เลือกที่มี) หรือ 'CUSTOM' (กรอกเอง)
  const [univMode, setUnivMode] = useState<'SELECT' | 'CUSTOM'>('CUSTOM')

  // คำนวณจำนวนผู้ใช้งานแต่ละประเภท
  const countAll = initialUsers.length
  const countOfficers = initialUsers.filter((u) => u.role === 'OFFICER').length
  const countStudents = initialUsers.filter((u) => u.role === 'STUDENT').length
  const countAdmins = initialUsers.filter((u) => u.role === 'ADMIN').length

  // กรองผู้ใช้งานตามคำค้นหา + แท็บที่เลือก
  const filteredUsers = initialUsers.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase())

    const matchesTab = activeTab === 'ALL' ? true : u.role === activeTab

    return matchesSearch && matchesTab
  })

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'นักเรียน'
      case 'OFFICER':
        return 'อาจารย์'
      case 'ADMIN':
        return 'ผู้ดูแลระบบ'
      default:
        return role
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการผู้ใช้งาน</h1>
          <p className="text-xs text-slate-500">
            ดูแลบัญชีและสิทธิ์การเข้าถึงทั้งหมด {initialUsers.length} บัญชี
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-[#07382B] text-white text-sm font-bold rounded-xl hover:bg-[#05281f] transition cursor-pointer shadow-sm"
        >
          + เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* แท็บตัวเลือกแบ่งหมวดหมู่ */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-[#07382B] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ทั้งหมด
          <span
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {countAll}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('OFFICER')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'OFFICER'
              ? 'bg-[#07382B] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          👨‍🏫 อาจารย์
          <span
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              activeTab === 'OFFICER' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {countOfficers}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('STUDENT')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'STUDENT'
              ? 'bg-[#07382B] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🎓 นักเรียน
          <span
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              activeTab === 'STUDENT' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {countStudents}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ADMIN')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ADMIN'
              ? 'bg-[#07382B] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🛡️ ผู้ดูแลระบบ
          <span
            className={`px-2 py-0.5 text-[10px] rounded-full ${
              activeTab === 'ADMIN' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {countAdmins}
          </span>
        </button>
      </div>

      {/* ช่องค้นหา */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="ค้นหาชื่อ อีเมล หรือสาขาวิชาสังกัด..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs outline-none px-2 text-slate-800 font-medium"
        />
      </div>

      {/* ตารางแสดงรายชื่อผู้ใช้งาน */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 border-b border-slate-100">
            <tr>
              <th className="p-4">ผู้ใช้งาน</th>
              <th className="p-4">อีเมล</th>
              <th className="p-4">บทบาท</th>
              <th className="p-4">สาขาวิชาสังกัด</th>
              <th className="p-4">สถานะ</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                  ไม่พบข้อมูลผู้ใช้งานในหมวดหมู่นี้
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#07382B] font-bold flex items-center justify-center text-xs shrink-0">
                      {user.name?.[0] || 'U'}
                    </div>
                    <span className="font-semibold text-slate-800">{user.name}</span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{user.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700'
                          : user.role === 'OFFICER'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-600">{user.department}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-semibold">
                      ใช้งาน
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={async () => {
                        if (confirm(`คุณต้องการลบผู้ใช้งาน "${user.name}" หรือไม่?`)) {
                          await deleteUserData(user.id, user.type)
                        }
                      }}
                      className="text-red-500 hover:text-red-700 cursor-pointer p-1 rounded hover:bg-red-50 transition"
                      title="ลบผู้ใช้"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal เพิ่มผู้ใช้งาน */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">เพิ่มผู้ใช้งานใหม่</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 text-xl cursor-pointer">
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await createUserData(formData)
                setIsOpen(false)
              }}
              className="space-y-4 text-sm"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B] text-xs"
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
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B] text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="กำหนดรหัสผ่านอย่างน้อย 6 หลัก"
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B] text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  บทบาทเริ่มต้น <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'OFFICER' | 'ADMIN')}
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B] bg-white cursor-pointer text-xs"
                >
                  <option value="OFFICER">อาจารย์</option>
                  <option value="ADMIN">ผู้ดูแลระบบ</option>
                </select>
              </div>

              {/* แสดงส่วนกรอกข้อมูลเฉพาะเมื่อเลือกบทบาทเป็น "อาจารย์" (OFFICER) */}
              {selectedRole === 'OFFICER' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      รหัสอาจารย์ (Teacher ID)
                    </label>
                    <input
                      name="teacherId"
                      type="text"
                      placeholder="เช่น T67014"
                      className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B] text-xs font-mono"
                    />
                  </div>

                  {/* 📌 สวิตช์เลือกระหว่าง "เลือกจากรายการ" หรือ "กรอกเอง" */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <label className="block font-semibold text-slate-700">
                        สังกัดคณะ / สาขาวิชา <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px]">
                        <button
                          type="button"
                          onClick={() => setUnivMode('CUSTOM')}
                          className={`px-2.5 py-1 rounded-md transition font-semibold ${
                            univMode === 'CUSTOM'
                              ? 'bg-white text-[#07382B] shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          ✏️ กรอกเอง
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnivMode('SELECT')}
                          className={`px-2.5 py-1 rounded-md transition font-semibold ${
                            univMode === 'SELECT'
                              ? 'bg-white text-[#07382B] shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          📋 เลือกจากรายการ
                        </button>
                      </div>
                    </div>

                    <input type="hidden" name="universityMode" value={univMode} />

                    {univMode === 'SELECT' ? (
                      <div>
                        <select
                          name="universityId"
                          required={univMode === 'SELECT'}
                          className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B] bg-white cursor-pointer text-xs"
                        >
                          <option value="">-- เลือกคณะ / สาขาวิชาสังกัด --</option>
                          {universities.map((u) => (
                            <option key={u.Universitiesid} value={u.Universitiesid}>
                              {u.faculty} - {u.department} ({u.campus})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            คณะ <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="faculty"
                            type="text"
                            required={univMode === 'CUSTOM'}
                            placeholder="เช่น มนุษยศาสตร์, วิศวกรรมศาสตร์"
                            className="w-full border border-slate-200 bg-white rounded-lg p-2 outline-none focus:border-[#07382B] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            สาขาวิชา <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="department"
                            type="text"
                            required={univMode === 'CUSTOM'}
                            placeholder="เช่น ภาษาเกาหลี, วิศวกรรมซอฟต์แวร์"
                            className="w-full border border-slate-200 bg-white rounded-lg p-2 outline-none focus:border-[#07382B] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            วิทยาเขต <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="campus"
                            type="text"
                            required={univMode === 'CUSTOM'}
                            defaultValue="บางเขน"
                            placeholder="เช่น บางเขน, กำแพงแสน, ศรีราชา"
                            className="w-full border border-slate-200 bg-white rounded-lg p-2 outline-none focus:border-[#07382B] text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#07382B] text-white rounded-xl font-semibold hover:bg-[#05281f] cursor-pointer text-xs"
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