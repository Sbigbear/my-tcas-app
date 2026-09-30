'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface SidebarProps {
  studentName?: string
  studentId?: string
}

export default function Sidebar({ studentName, studentId }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    router.push('/login')
  }

  const navItems = [
    { label: 'ภาพรวม', href: '/student/dashboard' },
    { label: 'ค้นหาหลักสูตร', href: '/student/search' },
    { label: 'สถานะการสมัคร', href: '/student/applications' }, // 📌 เมนูใหม่ที่เพิ่มเข้ามา
    { label: 'คะแนนของฉัน', href: '/student/scores' },
    { label: 'เอกสารการศึกษา', href: '/student/documents' },
  ]

  return (
    <aside className="w-64 bg-[#07382B] text-white flex flex-col justify-between p-4 flex-shrink-0 min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center font-bold">
            KU
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">KU Pathway</h1>
            <span className="text-xs text-emerald-400">TCAS Eligibility</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-white text-[#07382B] shadow-sm'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{studentName || 'นักเรียน'}</p>
          <p className="text-xs text-slate-400">รหัส: {studentId || '-'}</p>
        </div>
        <button
          onClick={handleLogout}
          title="ออกจากระบบ"
          className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </aside>
  )
}