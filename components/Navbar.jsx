'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ studentName, onLogout }) {
  const pathname = usePathname();

  const navClass = (path) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition ${
      pathname === path ? 'bg-blue-700 text-white' : 'text-slate-600 hover:text-blue-700'
    }`;

  return (
    <nav className="w-full bg-white border-b border-slate-100 px-8 py-3.5 flex justify-between items-center sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <span className="bg-blue-700 text-white text-xs font-bold px-2 py-1 rounded-md">TCAS</span>
        <span className="text-blue-900 font-bold text-lg">Smart Match</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/" className={navClass('/')}>หน้าหลัก</Link>
        <Link href="/search" className={navClass('/search')}>ค้นหา</Link>
        <Link href="#" className="text-slate-600 hover:text-blue-700 text-sm font-medium px-2 py-1.5">
          ฐานข้อมูล
        </Link>
        
        {studentName ? (
          <div className="flex items-center gap-3 ml-2">
            <Link href="/matching" className="bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
              <span>ผลการจับคู่</span>
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">13</span>
            </Link>
            <Link href="/profile" className="text-slate-700 font-semibold text-xs flex items-center gap-1">
              <span className="text-blue-700">ณ</span> {studentName}
            </Link>
            <button onClick={onLogout} className="text-red-500 hover:text-red-600 text-xs font-medium">
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <Link href="/login" className="border border-blue-700 text-blue-700 hover:bg-blue-50 text-sm font-medium px-4 py-1.5 rounded-lg transition">
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </nav>
  );
}