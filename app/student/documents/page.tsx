import prisma from '@/lib/prisma'

export default async function DocumentsPage() {
  // ตัวอย่างการดึงข้อมูลจากตาราง Student (ในระบบจริงดึงจาก Session/Cookie)
  // const student = await prisma.student.findFirst({
  //   where: { ... },
  //   select: {
  //     transcriptUrl: true,
  //     verificationStatus: true,
  //     updatedAt: true,
  //   }
  // })

  // Mockup สถานะและไฟล์เอกสารเพื่อแสดงผลตาม UI Figma
  const documents = [
    {
      id: '1',
      name: 'ระเบียนแสดงผลการเรียน (ปพ.1)',
      type: 'PDF Document',
      size: '2.4 MB',
      updatedAt: '24 ต.ค. 2024',
      status: 'VERIFIED', // VERIFIED, PENDING, FLAGGED
      url: '/uploads/transcripts/sample-pordor1.pdf',
    },
    {
      id: '2',
      name: 'หนังสือรับรองผลคะแนน TGAT/TPAT',
      type: 'PDF Document',
      size: '1.1 MB',
      updatedAt: '12 พ.ย. 2024',
      status: 'VERIFIED',
      url: '#',
    },
    {
      id: '3',
      name: 'สำเนาบัตรประจำตัวประชาชน',
      type: 'JPG Image',
      size: '850 KB',
      updatedAt: '10 ต.ค. 2024',
      status: 'VERIFIED',
      url: '#',
    },
  ]

  // ฟังก์ชันแปลง enum สถานะเป็น Badge Style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ตรวจสอบแล้ว (Verified)
          </span>
        )
      case 'FLAGGED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            เอกสารต้องแก้ไข (Flagged)
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            รอการตรวจสอบ (Pending)
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">เอกสารการศึกษา</h2>
          <p className="text-sm text-slate-500">รายการเอกสารแนบและสถานะการตรวจสอบความถูกต้อง</p>
        </div>
      </div>

      {/* แจ้งเตือนสถานะภาพรวม */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-blue-900">
        <div className="flex items-center gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="font-bold text-sm">การตรวจสอบเอกสารจากโรงเรียน</p>
            <p className="text-xs text-blue-700">เอกสาร ปพ.1 ถูกสแกนผ่านระบบ OCR และได้รับการยืนยันความถูกต้องเรียบร้อยแล้ว</p>
          </div>
        </div>
      </div>

      {/* Document List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">รายการเอกสารทั้งหมด</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <div key={doc.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl flex-shrink-0">
                  📄
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{doc.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>อัปเดตเมื่อ {doc.updatedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between md:justify-end">
                {getStatusBadge(doc.status)}
                
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-semibold text-[#07382B] bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  เปิดดูเอกสาร
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}