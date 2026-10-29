'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react'

export default function SelectedProgramsList({ allPrograms }: { allPrograms: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('selected_programs')
    if (saved) {
      try {
        setSelectedIds(JSON.parse(saved))
      } catch (e) {}
    }
    setIsLoaded(true)
  }, [])

  const removeProgram = (id: string) => {
    const updated = selectedIds.filter((itemId) => itemId !== id)
    setSelectedIds(updated)
    localStorage.setItem('selected_programs', JSON.stringify(updated))
  }

  const selectedPrograms = allPrograms.filter((p) => selectedIds.includes(p.id))

  if (!isLoaded) return null

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            สาขาวิชาที่คุณสนใจ / เลือกไว้
          </h3>
          <p className="text-xs text-slate-500">
            รายการสาขาวิชาที่คุณเลือกมาจากหน้าค้นหาเพื่อติดตามผลการประเมิน
          </p>
        </div>
        <Link
          href="/student/search"
          className="px-4 py-2 text-xs font-semibold bg-[#07382B] text-white rounded-lg hover:bg-[#052920] transition-colors"
        >
          ไปหน้าค้นหาและเลือกสาขาเพิ่มเติม →
        </Link>
      </div>

      {selectedPrograms.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs space-y-2">
          <p>คุณยังไม่ได้เลือกสาขาวิชาที่สนใจ</p>
          <Link href="/student/search" className="text-emerald-700 underline font-semibold">
            คลิกที่นี่เพื่อไปเลือกสาขาวิชาในหน้าค้นหา
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium text-xs">
                <th className="py-3 px-4">มหาวิทยาลัย / วิทยาเขต / คณะ</th>
                <th className="py-3 px-4">สาขาวิชา / หลักสูตร</th>
                <th className="py-3 px-4">จำนวนรับ</th>
                <th className="py-3 px-4 text-center">ผลการประเมิน</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {selectedPrograms.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  {/* 1. มหาวิทยาลัย / วิทยาเขต / คณะ */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{item.universityName}</div>
                    <div className="text-[11px] text-slate-500">
                      วิทยาเขต{item.campus} • {item.faculty.startsWith('คณะ') ? item.faculty : `คณะ${item.faculty}`}
                    </div>
                  </td>

                  {/* 2. สาขาวิชา / หลักสูตร */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{item.department}</div>
                    <div className="text-[11px] text-slate-500">
                      หลักสูตร/โครงการ: <span className="font-medium text-slate-700">{item.programName}</span>
                    </div>
                  </td>

                  {/* 3. จำนวนรับ */}
                  <td className="py-3 px-4 text-slate-600">
                    {item.recruitAmount} คน
                  </td>

                  {/* 4. ผลการประเมิน */}
                  <td className="py-3 px-4 text-center">
                    {item.evalStatus === 'PASSED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                        <XCircle className="w-3.5 h-3.5" /> ไม่ผ่านเกณฑ์
                      </span>
                    )}
                  </td>

                  {/* 5. จัดการ */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => removeProgram(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="นำออกจากรายการ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}