'use client'

import { useState, useEffect } from 'react'

interface ApplicationItem {
  id: string
  status: string
  remark?: string
  createdAt: string
  criteria: {
    id: string
    programName: string
    university?: {
      name: string
      faculty: string
    }
  }
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMyApplications() {
      try {
        const studentId =
          typeof window !== 'undefined'
            ? localStorage.getItem('studentId') || '66010001'
            : '66010001'

        const res = await fetch(`/api/student/applications?studentId=${studentId}`)
        const data = await res.json()

        if (data.success) {
          setApplications(data.data)
        }
      } catch (err) {
        console.error('Error fetching applications:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMyApplications()
  }, [])

  // ฟังก์ชันแปลง Badges แสดงสถานะการตอบรับ
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ELIGIBLE':
      case 'PASSED':
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            ผ่านการคัดเลือก (ผ่านเกณฑ์)
          </span>
        )
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            กำลังรอการตรวจสอบ
          </span>
        )
      case 'REJECTED':
      case 'NOT_ELIGIBLE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            ไม่ผ่านการคัดเลือก
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">สถานะการสมัครหลักสูตร</h1>
        <p className="text-sm text-slate-500">
          ตรวจสอบผลการยื่นคำขอสมัครและสถานะการพิจารณาจากมหาวิทยาลัย
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">กำลังโหลดข้อมูลการสมัคร...</div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-3">
          <p className="text-base font-medium text-slate-600">คุณยังไม่ได้ยื่นสมัครหลักสูตรใดๆ</p>
          <a
            href="/student/search"
            className="inline-block px-4 py-2 bg-[#07382B] text-white text-xs font-bold rounded-xl hover:bg-[#052920] transition"
          >
            ค้นหาหลักสูตรเพื่อยื่นสมัคร
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {app.criteria?.university?.faculty || 'คณะวิศวกรรมศาสตร์'}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">
                  {app.criteria?.programName || 'ไม่ระบุหลักสูตร'}
                </h3>
                <p className="text-xs text-slate-500">
                  {app.criteria?.university?.name || 'มหาวิทยาลัยเกษตรศาสตร์'}
                </p>
                <p className="text-xs text-slate-400 pt-1">
                  ยื่นสมัครเมื่อ:{' '}
                  {new Date(app.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                {renderStatusBadge(app.status)}
                {app.remark && (
                  <p className="text-xs text-slate-500 mt-1 max-w-xs text-right">
                    หมายเหตุ: {app.remark}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}