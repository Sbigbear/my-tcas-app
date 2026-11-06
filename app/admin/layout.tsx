import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from './components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  
  // 📌 เปลี่ยนมาดึง admin_id และ role ให้ตรงกับที่ตั้งใน admin-login/route.ts
  const adminId = cookieStore.get('admin_id')?.value || cookieStore.get('userId')?.value
  const userRole = cookieStore.get('role')?.value

  // เช็กสิทธิ์ ADMIN หรือ OFFICER
  if (!adminId || (userRole !== 'ADMIN' && userRole !== 'OFFICER')) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}