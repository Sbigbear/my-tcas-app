'use client'

import { useState } from 'react'
import { Search, Clock, BookOpen, Users, ListFilter, UserCheck, Printer, ShieldCheck, UserCog, GraduationCap } from 'lucide-react'

export interface LogEntry {
  id: string
  action: string
  user: string
  role: string
  details: string
  timestamp: string
  type?: 'auth' | 'user' | 'course' | 'passed_students' | 'report' | 'system'
}

interface LogsClientProps {
  initialLogs: LogEntry[]
}

// 📌 ฟังก์ชันจำแนกหมวดหมู่ประเภทกิจกรรม (Type Resolver)
function resolveLogType(log: LogEntry): 'auth' | 'user' | 'course' | 'passed_students' | 'report' | 'system' {
  if (log.type && log.type !== 'system') return log.type

  const action = (log.action || '').toUpperCase()
  const details = (log.details || '').toUpperCase()

  // 1. หมวด "พิมพ์/ส่งออกรายงาน PDF"
  if (action.includes('REPORT') || action.includes('EXPORT') || details.includes('รายงาน') || details.includes('PDF')) {
    return 'report'
  }

  // 2. หมวด "นักเรียนผ่านคัดเลือก / ยืนยันผล"
  if (
    action.includes('CONFIRM') ||
    action.includes('PASS') ||
    action.includes('STUDENT') ||
    details.includes('ผ่านการคัดเลือก') ||
    details.includes('ยืนยันผล')
  ) {
    return 'passed_students'
  }

  // 3. หมวด "หลักสูตร / เกณฑ์"
  if (action.includes('COURSE') || action.includes('CRITERIA') || action.includes('PROGRAM')) {
    return 'course'
  }

  // 4. หมวด "ผู้ใช้งาน / จัดการสิทธิ์"
  if (action.includes('USER') || action.includes('TEACHER') || action.includes('OFFICER')) {
    return 'user'
  }

  // 5. หมวด "เข้าสู่ระบบ"
  if (action.includes('LOGIN') || action.includes('LOGOUT') || action.includes('AUTH')) {
    return 'auth'
  }

  return 'system'
}

export default function LogsClient({ initialLogs }: LogsClientProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')

  const filteredLogs = (initialLogs || []).filter((log) => {
    // 1. ค้นหาคำ
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())

    // 2. กรองตามประเภทกิจกรรม
    const resolvedType = resolveLogType(log)
    const matchesType = filterType === 'all' || resolvedType === filterType

    // 3. กรองตามบทบาทผู้ใช้งาน
    const matchesRole =
      filterRole === 'all' || log.role.toUpperCase() === filterRole.toUpperCase()

    return matchesSearch && matchesType && matchesRole
  })

  // แสดง Badge สีตาม Role
  const getRoleBadge = (role: string) => {
    const r = (role || '').toUpperCase()
    if (r === 'TEACHER') {
      return 'bg-blue-100 text-blue-800 border-blue-200'
    }
    if (r === 'OFFICER') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
    if (r === 'STUDENT') {
      return 'bg-purple-100 text-purple-800 border-purple-200'
    }
    if (r === 'ADMIN') {
      return 'bg-amber-100 text-amber-800 border-amber-200'
    }
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 font-medium">ระบบบริหารจัดการ TCAS</p>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mt-0.5">
          <Clock className="w-6 h-6 text-[#07382B]" /> ประวัติการทำงาน (System Logs)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          บันทึกกิจกรรมการเข้าใช้งาน การจัดการหลักสูตร การส่งออกรายงาน และประวัติการทำงานทั้งหมดในระบบ
        </p>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม, ผู้ใช้งาน หรือรายละเอียด..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07382B] focus:bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* 📌 แท็บแยกตามประเภทกิจกรรม */}
          <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto">
            {[
              { key: 'all', label: 'กิจกรรมทั้งหมด', icon: ListFilter },
              { key: 'passed_students', label: 'การคัดเลือก/ยืนยันผล', icon: UserCheck },
              { key: 'course', label: 'หลักสูตร', icon: BookOpen },
              { key: 'report', label: 'พิมพ์/รายงาน PDF', icon: Printer },
              { key: 'user', label: 'ผู้ใช้งาน', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = filterType === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterType(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#07382B] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 📌 ตัวกรองตามบทบาทผู้ใช้งาน (Role) */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs overflow-x-auto">
          <span className="text-slate-400 font-medium shrink-0">บทบาทผู้ใช้งาน:</span>
          <div className="flex gap-1.5">
            {[
              { key: 'all', label: 'ทุกบทบาท', icon: ShieldCheck },
              { key: 'TEACHER', label: 'อาจารย์', icon: Users },
              { key: 'OFFICER', label: 'เจ้าหน้าที่คณะ', icon: UserCog },
              { key: 'STUDENT', label: 'นักเรียน', icon: GraduationCap },
              { key: 'ADMIN', label: 'ผู้ดูแลระบบ', icon: ShieldCheck },
            ].map((roleTab) => {
              const RoleIcon = roleTab.icon
              const isRoleActive = filterRole === roleTab.key
              return (
                <button
                  key={roleTab.key}
                  onClick={() => setFilterRole(roleTab.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    isRoleActive
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <RoleIcon className="w-3 h-3" />
                  {roleTab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-bold">
                <th className="py-3.5 px-4">กิจกรรม</th>
                <th className="py-3.5 px-4">ผู้ดำเนินการ / บทบาท</th>
                <th className="py-3.5 px-4">รายละเอียด</th>
                <th className="py-3.5 px-4">เวลาบันทึก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const resolvedType = resolveLogType(log)
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-bold px-2.5 py-1 rounded-lg border text-[11px] inline-block ${
                            resolvedType === 'report'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : resolvedType === 'passed_students'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : resolvedType === 'course'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : resolvedType === 'user'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.user}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getRoleBadge(
                              log.role
                            )}`}
                          >
                            {log.role}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed max-w-md">
                        {log.details}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                    ไม่พบข้อมูลประวัติการทำงานตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}