'use client'

import { useState } from 'react'
import { createUserData, deleteUserData } from './actions'

type FormattedUser = {
  id: string
  name: string | null
  email: string
  role: string
  type: 'USER' | 'STUDENT'
}

export default function UserListClient({ initialUsers }: { initialUsers: FormattedUser[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredUsers = initialUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการผู้ใช้งาน</h1>
          <p className="text-xs text-slate-500">
            ดูแลบัญชีและสิทธิ์การเข้าถึงทั้งหมด {initialUsers.length} บัญชี
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-[#07382B] text-white text-sm font-bold rounded-xl hover:bg-[#05281f] transition"
        >
          + เพิ่มผู้ใช้งาน
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="ค้นหาชื่อ อีเมล หรือบทบาท"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none px-2"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 border-b border-slate-100">
            <tr>
              <th className="p-4">ผู้ใช้งาน</th>
              <th className="p-4">อีเมล</th>
              <th className="p-4">บทบาท</th>
              <th className="p-4">สถานะ</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#07382B] font-bold flex items-center justify-center text-xs">
                    {user.name?.[0] || 'U'}
                  </div>
                  <span className="font-semibold text-slate-800">{user.name}</span>
                </td>
                <td className="p-4 text-slate-500">{user.email}</td>
                <td className="p-4">{getRoleLabel(user.role)}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-semibold">
                    ใช้งาน
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={async () => {
                      if (confirm('คุณต้องการลบผู้ใช้งานนี้หรือไม่?')) {
                        await deleteUserData(user.id, user.type)
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">เพิ่มผู้ใช้งานใหม่</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 text-xl">
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
                <label className="block font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">อีเมล</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@ku.th"
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">บทบาทเริ่มต้น</label>
                <select
                  name="role"
                  className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#07382B] bg-white"
                >
                  <option value="STUDENT">นักเรียน</option>
                  <option value="OFFICER">อาจารย์ / เจ้าหน้าที่</option>
                  <option value="ADMIN">ผู้ดูแลระบบ</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#07382B] text-white rounded-xl font-semibold hover:bg-[#05281f]"
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