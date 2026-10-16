import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { AlertCircle, Clock } from 'lucide-react'

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

    if (!userEmail) {
      userEmail = cookieStore.get('user_email')?.value
    }

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

// 2. ฟังก์ชันตรวจเช็คคุณสมบัตินักเรียนเทียบกับเกณฑ์ (Criteria) ของแต่ละสาขาแบบ Dynamic
function evaluateApplicant(app: any) {
  const student = app.student || {}
  const scores = student.tcasScores || {}
  const criteria = app.criteria || {}

  const checksConfig = [
    { label: 'GPAX', minKey: 'minGpax', getVal: () => student.gpax },
    { label: 'GPA คณิต', minKey: 'minMathGpa', getVal: () => student.mathGpa ?? student.gpaMath },
    { label: 'GPA วิทย์', minKey: 'minSciGpa', getVal: () => student.sciGpa ?? student.gpaSci },
    { label: 'GPA อังกฤษ', minKey: 'minEngGpa', getVal: () => student.engGpa ?? student.gpaEng },
    { label: 'GPA ไทย', minKey: 'minThaiGpa', getVal: () => student.thaiGpa ?? student.gpaThai },
    { label: 'GPA สังคม', minKey: 'minSocialGpa', getVal: () => student.socialGpa ?? student.gpaSocial },
    { label: 'GPA สุขศึกษา', minKey: 'minHealthGpa', getVal: () => student.healthGpa ?? student.gpaHealth },
    { label: 'TGAT', minKey: 'minTgat', getVal: () => scores.tgat },
    { label: 'TPAT1', minKey: 'minTpat1', getVal: () => scores.tpat1 },
    { label: 'TPAT2', minKey: 'minTpat2', getVal: () => scores.tpat2 },
    { label: 'TPAT3', minKey: 'minTpat3', getVal: () => scores.tpat3 },
    { label: 'TPAT4', minKey: 'minTpat4', getVal: () => scores.tpat4 },
    { label: 'TPAT5', minKey: 'minTpat5', getVal: () => scores.tpat5 },
    { label: 'A-Level Math1', minKey: 'minAlevelMath1', getVal: () => scores.alevelMath1 },
    { label: 'A-Level Math2', minKey: 'minAlevelMath2', getVal: () => scores.alevelMath2 },
    { label: 'A-Level วิทย์', minKey: 'minAlevelSci', getVal: () => scores.alevelSci },
    { label: 'A-Level ฟิสิกส์', minKey: 'minAlevelPhy', getVal: () => scores.alevelPhy },
    { label: 'A-Level เคมี', minKey: 'minAlevelChem', getVal: () => scores.alevelChem },
    { label: 'A-Level ชีวะ', minKey: 'minAlevelBio', getVal: () => scores.alevelBio },
    { label: 'A-Level สังคม', minKey: 'minAlevelSoc', getVal: () => scores.alevelSoc },
    { label: 'A-Level ไทย', minKey: 'minAlevelThai', getVal: () => scores.alevelThai },
    { label: 'A-Level อังกฤษ', minKey: 'minAlevelEng', getVal: () => scores.alevelEng },
    { label: 'A-Level ตปท.', minKey: 'minAlevelForeign', getVal: () => scores.alevelForeign },
  ]

  const activeScoreChecks: {
    label: string
    studentVal: number | null
    minVal: number
    isFail: boolean
  }[] = []

  const failedReasons: string[] = []

  for (const cfg of checksConfig) {
    const rawMin = criteria[cfg.minKey]
    if (rawMin !== null && rawMin !== undefined) {
      const minVal = Number(rawMin)
      const rawStudentVal = cfg.getVal()
      const studentVal = rawStudentVal !== null && rawStudentVal !== undefined ? Number(rawStudentVal) : null

      const isFail = studentVal === null || studentVal < minVal

      activeScoreChecks.push({
        label: cfg.label,
        studentVal,
        minVal,
        isFail,
      })

      if (isFail) {
        failedReasons.push(
          `${cfg.label} (${studentVal !== null ? studentVal.toFixed(2) : 'ไม่มีข้อมูล'}) ต่ำกว่าขั้นต่ำ (${minVal.toFixed(2)})`
        )
      }
    }
  }

  return {
    activeScoreChecks,
    failedReasons,
    isEligible: failedReasons.length === 0,
  }
}

export default async function ApplicantsPage() {
  const universityId = await getTeacherUniversityId()

  const applications = await prisma.application.findMany({
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

  // ป้ายแสดงสถานะ (ผ่านเกณฑ์ / ไม่ผ่านเกณฑ์ / ยกเลิก)
  const renderStatusBadge = (status: string, isEligibleByCriteria: boolean) => {
    if (status === 'CANCELLED') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">ยกเลิกการสมัคร</span>
    }

    if (!isEligibleByCriteria) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">ไม่ผ่านเกณฑ์</span>
    }

    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">ผ่านเกณฑ์</span>
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
          applications.map((app) => {
            const evalRes = evaluateApplicant(app)

            // จัดรูปแบบวันที่และเวลาที่สมัคร
            const appliedAt = new Date(app.createdAt).toLocaleString('th-TH', {
              timeZone: 'Asia/Bangkok',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) + ' น.'

            return (
              <div
                key={app.Applicationsid}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
              >
                {/* 📌 ย้ายเวลาที่สมัครมาไว้ที่มุมซ้ายบน */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1.5 text-slate-500 text-[11px] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    สมัครเมื่อ: {appliedAt}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    รหัสการสมัคร: {app.Applicationsid}
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                  {/* ฝั่งซ้าย: ข้อมูลผู้สมัคร และ สาขาที่สมัคร */}
                  <div className="flex items-center gap-3.5 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#07382B] flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {app.student.name?.[0] || 'น'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{app.student.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.criteria.programName}{' '}
                        <span className="text-slate-400">
                          ({app.criteria.university?.faculty || '-'} {app.criteria.university?.department || '-'})
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* ฝั่งขวา: แสดงคะแนนสไตล์ Badge + Badge สถานะ */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center justify-end gap-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5 max-w-xl">
                      {evalRes.activeScoreChecks.map((check, idx) => (
                        <div
                          key={idx}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                            check.isFail
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="text-[11px] opacity-80">{check.label}</span>
                          <span className={`font-bold ${check.isFail ? 'text-rose-700' : 'text-slate-900'}`}>
                            {check.studentVal !== null ? check.studentVal.toFixed(2) : '-'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex-shrink-0">
                      {renderStatusBadge(app.status, evalRes.isEligible)}
                    </div>
                  </div>
                </div>

                {/* กล่องแสดงเหตุผลที่ไม่ผ่านเกณฑ์ */}
                {evalRes.failedReasons.length > 0 && app.status !== 'CANCELLED' && (
                  <div className="pt-2.5 border-t border-slate-100 flex items-start gap-2 text-xs bg-rose-50/70 p-3 rounded-xl border border-rose-100 text-rose-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-rose-800">เหตุผลที่ไม่ผ่านเกณฑ์: </span>
                      {evalRes.failedReasons.map((reason, idx) => (
                        <span key={idx}>
                          {idx > 0 && <span className="mx-1.5 text-rose-300">|</span>}
                          {reason}
                        </span>
                      ))}
                    </div>
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