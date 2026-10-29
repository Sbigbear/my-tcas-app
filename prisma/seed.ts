import { PrismaClient, Role, VerificationStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// รายชื่อนักเรียนสำหรับสุ่ม
const firstNames = [
  'สมชาย', 'กนกวรรณ', 'ชยพล', 'ณิชา', 'ธนกฤต', 'พิมลพรรณ', 'ภานุวัฒน์', 'วรัญญู', 'ศิรินทิพย์', 'อัครเดช',
  'กิตติพงษ์', 'จิราพร', 'ชลธิชา', 'ณัฐวุฒิ', 'ธนพล', 'นภัสสร', 'ปองพล', 'พีรพัฒน์', 'เมธัส', 'วิศรุต',
  'ศุภกิตติ์', 'สิริกร', 'อนันตชัย', 'อารียา', 'กัญญารัตน์', 'จตุรภัทร', 'ฉัตรชัย', 'ชานนท์', 'ฐิติมา', 'ณรงค์ศักดิ์',
  'ธนากร', 'นันทวัฒน์', 'ปิยะวัฒน์', 'พงศกร', 'ภัทรพล', 'รวิศรา', 'วรเมธ', 'ศุภชัย', 'สุภัสสรา', 'อิทธิพล',
  'กวิน', 'ขวัญข้าว', 'คณิน', 'จิรภัทร', 'ชนินทร์', 'ณิชาภัทร', 'ธนบดี', 'นนทวัฒน์', 'ปาณิสรา', 'พรรณราย'
]

const lastNames = [
  'ใจดี', 'รัตนอุบล', 'เจริญสุข', 'ศรีสุข', 'วงษ์สุวรรณ', 'ทองแท้', 'เลิศปัญญา', 'สมบูรณ์', 'เกียรติไพศาล', 'พัฒนาศิริ',
  'สุขเจริญ', 'มั่นคง', 'ตั้งเจริญ', 'คงกะพัน', 'เดชะกุล', 'พงษ์พาณิชย์', 'วัฒนากุล', 'อนันตโชค', 'ศิริผล', 'ตระกูลดี',
  'ประเสริฐสุข', 'วิเศษสมบัติ', 'สุวรรณโชติ', 'อัครพงษ์', 'บุญยืน', 'งามวิไล', 'คงเจริญ', 'เลิศวิไล', 'รุ่งเรือง', 'ชัยชนะ'
]

function getRandomName(tag: string, index: number): string {
  const fn = firstNames[index % firstNames.length]
  const ln = lastNames[(index * 3) % lastNames.length]
  return `${fn} ${ln} ${tag}`
}

// ฟังก์ชันสุ่มเกรด (ช่วง 0.00 - 4.00)
function getRandomGpa(min: number, max: number): number {
  const val = Math.random() * (max - min) + min
  return parseFloat(Math.min(4.0, Math.max(0.0, val)).toFixed(2))
}

// ฟังก์ชันสุ่มคะแนน TCAS (ช่วง 0.00 - 100.00)
function getRandomScore(min: number, max: number): number {
  const val = Math.random() * (max - min) + min
  return parseFloat(Math.min(100.0, Math.max(0.0, val)).toFixed(2))
}

function generateRandomSubjectGpas(minRange: number, maxRange: number) {
  return {
    mathGpa: getRandomGpa(minRange, maxRange),
    sciGpa: getRandomGpa(minRange, maxRange),
    engGpa: getRandomGpa(minRange, maxRange),
    thaiGpa: getRandomGpa(minRange, maxRange),
    socialGpa: getRandomGpa(minRange, maxRange),
    healthGpa: getRandomGpa(minRange, maxRange),
    artGpa: getRandomGpa(minRange, maxRange),
    careerGpa: getRandomGpa(minRange, maxRange),
  }
}

// ฟังก์ชันสุ่มคะแนน TGAT / TPAT / A-Level ตามระดับกลุ่ม
function generateRandomTcasScores(minScore: number, maxScore: number) {
  return {
    tgat: getRandomScore(minScore, maxScore),
    tpat1: getRandomScore(minScore, maxScore),
    tpat2: getRandomScore(minScore, maxScore),
    tpat3: getRandomScore(minScore, maxScore),
    tpat4: getRandomScore(minScore, maxScore),
    tpat5: getRandomScore(minScore, maxScore),
    alevelMath1: getRandomScore(minScore, maxScore),
    alevelMath2: getRandomScore(minScore, maxScore),
    alevelSci: getRandomScore(minScore, maxScore),
    alevelPhy: getRandomScore(minScore, maxScore),
    alevelChem: getRandomScore(minScore, maxScore),
    alevelBio: getRandomScore(minScore, maxScore),
    alevelSoc: getRandomScore(minScore, maxScore),
    alevelThai: getRandomScore(minScore, maxScore),
    alevelEng: getRandomScore(minScore, maxScore),
    alevelForeign: getRandomScore(minScore, maxScore),
  }
}

async function main() {
  console.log('🌱 Starting database seeding (Students + Randomized TCAS Scores)...')

  // 1. ผู้ดูแลระบบ (ADMIN 2 คน)
  const defaultPassword = await bcrypt.hash('adminpass123', 10)

  const adminUsers = [
    {
      email: 'admin.sys@ku.ac.th',
      name: 'System Admin',
      password: defaultPassword,
      role: Role.ADMIN,
    },
    {
      email: 'admin.tcas@ku.ac.th',
      name: 'TCAS Admin',
      password: defaultPassword,
      role: Role.ADMIN,
    },
  ]

  for (const admin of adminUsers) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { name: admin.name, password: admin.password, role: admin.role },
      create: admin,
    })
  }
  console.log('✅ Created 2 Admin Accounts')

  // 2. ข้อมูลนักเรียน + สุ่มคะแนน TCAS (45 คน)
  const studentsData = [
    // --- กลุ่มที่ 1: GPA > 3.00 (15 คน) -> คะแนนสอบสูงช่วง 50 - 90 ---
    ...Array.from({ length: 15 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0')
      return {
        student: {
          studentCode: `ST66${num}`,
          nationalId: `11001001110${num}`,
          name: getRandomName('(GPA > 3.00)', i),
          gpax: 3.00,
          ...generateRandomSubjectGpas(2.20, 3.90),
          verificationStatus: VerificationStatus.VERIFIED,
        },
        tcasScores: generateRandomTcasScores(50.0, 92.0),
      }
    }),

    // --- กลุ่มที่ 2: GPA 2.50 – 2.99 (15 คน) -> คะแนนสอบปานกลางช่วง 35 - 75 ---
    ...Array.from({ length: 15 }, (_, i) => {
      const num = String(i + 26).padStart(2, '0')
      const randomGpax = parseFloat((2.50 + i * 0.03).toFixed(2))
      return {
        student: {
          studentCode: `ST66${num}`,
          nationalId: `11001001110${num}`,
          name: getRandomName('(GPA 2.50-2.99)', i + 15),
          gpax: randomGpax,
          ...generateRandomSubjectGpas(1.80, 3.50),
          verificationStatus: VerificationStatus.VERIFIED,
        },
        tcasScores: generateRandomTcasScores(35.0, 75.0),
      }
    }),

    // --- กลุ่มที่ 3: GPA < 2.00 (15 คน) -> คะแนนสอบช่วง 15 - 50 ---
    ...Array.from({ length: 15 }, (_, i) => {
      const num = String(i + 51).padStart(2, '0')
      const randomGpax = parseFloat((1.50 + i * 0.03).toFixed(2))
      return {
        student: {
          studentCode: `ST66${num}`,
          nationalId: `11001001110${num}`,
          name: getRandomName('(GPA < 2.00)', i + 30),
          gpax: randomGpax,
          ...generateRandomSubjectGpas(1.00, 2.20),
          verificationStatus: VerificationStatus.VERIFIED,
        },
        tcasScores: generateRandomTcasScores(15.0, 50.0),
      }
    }),
  ]

  // 3. บันทึกข้อมูลนักเรียนและคะแนน TCAS ลงตาราง D3_Students และ D4_Tcas_Scores
  for (const item of studentsData) {
    const createdStudent = await prisma.student.upsert({
      where: { nationalId: item.student.nationalId },
      update: item.student,
      create: item.student,
    })

    await prisma.tcasScore.upsert({
      where: { studentId: createdStudent.Studentsid },
      update: item.tcasScores,
      create: {
        studentId: createdStudent.Studentsid,
        ...item.tcasScores,
      },
    })
  }

  console.log(`✅ Successfully seeded ${studentsData.length} Students with full TCAS Scores!`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error Seeding Data:', e)
    await prisma.$disconnect()
    process.exit(1)
  })