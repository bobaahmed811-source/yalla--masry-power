import Link from 'next/link';
import type { NextPage } from 'next';

import { courses } from '@/lib/data';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { CourseCard } from '@/components/dashboard/course-card';

const DashboardPage: NextPage = () => {
  return (
    <MainLayout>
      <DashboardHeader userName="Admin" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
