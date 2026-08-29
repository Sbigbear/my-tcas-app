'use client'
import { useState } from 'react'
import { matchStudentEligibility } from '../actions'

export default function StudentHomePage() {
  const [nationalId, setNationalId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setResult(null)

    const res = await matchStudentEligibility(nationalId, studentId)
    setLoading(false)

    if (res.success) {
      setResult(res)
    } else {
      setErrorMsg(res.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล')
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen text-black">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">
          ระบบตรวจสอบสิทธิ์และ Match คณะ TCAS
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm">
          กรอกข้อมูลของคุณเพื่อค้นหาคณะและมหาวิทยาลัยที่ผ่านเกณฑ์การรับสมัคร
        </p>

        {/* ฟอร์มค้นหาสำหรับนักเรียน */}
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">เลขประจำตัวประชาชน (13 หลัก)</label>
            <input
              type="text"
              required
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="กรอกเลขบัตรประชาชน"
              className="w-full border p-2 rounded focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">รหัสนักเรียน</label>
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="กรอกรหัสนักเรียน"
              className="w-full border p-2 rounded focus:outline-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded transition"
          >
            {loading ? 'กำลังประมวลผล Matching...' : 'ตรวจสอบคณะที่ผ่านเกณฑ์'}
          </button>
        </form>
      </div>

      {/* แสดงข้อผิดพลาด */}
      {errorMsg && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6 border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* ผลลัพธ์ข้อมูลนักเรียน + รายชื่อคณะที่ผ่านเกณฑ์ */}
      {result && (
        <div className="space-y-6">
          {/* ข้อมูลสรุปของนักเรียน */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-blue-900 mb-2">ข้อมูลประจำตัวนักเรียน</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-950">
              <p><strong>ชื่อ-นามสกุล:</strong> {result.student.name}</p>
              <p><strong>โรงเรียน:</strong> {result.student.school_name}</p>
              <p><strong>แผนการเรียน:</strong> {result.student.study_plan}</p>
              <p><strong>เกรดเฉลี่ย (GPAX):</strong> {result.student.gpax}</p>
              <p><strong>คะแนน TGAT:</strong> {result.student.score_tgat ?? 'ไม่มีข้อมูล'}</p>
              <p><strong>คะแนน TPAT:</strong> {result.student.score_tpat ?? 'ไม่มีข้อมูล'}</p>
            </div>
          </div>

          {/* รายชื่อคณะที่ตรงเกณฑ์ */}
          <div>
            <h2 className="text-xl font-bold mb-3 text-green-800">
              คณะที่ผ่านเกณฑ์ยื่นสมัครได้ ({result.universities.length} รายการ)
            </h2>

            {result.universities.length === 0 ? (
              <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                ยังไม่พบคณะที่ผ่านเกณฑ์จากคะแนนปัจจุบันของคุณ
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {result.universities.map((uni: any, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-blue-800">{uni.university_name}</h3>
                        <p className="text-gray-700 font-medium">{uni.faculty_name} - {uni.major_name}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">
                        รอบที่ {uni.tcas_round}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex gap-4 border-t pt-2 mt-2">
                      <span>GPAX ขั้นต่ำ: {uni.min_gpax}</span>
                      <span>TGAT ขั้นต่ำ: {uni.min_tgat}</span>
                      <span>สายที่รับ: {uni.allowed_plan}</span>
                      <span>รับจำนวน: {uni.quota} คน</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}