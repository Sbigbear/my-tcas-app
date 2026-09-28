'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface TeacherSidebarProps {
  teacherName?: string
  teacherEmail?: string
}

export default function TeacherSidebar({ teacherName, teacherEmail }: TeacherSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'ภาพรวม', href: '/teacher/dashboard', icon: '🏠' },
    { label: 'รายชื่อผู้สมัคร', href: '/teacher/applicants', icon: '👤' },
    { label: 'เกณฑ์หลักสูตร', href: '/teacher/criteria', icon: '📋' },
    { label: 'รายงานผล', href: '/teacher/reports', icon: '📄' },
  ]

  return (
    <aside className="w-64 bg-[#07382B] text-white flex flex-col justify-between p-4 flex-shrink-0 min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold">
            KU
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none text-white">KU Pathway</h1>
            <span className="text-xs text-emerald-400">TCAS Eligibility</span>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-emerald-300/70 px-4 mb-2">เมนูหลัก</p>

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
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
            {teacherName ? teacherName.charAt(0) : 'ศ'}
          </div>
          <div>
            <p className="font-bold text-xs text-white truncate max-w-[120px]">
              {teacherName || 'อาจารย์ ดร.ศศิน'}
            </p>
            <p className="text-[10px] text-slate-300 truncate max-w-[120px]">
              {teacherEmail || 'กรรมการคัดเลือก'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}