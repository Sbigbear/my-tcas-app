import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import AddCourseModal from './AddCourseModal'

// ฟังก์ชันค้นหาข้อมูลอาจารย์จาก Cookie
async function getLoggedInUser() {
  try {
    const cookieStore = await cookies()

    const teacherId = cookieStore.get('teacher_id')?.value || cookieStore.get('userId')?.value
    const userEmail = cookieStore.get('email')?.value || cookieStore.get('user_email')?.value

    if (teacherId) {
      const user = await prisma.user.findUnique({
        where: { Usersid: teacherId },
        select: { universityId: true, name: true, email: true },
      })
      if (user) return user
    }

    if (userEmail) {
      const user = await prisma.user.findFirst({
        where: { email: userEmail },
        select: { universityId: true, name: true, email: true },
      })
      if (user) return user
    }

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

// ฟังก์ชันดึงเกณฑ์ทั้งหมดจากฐานข้อมูลที่มีการกำหนดไว้
function getActiveCriteria(item: any) {
  const list: { label: string; value: string | number }[] = []

  if (item.minGpax !== null && item.minGpax !== undefined) {
    list.push({ label: 'GPAX ขั้นต่ำ', value: item.minGpax })
  }

  if (item.minMathGpa != null) list.push({ label: 'GPA คณิต', value: item.minMathGpa })
  if (item.minSciGpa != null) list.push({ label: 'GPA วิทย์', value: item.minSciGpa })
  if (item.minEngGpa != null) list.push({ label: 'GPA อังกฤษ', value: item.minEngGpa })
  if (item.minThaiGpa != null) list.push({ label: 'GPA ไทย', value: item.minThaiGpa })
  if (item.minSocialGpa != null) list.push({ label: 'GPA สังคม', value: item.minSocialGpa })
  if (item.minHealthGpa != null) list.push({ label: 'GPA สุขศึกษา/พละ', value: item.minHealthGpa })
  if (item.minArtGpa != null) list.push({ label: 'GPA ศิลปะ', value: item.minArtGpa })
  if (item.minCareerGpa != null) list.push({ label: 'GPA การงาน', value: item.minCareerGpa })

  if (item.minTgat != null) list.push({ label: 'TGAT ขั้นต่ำ', value: item.minTgat })
  if (item.minTpat1 != null) list.push({ label: 'TPAT 1', value: item.minTpat1 })
  if (item.minTpat2 != null) list.push({ label: 'TPAT 2', value: item.minTpat2 })
  if (item.minTpat3 != null) list.push({ label: 'TPAT 3', value: item.minTpat3 })
  if (item.minTpat4 != null) list.push({ label: 'TPAT 4', value: item.minTpat4 })
  if (item.minTpat5 != null) list.push({ label: 'TPAT 5', value: item.minTpat5 })

  if (item.minAlevelMath1 != null) list.push({ label: 'A-Level คณิต 1', value: item.minAlevelMath1 })
  if (item.minAlevelMath2 != null) list.push({ label: 'A-Level คณิต 2', value: item.minAlevelMath2 })
  if (item.minAlevelSci != null) list.push({ label: 'A-Level วิทย์ทั่วไป', value: item.minAlevelSci })
  if (item.minAlevelPhy != null) list.push({ label: 'A-Level ฟิสิกส์', value: item.minAlevelPhy })
  if (item.minAlevelChem != null) list.push({ label: 'A-Level เคมี', value: item.minAlevelChem })
  if (item.minAlevelBio != null) list.push({ label: 'A-Level ชีววิทยา', value: item.minAlevelBio })
  if (item.minAlevelSoc != null) list.push({ label: 'A-Level สังคม', value: item.minAlevelSoc })
  if (item.minAlevelThai != null) list.push({ label: 'A-Level ภาษาไทย', value: item.minAlevelThai })
  if (item.minAlevelEng != null) list.push({ label: 'A-Level ภาษาอังกฤษ', value: item.minAlevelEng })
  if (item.minAlevelForeign != null) {
    const lang = item.foreignLanguageSubject ? ` (${item.foreignLanguageSubject})` : ''
    list.push({ label: `A-Level ภาษาต่างประเทศ${lang}`, value: item.minAlevelForeign })
  }

  return list
}

export default async function TeacherCriteriaPage() {
  const user = await getLoggedInUser()

  // ดึงเกณฑ์หลักสูตร
  const rawCriteriaList = user?.universityId
    ? await prisma.programCriteria.findMany({
        where: { universityId: user.universityId },
        include: {
          university: true,
          applications: {
            select: {
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  // 📌 ซิงก์สถานะลง MySQL แบบ 2 ทาง (Auto Close เมื่อเต็ม & Auto Re-open เมื่อโควตากลับมาว่าง)
  const criteriaList = await Promise.all(
    rawCriteriaList.map(async (item) => {
      const appliedCount = (item.applications || []).filter(
        (app: any) => app.status !== 'CANCELLED'
      ).length

      const isFull = item.capacity > 0 && appliedCount >= item.capacity
      let currentIsOpen = item.isOpen

      // 1. ถ้าคนสมัครเต็มโควตา -> สั่งปิดรับสมัคร (isOpen = false)
      if (isFull && item.isOpen) {
        await prisma.programCriteria.update({
          where: { Program_Criteriaid: item.Program_Criteriaid },
          data: { isOpen: false },
        })
        currentIsOpen = false
      }
      // 2. ถ้าโควตากลับมาว่าง (เช่น 0/1) แต่ DB ปิดอยู่ -> สั่งเปิดรับสมัครคืน (isOpen = true) อัตโนมัติ!
      else if (!isFull && !item.isOpen && item.capacity > 0) {
        await prisma.programCriteria.update({
          where: { Program_Criteriaid: item.Program_Criteriaid },
          data: { isOpen: true },
        })
        currentIsOpen = true
      }

      return {
        ...item,
        appliedCount,
        isFull,
        isOpen: currentIsOpen,
      }
    })
  )

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

        <AddCourseModal universityId={user?.universityId ?? null} />
      </div>

      <div className="space-y-3">
        {!user ? (
          <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-red-600 mb-2">ไม่สามารถอ่านข้อมูลผู้ใช้งานได้</span>
            <span className="text-sm text-red-500">
              ระบบฝั่ง Server หา Cookie ล็อกอินไม่เจอ
            </span>
          </div>
        ) : criteriaList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold mb-2">ไม่มีข้อมูลเกณฑ์หลักสูตร</span>
            <span className="text-sm">ไม่พบข้อมูลเกณฑ์ที่ผูกกับรหัสสาขา <strong>{user.universityId ?? 'ไม่ระบุ'}</strong> ในระบบ</span>
          </div>
        ) : (
          criteriaList.map((item) => {
            const activeCriteria = getActiveCriteria(item)

            return (
              <div
                key={item.Program_Criteriaid}
                className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm hover:border-slate-300 transition"
              >
                {/* Header ส่วนชื่อภาควิชา, รหัสหลักสูตร และ สถานะการรับสมัคร */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        {item.Program_Criteriaid}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">
                        {item.programName}
                      </h3>

                      {/* 📌 ป้ายแสดงสถานะการรับสมัคร */}
                      {item.isFull ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          ปิดรับสมัคร (เต็มแล้ว)
                        </span>
                      ) : !item.isOpen ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          ปิดรับสมัคร
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          เปิดรับสมัคร
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.university?.faculty} - {item.university?.department} ({item.university?.campus})
                    </p>
                  </div>

                  {/* 📌 ส่วนแสดงจำนวนผู้สมัครเทียบกับจำนวนที่เปิดรับ */}
                  <div className="text-right">
                    <span className="text-xs text-slate-500">สมัคร / รับทั้งหมด</span>
                    <p className="text-base font-extrabold">
                      <span className={item.isFull ? 'text-rose-600 font-black' : 'text-[#07382B]'}>
                        {item.appliedCount}
                      </span>
                      <span className="text-slate-400 font-normal"> / </span>
                      <span className="text-[#07382B]">{item.capacity}</span>{' '}
                      <span className="text-xs font-normal text-slate-500">คน</span>
                    </p>
                  </div>
                </div>

                {/* แสดงเกณฑ์ขั้นต่ำทั้งหมดที่ถูกบันทึกในฐานข้อมูล */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-2">เกณฑ์คุณสมบัติขั้นต่ำที่ต้องผ่าน:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeCriteria.length === 0 ? (
                      <span className="text-xs text-slate-400">ไม่มีการกำหนดเกณฑ์คะแนนขั้นต่ำ</span>
                    ) : (
                      activeCriteria.map((crit, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5"
                        >
                          <span className="text-slate-500">{crit.label}:</span>
                          <strong className="text-slate-900 font-bold">{crit.value}</strong>
                        </span>
                      ))
                    )}

                    {item.additionals && (
                      <span className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                        <span className="text-amber-600">เงื่อนไขพิเศษ:</span>
                        <strong>{item.additionals}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}