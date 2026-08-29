'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser } from '../actions'; // เรียกใช้ Server Action ลง Neon DB

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'school';
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('role', role);

    const result = await registerUser(formData);
    setLoading(false);

    if (result.success) {
      alert(result.message);
      router.push('/login');
    } else {
      alert(result.message);
    }
  };

  const inputStyle = "w-full p-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-xl w-full border border-slate-100">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            ลงทะเบียน {role === 'school' ? 'ตัวแทนโรงเรียน' : role === 'university' ? 'เจ้าหน้าที่มหาวิทยาลัย' : 'เจ้าหน้าที่ TCAS'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานระบบ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: ข้อมูลผู้สมัคร */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">
              1. ข้อมูลผู้สมัคร / ตัวแทนผู้ใช้งาน
            </h2>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">ชื่อ-นามสกุล ผู้รับผิดชอบ</label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="นายสมชาย ใจดี"
                className={inputStyle}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">อีเมลผู้ใช้งาน</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="user@domain.ac.th"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0812345678"
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">รหัสผ่าน</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">ยืนยันรหัสผ่าน</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: ข้อมูลองค์กร/โรงเรียน */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">
              2. ข้อมูล{role === 'school' ? 'โรงเรียน' : 'หน่วยงาน'}
            </h2>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                ชื่อ{role === 'school' ? 'โรงเรียน' : 'หน่วยงาน/มหาวิทยาลัย'}
              </label>
              <input
                type="text"
                name="schoolName"
                required
                placeholder={role === 'school' ? "เช่น โรงเรียนเตรียมอุดมศึกษา" : "เช่น มหาวิทยาลัยจุฬาลงกรณ์"}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                รหัสไอดี{role === 'school' ? 'โรงเรียน (School ID)' : 'หน่วยงาน'}
              </label>
              <input
                type="text"
                name="orgId"
                placeholder="เช่น SCH-101001"
                className={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-blue-600 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-blue-500/20 text-base mt-4"
          >
            {loading ? 'กำลังบันทึกลง Neon DB...' : 'ยืนยันการลงทะเบียน'}
          </button>
        </form>

      </div>
    </div>
  );
}