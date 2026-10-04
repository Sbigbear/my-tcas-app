import prisma from '@/lib/prisma'
import LogsClient, { LogEntry } from './LogsClient'

export default async function LogsPage() {
  try {
    // ดึงข้อมูลประวัติการทำงานจากตาราง AuditLog พร้อม Join ข้อมูลผู้ใช้
    const logsData = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // ดึง 100 รายการล่าสุด
      include: {
        user: true,    // ดึงข้อมูล User (ADMIN / OFFICER)
        student: true, // ดึงข้อมูล Student (STUDENT)
      },
    })

    const formattedLogs: LogEntry[] = logsData.map((log) => {
      // 1. ระบุชื่อผู้ดำเนินการ (User หรือ Student)
      const userName = log.user?.name || log.student?.name || 'ระบบ'

      // 2. ระบุบทบาท (ADMIN, OFFICER, STUDENT, SYSTEM)
      let userRole = 'SYSTEM'
      if (log.user) {
        userRole = log.user.role
      } else if (log.student) {
        userRole = 'STUDENT'
      }

      // 3. จำแนกประเภทการกรอง (Type) จากข้อความ Action
      let logType: LogEntry['type'] = 'system'
      const actionText = log.action.toLowerCase()

      if (actionText.includes('เข้าสู่ระบบ') || actionText.includes('login') || actionText.includes('logout')) {
        logType = 'auth'
      } else if (actionText.includes('หลักสูตร') || actionText.includes('เกณฑ์') || actionText.includes('course')) {
        logType = 'course'
      } else if (actionText.includes('ผู้ใช้') || actionText.includes('อนุมัติ') || actionText.includes('user')) {
        logType = 'user'
      }

      return {
        id: log.AuditLogsid,
        action: log.action,
        user: userName,
        role: userRole,
        details: log.details || '-',
        timestamp: new Date(log.createdAt).toLocaleString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' น.',
        type: logType,
      }
    })

    return <LogsClient initialLogs={formattedLogs} />
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return <LogsClient initialLogs={[]} />
  }
}