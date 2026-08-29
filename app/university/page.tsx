'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function UniversityPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-md"
            >
              เข้าสู่ระบบตัวแทนมหาวิทยาลัย
            </button>
            <Link
              href="/register?role=university"
              className="block w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
            >
              ลงทะเบียนตัวแทนมหาวิทยาลัยใหม่
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
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center items-center">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md border border-slate-200">
        <div className="mb-4 flex justify-between items-center pb-3 border-b">
          <span className="font-bold text-emerald-600 text-sm">🎓 จัดการหลักสูตร (มหาวิทยาลัย)</span>
          <button onClick={() => setIsLoggedIn(false)} className="text-xs text-red-500 font-semibold hover:underline">
            ออกจากระบบ
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อคณะ / คณะวิชา</label>
            <input type="text" placeholder="วิศวกรรมศาสตร์" className="w-full p-2.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อสาขาวิชา</label>
            <input type="text" placeholder="วิศวกรรมคอมพิวเตอร์" className="w-full p-2.5 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวนที่รับ (คน)</label>
            <input type="number" placeholder="50" className="w-full p-2.5 border rounded-lg text-sm" />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition">
            บันทึกข้อมูลหลักสูตร
          </button>
        </form>
      </div>
    </div>
  );
}