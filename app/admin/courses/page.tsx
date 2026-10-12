import prisma from '@/lib/prisma'
import CourseClient from './CourseClient'

export default async function CoursesPage() {
  try {
    const courses = await prisma.programCriteria.findMany({
      include: { university: true }, // ดึงข้อมูลความสัมพันธ์ของมหาวิทยาลัยเพื่อเอาชื่อสาขา (department)
      orderBy: { createdAt: 'desc' },
    })

    const formattedCourses = courses.map((c: any) => ({
      id: c.Program_Criteriaid || c.id,
      programName: c.programName || c.name || 'ไม่ระบุชื่อหลักสูตร',
      department: c.university?.department || c.department || 'ไม่ระบุสาขา',
      minGpax: c.minGpax ?? c.gpax ?? '-',
      quota: c.quota ?? c.capacity ?? 0,
    }))

    return <CourseClient initialCourses={formattedCourses} />
  } catch (error) {
    console.error('Error fetching courses:', error)
    return <CourseClient initialCourses={[]} />
  }
}