'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, RefreshCw, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

interface CriteriaState {
  active: boolean
  value: string
  label: string
  max: number
  step: string
}

export default function AddCourseModal({ universityId }: { universityId: string | null }) {
  const router = useRouter()
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'gpa' | 'tgas_tpat' | 'alevel'>('basic')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 1. ข้อมูลพื้นฐาน
  const [programName, setProgramName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [additionals, setAdditionals] = useState('')

  // 2. เกรดเฉลี่ยขั้นต่ำ (GPAX & กลุ่มสาระ)
  const [gpaFields, setGpaFields] = useState<Record<string, CriteriaState>>({
    minGpax: { active: false, value: '', label: 'GPAX สะสม', max: 4.0, step: '0.01' },
    minMathGpa: { active: false, value: '', label: 'กลุ่มสาระคณิตศาสตร์', max: 4.0, step: '0.01' },
    minSciGpa: { active: false, value: '', label: 'กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี', max: 4.0, step: '0.01' },
    minEngGpa: { active: false, value: '', label: 'กลุ่มสาระภาษาต่างประเทศ', max: 4.0, step: '0.01' },
    minThaiGpa: { active: false, value: '', label: 'กลุ่มสาระภาษาไทย', max: 4.0, step: '0.01' },
    minSocialGpa: { active: false, value: '', label: 'กลุ่มสาระสังคมศึกษาฯ', max: 4.0, step: '0.01' },
    minHealthGpa: { active: false, value: '', label: 'กลุ่มสาระสุขศึกษาและพลศึกษา', max: 4.0, step: '0.01' },
    minArtGpa: { active: false, value: '', label: 'กลุ่มสาระศิลปะ', max: 4.0, step: '0.01' },
    minCareerGpa: { active: false, value: '', label: 'กลุ่มสาระการงานอาชีพ', max: 4.0, step: '0.01' },
  })

  // 3. TGAT / TPAT
  const [tpatFields, setTpatFields] = useState<Record<string, CriteriaState>>({
    minTgat: { active: false, value: '', label: 'TGAT (100 คะแนน)', max: 100, step: '0.01' },
    minTpat1: { active: false, value: '', label: 'TPAT1 วิชาเฉพาะกสพท', max: 100, step: '0.01' },
    minTpat2: { active: false, value: '', label: 'TPAT2 ศิลปศาสตร์', max: 100, step: '0.01' },
    minTpat3: { active: false, value: '', label: 'TPAT3 วิทยาศาสตร์ เทคโนโลยี วิศวกรรมศาสตร์', max: 100, step: '0.01' },
    minTpat4: { active: false, value: '', label: 'TPAT4 สถาปัตยกรรมศาสตร์', max: 100, step: '0.01' },
    minTpat5: { active: false, value: '', label: 'TPAT5 ครุศาสตร์/ศึกษาศาสตร์', max: 100, step: '0.01' },
  })

  // 4. A-Level (ตัดเลขรหัสวิชาออกเรียบร้อยแล้ว)
  const [alevelFields, setAlevelFields] = useState<Record<string, CriteriaState>>({
    minAlevelMath1: { active: false, value: '', label: 'A-Level Math1 คณิตศาสตร์ประยุกต์ 1', max: 100, step: '0.01' },
    minAlevelMath2: { active: false, value: '', label: 'A-Level Math2 คณิตศาสตร์ประยุกต์ 2', max: 100, step: '0.01' },
    minAlevelSci: { active: false, value: '', label: 'A-Level Sci วิทยาศาสตร์ประยุกต์', max: 100, step: '0.01' },
    minAlevelPhy: { active: false, value: '', label: 'A-Level Phy ฟิสิกส์', max: 100, step: '0.01' },
    minAlevelChem: { active: false, value: '', label: 'A-Level Chem เคมี', max: 100, step: '0.01' },
    minAlevelBio: { active: false, value: '', label: 'A-Level Bio ชีววิทยา', max: 100, step: '0.01' },
    minAlevelSoc: { active: false, value: '', label: 'A-Level Soc สังคมศึกษา', max: 100, step: '0.01' },
    minAlevelThai: { active: false, value: '', label: 'A-Level Thai ภาษาไทย', max: 100, step: '0.01' },
    minAlevelEng: { active: false, value: '', label: 'A-Level Eng ภาษาอังกฤษ', max: 100, step: '0.01' },
    minAlevelForeign: { active: false, value: '', label: 'A-Level ภาษาต่างประเทศอื่นๆ', max: 100, step: '0.01' },
  })
  const [foreignLanguageSubject, setForeignLanguageSubject] = useState('')

  // Helper สลับสถานะเปิด/ปิดวิชา
  const handleToggle = (
    setter: React.Dispatch<React.SetStateAction<Record<string, CriteriaState>>>,
    key: string
  ) => {
    setErrorMessage(null)
    setter((prev) => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active, value: !prev[key].active ? prev[key].value : '' },
    }))
  }

  const handleValueChange = (
    setter: React.Dispatch<React.SetStateAction<Record<string, CriteriaState>>>,
    key: string,
    val: string
  ) => {
    setErrorMessage(null)
    setter((prev) => ({
      ...prev,
      [key]: { ...prev[key], value: val },
    }))
  }

  // ตรวจสอบความถูกต้องของแต่ละหน้า
  const validateCurrentTab = (): boolean => {
    setErrorMessage(null)

    if (activeTab === 'basic') {
      if (!programName.trim()) {
        setErrorMessage('กรุณากรอกชื่อหลักสูตร / โครงการ')
        return false
      }
      if (!capacity || Number(capacity) <= 0) {
        setErrorMessage('กรุณากรอกจำนวนที่รับสมัครให้ถูกต้อง (มากกว่า 0)')
        return false
      }
    } else if (activeTab === 'gpa') {
      for (const [key, item] of Object.entries(gpaFields)) {
        if (item.active && (item.value === '' || item.value === null || isNaN(Number(item.value)))) {
          setErrorMessage(`คุณกำหนดให้มีเกณฑ์ "${item.label}" แต่ยังไม่ได้กรอกคะแนน/เกรดขั้นต่ำ`)
          return false
        }
      }
    } else if (activeTab === 'tgas_tpat') {
      for (const [key, item] of Object.entries(tpatFields)) {
        if (item.active && (item.value === '' || item.value === null || isNaN(Number(item.value)))) {
          setErrorMessage(`คุณกำหนดให้มีเกณฑ์ "${item.label}" แต่ยังไม่ได้กรอกคะแนนขั้นต่ำ`)
          return false
        }
      }
    } else if (activeTab === 'alevel') {
      for (const [key, item] of Object.entries(alevelFields)) {
        if (item.active && (item.value === '' || item.value === null || isNaN(Number(item.value)))) {
          setErrorMessage(`คุณกำหนดให้มีเกณฑ์ "${item.label}" แต่ยังไม่ได้กรอกคะแนนขั้นต่ำ`)
          return false
        }
      }
      if (alevelFields.minAlevelForeign.active && !foreignLanguageSubject.trim()) {
        setErrorMessage('กรุณาระบุชื่อภาษาต่างประเทศ (เช่น ภาษาญี่ปุ่น, ภาษาจีน)')
        return false
      }
    }

    return true
  }

  // นำทางไปหน้าถัดไป
  const handleNext = () => {
    if (!validateCurrentTab()) return

    if (activeTab === 'basic') setActiveTab('gpa')
    else if (activeTab === 'gpa') setActiveTab('tgas_tpat')
    else if (activeTab === 'tgas_tpat') setActiveTab('alevel')
  }

  // ย้อนกลับ
  const handleBack = () => {
    setErrorMessage(null)
    if (activeTab === 'alevel') setActiveTab('tgas_tpat')
    else if (activeTab === 'tgas_tpat') setActiveTab('gpa')
    else if (activeTab === 'gpa') setActiveTab('basic')
  }

  // บันทึกข้อมูล (ทำได้เฉพาะหน้าสุดท้าย)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCurrentTab()) return

    if (!universityId) {
      setErrorMessage('ไม่พบข้อมูลรหัสสาขา (universityId) กรุณาล็อกอินใหม่อีกครั้ง')
      return
    }

    const payload: Record<string, any> = {
      universityId,
      programName,
      capacity: Number(capacity),
      isOpen,
      additionals: additionals.trim() || null,
      foreignLanguageSubject: alevelFields.minAlevelForeign.active ? foreignLanguageSubject : null,
    }

    Object.entries(gpaFields).forEach(([key, item]) => {
      payload[key] = item.active ? Number(item.value) : null
    })

    Object.entries(tpatFields).forEach(([key, item]) => {
      payload[key] = item.active ? Number(item.value) : null
    })

    Object.entries(alevelFields).forEach(([key, item]) => {
      payload[key] = item.active ? Number(item.value) : null
    })

    setIsLoading(true)
    try {
      const res = await fetch('/api/teacher/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setIsOpenModal(false)
        router.refresh()
      } else {
        setErrorMessage(data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setIsLoading(false)
    }
  }

  const renderCriterionRow = (
    fields: Record<string, CriteriaState>,
    setter: React.Dispatch<React.SetStateAction<Record<string, CriteriaState>>>,
    key: string
  ) => {
    const item = fields[key]
    return (
      <div key={key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">{item.label}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={item.active}
              onChange={() => handleToggle(setter, key)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A6B50]"></div>
            <span className="ml-2 text-[11px] font-bold text-slate-600">
              {item.active ? 'กำหนดให้มี' : 'ไม่มีเกณฑ์'}
            </span>
          </label>
        </div>

        {item.active && (
          <div>
            <input
              type="number"
              step={item.step}
              min="0"
              max={item.max}
              placeholder={`ระบุคะแนนขั้นต่ำ (สูงสุด ${item.max})`}
              value={item.value}
              onChange={(e) => handleValueChange(setter, key, e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-amber-300 bg-amber-50/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6B50] font-medium text-slate-900"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => {
          setActiveTab('basic')
          setErrorMessage(null)
          setIsOpenModal(true)
        }}
        className="bg-[#0A6B50] hover:bg-[#07382B] text-white px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1 shadow-sm cursor-pointer"
      >
        <Plus className="w-4 h-4" /> เพิ่มหลักสูตรใหม่
      </button>

      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">เพิ่มหลักสูตร / กำหนดเกณฑ์ TCAS</h3>
                <p className="text-xs text-slate-500">กรอกข้อมูลให้ครบถ้วนตามขั้นตอน</p>
              </div>
              <button onClick={() => setIsOpenModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message Bar */}
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Steps Navigation Bar */}
            <div className="flex border-b bg-slate-100 text-xs font-medium text-slate-600 px-4 pt-2 gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  if (validateCurrentTab()) setActiveTab('basic')
                }}
                className={`px-3 py-2 rounded-t-xl transition ${
                  activeTab === 'basic' ? 'bg-white text-[#0A6B50] font-bold border-t-2 border-[#0A6B50]' : 'hover:bg-slate-200'
                }`}
              >
                1. ข้อมูลหลักสูตร
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateCurrentTab()) setActiveTab('gpa')
                }}
                className={`px-3 py-2 rounded-t-xl transition ${
                  activeTab === 'gpa' ? 'bg-white text-[#0A6B50] font-bold border-t-2 border-[#0A6B50]' : 'hover:bg-slate-200'
                }`}
              >
                2. เกรดเฉลี่ย (GPA)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateCurrentTab()) setActiveTab('tgas_tpat')
                }}
                className={`px-3 py-2 rounded-t-xl transition ${
                  activeTab === 'tgas_tpat' ? 'bg-white text-[#0A6B50] font-bold border-t-2 border-[#0A6B50]' : 'hover:bg-slate-200'
                }`}
              >
                3. TGAT / TPAT
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateCurrentTab()) setActiveTab('alevel')
                }}
                className={`px-3 py-2 rounded-t-xl transition ${
                  activeTab === 'alevel' ? 'bg-white text-[#0A6B50] font-bold border-t-2 border-[#0A6B50]' : 'hover:bg-slate-200'
                }`}
              >
                4. A-Level
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* PAGE 1: ข้อมูลหลักสูตร */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อหลักสูตร / โครงการ <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="เช่น ภาคพิเศษ, โครงการเรียนดี, วิศวกรรมซอฟต์แวร์"
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6B50] text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวนที่รับสมัคร (คน) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      placeholder="เช่น 35"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6B50] text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">เงื่อนไข/ข้อกำหนดเพิ่มเติม (additionals)</label>
                    <textarea
                      rows={3}
                      placeholder="เช่น ต้องผ่านการสัมภาษณ์ หรือมีแฟ้มสะสมผลงาน..."
                      value={additionals}
                      onChange={(e) => setAdditionals(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6B50] text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <input
                      type="checkbox"
                      id="isOpenCheckModal"
                      checked={isOpen}
                      onChange={(e) => setIsOpen(e.target.checked)}
                      className="rounded text-[#0A6B50] focus:ring-[#0A6B50]"
                    />
                    <label htmlFor="isOpenCheckModal" className="text-xs font-medium text-slate-700">เปิดรับสมัครหลักสูตรนี้ทันที</label>
                  </div>
                </div>
              )}

              {/* PAGE 2: เกรดเฉลี่ย (GPAX & 8 กลุ่มสาระ) */}
              {activeTab === 'gpa' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(gpaFields).map((key) => renderCriterionRow(gpaFields, setGpaFields, key))}
                </div>
              )}

              {/* PAGE 3: TGAT / TPAT */}
              {activeTab === 'tgas_tpat' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(tpatFields).map((key) => renderCriterionRow(tpatFields, setTpatFields, key))}
                </div>
              )}

              {/* PAGE 4: A-Level */}
              {activeTab === 'alevel' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.keys(alevelFields).map((key) => renderCriterionRow(alevelFields, setAlevelFields, key))}
                  </div>

                  {alevelFields.minAlevelForeign.active && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                      <label className="block text-xs font-bold text-amber-900">
                        ระบุชื่อภาษาต่างประเทศ (foreignLanguageSubject) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น Japanese, Chinese, French, German"
                        value={foreignLanguageSubject}
                        onChange={(e) => setForeignLanguageSubject(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6B50] text-slate-900"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Wizard Bottom Buttons (ย้อนกลับ / ถัดไป / บันทึก) */}
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                {activeTab === 'basic' ? (
                  <button
                    type="button"
                    onClick={() => setIsOpenModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
                  </button>
                )}

                {activeTab !== 'alevel' ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#0A6B50] hover:bg-[#07382B] rounded-xl flex items-center gap-1 shadow-sm transition"
                  >
                    ถัดไป <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#0A6B50] hover:bg-[#07382B] rounded-xl flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> บันทึกข้อมูลเกณฑ์หลักสูตร
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}