'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '../actions';

export default function LoginPage() {
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

    const result = await loginUser(formData);
    setLoading(false);

    if (result.success) {
      // บันทึกสถานะการเข้าสู่ระบบ
      localStorage.setItem('tcas_current_user', JSON.stringify(result.user));
      alert('เข้าสู่ระบบสำเร็จ!');

      // ไปยังหน้าที่ถูกต้องตาม บทบาท (Role)
      if (role === 'school') router.push('/school');
      else if (role === 'university') router.push('/university');
      else if (role === 'tcas') router.push('/tcas');
      else router.push('/admin');
    } else {
      alert(result.message);
    }
  };

  const inputStyle = "w-full p-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 text-center">
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">เข้าสู่ระบบ</h1>
        <p className="text-sm text-slate-500 mb-6">
          สำหรับ <span className="font-bold text-blue-600">{role === 'school' ? 'ตัวแทนโรงเรียน' : role === 'university' ? 'เจ้าหน้าที่มหาวิทยาลัย' : 'เจ้าหน้าที่ TCAS'}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">อีเมลผู้ใช้งาน</label>
            <input
              type="email"
              name="email"
              required
              placeholder="somsak@triamudom.ac.th"
              className={inputStyle}
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-blue-600 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-blue-500/20 text-base mt-2"
          >
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

      </div>
    </div>
  );
}