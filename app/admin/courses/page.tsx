import prisma from '@/lib/prisma'
import CourseClient from './CourseClient'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  try {
    // 📌 ดึงหลักสูตรทั้งหมดทุกคณะทุกสาขาวิชาโดยไม่มี Filter กรอง
    const courses = await prisma.programCriteria.findMany({
      include: { university: true },
      orderBy: { createdAt: 'desc' },
    })

    const formattedCourses = courses.map((c: any) => ({
      id: c.Program_Criteriaid || c.id,
      programName: c.programName || c.name || 'ไม่ระบุชื่อหลักสูตร',
      faculty: c.university?.faculty || 'ไม่ระบุคณะ',
      department: c.university?.department || c.department || 'ไม่ระบุสาขา',
      campus: c.university?.campus || 'หลัก',
      minGpax: c.minGpax != null ? Number(c.minGpax).toFixed(2) : 'ไม่ระบุ',
      quota: c.capacity ?? c.quota ?? 0,
    }))

    return <CourseClient initialCourses={formattedCourses} />
  } catch (error) {
    console.error('Error fetching courses:', error)
    return <CourseClient initialCourses={[]} />
  }
}