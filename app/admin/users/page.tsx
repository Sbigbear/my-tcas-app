import prisma from '@/lib/prisma'
import UserListClient from './UserClient'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      university: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const universities = await prisma.university.findMany({
    orderBy: { code: 'asc' },
  })

  const formattedUsers = [
    ...users.map((u: any) => ({
      id: u.Usersid,
      name: u.name,
      email: u.email,
      role: u.role,
      type: 'USER' as const,
      department: u.university ? `${u.university.faculty} ${u.university.department}` : '-',
    })),
    ...students.map((s) => ({
      id: s.Studentsid,
      name: s.name,
      email: s.studentCode ? `${s.studentCode}@ku.th` : `${s.nationalId}@ku.th`,
      role: 'STUDENT',
      type: 'STUDENT' as const,
      department: '-',
    })),
  ]

  return (
    <div className="space-y-6">
      <UserListClient initialUsers={formattedUsers} universities={universities} />
    </div>
  )
}