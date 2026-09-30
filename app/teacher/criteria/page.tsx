'use client'

import { useState, useEffect } from 'react'

interface Criteria {
  id: string
  programName: string
  capacity: number
  minGpax: number
  isOpen: boolean
  university: {
    name: string
    faculty: string
  }
}

export default function CriteriaPage() {
  const [criteriaList, setCriteriaList] = useState<Criteria[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCriteria = async () => {
    try {
      // เพิ่ม cache: 'no-store' เพื่อบังคับดึงข้อมูลใหม่สดๆ จาก DB
      const res = await fetch('/api/teacher/criteria', { cache: 'no-store' })
      const data = await res.json()
      if (data.success) setCriteriaList(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCriteria()
  }, [])

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus

    // Optimistic Update ปรับ UI ทันที
    setCriteriaList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isOpen: nextStatus } : item))
    )

    try {
      const res = await fetch('/api/teacher/criteria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isOpen: nextStatus }),
      })

      const data = await res.json()
      if (!data.success) {
        fetchCriteria() // ดึงค่าจริงย้อนกลับถ้าไม่สำเร็จ
      }
    } catch (err) {
      console.error(err)
      fetchCriteria()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">เกณฑ์หลักสูตร</h1>
        <p className="text-xs text-slate-500">กำหนดรอบรับสมัคร จำนวนที่รับ และเกณฑ์คุณสมบัติขั้นต่ำ</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">กำลังโหลดข้อมูล...</div>
        ) : criteriaList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            ยังไม่มีข้อมูลเกณฑ์หลักสูตรในระบบ
          </div>
        ) : (
          criteriaList.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {item.university.faculty} ({item.university.name})
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{item.programName}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    รับสมัคร {item.capacity} คน | GPAX ขั้นต่ำ {item.minGpax}
                  </p>
                </div>

                {/* ปุ่มสลับ เปิด/ปิด รับสมัคร */}
                <button
                  onClick={() => toggleStatus(item.id, item.isOpen)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
                    item.isOpen
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  {item.isOpen ? '🟢 เปิดรับสมัคร' : '🔴 ปิดรับสมัคร'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}