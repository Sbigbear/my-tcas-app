import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import AddCourseModal from './AddCourseModal'

async function getLoggedInOfficer() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let userEmail: string | undefined
    let userId: string | undefined

    if (token) {
      try {
        const decoded = jwt.decode(token) as any
        userEmail = decoded?.email || decoded?.userEmail
        userId = decoded?.id || decoded?.userId || decoded?.sub
      } catch (e) {}
    }

    if (!userEmail) {
      userEmail = cookieStore.get('user_email')?.value || cookieStore.get('email')?.value
    }

    const cookieUserId =
      cookieStore.get('officer_id')?.value ||
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
  } catch (e) {
    return null
  }
}

export default async function OfficerCoursesPage() {
  const officer = await getLoggedInOfficer()
  const facultyName = officer?.university?.faculty || ''

  const courses = facultyName
    ? await prisma.programCriteria.findMany({
        where: {
          university: {
            faculty: facultyName,
          },
        },
        include: {
          university: true,
          applications: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  const allUnivs = await prisma.university.findMany({
    select: {
      Universitiesid: true,
      faculty: true,
      department: true,
      campus: true,
    },
  })

  const departmentOptions = allUnivs.map((u) => ({
    universityId: u.Universitiesid,
    facultyName: u.faculty,
    departmentName: u.department,
    campusName: u.campus,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">ระบบจัดการหลักสูตรระดับคณะ (Faculty Officer)</p>
          <h1 className="text-2xl font-bold text-slate-900">จัดการหลักสูตรและเกณฑ์การรับสมัคร</h1>
          <p className="text-xs text-slate-500">
            กำหนดหลักสูตร จำนวนรับ และเกณฑ์คะแนนขั้นต่ำสำหรับอาจารย์ใช้คัดเลือก สังกัด{' '}
            <span className="font-bold text-[#07382B]">
              {facultyName ? `คณะ${facultyName}` : 'ยังไม่ได้ระบุคณะสังกัด'}
            </span>
          </p>
        </div>

        <AddCourseModal facultyName={facultyName} departments={departmentOptions} />
      </div>

      <div className="space-y-4">
        {!facultyName ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-amber-200 bg-amber-50/30 text-amber-800 text-xs">
            บัญชีผู้ใช้นี้ยังไม่ได้ผูกกับคณะสังกัด กรุณากดปุ่ม <span className="font-bold">"+ เพิ่มหลักสูตรใหม่"</span> เพื่อระบุคณะและสาขาแรกของระบบ
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            ยังไม่มีรายการหลักสูตรที่เปิดรับสมัครในคณะ{facultyName}
          </div>
        ) : (
          courses.map((course) => {
            const totalApps = course.applications.length
            const passedApps = course.applications.filter(
              (a) => a.status === 'PASSED' || a.status === 'CONFIRMED'
            ).length

            // 📌 รวบรวมเกณฑ์การรับสมัครให้ครบถ้วนทุกฟิลด์ใน Schema D6_Program_Criteria
            const criteriaList = [
              // เกรดเฉลี่ยขั้นต่ำ (GPA)
              course.minGpax ? `GPAX ขั้นต่ำ: ${Number(course.minGpax).toFixed(2)}` : null,
              course.minMathGpa ? `GPA คณิต: ${Number(course.minMathGpa).toFixed(2)}` : null,
              course.minSciGpa ? `GPA วิทย์: ${Number(course.minSciGpa).toFixed(2)}` : null,
              course.minEngGpa ? `GPA อังกฤษ: ${Number(course.minEngGpa).toFixed(2)}` : null,
              course.minThaiGpa ? `GPA ไทย: ${Number(course.minThaiGpa).toFixed(2)}` : null,
              course.minSocialGpa ? `GPA สังคม: ${Number(course.minSocialGpa).toFixed(2)}` : null,
              course.minHealthGpa ? `GPA สุขศึกษา: ${Number(course.minHealthGpa).toFixed(2)}` : null,
              course.minArtGpa ? `GPA ศิลปะ: ${Number(course.minArtGpa).toFixed(2)}` : null,
              course.minCareerGpa ? `GPA การงาน: ${Number(course.minCareerGpa).toFixed(2)}` : null,

              // คะแนนสอบ TGAT / TPAT
              course.minTgat ? `TGAT ขั้นต่ำ: ${Number(course.minTgat).toFixed(2)}` : null,
              course.minTpat1 ? `TPAT1: ${Number(course.minTpat1).toFixed(2)}` : null,
              course.minTpat2 ? `TPAT2: ${Number(course.minTpat2).toFixed(2)}` : null,
              course.minTpat3 ? `TPAT3: ${Number(course.minTpat3).toFixed(2)}` : null,
              course.minTpat4 ? `TPAT4: ${Number(course.minTpat4).toFixed(2)}` : null,
              course.minTpat5 ? `TPAT5: ${Number(course.minTpat5).toFixed(2)}` : null,

              // คะแนนสอบ A-Level
              course.minAlevelMath1 ? `A-Level คณิต 1: ${Number(course.minAlevelMath1).toFixed(2)}` : null,
              course.minAlevelMath2 ? `A-Level คณิต 2: ${Number(course.minAlevelMath2).toFixed(2)}` : null,
              course.minAlevelSci ? `A-Level วิทย์ทั่วไป: ${Number(course.minAlevelSci).toFixed(2)}` : null,
              course.minAlevelPhy ? `A-Level ฟิสิกส์: ${Number(course.minAlevelPhy).toFixed(2)}` : null,
              course.minAlevelChem ? `A-Level เคมี: ${Number(course.minAlevelChem).toFixed(2)}` : null,
              course.minAlevelBio ? `A-Level ชีวะ: ${Number(course.minAlevelBio).toFixed(2)}` : null,
              course.minAlevelSoc ? `A-Level สังคม: ${Number(course.minAlevelSoc).toFixed(2)}` : null,
              course.minAlevelThai ? `A-Level ภาษาไทย: ${Number(course.minAlevelThai).toFixed(2)}` : null,
              course.minAlevelEng ? `A-Level อังกฤษ: ${Number(course.minAlevelEng).toFixed(2)}` : null,
              course.minAlevelForeign
                ? `A-Level ต่างประเทศ${course.foreignLanguageSubject ? ` (${course.foreignLanguageSubject})` : ''}: ${Number(course.minAlevelForeign).toFixed(2)}`
                : null,
            ].filter(Boolean)

            return (
              <div
                key={course.Program_Criteriaid}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono font-bold text-xs rounded-lg">
                        {course.Program_Criteriaid}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">{course.programName}</h2>
                      {course.isOpen ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          เปิดรับสมัคร
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          ปิดรับสมัคร
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {course.university.faculty}{' '}
                      <span className="font-bold text-slate-700">{course.university.department}</span> ({course.university.campus})
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <p className="text-slate-400 text-[11px]">คัดเลือกผ่านแล้ว / รับทั้งหมด</p>
                    <p className="font-bold text-[#07382B] text-sm">
                      {passedApps} / {course.capacity}{' '}
                      <span className="text-xs text-slate-500 font-normal">(สมัครรวม {totalApps} คน)</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">เกณฑ์คุณสมบัติขั้นต่ำที่ต้องผ่าน:</p>
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

                  {/* 📌 แสดงเงื่อนไขเพิ่มเติม (additionals) ถ้ามี */}
                  {course.additionals && (
                    <div className="mt-2 p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                      <strong>เงื่อนไขเพิ่มเติม:</strong> {course.additionals}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}