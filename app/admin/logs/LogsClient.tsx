'use client'

import { useState } from 'react'
import { Search, Clock, BookOpen, Users, ListFilter, UserCheck } from 'lucide-react'

export interface LogEntry {
  id: string
  action: string
  user: string
  role: string
  details: string
  timestamp: string
  type?: 'auth' | 'user' | 'course' | 'passed_students' | 'system'
}

interface LogsClientProps {
  initialLogs: LogEntry[]
}

// 📌 ฟังก์ชันจำแนกหมวดหมู่ประเภทกิจกรรม (Type Resolver)
function resolveLogType(log: LogEntry): 'auth' | 'user' | 'course' | 'passed_students' | 'system' {
  if (log.type && log.type !== 'system') return log.type

  const action = (log.action || '').toUpperCase()
  const details = (log.details || '').toUpperCase()

  // 1. หมวด "นักเรียนผ่านคัดเลือก"
  if (
    action.includes('CONFIRM') ||
    action.includes('PASS') ||
    action.includes('STUDENT') ||
    details.includes('ผ่านการคัดเลือก') ||
    details.includes('ยืนยันผล') ||
    details.includes('นักเรียน')
  ) {
    return 'passed_students'
  }

  // 2. หมวด "หลักสูตร"
  if (
    action.includes('COURSE') ||
    action.includes('CRITERIA') ||
    action.includes('PROGRAM')
  ) {
    return 'course'
  }

  // 3. หมวด "ผู้ใช้งาน"
  if (
    action.includes('USER') ||
    action.includes('TEACHER') ||
    action.includes('OFFICER')
  ) {
    return 'user'
  }

  // 4. หมวด "เข้าสู่ระบบ"
  if (action.includes('LOGIN') || action.includes('LOGOUT') || action.includes('AUTH')) {
    return 'auth'
  }

  return 'system'
}

export default function LogsClient({ initialLogs }: LogsClientProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredLogs = (initialLogs || []).filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())

    const resolvedType = resolveLogType(log)
    const matchesType = filterType === 'all' || resolvedType === filterType

    return matchesSearch && matchesType
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 font-medium">ระบบบริหารจัดการ TCAS</p>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mt-0.5">
          <Clock className="w-6 h-6 text-[#07382B]" /> ประวัติการทำงาน (System Logs)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          บันทึกกิจกรรมการเข้าใช้งาน การแก้ไขข้อมูล และประวัติการทำงานทั้งหมดในระบบ
        </p>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
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

        {/* 📌 แท็บตัวกรอง: เพิ่มแท็บ "นักเรียนผ่านคัดเลือก" */}
        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'all', label: 'ทั้งหมด', icon: ListFilter },
            { key: 'user', label: 'ผู้ใช้งาน', icon: Users },
            { key: 'course', label: 'หลักสูตร', icon: BookOpen },
            { key: 'passed_students', label: 'นักเรียนผ่านคัดเลือก', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = filterType === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
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

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-bold">
                <th className="py-3.5 px-4">กิจกรรม</th>
                <th className="py-3.5 px-4">ผู้ดำเนินการ</th>
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
                            resolvedType === 'passed_students'
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
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold uppercase px-1.5 py-0.5 rounded border border-slate-200">
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
                    ไม่พบข้อมูลประวัติการทำงานในหมวดนี้
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