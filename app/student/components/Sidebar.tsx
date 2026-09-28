'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  studentName?: string
  studentId?: string
}

export default function Sidebar({ studentName, studentId }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'ภาพรวม', href: '/student/dashboard' },
    { label: 'ค้นหาหลักสูตร', href: '/student/search' },
    { label: 'คะแนนของฉัน', href: '/student/scores' },
    { label: 'เอกสารการศึกษา', href: '/student/documents' },
  ]

  return (
    <aside className="w-64 bg-[#07382B] text-white flex flex-col justify-between p-4 flex-shrink-0 min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center font-bold">KU</div>
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
      </div>
    </aside>
  )
}