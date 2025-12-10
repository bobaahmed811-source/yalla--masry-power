
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight, GraduationCap, Loader2 } from 'lucide-react';

interface Instructor {
  id: string;
  teacherName: string;
  email: string;
  shortBio: string;
  lessonPrice: number;
  photo?: string; // Optional photo URL
  specialties?: string[];
  averageRating?: number;
  totalReviews?: number;
}

const InstructorCard = ({ instructor }: { instructor: Instructor }) => (
  <Card className="dashboard-card text-white overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col">
    <div className="relative">
      <Image
        src={instructor.photo || 'https://picsum.photos/seed/' + instructor.id + '/400/250'}
        alt={`صورة المعلمة ${instructor.teacherName}`}
        width={400}
        height={250}
        className="w-full h-48 object-cover"
      />
      <div className="absolute top-2 left-2 bg-nile-dark/70 text-gold-accent p-2 rounded-lg font-bold">
        ${instructor.lessonPrice}/ساعة
      </div>
    </div>
    <CardHeader className="text-center">
      <CardTitle className="royal-title text-2xl">{instructor.teacherName}</CardTitle>
      {instructor.averageRating && (
        <div className="flex items-center justify-center text-sand-ochre">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < instructor.averageRating! ? 'text-gold-accent fill-current' : ''}`} />
            ))}
            <span className="mr-2 text-sm">({instructor.totalReviews || 0} مراجعة)</span>
        </div>
      )}
    </CardHeader>
    <CardContent className="flex-grow flex flex-col">
      <CardDescription className="text-sand-ochre text-center mb-4 flex-grow">{instructor.shortBio}</CardDescription>
       {instructor.specialties && instructor.specialties.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {instructor.specialties.map(spec => (
              <span key={spec} className="bg-sand-ochre/20 text-sand-ochre text-xs font-bold px-2 py-1 rounded-full">{spec}</span>
            ))}
          </div>
        )}
      <Button asChild className="w-full cta-button mt-auto">
        <Link href={`/booking?instructorId=${instructor.id}`}>احجزي الآن</Link>
      </Button>
    </CardContent>
  </Card>
);


export default function InstructorsPage() {
  const firestore = useFirestore();

  const instructorsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'instructors');
  }, [firestore]);

  const { data: instructors, isLoading, error } = useCollection<Instructor>(instructorsCollection);

  return (
    <div className="min-h-screen bg-nile-dark p-8 text-white" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
           <div className="inline-block p-4 bg-nile-dark/50 border-2 border-gold-accent rounded-full shadow-lg mb-4">
              <GraduationCap className="w-12 h-12 text-gold-accent" />
           </div>
          <h1 className="text-5xl md:text-6xl font-black royal-title mb-2">
            قابلِ معلمات المملكة
          </h1>
          <p className="text-xl text-sand-ochre">
            نخبة من المعلمات المتميزات لمساعدتك في رحلتك لإتقان العامية المصرية.
          </p>
        </header>

        {isLoading && (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
                <p className="text-center text-lg text-sand-ochre ml-4">جاري استدعاء سجلات المعلمات من ديوان المملكة...</p>
            </div>
        )}
        {error && <p className="text-center text-lg text-red-400">حدث خطأ ملكي أثناء استدعاء السجلات: {error.message}</p>}

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructors && instructors.map(instructor => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
          {!isLoading && instructors?.length === 0 && (
            <div className="text-center py-16">
                 <p className="text-xl text-sand-ochre">لا توجد معلمات مسجلات في الديوان حالياً. يرجى العودة لاحقاً.</p>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center">
            <Link href="/" className="utility-button px-6 py-2 text-md font-bold rounded-lg flex items-center justify-center mx-auto w-fit">
                <ArrowRight className="ml-2 h-4 w-4" />
                <span>العودة للوحة التحكم الرئيسية</span>
            </Link>
        </footer>
      </div>
    </div>
  );
}
