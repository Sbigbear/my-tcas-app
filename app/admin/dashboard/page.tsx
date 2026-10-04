import prisma from '@/lib/prisma'
import DashboardClient from './DashboardClient'

export default async function AdminDashboardPage() {
  // ดึงจำนวนผู้ใช้จริงจาก Database โดยตรงบน Server
  const userCount = await prisma.user.count()
  const studentCount = await prisma.student.count()
  const totalUsers = userCount + studentCount

  return <DashboardClient totalUsers={totalUsers} />
}