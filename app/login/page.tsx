'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'student' | 'teacher' | 'officer' | 'admin'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('student')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const getRoleInfo = () => {
    switch (role) {
      case 'student':
        return {
          title: 'ตรวจสอบคะแนน',
          subtitle: 'ดูข้อมูลผลการเรียน คะแนนสอบ และหลักสูตรที่ผ่านเกณฑ์',
          userLabel: 'เลขประจำตัวประชาชน 13 หลัก',
          placeholder: '1103700123456',
        }
      case 'teacher':
        return {
          title: 'คัดเลือกผู้สมัคร',
          subtitle: 'ตรวจสอบคะแนน เอกสาร และคัดเลือกผู้สมัครที่ผ่านเกณฑ์',
          userLabel: 'บัญชีอาจารย์/กรรมการ (อีเมล/ไอดี)',
          placeholder: 'teacher.t@ku.th',
        }
      case 'officer':
        return {
          title: 'จัดการหลักสูตรและยืนยันผล',
          subtitle: 'สร้างและจัดการเกณฑ์หลักสูตร รวมถึงยืนยันผลการคัดเลือก',
          userLabel: 'บัญชีเจ้าหน้าที่ประจำคณะ (อีเมล/ไอดี)',
          placeholder: 'officer.f@ku.th',
        }
      case 'admin':
        return {
          title: 'จัดการระบบ TCAS',
          subtitle: 'จัดการผู้ใช้งาน สิทธิ์การเข้าถึง และประวัติการทำงาน',
          userLabel: 'บัญชีผู้ดูแลระบบ',
          placeholder: 'admin.demo',
        }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    let endpoint = '/api/auth/student-login'
    if (role === 'teacher') {
      endpoint = '/api/auth/teacher-login'
    } else if (role === 'officer') {
      endpoint = '/api/auth/officer-login'
    } else if (role === 'admin') {
      endpoint = '/api/auth/admin-login'
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nationalId: username,
          username,
          password,
          role,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        const userToSave = data.user || data.student || {
          name: username,
          role: role,
        }
        
        // 1. บันทึกข้อมูล Object ของผู้ใช้
        localStorage.setItem('user', JSON.stringify(userToSave))

        // 📌 2. บันทึก ID แยกตามบทบาท
        if (role === 'student') {
          const studentIdToStore = 
            userToSave.studentId || 
            userToSave.id || 
            userToSave.nationalId || 
            username
          localStorage.setItem('studentId', studentIdToStore)
        } else if (role === 'officer') {
          const officerIdToStore = 
            userToSave.Usersid || 
            userToSave.id || 
            username
          localStorage.setItem('officerId', officerIdToStore)
        }

        if (role === 'student') router.push('/student/dashboard')
        else if (role === 'teacher') router.push('/teacher/dashboard')
        else if (role === 'officer') router.push('/officer/courses')
        else router.push('/admin/dashboard')
      } else {
        setErrorMsg(data.message || 'เข้าสู่ระบบไม่สำเร็จ')
      }
    } catch (err) {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setLoading(false)
    }
  }

  const roleInfo = getRoleInfo()

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* ฝั่งซ้าย: Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#07382B] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Header Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white shadow-sm">
            KU
          </div>
        </div>

        {/* Banner Title Heading */}
        <div className="space-y-4 z-10 my-auto max-w-xl">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-snug tracking-tight">
            ระบบสารสนเทศวิเคราะห์และตรวจสอบคุณสมบัติทางวิชาการ
          </h2>
          <p className="text-lg xl:text-xl font-medium text-emerald-100/90 leading-relaxed">
            ของผู้สมัครเข้าศึกษาต่อ มหาวิทยาลัยเกษตรศาสตร์ ในระบบ TCAS
          </p>
        </div>

        {/* Footer Subtext */}
        <div className="z-10 text-xs text-emerald-200/60">
          Kasetsart University Admissions System
        </div>
      </div>

      {/* ฝั่งขวา: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">เข้าสู่ระบบ</h2>
            <p className="text-sm text-slate-600 mt-1">เลือกประเภทผู้ใช้งานเพื่อเข้าสู่ระบบ</p>
          </div>

          {/* Role Tabs (ปรับเป็น 4 ปุ่ม) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => { setRole('student'); setErrorMsg(''); }}
              className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                role === 'student'
                  ? 'border-[#07382B] bg-emerald-50/80 text-[#07382B] font-bold shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${role === 'student' ? 'bg-[#07382B] text-white' : 'bg-slate-100 text-slate-600'}`}>
                📊
              </div>
              <span className="text-xs">นักเรียน</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('teacher'); setErrorMsg(''); }}
              className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                role === 'teacher'
                  ? 'border-[#07382B] bg-emerald-50/80 text-[#07382B] font-bold shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${role === 'teacher' ? 'bg-[#07382B] text-white' : 'bg-slate-100 text-slate-600'}`}>
                👨‍🏫
              </div>
              <span className="text-xs">อาจารย์</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('officer'); setErrorMsg(''); }}
              className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                role === 'officer'
                  ? 'border-[#07382B] bg-emerald-50/80 text-[#07382B] font-bold shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${role === 'officer' ? 'bg-[#07382B] text-white' : 'bg-slate-100 text-slate-600'}`}>
                🏛️
              </div>
              <span className="text-xs">เจ้าหน้าที่คณะ</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('admin'); setErrorMsg(''); }}
              className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                role === 'admin'
                  ? 'border-[#07382B] bg-emerald-50/80 text-[#07382B] font-bold shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${role === 'admin' ? 'bg-[#07382B] text-white' : 'bg-slate-100 text-slate-600'}`}>
                ⚙️
              </div>
              <span className="text-xs">ผู้ดูแลระบบ</span>
            </button>
          </div>

          {/* Form Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-slate-900">{roleInfo.title}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{roleInfo.subtitle}</p>
            </div>

            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {roleInfo.userLabel}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={roleInfo.placeholder}
                  style={{ color: '#0f172a' }}
                  className="w-full px-4 py-3 text-sm text-[#0f172a] bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07382B] focus:bg-white placeholder:text-slate-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ color: '#0f172a' }}
                  className="w-full px-4 py-3 text-sm text-[#0f172a] bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07382B] focus:bg-white placeholder:text-slate-400 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#07382B] hover:bg-[#052b21] text-white font-bold rounded-xl text-sm shadow transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ >'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-500">
            ระบบสำหรับมหาวิทยาลัยเกษตรศาสตร์
          </p>
        </div>
      </div>
    </div>
  )
}