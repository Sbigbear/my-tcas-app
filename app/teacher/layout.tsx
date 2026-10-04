import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import TeacherSidebar from './components/TeacherSidebar'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const teacherId = cookieStore.get('teacher_id')?.value

  if (!teacherId) {
    redirect('/login')
  }

  // ค้นหาอาจารย์ด้วย Primary Key ตัวใหม่ (Usersid)
  const teacher = await prisma.user.findUnique({
    where: { Usersid: teacherId },
  })

  if (!teacher) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <TeacherSidebar teacherName={teacher?.name} teacherEmail={teacher?.email} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-semibold text-slate-400">
            ระบบวิเคราะห์คุณสมบัติ TCAS
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              ระบบพร้อมใช้งาน
            </span>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}