import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OfficerSidebar from './components/OfficerSidebar'

export default async function OfficerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const userRole = cookieStore.get('user_role')?.value || cookieStore.get('role')?.value

  // เช็กสิทธิ์ OFFICER หรือ ADMIN
  if (!token || (userRole !== 'OFFICER' && userRole !== 'ADMIN')) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <OfficerSidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}