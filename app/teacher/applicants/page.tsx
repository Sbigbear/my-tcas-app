import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// 1. ดึง universityId ของอาจารย์ที่ล็อกอินอยู่จริง ณ ขณะนั้น
async function getTeacherUniversityId() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let userEmail: string | undefined
    let userId: string | undefined

    if (token) {
      const decoded = jwt.decode(token) as any
      userEmail = decoded?.email || decoded?.userEmail
      userId = decoded?.id || decoded?.userId || decoded?.sub
    }

    // กรณีอ่านจาก JWT Token ไม่เจอ ให้ Fallback ไปดู Cookie ตัวอื่น
    if (!userEmail) {
      userEmail = cookieStore.get('user_email')?.value
    }

    // ค้นหา User จาก Email หรือ ID ที่ได้
    if (userEmail || userId) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            userEmail ? { email: userEmail } : {},
            userId ? { Usersid: userId } : {},
          ],
        },
        select: { universityId: true },
      })
      if (user?.universityId) return user.universityId
    }

    // Fallback สอง: เช็คจาก Cookie userId โดยตรง
    const cookieUserId = cookieStore.get('userId')?.value || cookieStore.get('user_id')?.value
    if (cookieUserId) {
      const user = await prisma.user.findUnique({
        where: { Usersid: cookieUserId },
        select: { universityId: true },
      })
      if (user?.universityId) return user.universityId
    }

    return null
  } catch (err) {
    console.error('Error fetching teacher session:', err)
    return null
  }
}

export default async function ApplicantsPage() {
  const universityId = await getTeacherUniversityId()

  const applications = await prisma.application.findMany({
    // กรองเฉพาะถ้าเจอ universityId ของอาจารย์ท่านนี้ หากหาไม่เจอให้ใช้เงื่อนไขที่ไม่เจอข้อมูล
    where: universityId
      ? {
          criteria: {
            universityId: universityId,
          },
        }
      : { Applicationsid: 'no-match' },
    include: {
      student: {
        include: {
          tcasScores: true,
        },
      },
      criteria: {
        include: {
          university: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ELIGIBLE':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">ผ่านเกณฑ์</span>
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">รอตรวจสอบ</span>
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">ยกเลิกการสมัคร</span>
      case 'INELIGIBLE':
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">ไม่ผ่านเกณฑ์</span>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">รายชื่อผู้สมัคร</h1>
        <p className="text-xs text-slate-500">
          ตรวจสอบคะแนน เอกสาร และผลการคัดกรองคุณสมบัติเฉพาะสังกัดของคุณ
        </p>
      </div>

      <div className="space-y-3">
        {applications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            ยังไม่มีข้อมูลผู้สมัครในระบบ
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.Applicationsid}
              className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-slate-300 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#07382B] flex items-center justify-center font-bold text-sm">
                  {app.student.name?.[0] || 'น'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{app.student.name}</h3>
                  <p className="text-xs text-slate-500">
                    {app.criteria.programName}{' '}
                    <span className="text-slate-400">
                      ({app.criteria.university?.faculty} - {app.criteria.university?.department})
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right text-xs space-x-3">
                  <span className="text-slate-400">
                    GPAX <strong className="text-slate-800">{app.student.gpax ? Number(app.student.gpax).toFixed(2) : '-'}</strong>
                  </span>
                  {app.student.tcasScores?.tgat !== null && app.student.tcasScores?.tgat !== undefined && (
                    <span className="text-slate-400">
                      TGAT <strong className="text-slate-800">{Number(app.student.tcasScores.tgat).toFixed(2)}</strong>
                    </span>
                  )}
                </div>

                {renderStatusBadge(app.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}