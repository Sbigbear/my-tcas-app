import prisma from '@/lib/prisma'
import CourseClient from './CourseClient'

export default async function CoursesPage() {
  try {
    const courses = await prisma.programCriteria.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const formattedCourses = courses.map((c: any) => ({
      id: c.Program_Criteriaid || c.id,
      programName: c.programName || c.name || 'ไม่ระบุชื่อหลักสูตร',
      faculty: c.faculty || 'ไม่ระบุคณะ',
      minGpax: c.minGpax ?? c.gpax ?? '-',
      round: c.round ?? '1',
      quota: c.quota ?? c.capacity ?? 0,
    }))

    return <CourseClient initialCourses={formattedCourses} />
  } catch (error) {
    console.error('Error fetching courses:', error)
    return <CourseClient initialCourses={[]} />
  }
}