'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // ดึงข้อมูลผู้สมัครทั้งหมดจาก LocalStorage
  useEffect(() => {
    const loadedUsers = JSON.parse(localStorage.getItem('tcas_users') || '[]');
    setUsers(loadedUsers);
  }, []);

  // บันทึกกลับลง LocalStorage
  const saveToStorage = (updatedUsers: any[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('tcas_users', JSON.stringify(updatedUsers));
  };

  // ฟังก์ชันลบข้อมูลผู้ใช้งาน
  const handleDelete = (index: number) => {
    if (confirm(`คุณต้องการลบบัญชีของ "${users[index].name}" ใช่หรือไม่?`)) {
      const updated = users.filter((_, i) => i !== index);
      saveToStorage(updated);
    }
  };

  // เริ่มการแก้ไข
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditFormData({ ...users[index] });
  };

  // บันทึกการแก้ไข
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null) return;

    const updated = [...users];
    updated[editingIndex] = editFormData;
    saveToStorage(updated);
    setEditingIndex(null);
    alert('อัปเดตข้อมูลสำเร็จ!');
  };

  const inputStyle = "w-full p-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* หัวข้อหน้าต่าง */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">🛡️ ระบบจัดการผู้ใช้งาน (Admin Dashboard)</h1>
            <p className="text-sm text-slate-500">จัดการข้อมูล แก้ไข หรือลบบัญชีผู้ลงทะเบียนทั้งหมดในระบบ</p>
          </div>
          <div className="text-sm font-bold bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100">
            ผู้ลงทะเบียนทั้งหมด: {users.length} คน
          </div>
        </div>

        {/* ตารางแสดงและจัดการข้อมูล */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4">ลำดับ</th>
                  <th className="p-4">บทบาท (Role)</th>
                  <th className="p-4">ชื่อ-นามสกุล</th>
                  <th className="p-4">อีเมล / เบอร์โทร</th>
                  <th className="p-4">สังกัด / หน่วยงาน</th>
                  <th className="p-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      ยังไม่มีข้อมูลผู้ลงทะเบียนในระบบ
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-semibold text-slate-400">{index + 1}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.role === 'school' ? 'bg-amber-100 text-amber-800' :
                          user.role === 'university' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'school' && 'โรงเรียน'}
                          {user.role === 'university' && 'มหาวิทยาลัย'}
                          {user.role === 'tcas' && 'เจ้าหน้าที่ TCAS'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">{user.name}</td>
                      <td className="p-4 space-y-0.5">
                        <div className="text-slate-900 font-medium">{user.email}</div>
                        <div className="text-xs text-slate-400">{user.phone}</div>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-600">
                        {user.role === 'school' && `${user.schoolName || '-'} (${user.schoolCode || '-'})`}
                        {user.role === 'university' && `${user.universityName || '-'} / ${user.faculty || '-'}`}
                        {user.role === 'tcas' && `${user.tcasDepartment || '-'} (${user.tcasOfficerId || '-'})`}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal สำหรับป๊อปอัปแก้ไขข้อมูล */}
        {editingIndex !== null && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">✏️ แก้ไขข้อมูลผู้ลงทะเบียน</h2>
              
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className={inputStyle}
                    required
                  />
                </div>

                {editFormData.role === 'school' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อโรงเรียน</label>
                    <input
                      type="text"
                      value={editFormData.schoolName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, schoolName: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-sm"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-sm"
                  >
                    บันทึกการแก้ไข
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}