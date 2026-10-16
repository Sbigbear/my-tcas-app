import prisma from '@/lib/prisma'
import LogsClient, { LogEntry } from './LogsClient'

export default async function LogsPage() {
  try {
    const logsData = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: true,
        student: true,
      },
    })

    const formattedLogs: LogEntry[] = logsData.map((log: any) => {
      const userName = log.performedBy || log.user?.name || (log.student ? `นักเรียน: ${log.student.name}` : 'ระบบ')

      let userRole = log.role || 'SYSTEM'
      if (!log.role) {
        if (log.user) {
          userRole = log.user.role
        } else if (log.student) {
          userRole = 'STUDENT'
        }
      }

      // 📌 แมปประเภทหมวดหมู่ Log ให้แสดงในแท็บ "หลักสูตร" อย่างแม่นยำ
      let logType: LogEntry['type'] = 'system'
      const actionText = (log.action || '').toLowerCase()
      const detailsText = (log.details || '').toLowerCase()

      if (
        actionText.includes('confirm') ||
        actionText.includes('pass') ||
        detailsText.includes('ผ่านการคัดเลือก') ||
        detailsText.includes('ยืนยันผล')
      ) {
        logType = 'passed_students'
      } else if (
        actionText.includes('course') ||
        actionText.includes('criteria') ||
        actionText.includes('program') ||
        actionText.includes('หลักสูตร') ||
        actionText.includes('เกณฑ์') ||
        detailsText.includes('หลักสูตร')
      ) {
        logType = 'course'
      } else if (
        actionText.includes('เข้าสู่ระบบ') ||
        actionText.includes('login') ||
        actionText.includes('logout')
      ) {
        logType = 'auth'
      } else if (
        actionText.includes('ผู้ใช้') ||
        actionText.includes('user') ||
        actionText.includes('teacher') ||
        actionText.includes('officer')
      ) {
        logType = 'user'
      }

      return {
        id: log.AuditLogsid || log.SystemLogsid || log.id,
        action: log.action,
        user: userName,
        role: userRole,
        details: log.details || '-',
        timestamp:
          new Date(log.createdAt).toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
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