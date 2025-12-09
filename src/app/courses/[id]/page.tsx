import { notFound } from 'next/navigation';
import { courses } from '@/lib/data';
import { MainLayout } from '@/components/layout/main-layout';
import { CourseHeader } from '@/components/course/course-header';
import { LessonList } from '@/components/course/lesson-list';
import { CourseContent } from '@/components/course/course-content';

export async function generateStaticParams() {
  return courses.map((course) => ({
    id: course.id,
  }));
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const course = courses.find((c) => c.id === params.id);

  if (!course) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <CourseHeader title={course.title} />
        <div className="flex-1 grid md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_350px] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <CourseContent course={course} />
          </div>
          <div className="sticky top-6">
            <LessonList lessons={course.lessons} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
