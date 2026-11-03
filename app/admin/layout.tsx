import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from './components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const userRole = cookieStore.get('user_role')?.value || cookieStore.get('role')?.value

  // เช็กสิทธิ์ ADMIN
  if (!token || userRole !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}