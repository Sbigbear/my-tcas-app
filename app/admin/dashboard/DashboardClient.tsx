'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardClientProps {
  totalUsers: number
}

export default function DashboardClient({ totalUsers }: DashboardClientProps) {
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
            ระบบทำงานเป็นปกติ มีผู้ใช้งานทั้งหมด{' '}
            <span className="font-bold text-white">{totalUsers}</span> บัญชี
          </p>
        </div>

        {/* ปุ่มลิงก์ไปยังหน้าจัดการผู้ใช้งาน */}
        <Link
          href="/admin/users"
          className="bg-white text-[#063b2c] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors inline-block"
        >
          จัดการผู้ใช้งาน &gt;
        </Link>
      </div>
    </div>
  )
}