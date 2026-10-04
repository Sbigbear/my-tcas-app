'use client'

import { useState } from 'react'
import { Search, Clock } from 'lucide-react'

export interface LogEntry {
  id: string
  action: string
  user: string
  role: string
  details: string
  timestamp: string
  type: 'auth' | 'user' | 'course' | 'system'
}

interface LogsClientProps {
  initialLogs: LogEntry[]
}

export default function LogsClient({ initialLogs }: LogsClientProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredLogs = (initialLogs || []).filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())

    const matchesType = filterType === 'all' || log.type === filterType

    return matchesSearch && matchesType
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 font-medium">ระบบบริหารจัดการ TCAS</p>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#063b2c]" /> ประวัติการทำงาน (System Logs)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          บันทึกกิจกรรมการเข้าใช้งาน การแก้ไขข้อมูล และประวัติการทำงานทั้งหมดในระบบ
        </p>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหากิจกรรม, ผู้ใช้งาน หรือรายละเอียด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b2c] focus:bg-white text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'all', label: 'ทั้งหมด' },
            { key: 'auth', label: 'เข้าสู่ระบบ' },
            { key: 'course', label: 'หลักสูตร' },
            { key: 'user', label: 'ผู้ใช้งาน' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === tab.key
                  ? 'bg-[#063b2c] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-semibold">
                <th className="py-3 px-4">กิจกรรม</th>
                <th className="py-3 px-4">ผู้ดำเนินการ</th>
                <th className="py-3 px-4">รายละเอียด</th>
                <th className="py-3 px-4">เวลาบันทึก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{log.action}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{log.user}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                          {log.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{log.details}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs whitespace-nowrap">
                      {log.timestamp}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                    ไม่พบข้อมูลประวัติการทำงาน
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