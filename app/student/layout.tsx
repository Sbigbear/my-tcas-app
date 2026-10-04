import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Sidebar from './components/Sidebar'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('student_id')?.value

  if (!studentId) {
    redirect('/login')
  }

  // ค้นหาด้วย Primary Key ใหม่ (Studentsid)
  const student = await prisma.student.findUnique({
    where: { Studentsid: studentId },
  })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        studentName={student?.name} 
        studentId={student?.studentCode || student?.Studentsid} 
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}