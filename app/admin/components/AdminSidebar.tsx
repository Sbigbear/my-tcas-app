'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, BookOpen, Clock, LogOut } from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('ผู้ดูแลระบบ')

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้จาก localStorage
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

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  const navItems = [
    { name: 'ภาพรวม', href: '/admin/dashboard', icon: Home },
    { name: 'จัดการผู้ใช้งาน', href: '/admin/users', icon: Users },
    { name: 'จัดการหลักสูตร', href: '/admin/courses', icon: BookOpen },
    { name: 'ประวัติการทำงาน', href: '/admin/logs', icon: Clock },
  ]

  // ดึงตัวอักษรแรกมาทำเป็น Avatar Logo เช่น "ผ" หรือ "A"
  const avatarText = userName.charAt(0).toUpperCase()

  return (
    <aside className="w-64 bg-[#063b2c] text-white flex flex-col justify-between p-6 min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-lg">
            KU
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">KU Pathway</h1>
            <p className="text-xs text-emerald-200/70">TCAS Eligibility</p>
          </div>
        </div>

        <p className="text-xs text-emerald-300/60 uppercase tracking-wider mb-3">เมนูหลัก</p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#063b2c] shadow-sm font-semibold'
                    : 'text-emerald-100 hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* แสดงชื่อผู้ใช้ตรงมุมซ้ายล่าง */}
      <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-emerald-300 text-[#063b2c] font-bold flex items-center justify-center text-xs flex-shrink-0">
            {avatarText}
          </div>
          <p className="text-sm font-medium truncate" title={userName}>
            {userName}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-emerald-200 hover:text-white flex-shrink-0 p-1"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}