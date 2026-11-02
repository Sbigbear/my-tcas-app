'use client'

import { useState } from 'react'
import { School, GraduationCap, RefreshCw, CheckCircle2, AlertCircle, Database } from 'lucide-react'

export default function AdminSyncPage() {
  const [loadingSchool, setLoadingSchool] = useState(false)
  const [loadingTcas, setLoadingTcas] = useState(false)
  const [log, setLog] = useState<{
    type: 'success' | 'error'
    title: string
    message: string
    time: string
  } | null>(null)

  // 1. กดซิงก์ข้อมูลโรงเรียนและนักเรียน ปพ.1
  const handleSyncSchool = async () => {
    setLoadingSchool(true)
    setLog(null)
    try {
      const res = await fetch('/api/mock/school', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setLog({
          type: 'success',
          title: 'ซิงก์ข้อมูลโรงเรียน & นักเรียนสำเร็จ',
          message: data.message,
          time: new Date().toLocaleTimeString('th-TH'),
        })
      } else {
        setLog({
          type: 'error',
          title: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลโรงเรียน',
          message: data.message,
          time: new Date().toLocaleTimeString('th-TH'),
        })
      }
    } catch (error: any) {
      setLog({
        type: 'error',
        title: 'ข้อผิดพลาดเครือข่าย',
        message: 'ไม่สามารถเชื่อมต่อ API /api/mock/school ได้',
        time: new Date().toLocaleTimeString('th-TH'),
      })
    } finally {
      setLoadingSchool(false)
    }
  }

  // 2. กดซิงก์คะแนนสอบ TCAS
  const handleSyncTcas = async () => {
    setLoadingTcas(true)
    setLog(null)
    try {
      const res = await fetch('/api/mock/tcas', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setLog({
          type: 'success',
          title: 'ซิงก์คะแนนสอบ TCAS สำเร็จ',
          message: data.message,
          time: new Date().toLocaleTimeString('th-TH'),
        })
      } else {
        setLog({
          type: 'error',
          title: 'เกิดข้อผิดพลาดในการนำเข้าคะแนน TCAS',
          message: data.message,
          time: new Date().toLocaleTimeString('th-TH'),
        })
      }
    } catch (error: any) {
      setLog({
        type: 'error',
        title: 'ข้อผิดพลาดเครือข่าย',
        message: 'ไม่สามารถเชื่อมต่อ API /api/mock/tcas ได้',
        time: new Date().toLocaleTimeString('th-TH'),
      })
    } finally {
      setLoadingTcas(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* ส่วนหัวข้อหน้า */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Database className="w-7 h-7 text-[#063b2c]" />
          จำลองการนำเข้าข้อมูลภายนอก (Mock Data Sync)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          จำลองระบบรับส่งข้อมูลจากโรงเรียน (ปพ.1) และ ทปอ. (TCAS) จากไฟล์บนไดรฟ์ D เข้าสู่ MySQL
        </p>
      </div>

      {/* การ์ดตัวเลือกซิงก์ข้อมูล */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: ข้อมูลโรงเรียน */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#063b2c] flex items-center justify-center">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">1. ข้อมูลโรงเรียน & นักเรียน (ปพ.1)</h2>
              <p className="text-xs text-gray-500 mt-1">
                อ่านไฟล์ <code className="bg-gray-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono">D:\DATA\mock_school.json</code>
              </p>
            </div>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
              <li>นำเข้าโรงเรียนลงตาราง <code className="font-semibold">D2_Schools</code></li>
              <li>นำเข้าเกรด ปพ.1 ลงตาราง <code className="font-semibold">D3_Students</code></li>
            </ul>
          </div>

          <button
            onClick={handleSyncSchool}
            disabled={loadingSchool || loadingTcas}
            className="mt-6 w-full py-3 px-4 bg-[#063b2c] hover:bg-[#04281e] text-white font-medium rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSchool ? 'animate-spin' : ''}`} />
            {loadingSchool ? 'กำลังนำเข้าข้อมูล...' : 'ซิงก์ข้อมูลโรงเรียน & นักเรียน'}
          </button>
        </div>

        {/* Card 2: คะแนนสอบ TCAS */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">2. คะแนนสอบ TCAS</h2>
              <p className="text-xs text-gray-500 mt-1">
                อ่านไฟล์ <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-800 font-mono">D:\DATA\mock_tcas.json</code>
              </p>
            </div>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
              <li>แมปเลข 13 หลัก (<code className="font-semibold">nationalId</code>) ค้นหานักเรียน</li>
              <li>บันทึกคะแนน TGAT/TPAT/A-Level ลง <code className="font-semibold">D4_Tcas_Scores</code></li>
            </ul>
          </div>

          <button
            onClick={handleSyncTcas}
            disabled={loadingSchool || loadingTcas}
            className="mt-6 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingTcas ? 'animate-spin' : ''}`} />
            {loadingTcas ? 'กำลังนำเข้าคะแนน...' : 'ซิงก์คะแนนสอบ TCAS'}
          </button>
        </div>
      </div>

      {/* กล่องแสดง Log ผลการทำงาน */}
      {log && (
        <div
          className={`p-5 rounded-2xl border flex items-start gap-3 transition-all ${
            log.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {log.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">{log.title}</h3>
              <span className="text-xs opacity-75 font-mono">{log.time}</span>
            </div>
            <p className="text-xs font-mono bg-white/60 p-2.5 rounded-lg border border-black/5 mt-2">
              {log.message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}