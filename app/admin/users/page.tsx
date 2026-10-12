import prisma from '@/lib/prisma'
import UserListClient from './UserClient'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // รวมรายชื่อผู้ใช้งานและนักเรียนนำมาแสดงในตาราง
  const formattedUsers = [
    ...users.map((u) => ({
      id: u.Usersid,
      name: u.name,
      email: u.email,
      role: u.role, // ADMIN หรือ OFFICER
      type: 'USER' as const,
    })),
    ...students.map((s) => ({
      id: s.Studentsid,
      name: s.name,
      email: s.studentCode ? `${s.studentCode}@ku.th` : `${s.nationalId}@ku.th`,
      role: 'STUDENT',
      type: 'STUDENT' as const,
    })),
  ]

  return (
    <div className="space-y-6">
      <UserListClient initialUsers={formattedUsers} />
    </div>
  )
}