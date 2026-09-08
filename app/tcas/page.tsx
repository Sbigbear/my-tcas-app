'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateTcasScore } from '../actions';

export default function TcasPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [citizenId, setCitizenId] = useState('');
  const [tgatScore, setTgatScore] = useState('');
  const [tpat1, setTpat1] = useState('');

  // Login 
  useEffect(() => {
    const savedUser = localStorage.getItem('tcas_current_user');
    if (savedUser) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSimulate = () => {
    // บันทึก session 
    localStorage.setItem('tcas_current_user', JSON.stringify({ role: 'TCAS' }));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('tcas_current_user');
    setIsLoggedIn(false);
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await updateTcasScore({
        citizenId: citizenId.trim(),
        tgatScore: tgatScore ? parseFloat(tgatScore) : undefined,
        tpat1: tpat1 ? parseFloat(tpat1) : undefined,
      });

      setLoading(false);
      if (res.success) {
        setMessage({ type: 'success', text: 'บันทึกคะแนนสอบ TCAS ของนักเรียนสำเร็จ!' });
        setCitizenId('');
        setTgatScore('');
        setTpat1('');
      } else {
        setMessage({ type: 'error', text: res.message || 'เกิดข้อผิดพลาดในการบันทึกคะแนน' });
      }
    } catch (err) {
      setLoading(false);
      setMessage({ type: 'error', text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-black">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">ระบบสำหรับเจ้าหน้าที่ TCAS</h1>
          <p className="text-slate-600 text-sm mb-6">ระบบนำเข้าและจัดการคะแนนสอบส่วนกลาง (TGAT / TPAT)</p>

          <div className="space-y-3">
            <button
              onClick={handleLoginSimulate}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-md"
            >
              เข้าสู่ระบบเจ้าหน้าที่ TCAS
            </button>
            <Link
              href="/register?role=tcas"
              className="block w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
            >
              ลงทะเบียนเจ้าหน้าที่ TCAS ใหม่
            </Link>
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
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center items-center text-black">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md border border-slate-200">
        <div className="mb-4 flex justify-between items-center pb-3 border-b">
          <span className="font-bold text-purple-600 text-sm">⚡ บันทึกคะแนนสอบนักเรียน (TCAS Center)</span>
          <button onClick={handleLogout} className="text-xs text-red-500 font-semibold hover:underline">
            ออกจากระบบ
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
              message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmitScore} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เลขบัตรประชาชนนักเรียน (13 หลัก) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={citizenId}
              onChange={(e) => setCitizenId(e.target.value)}
              placeholder="1100200300401"
              className="w-full p-2.5 border rounded-lg text-sm focus:outline-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">คะแนน TGAT (รวม)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="300"
                value={tgatScore}
                onChange={(e) => setTgatScore(e.target.value)}
                placeholder="เต็ม 300"
                className="w-full p-2.5 border rounded-lg text-sm focus:outline-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">คะแนน TPAT 1</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={tpat1}
                onChange={(e) => setTpat1(e.target.value)}
                placeholder="เต็ม 100"
                className="w-full p-2.5 border rounded-lg text-sm focus:outline-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-lg hover:bg-purple-700 transition disabled:bg-purple-300 shadow-sm mt-2"
          >
            {loading ? 'กำลังบันทึกคะแนน...' : 'บันทึกคะแนนสอบเข้า DB'}
          </button>
        </form>
      </div>
    </div>
  );
}