import prisma from '@/lib/prisma'
import UserListClient from './UserClient'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // แปลงให้เป็นรูปแบบเดียวกันสำหรับนำไปแสดงผลใน Table
  const formattedUsers = [
    ...users.map((u) => ({
      id: u.Usersid, // อ้างอิง Primary Key ใหม่ของ User
      name: u.name,
      email: u.email,
      role: u.role, // ADMIN หรือ OFFICER
      type: 'USER' as const,
    })),
    ...students.map((s) => ({
      id: s.Studentsid, // อ้างอิง Primary Key ใหม่ของ Student
      name: s.name,
      email: s.studentCode ? `${s.studentCode}@ku.th` : `${s.nationalId}@ku.th`, // อ้างอิง studentCode แทน studentId
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