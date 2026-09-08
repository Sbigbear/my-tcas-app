'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addStudentBySchool } from '../actions';

export default function SchoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget; 
    const formData = new FormData(form);

    const result = await addStudentBySchool(formData);

    setLoading(false);

    if (result.success) {
      alert(result.message);
      form.reset();
    } else {
      alert(result.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tcas_current_user');
    router.push('/');
  };

  const inputStyle = "w-full p-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-lg w-full border border-slate-100">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🏫</span> จัดการข้อมูลนักเรียน (โรงเรียน)
          </h1>
          <button
            onClick={handleLogout}
            type="button"
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
          >
            ออกจากระบบ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">เลขบัตรประชาชนนักเรียน</label>
            <input
              type="text"
              name="citizenId" 
              required
              placeholder="1234567890123"
              className={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">รหัสนักเรียน</label>
            <input
              type="text"
              name="studentCode" 
              required
              placeholder="STU-67001"
              className={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">ชื่อ-นามสกุล นักเรียน</label>
            <input
              type="text"
              name="fullName" 
              required
              placeholder="นายสมชาย เรียนดี"
              className={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">ชื่อโรงเรียน</label>
            <input
              type="text"
              name="schoolName"
              placeholder="โรงเรียนเตรียมอุดมศึกษา"
              className={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">แผนการเรียน (สายเรียน)</label>
            <select name="studyPlan" required className={inputStyle}>
              <option value="วิทย์-คณิต">วิทย์-คณิต</option>
              <option value="ศิลป์-คำนวณ">ศิลป์-คำนวณ</option>
              <option value="ศิลป์-ภาษา">ศิลป์-ภาษา</option>
              <option value="ทั่วไป">ทั่วไป</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">GPAX สะสม</label>
            <input
              type="number"
              name="gpax"
              step="0.01"
              min="0"
              max="4.00"
              required
              placeholder="3.85"
              className={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-blue-600 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-blue-500/20 text-base mt-2"
          >
            {loading ? 'กำลังบันทึกลง Neon DB...' : 'บันทึกข้อมูลนักเรียน'}
          </button>
        </form>

      </div>
    </div>
  );
}