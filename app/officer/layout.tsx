import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OfficerSidebar from './components/OfficerSidebar'

export default async function OfficerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  
  // 📌 เปลี่ยนมาดึง officer_id และ role ให้ตรงกับ API
  const officerId = cookieStore.get('officer_id')?.value || cookieStore.get('userId')?.value
  const userRole = cookieStore.get('role')?.value || cookieStore.get('user_role')?.value

  // เช็กสิทธิ์ OFFICER หรือ ADMIN
  if (!officerId || (userRole !== 'OFFICER' && userRole !== 'ADMIN')) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <OfficerSidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}