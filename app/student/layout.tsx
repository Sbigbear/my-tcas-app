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

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar studentName={student?.name} studentId={student?.studentId} />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}