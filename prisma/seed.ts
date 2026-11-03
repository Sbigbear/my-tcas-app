import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding initial database...')

  // 1. สร้างมหาวิทยาลัยตัวอย่าง
  const university = await prisma.university.upsert({
    where: { Universitiesid: 'uni-001' },
    update: {},
    create: {
      Universitiesid: 'uni-001',
      code: 'KMUTT',
      name: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
      campus: 'บางมด',
      faculty: 'เทคโนโลยีสารสนเทศ',
      department: 'วิทยาการคอมพิวเตอร์',
    },
  })

  // 2. สร้างผู้ดูแลระบบ (Admin) ตัวอย่าง
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tcas.ac.th' },
    update: {},
    create: {
      Usersid: 'usr-admin-01',
      email: 'admin@tcas.ac.th',
      password: 'password123', // ควร HASH รหัสผ่านในการใช้งานจริง
      name: 'ผู้ดูแลระบบ TCAS',
      role: Role.ADMIN,
      universityId: university.Universitiesid,
    },
  })

  // 3. สร้างโรงเรียนตัวอย่าง
  const school = await prisma.school.upsert({
    where: { code: 'SCH-001' },
    update: {},
    create: {
      Schoolsid: 'sch-001',
      code: 'SCH-001',
      name: 'โรงเรียนสาธิตทดสอบ',
      province: 'กรุงเทพมหานคร',
    },
  })

  console.log('✅ Seeding completed!')
  console.log(`- Created Admin: ${admin.email}`)
  console.log(`- Created University: ${university.name}`)
  console.log(`- Created School: ${school.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })