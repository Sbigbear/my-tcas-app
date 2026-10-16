'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, CheckSquare, Square, RefreshCw, AlertCircle, FileCheck } from 'lucide-react'
import { confirmFacultyOfficer, confirmBulkFacultyOfficer } from './actions'

interface ConfirmationItem {
  id: string
  applicationId: string
  studentName: string
  studentNationalId: string
  programName: string
  departmentName: string
  facultyName: string
  criteriaCode: string
  status: 'PASSED' | 'CONFIRMED' | string
  confirmedAt?: string
  confirmedBy?: string
}

export default function ConfirmationsClient({
  confirmations = [], // 📌 กำหนดค่าเริ่มต้นเป็น [] ป้องกันค่า undefined
  officerUserId,
}: {
  confirmations?: ConfirmationItem[]
  officerUserId: string
}) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 📌 ป้องกันการพังด้วย safeConfirmations
  const safeConfirmations = confirmations || []

  // รายการนักเรียนที่อาจารย์ให้ผ่านแล้ว แต่งานยังไม่ถูกยืนยันส่งมหาวิทยาลัย
  const pendingItems = safeConfirmations.filter((item) => item.status === 'PASSED')

  // เลือก / ยกเลิก ทั้งหมดสำหรับรายการที่รออนุมัติ
  const handleSelectAll = () => {
    if (selectedIds.length === pendingItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(pendingItems.map((item) => item.applicationId))
    }
  }

  // เลือกทีละรายการ
  const handleToggleSelect = (appId: string) => {
    setSelectedIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    )
  }

  // บันทึกยืนยันผลเดี่ยว
  const handleSingleConfirm = async (appId: string) => {
    if (!confirm('ยืนยันการบันทึกส่งผลการคัดเลือกนักเรียนคนนี้ไปยังมหาวิทยาลัย?')) return

    setLoadingId(appId)
    const res = await confirmFacultyOfficer(appId, officerUserId)
    setLoadingId(null)

    if (res.success) {
      setSelectedIds((prev) => prev.filter((id) => id !== appId))
      router.refresh()
    } else {
      alert(res.message || 'เกิดข้อผิดพลาดในการบันทึก')
    }
  }

  // บันทึกยืนยันผลยกแพ็ก (Bulk Confirm)
  const handleBulkConfirm = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`ยืนยันการบันทึกส่งผลการคัดเลือกนักเรียนที่เลือกจำนวน ${selectedIds.length} รายการ ส่งไปยังมหาวิทยาลัยพร้อมกัน?`)) return

    setIsBulkLoading(true)
    const res = await confirmBulkFacultyOfficer(selectedIds, officerUserId)
    setIsBulkLoading(false)

    if (res.success) {
      alert(`บันทึกยืนยันส่งมหาวิทยาลัยเรียบร้อยแล้ว ทั้งหมด ${res.count} รายการ`)
      setSelectedIds([])
      router.refresh()
    } else {
      alert(res.message || 'เกิดข้อผิดพลาดในการบันทึกยกแพ็ก')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar & Control Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 font-medium">ระบบยืนยันผลการคัดเลือก (Faculty Officer)</p>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <FileCheck className="w-6 h-6 text-[#07382B]" /> ประวัติการยืนยันผลการคัดเลือกนักเรียน
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            รายการผู้สมัครที่ผ่านการคัดเลือกจากอาจารย์ และประวัติการบันทึกยืนยันส่งระดับมหาวิทยาลัย
          </p>
        </div>

        {/* ปุ่มดำเนินการ Bulk Action ยืนยันยกแพ็ก */}
        {pendingItems.length > 0 && (
          <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              {selectedIds.length === pendingItems.length && pendingItems.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#07382B]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              {selectedIds.length === pendingItems.length && pendingItems.length > 0
                ? 'ยกเลิกการเลือก'
                : 'เลือกทั้งหมดที่รออนุมัติ'}
            </button>

            <button
              type="button"
              onClick={handleBulkConfirm}
              disabled={selectedIds.length === 0 || isBulkLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-[#07382B] hover:bg-[#05281f] rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isBulkLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> กำลังบันทึก...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  บันทึกยืนยันที่เลือก ({selectedIds.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-bold">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={pendingItems.length > 0 && selectedIds.length === pendingItems.length}
                    onChange={handleSelectAll}
                    disabled={pendingItems.length === 0}
                    className="rounded text-[#07382B] focus:ring-[#07382B] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">ผู้สมัคร</th>
                <th className="py-3.5 px-4">หลักสูตร / สาขาวิชา</th>
                <th className="py-3.5 px-4">สถานะคัดเลือก</th>
                <th className="py-3.5 px-4">ประวัติการยืนยัน (FacultyConfirmation)</th>
                <th className="py-3.5 px-4 text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {safeConfirmations.length > 0 ? (
                safeConfirmations.map((item) => {
                  const isConfirmed = item.status === 'CONFIRMED'
                  const isSelected = selectedIds.includes(item.applicationId)

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        {!isConfirmed ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(item.applicationId)}
                            className="rounded text-[#07382B] focus:ring-[#07382B] cursor-pointer"
                          />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{item.studentName}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {item.studentNationalId}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800">{item.programName}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.facultyName} - {item.departmentName}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] rounded border border-slate-200">
                          {item.criteriaCode}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {isConfirmed ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ยืนยันส่งมหาวิทยาลัยแล้ว
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านการคัดเลือก (อาจารย์)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {isConfirmed ? (
                          <div className="space-y-0.5 text-[11px]">
                            <p className="font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> บันทึกประวัติเรียบร้อย
                            </p>
                            <p className="text-slate-400 font-mono">เวลา: {item.confirmedAt || '-'}</p>
                            <p className="text-slate-400">โดย: {item.confirmedBy || 'OFFICER'}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium inline-block">
                            รอเจ้าหน้าที่บันทึกประวัติ
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {isConfirmed ? (
                          <span className="text-xs text-slate-400 font-medium italic">บันทึกแล้ว</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSingleConfirm(item.applicationId)}
                            disabled={loadingId === item.applicationId}
                            className="px-4 py-2 bg-[#07382B] hover:bg-[#05281f] text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer disabled:opacity-50"
                          >
                            {loadingId === item.applicationId ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            บันทึกยืนยันผล
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    ยังไม่มีรายการนักเรียนที่รอการยืนยันผล
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