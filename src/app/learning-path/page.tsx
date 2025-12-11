
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Map, CheckCircle, ArrowLeft, Lock, Loader2 } from 'lucide-react';

// Define types for Firestore documents
interface Course {
  id: string;
  title: string;
  description: string;
}

interface Lesson {
  id: string;
  title: string;
  order: number;
}

interface Progress {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: string[];
  currentLessonId: string;
}

const getStatusForLesson = (lessonId: string, progress: Progress | undefined, allLessons: Lesson[] | undefined) => {
    if (!progress || !allLessons) return 'locked';
    if (progress.completedLessons.includes(lessonId)) {
        return 'completed';
    }
    if (progress.currentLessonId === lessonId) {
        return 'current';
    }
    // Check if lesson is in the future based on order
    const currentLessonInAll = allLessons.find(l => l.id === progress.currentLessonId);
    const thisLesson = allLessons.find(l => l.id === lessonId);
    if (currentLessonInAll && thisLesson && thisLesson.order > currentLessonInAll.order) {
        return 'locked';
    }
    // Default to locked if logic doesn't match
    return 'locked'; 
};


const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="text-green-400" />;
    case 'current':
      return <ArrowLeft className="text-yellow-400 animate-pulse" />;
    case 'locked':
      return <Lock className="text-gray-500" />;
    default:
      return null;
  }
};

const CourseSection = ({ course, progress }: { course: Course, progress: Progress | undefined }) => {
  const firestore = useFirestore();

  const lessonsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `courses/${course.id}/lessons`), orderBy('order'));
  }, [firestore, course.id]);

  const { data: lessons, isLoading: isLoadingLessons, error: lessonsError } = useCollection<Lesson>(lessonsQuery);
  
  const getIsLocked = (lessonId: string, status: string) => {
      if(!progress) return true;
      return status === 'locked';
  };

  return (
    <div className="dashboard-card p-6 rounded-2xl">
      <h2 className="text-3xl royal-title text-gold-accent mb-2 border-b-2 border-sand-ochre/20 pb-3">
        {course.title}
      </h2>
      <p className="text-sand-ochre mb-6">{course.description}</p>

      {isLoadingLessons && <div className="text-sand-ochre text-center">جاري تحميل وحدات الدورة...</div>}
      {lessonsError && <div className="text-red-400 text-center">خطأ في تحميل الوحدات: {lessonsError.message}</div>}

      <div className="space-y-4">
        {lessons && lessons.map((lesson) => {
          const status = getStatusForLesson(lesson.id, progress, lessons);
          const isLocked = getIsLocked(lesson.id, status);
          
          return (
            <Link
              key={lesson.id}
              href={!isLocked ? `/learning-path/${lesson.id}?courseId=${course.id}` : '#'}
              passHref
              className={`block ${isLocked ? 'pointer-events-none' : ''}`}
            >
              <div
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                  isLocked
                    ? 'bg-nile/50 cursor-not-allowed opacity-60'
                    : 'bg-nile hover:bg-sand-ochre/20 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl w-8 text-center">
                    {getStatusIcon(status)}
                  </div>
                  <span className="font-bold text-lg">{lesson.title}</span>
                </div>
                {!isLocked && (
                  <Button asChild className="cta-button text-sm px-5 py-2">
                     <a>{status === 'current' ? 'ابدأ الدرس' : 'مراجعة'}</a>
                  </Button>
                )}
              </div>
            </Link>
          );
        })}
         {!isLoadingLessons && lessons?.length === 0 && <p className="text-sand-ochre text-center">لا توجد دروس متاحة لهذه الدورة بعد.</p>}
      </div>
    </div>
  );
};

export default function LearningPathPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'courses');
  }, [firestore]);

  // Fetch progress for the current user. A user can be enrolled in multiple courses.
  const progressQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(collection(firestore, `users/${user.uid}/progress`));
  }, [firestore, user]);

  const { data: courses, isLoading: isLoadingCourses, error: coursesError } = useCollection<Course>(coursesQuery);
  const { data: progresses, isLoading: isLoadingProgress, error: progressError } = useCollection<Progress>(progressQuery);

  const findProgressForCourse = (courseId: string) => {
      return progresses?.find(p => p.courseId === courseId);
  }

  return (
    <div
      className="min-h-screen bg-nile-dark text-white p-4 md:p-8"
      style={{ direction: 'rtl' }}
    >
      <header className="text-center mb-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
          <Map className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          مسار التعلم الملكي
        </h1>
        <p className="text-xl text-sand-ochre">
          رحلتك خطوة بخطوة من تلميذ إلى فرعون في اللهجة المصرية.
        </p>
      </header>

      <main className="max-w-4xl mx-auto w-full">
         {(isLoadingCourses || isLoadingProgress) && (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
                <p className="text-center text-lg text-sand-ochre ml-4">جاري تحميل مسارك التعليمي...</p>
            </div>
        )}
        {coursesError && <p className="text-center text-lg text-red-400">حدث خطأ أثناء تحميل الدورات: {coursesError.message}</p>}
        {progressError && <p className="text-center text-lg text-red-400">حدث خطأ أثناء تحميل تقدمك: {progressError.message}</p>}
        
        <div className="space-y-12">
          {courses && courses.map((course) => (
            <CourseSection key={course.id} course={course} progress={findProgressForCourse(course.id)} />
          ))}
        </div>
         {!isLoadingCourses && courses?.length === 0 && (
            <div className="text-center py-16">
                 <p className="text-xl text-sand-ochre">لا توجد دورات متاحة حالياً. يرجى المراجعة لاحقاً.</p>
            </div>
          )}
      </main>

      <footer className="mt-auto pt-12 text-center text-gray-400 text-sm">
        <Link
          href="/"
          className="utility-button px-6 py-2 text-md font-bold rounded-lg flex items-center justify-center mx-auto w-fit"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          <span>العودة للوحة التحكم</span>
        </Link>
        <p className="mt-4">أكاديمية يلا مصري © 2024</p>
      </footer>
    </div>
  );
}
