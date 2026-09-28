'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'student' | 'teacher' | 'admin'

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
          title: 'ตรวจสอบคะแนนและโอกาสเข้าศึกษา',
          subtitle: 'ดูข้อมูลผลการเรียน คะแนนสอบ และหลักสูตรที่ผ่านเกณฑ์',
          userLabel: 'เลขประจำตัวประชาชน 13 หลัก',
          placeholder: '1103700123456',
        }
      case 'teacher':
        return {
          title: 'ตรวจสอบคุณสมบัติผู้สมัคร',
          subtitle: 'ติดตามผู้สมัคร ตรวจสอบหลักฐาน และจัดการเกณฑ์หลักสูตร',
          userLabel: 'บัญชีบุคลากรมหาวิทยาลัย (อีเมล/ไอดี)',
          placeholder: 'sasin.t@ku.th',
        }
      case 'admin':
        return {
          title: 'บริหารจัดการระบบ TCAS',
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
        // 📌 บันทึกข้อมูลลง localStorage เพื่อให้ Dashboard และ Sidebar ดึงไปใช้
        const userToSave = data.user || {
          name: data.user?.name || `ผู้ดูแลระบบ ${username}`,
          role: role,
        }
        localStorage.setItem('user', JSON.stringify(userToSave))

        if (role === 'student') router.push('/student/dashboard')
        else if (role === 'teacher') router.push('/teacher/dashboard')
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
      {/* ฝั่งซ้าย: KU Pathway Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#07382B] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white">
            KU
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none text-white">KU Pathway</h1>
            <span className="text-xs text-emerald-400">TCAS Eligibility System</span>
          </div>
        </div>

        <div className="space-y-6 z-10 my-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">
            ระบบสารสนเทศเพื่อการคัดเลือกที่แม่นยำ
          </span>
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            เชื่อมโยงข้อมูลจริง<br />วิเคราะห์ทุกโอกาส
          </h2>
          <p className="text-slate-300 text-sm max-w-md">
            ตรวจสอบคุณสมบัติทางวิชาการโดยอัตโนมัติ ด้วยข้อมูลที่ยืนยันจากโรงเรียนและระบบ TCAS
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-300 z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> ข้อมูลผ่านการยืนยัน
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> แบ่งสิทธิ์ตามบทบาท
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">เข้าสู่ระบบ</h2>
            <p className="text-sm text-slate-600 mt-1">เลือกประเภทผู้ใช้งานเพื่อเข้าสู่ระบบ</p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => { setRole('student'); setErrorMsg(''); }}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${
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
              className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${
                role === 'teacher'
                  ? 'border-[#07382B] bg-emerald-50/80 text-[#07382B] font-bold shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${role === 'teacher' ? 'bg-[#07382B] text-white' : 'bg-slate-100 text-slate-600'}`}>
                👤
              </div>
              <span className="text-xs">อาจารย์</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('admin'); setErrorMsg(''); }}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${
                role === 'admin'
                  ? 'border-[#07382B] bg-emerald-50/80 text-[#07382B] font-bold shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${role === 'admin' ? 'bg-[#07382B] text-white' : 'bg-slate-100 text-slate-600'}`}>
                📋
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

              <div className="flex justify-end">
                <a href="#" className="text-xs font-semibold text-emerald-700 hover:underline">
                  ลืมรหัสผ่าน?
                </a>
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
            ระบบต้นแบบสำหรับมหาวิทยาลัยเกษตรศาสตร์
          </p>
        </div>
      </div>
    </div>
  )
}