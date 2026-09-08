'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // ข้อมูล Log จำลอง
  const [logs] = useState([
    { id: 1, time: '2026-08-29 20:45:12', action: 'REGISTER_SUBMIT', user: 'somchai.r@sk.ac.th', role: 'School', status: 'SUCCESS', ip: '182.52.12.90' },
    { id: 2, time: '2026-08-29 20:42:05', action: 'LOGIN_ATTEMPT', user: 'wipada.v@chula.ac.th', role: 'University', status: 'SUCCESS', ip: '171.96.44.11' },
    { id: 3, time: '2026-08-29 20:30:18', action: 'CREATE_CRITERIA', user: 'anan.sys@mytcas.com', role: 'TCAS', status: 'SUCCESS', ip: '202.28.1.5' },
    { id: 4, time: '2026-08-29 20:15:40', action: 'LOGIN_FAILED', user: 'unknown@test.com', role: 'Unknown', status: 'FAILED', ip: '110.168.9.33' },
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🛡️ Admin Control Panel <span className="text-xs bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full border border-red-500/30">System Logs</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">ระบบติดตามกิจกรรมและการลงทะเบียนเข้าใช้งานทั้งหมด</p>
          </div>
          <Link href="/admin/login" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-lg text-slate-300">
            ออกจากระบบ
          </Link>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 block mb-1">Total Logs</span>
            <span className="text-2xl font-bold text-white">1,248</span>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 block mb-1">School Registrations</span>
            <span className="text-2xl font-bold text-blue-400">412</span>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 block mb-1">University Accounts</span>
            <span className="text-2xl font-bold text-emerald-400">85</span>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 block mb-1">TCAS Officers</span>
            <span className="text-2xl font-bold text-purple-400">14</span>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-sm text-slate-200">กิจกรรมล่าสุดในระบบ (Audit Trail)</h2>
            <button onClick={() => alert('รีเฟรชข้อมูล Log ล่าสุดแล้ว')} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-slate-200">
              🔄 Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">User Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30 transition">
                    <td className="p-3.5 font-mono text-slate-400">{log.time}</td>
                    <td className="p-3.5 font-bold text-slate-200">{log.action}</td>
                    <td className="p-3.5">{log.user}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.role === 'School' ? 'bg-blue-500/20 text-blue-400' :
                        log.role === 'University' ? 'bg-emerald-500/20 text-emerald-400' :
                        log.role === 'TCAS' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{log.ip}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}