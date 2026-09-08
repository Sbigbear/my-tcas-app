'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin1234') {
      alert('เข้าสู่ระบบผู้ดูแลระบบสำเร็จ');
      router.push('/admin');
    } else {
      alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ทดลองใช้: admin / admin1234)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold border border-red-500/20">
            🛡️
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
          <p className="text-xs text-slate-400">เข้าสู่ระบบเพื่อตรวจสอบ System Logs และจัดการสิทธิ์</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Admin Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full p-2.5 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-600/30"
          >
            เข้าสู่ระบบผู้ดูแลระบบ
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300">
            &larr; กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}