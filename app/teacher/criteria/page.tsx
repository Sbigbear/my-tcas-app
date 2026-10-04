import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

// ฟังก์ชันค้นหาข้อมูลอาจารย์จาก Cookie (รองรับทั้ง teacher_id, userId และ email)
async function getLoggedInUser() {
  try {
    const cookieStore = await cookies()

    // 1. ดึง ID หรือ Email จาก Cookie โดยตรง
    const teacherId = cookieStore.get('teacher_id')?.value || cookieStore.get('userId')?.value
    const userEmail = cookieStore.get('email')?.value || cookieStore.get('user_email')?.value

    // 2. ถ้ามี teacherId ให้ค้นจาก Usersid ก่อนทันที (แม่นยำที่สุด)
    if (teacherId) {
      const user = await prisma.user.findUnique({
        where: { Usersid: teacherId },
        select: { universityId: true, name: true, email: true },
      })
      if (user) return user
    }

    // 3. ถ้าไม่มี teacherId ให้ค้นด้วย email
    if (userEmail) {
      const user = await prisma.user.findFirst({
        where: { email: userEmail },
        select: { universityId: true, name: true, email: true },
      })
      if (user) return user
    }

    // 4. Fallback: สแกนกวาดหาอีเมลใน Cookie ทุกตัวเผื่อกรณี Cookie ถูกเข้ารหัส
    const allCookies = cookieStore.getAll()
    for (const c of allCookies) {
      try {
        const decodedValue = decodeURIComponent(c.value)
        const match = decodedValue.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)
        if (match) {
          const email = match[1]
          const user = await prisma.user.findFirst({
            where: { email },
            select: { universityId: true, name: true, email: true },
          })
          if (user) return user
        }
      } catch (e) {
        continue
      }
    }

    return null
  } catch (err) {
    console.error('Error in getLoggedInUser:', err)
    return null
  }
}

export default async function TeacherCriteriaPage() {
  const user = await getLoggedInUser()

  // ค้นหาเกณฑ์ตาม universityId ของผู้ใช้ที่ดึงมาได้
  const criteriaList = user?.universityId
    ? await prisma.programCriteria.findMany({
        where: { universityId: user.universityId },
        include: { university: true },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">ระบบวิเคราะห์คุณสมบัติ TCAS</p>
          <h1 className="text-2xl font-bold text-slate-900">เกณฑ์หลักสูตร</h1>
          <p className="text-xs text-slate-500">
            กำหนดรอบรับสมัคร จำนวนที่รับ และเกณฑ์คุณสมบัติขั้นต่ำ
          </p>
        </div>
        <button className="bg-[#0A6B50] hover:bg-[#07382B] text-white px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1 shadow-sm">
          + เพิ่มหลักสูตรใหม่
        </button>
      </div>

      <div className="space-y-3">
        {!user ? (
          <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-red-600 mb-2">ไม่สามารถอ่านข้อมูลผู้ใช้งานได้</span>
            <span className="text-sm text-red-500">
              ระบบฝั่ง Server หา Cookie ล็อกอินไม่เจอ (หากคุณใช้ LocalStorage ในการล็อกอิน Server Component จะไม่สามารถอ่านค่าได้)
            </span>
          </div>
        ) : criteriaList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold mb-2">ไม่มีข้อมูลเกณฑ์หลักสูตร</span>
            <span className="text-sm">ไม่พบข้อมูลเกณฑ์ที่ผูกกับรหัสสาขา <strong>{user.universityId ?? 'ไม่ระบุ'}</strong> ในระบบ</span>
          </div>
        ) : (
          criteriaList.map((item) => (
            <div
              key={item.Program_Criteriaid}
              className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-slate-300 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {item.programName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.isOpen
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.isOpen ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {item.university?.faculty} - {item.university?.department} ({item.university?.campus})
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>จำนวนที่รับ: <strong className="text-slate-700">{item.capacity} คน</strong></span>
                  <span>GPAX ขั้นต่ำ: <strong className="text-slate-700">{item.minGpax ?? '-'}</strong></span>
                  <span>TGAT ขั้นต่ำ: <strong className="text-slate-700">{item.minTgat ?? '-'}</strong></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}