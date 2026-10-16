import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'

async function getTeacherInfo() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let userEmail: string | undefined
    let userId: string | undefined

    if (token) {
      try {
        const decoded = jwt.decode(token) as any
        if (decoded) {
          userEmail = decoded?.email || decoded?.userEmail
          userId = decoded?.id || decoded?.userId || decoded?.sub
        }
      } catch (e) {
        console.error('JWT Decode Error:', e)
      }
    }

    if (!userEmail) {
      userEmail = cookieStore.get('user_email')?.value || cookieStore.get('email')?.value
    }

    const cookieUserId =
      cookieStore.get('teacher_id')?.value ||
      cookieStore.get('userId')?.value ||
      cookieStore.get('user_id')?.value

    const orConditions = [
      userEmail ? { email: userEmail } : null,
      userId ? { Usersid: userId } : null,
      cookieUserId ? { Usersid: cookieUserId } : null,
    ].filter(Boolean) as any[]

    if (orConditions.length === 0) return null

    const user = await prisma.user.findFirst({
      where: { OR: orConditions },
      include: { university: true },
    })

    return user
  } catch (err) {
    console.error('Error fetching teacher info:', err)
    return null
  }
}

export default async function TeacherCoursesPage() {
  const teacher = await getTeacherInfo()

  if (!teacher) {
    redirect('/login')
  }

  const teacherUnivId = teacher.universityId
  const faculty = teacher.university?.faculty || ''
  const department = teacher.university?.department || ''

  const courses = teacherUnivId
    ? await prisma.programCriteria.findMany({
        where: {
          universityId: teacherUnivId,
        },
        include: {
          university: true,
          applications: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">หลักสูตรและเกณฑ์การรับสมัคร TCAS</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          เกณฑ์คะแนนขั้นต่ำและจำนวนรับสมัครเฉพาะ{' '}
          <span className="font-bold text-[#07382B]">
            {faculty} - {department}
          </span>
        </p>
      </div>

      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            ยังไม่มีหลักสูตรที่เปิดรับสมัครในสาขาวิชานี้
          </div>
        ) : (
          courses.map((course) => {
            const totalApps = course.applications.length
            const passedApps = course.applications.filter(
              (a) => a.status === 'PASSED' || a.status === 'CONFIRMED'
            ).length

            // 📌 คำนวณตรรกะระบบแบบเดียวกันทุกฝั่ง
            const isFull = passedApps >= course.capacity

            const criteriaList = [
              course.minGpax ? `GPAX ขั้นต่ำ: ${Number(course.minGpax).toFixed(2)}` : null,
              course.minMathGpa ? `GPA คณิต: ${Number(course.minMathGpa).toFixed(2)}` : null,
              course.minSciGpa ? `GPA วิทย์: ${Number(course.minSciGpa).toFixed(2)}` : null,
              course.minEngGpa ? `GPA อังกฤษ: ${Number(course.minEngGpa).toFixed(2)}` : null,
              course.minTgat ? `TGAT ขั้นต่ำ: ${Number(course.minTgat).toFixed(2)}` : null,
              course.minTpat1 ? `TPAT1: ${Number(course.minTpat1).toFixed(2)}` : null,
              course.minTpat3 ? `TPAT3: ${Number(course.minTpat3).toFixed(2)}` : null,
              course.minAlevelMath1 ? `A-Level Math1: ${Number(course.minAlevelMath1).toFixed(2)}` : null,
              course.minAlevelEng ? `A-Level Eng: ${Number(course.minAlevelEng).toFixed(2)}` : null,
            ].filter(Boolean)

            return (
              <div
                key={course.Program_Criteriaid}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono font-bold text-xs rounded-lg">
                        {course.Program_Criteriaid}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">{course.programName}</h2>

                      {!isFull ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          เปิดรับสมัคร
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          ปิดรับสมัคร (เต็มแล้ว)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {course.university.faculty}{' '}
                      <span className="font-bold text-slate-700">{course.university.department}</span>{' '}
                      ({course.university.name} {course.university.campus})
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <p className="text-slate-400 text-[11px]">คัดเลือกผ่านแล้ว / รับทั้งหมด</p>
                      <p className="font-bold text-[#07382B] text-sm">
                        {passedApps} / {course.capacity}{' '}
                        <span className="text-xs text-slate-500 font-normal">
                          (สมัครรวม {totalApps} คน)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    เกณฑ์คุณสมบัติขั้นต่ำที่ต้องผ่าน:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {criteriaList.length > 0 ? (
                      criteriaList.map((crit, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                        >
                          {crit}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">ไม่มีเกณฑ์คะแนนขั้นต่ำ</span>
                    )}
                  </div>
                </div>

                {course.additionals && (
                  <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs text-amber-900">
                    <span className="font-bold">เงื่อนไขเพิ่มเติม: </span>
                    {course.additionals}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}