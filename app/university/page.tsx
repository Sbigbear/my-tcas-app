'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addProgramCriteriaByUniversity } from '../actions';

export default function UniversityPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Form State
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');
  const [seats, setSeats] = useState('');
  const [minGpax, setMinGpax] = useState('');
  const [minTgat, setMinTgat] = useState('');
  const [studyPlan, setStudyPlan] = useState('SCIENCE_MATH');

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/'); // เปลี่ยนเส้นทางกลับไปหน้าหลัก
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    const res = await addProgramCriteriaByUniversity({
      faculty,
      major,
      seats: Number(seats),
      minGpax: Number(minGpax),
      minTgat: Number(minTgat),
      studyPlan,
    });

    setLoading(false);
    if (res.success) {
      setStatusMsg('✅ ' + res.message);
      setFaculty('');
      setMajor('');
      setSeats('');
      setMinGpax('');
      setMinTgat('');
    } else {
      setStatusMsg('❌ ' + res.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🎓
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">ระบบสำหรับมหาวิทยาลัย</h1>
          <p className="text-slate-600 text-sm mb-6">
            จัดการหลักสูตรและรอบการรับสมัคร กรุณาเข้าสู่ระบบหรือลงทะเบียนตัวแทนมหาวิทยาลัยก่อนใช้งาน
          </p>

          <div className="space-y-3">
            <Link
              href="/login?role=university"
              className="block w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-md text-center"
            >
              เข้าสู่ระบบตัวแทนมหาวิทยาลัย
            </Link>
            <Link
              href="/register?role=university"
              className="block w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-center"
            >
              ลงทะเบียนตัวแทนมหาวิทยาลัยใหม่
            </Link>
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 underline"
            >
              (ทดสอบเข้าใช้งานชั่วคราว)
            </button>
          </div>

          <div className="mt-6 border-t pt-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">
              &larr; กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center items-center">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md border border-slate-200">
        <div className="mb-4 flex justify-between items-center pb-3 border-b">
          <span className="font-bold text-emerald-600 text-sm">🎓 จัดการหลักสูตร (มหาวิทยาลัย)</span>
          <button onClick={handleLogout} className="text-xs text-red-500 font-semibold hover:underline">
            ออกจากระบบ
          </button>
        </div>

        {statusMsg && (
          <div className={`p-3 text-xs rounded-lg mb-4 text-center ${statusMsg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อคณะ / คณะวิชา</label>
            <input 
              type="text" 
              placeholder="วิศวกรรมศาสตร์" 
              required
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อสาขาวิชา</label>
            <input 
              type="text" 
              placeholder="วิศวกรรมคอมพิวเตอร์" 
              required
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวนที่รับ (คน)</label>
              <input 
                type="number" 
                placeholder="50" 
                required
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">แผนการเรียน</label>
              <select
                value={studyPlan}
                onChange={(e) => setStudyPlan(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="SCIENCE_MATH">วิทย์-คณิต</option>
                <option value="ARTS_MATH">ศิลป์-คำนวณ</option>
                <option value="ARTS_LANGUAGE">ศิลป์-ภาษา</option>
                <option value="GENERAL">ทั่วไป</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GPAX ขั้นต่ำ</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="2.50" 
                value={minGpax}
                onChange={(e) => setMinGpax(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">TGAT ขั้นต่ำ</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="50.00" 
                value={minTgat}
                onChange={(e) => setMinTgat(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลหลักสูตร'}
          </button>
        </form>
      </div>
    </div>
  );
}