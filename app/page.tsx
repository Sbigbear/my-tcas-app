'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col justify-between items-center">
      <div className="max-w-4xl w-full my-auto space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            ระบบคัดเลือกกลางบุคคลเข้าศึกษาในอุดมศึกษา (TCAS)
          </h1>
          <p className="text-sm text-slate-600">
            เลือกระบบงานตามสิทธิ์การใช้งานของหน่วยงานหรือประเภทผู้ใช้งาน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. โรงเรียน */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl mb-3">
                🏫
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">สำหรับโรงเรียน</h2>
              <p className="text-xs text-slate-500 mb-4">
                จัดการและส่งข้อมูลประวัตินักเรียน ผลการเรียน GPAX เข้าระบบคัดเลือกกลาง
              </p>
            </div>
            <div className="space-y-2">
              <Link
                href="/login?role=school"
                className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-lg text-xs transition shadow-sm"
              >
                เข้าสู่ระบบตัวแทนโรงเรียน &rarr;
              </Link>
              <Link
                href="/register?role=school"
                className="block w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-center rounded-lg text-xs transition"
              >
                ลงทะเบียนตัวแทนโรงเรียน
              </Link>
            </div>
          </div>

          {/* 2. TCAS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl mb-3">
                ⚡
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">สำหรับเจ้าหน้าที่ TCAS</h2>
              <p className="text-xs text-slate-500 mb-4">
                ควบคุมกำหนดการ ประกาศเกณฑ์กลาง และกำกับการประมวลผลระบบคัดเลือก
              </p>
            </div>
            <div className="space-y-2">
              <Link
                href="/login?role=tcas"
                className="block w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-center rounded-lg text-xs transition shadow-sm"
              >
                เข้าสู่ระบบเจ้าหน้าที่ TCAS &rarr;
              </Link>
              <Link
                href="/register?role=tcas"
                className="block w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-center rounded-lg text-xs transition"
              >
                ลงทะเบียนเจ้าหน้าที่ TCAS
              </Link>
            </div>
          </div>

          {/* 3. มหาวิทยาลัย */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl mb-3">
                🏛️
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">สำหรับมหาวิทยาลัย</h2>
              <p className="text-xs text-slate-500 mb-4">
                เปิดหลักสูตร ประกาศเกณฑ์การรับสมัคร และประมวลผลรายชื่อผู้มีสิทธิ์เข้าศึกษา
              </p>
            </div>
            <div className="space-y-2">
              <Link
                href="/login?role=university"
                className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center rounded-lg text-xs transition shadow-sm"
              >
                เข้าสู่ระบบตัวแทนมหาวิทยาลัย &rarr;
              </Link>
              <Link
                href="/register?role=university"
                className="block w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-center rounded-lg text-xs transition"
              >
                ลงทะเบียนตัวแทนมหาวิทยาลัย
              </Link>
            </div>
          </div>

          {/* 4. นักเรียน */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl mb-3">
                🎓
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">สำหรับนักเรียน</h2>
              <p className="text-xs text-slate-500 mb-4">
                ตรวจสอบสิทธิ์ ตรวจสอบคะแนน ยื่นสมัคร และยืนยันสิทธิ์สถาบันอุดมศึกษา
              </p>
            </div>
            <div className="space-y-2">
              <Link
                href="/student"
                className="block w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-center rounded-lg text-xs transition shadow-sm"
              >
                เข้าสู่หน้าจัดการนักเรียน &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* ส่วน Admin */}
        <div className="max-w-md mx-auto w-full pt-2">
          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center text-xl mx-auto border border-red-500/20">
              🛡️
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ผู้ดูแลระบบ (Admin)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                สำหรับตรวจสอบ Audit Logs, สถานะความปลอดภัย และจัดการสิทธิ์ผู้ใช้งานทั้งหมด
              </p>
            </div>
            <div className="pt-1">
              <Link
                href="/admin/login"
                className="block w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-center rounded-lg text-xs transition shadow-lg shadow-red-600/20"
              >
                เข้าสู่ระบบผู้ดูแลระบบ (Admin Login)
              </Link>
            </div>
          </div>
        </div>

      </div>

      <footer className="text-center text-xs text-slate-400 py-4">
        © 2026 TCAS Central System. All Rights Reserved.
      </footer>
    </div>
  );
}