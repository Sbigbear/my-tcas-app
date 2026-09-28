'use client'

import { useState, useEffect } from 'react'

export default function AdminDashboardPage() {
  const [userName, setUserName] = useState('ผู้ดูแลระบบ')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        if (parsed.name) setUserName(parsed.name)
      } catch (err) {
        console.error(err)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">ภาพรวม</h1>

      {/* Banner ต้อนรับ */}
      <div className="bg-[#063b2c] text-white p-6 rounded-2xl flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-2xl font-bold">สวัสดี, {userName}</h2>
          <p className="text-sm text-emerald-100/80 mt-1">
            ระบบทำงานเป็นปกติ มีผู้ใช้งานทั้งหมด 11 บัญชี
          </p>
        </div>
        <button className="bg-white text-[#063b2c] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors">
          จัดการผู้ใช้งาน &gt;
        </button>
      </div>

      {/* ส่วนอื่นๆ ของ Dashboard... */}
    </div>
  )
}