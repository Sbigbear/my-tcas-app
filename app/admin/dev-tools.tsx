'use client'
import { useState } from 'react'
import { addStudentBySchool, addExamScoresByTCAS, addUniversityRequirement } from '../actions'

export default function AdminPage() {
  const [tab, setTab] = useState<'school' | 'tcas' | 'university'>('school')
  const [msg, setMsg] = useState('')

  const handleSchoolSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await addStudentBySchool(formData)
    setMsg(res.message)
  }

  const handleTcasSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await addExamScoresByTCAS(formData)
    setMsg(res.message)
  }

  const handleUniSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await addUniversityRequirement(formData)
    setMsg(res.message)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white text-black min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">ระบบจัดการข้อมูลหลังบ้าน (Admin)</h1>
      
      {/* แท็บสลับ 3 ฝ่าย */}
      <div className="flex gap-2 mb-6 border-b pb-2 text-sm font-semibold">
        <button 
          onClick={() => { setTab('school'); setMsg(''); }}
          className={`px-3 py-2 ${tab === 'school' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          1. โรงเรียน (ข้อมูลนักเรียน + GPAX)
        </button>
        <button 
          onClick={() => { setTab('tcas'); setMsg(''); }}
          className={`px-3 py-2 ${tab === 'tcas' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
        >
          2. myTCAS (คะแนนสอบกลาง)
        </button>
        <button 
          onClick={() => { setTab('university'); setMsg(''); }}
          className={`px-3 py-2 ${tab === 'university' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
        >
          3. มหาวิทยาลัย (เกณฑ์รับสมัคร)
        </button>
      </div>

      {msg && <div className="p-3 mb-4 bg-blue-100 text-blue-800 rounded">{msg}</div>}

      {/* 1. ฟอร์มโรงเรียน */}
      {tab === 'school' && (
        <form onSubmit={handleSchoolSubmit} className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-blue-700">ฝั่งโรงเรียน: กรอกข้อมูลและเกรดเฉลี่ย (GPAX)</h2>
          <input name="nationalId" placeholder="เลขบัตรประชาชน (13 หลัก)" required className="border p-2 rounded" />
          <input name="studentId" placeholder="รหัสนักเรียน" required className="border p-2 rounded" />
          <input name="name" placeholder="ชื่อ-นามสกุล นักเรียน" required className="border p-2 rounded" />
          <input name="schoolName" placeholder="ชื่อโรงเรียน" required className="border p-2 rounded" />
          <input name="gpax" type="number" step="0.01" placeholder="เกรดเฉลี่ยสะสม (GPAX) เช่น 3.50" required className="border p-2 rounded" />
          <select name="studyPlan" className="border p-2 rounded">
            <option value="วิทย์-คณิต">วิทย์-คณิต</option>
            <option value="ศิลป์-คำนวณ">ศิลป์-คำนวณ</option>
            <option value="ศิลป์-ภาษา">ศิลป์-ภาษา</option>
            <option value="ทุกสาย">ทุกสายการเรียน</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">
            บันทึกข้อมูลนักเรียน
          </button>
        </form>
      )}

      {/* 2. ฟอร์ม myTCAS */}
      {tab === 'tcas' && (
        <form onSubmit={handleTcasSubmit} className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-purple-700">ฝั่ง myTCAS: บันทึกคะแนนสอบกลาง</h2>
          <input name="nationalId" placeholder="เลขบัตรประชาชนนักเรียน (13 หลัก)" required className="border p-2 rounded" />
          <input name="tgat" type="number" step="0.01" placeholder="คะแนน TGAT (รวม)" className="border p-2 rounded" />
          <input name="tpat" type="number" step="0.01" placeholder="คะแนน TPAT" className="border p-2 rounded" />
          <button type="submit" className="bg-purple-600 text-white p-2 rounded font-bold hover:bg-purple-700">
            แมตช์คะแนนใส่ตัวนักเรียน
          </button>
        </form>
      )}

      {/* 3. ฟอร์มมหาวิทยาลัย */}
      {tab === 'university' && (
        <form onSubmit={handleUniSubmit} className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-green-700">ฝั่งมหาวิทยาลัย: บันทึก Template เกณฑ์รับสมัคร</h2>
          <input name="universityName" placeholder="ชื่อมหาวิทยาลัย" required className="border p-2 rounded" />
          <input name="facultyName" placeholder="คณะ" required className="border p-2 rounded" />
          <input name="majorName" placeholder="สาขาวิชา" required className="border p-2 rounded" />
          <input name="tcasRound" type="number" placeholder="รอบ TCAS (เช่น 1, 2, 3)" required className="border p-2 rounded" />
          <input name="minGpax" type="number" step="0.01" placeholder="GPAX ขั้นต่ำที่รับ (เช่น 2.75)" className="border p-2 rounded" />
          <input name="minTgat" type="number" step="0.01" placeholder="TGAT ขั้นต่ำที่รับ (เช่น 50.00)" className="border p-2 rounded" />
          <select name="allowedPlan" className="border p-2 rounded">
            <option value="ทุกสาย">รับทุกสายการเรียน</option>
            <option value="วิทย์-คณิต">เฉพาะ วิทย์-คณิต</option>
            <option value="ศิลป์-คำนวณ">เฉพาะ ศิลป์-คำนวณ</option>
            <option value="ศิลป์-ภาษา">เฉพาะ ศิลป์-ภาษา</option>
          </select>
          <input name="quota" type="number" placeholder="จำนวนที่รับ (คน)" required className="border p-2 rounded" />
          <button type="submit" className="bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700">
            บันทึกเกณฑ์รับสมัคร
          </button>
        </form>
      )}
    </div>
  )
}