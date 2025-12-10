
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star, Clock, Tag, CalendarCheck, CheckCircle, Crown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the type for an instructor from Firestore
interface Instructor {
  id: string;
  teacherName: string;
  email: string;
  shortBio: string;
  lessonPrice: number;
  photo?: string;
  specialties?: string[];
  averageRating?: number;
  totalReviews?: number;
}

// Generate a more realistic mock schedule associated with real instructors
const generateMockSchedule = (instructors: Instructor[]) => {
  if (!instructors || instructors.length === 0) return {};
  const schedule: any[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) { // Generate for the next 7 days
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];

    instructors.forEach((instructor, index) => {
      // Give each instructor 1-2 slots per day
      if (Math.random() > 0.3) {
        const hour = 10 + (index % 4) * 2 + (i % 3);
        schedule.push({
          id: `${instructor.id}-${i}-1`,
          date: dateString,
          time: `${hour}:00`,
          teacherName: instructor.teacherName,
          instructorId: instructor.id,
          subject: instructor.specialties?.[0] || 'درس في العامية',
          price: instructor.lessonPrice,
          photo: instructor.photo,
          duration: 60,
        });
      }
    });
  }

  // Group by date
  return schedule.reduce((acc: Record<string, any[]>, lesson) => {
    const dateKey = lesson.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(lesson);
    return acc;
  }, {});
};


export default function BookingPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const instructorsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'instructors');
  }, [firestore]);

  const { data: instructors, isLoading: isLoadingInstructors, error: instructorsError } = useCollection<Instructor>(instructorsCollection);

  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'confirming' | 'confirmed'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize the schedule generation
  const scheduleByDate = useMemo(() => {
    if (!instructors) return {};
    return generateMockSchedule(instructors);
  }, [instructors]);

  // Date formatting function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString + 'T12:00:00').toLocaleDateString('ar-EG', options);
  };
  
  const handleSelectLesson = (lesson: any) => {
    if (bookingStatus === 'idle') {
      setSelectedLesson(lesson);
      setBookingStatus('confirming');
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedLesson) return;
    setIsSubmitting(true);
    // In a real app, this would trigger the purchase flow we discussed
    setTimeout(() => {
      setBookingStatus('confirmed');
      toast({
        title: "✅ تم تسجيل طلب الحجز بنجاح",
        description: "سيتم التواصل معكِ من قبل الإدارة لتأكيد الدفع والموعد.",
      });
      setIsSubmitting(false);
    }, 1500);
  };
  
  const resetBooking = () => {
      setSelectedLesson(null);
      setBookingStatus('idle');
  }

  const renderContent = () => {
    if (isLoadingInstructors) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
                <p className="text-center text-lg text-sand-ochre ml-4">جاري استدعاء سجلات المعلمات...</p>
            </div>
        );
    }

    if (instructorsError) {
        return <p className="text-center text-red-500 py-10">حدث خطأ ملكي: {instructorsError.message}</p>;
    }
    
    if (bookingStatus === 'idle') {
        return (
            <div className="space-y-8">
              {Object.keys(scheduleByDate).length > 0 ? Object.keys(scheduleByDate).map(dateKey => (
                <div key={dateKey}>
                  <h3 className="text-2xl font-bold text-sand-ochre mb-4 border-r-4 border-gold-accent pr-4">
                    {formatDate(dateKey)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scheduleByDate[dateKey].map((lesson:any) => (
                      <Card key={lesson.id} className="stat-card p-0 flex flex-col overflow-hidden cursor-pointer" onClick={() => handleSelectLesson(lesson)}>
                          <CardHeader className="flex-grow p-4">
                              <div className="flex items-center gap-4 mb-3">
                                <Image src={lesson.photo || `https://picsum.photos/seed/${lesson.instructorId}/100/100`} alt={lesson.teacherName} width={50} height={50} className="rounded-full border-2 border-gold-accent"/>
                                <div>
                                    <CardTitle className="text-xl text-white">{lesson.teacherName}</CardTitle>
                                    <p className="text-sm text-sand-ochre">{lesson.subject}</p>
                                </div>
                              </div>
                              <div className="flex justify-around text-center text-xs text-gray-300 border-t border-b border-sand-ochre/20 py-2">
                                <div className="flex items-center gap-1"><Clock size={14}/> {lesson.time}</div>
                                <div className="flex items-center gap-1"><Tag size={14}/> ${lesson.price}</div>
                              </div>
                          </CardHeader>
                           <CardContent className="p-0">
                               <div className="bg-gold-accent text-nile-dark text-center py-2 font-bold">
                                   اختر هذا الموعد
                               </div>
                           </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )) : <p className="text-center text-sand-ochre py-10">لا توجد مواعيد متاحة حالياً. يرجى المراجعة لاحقاً.</p>}
            </div>
        )
    }

    if (bookingStatus === 'confirming' && selectedLesson) {
        return (
             <Card className="bg-nile border border-sand-ochre p-8 max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl royal-title text-center mb-4">مراجعة وتأكيد الحجز</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-lg">
                    <div className="flex items-center gap-4">
                        <Image src={selectedLesson.photo || `https://picsum.photos/seed/${selectedLesson.instructorId}/100/100`} alt={selectedLesson.teacherName} width={80} height={80} className="rounded-full border-4 border-gold-accent"/>
                        <div>
                            <p className="text-2xl font-bold text-white">{selectedLesson.teacherName}</p>
                            <p className="text-sand-ochre">{selectedLesson.subject}</p>
                        </div>
                    </div>
                     <div className="border-t border-sand-ochre/30 my-4"></div>
                    <p className="flex items-center gap-2"><CalendarCheck className="text-gold-accent"/> <strong>التاريخ:</strong> {formatDate(selectedLesson.date)} الساعة {selectedLesson.time}</p>
                    <p className="flex items-center gap-2"><Clock className="text-gold-accent"/> <strong>المدة:</strong> {selectedLesson.duration} دقيقة</p>
                    <p className="flex items-center gap-2"><Tag className="text-gold-accent"/> <strong>التكلفة:</strong> <span className="font-black text-2xl text-white">${selectedLesson.price}</span></p>

                    <div className="mt-6 flex justify-between items-center gap-4">
                        <Button onClick={resetBooking} variant="outline" className="utility-button flex-1">
                            تغيير الموعد
                        </Button>
                        <Button onClick={handleConfirmBooking} className="cta-button flex-1" disabled={isSubmitting}>
                          {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الحجز والدفع'}
                        </Button>
                    </div>
                </CardContent>
             </Card>
        )
    }
    
    if (bookingStatus === 'confirmed' && selectedLesson) {
        return (
            <Card className="bg-nile border border-green-400 p-8 text-center max-w-2xl mx-auto">
                <CardHeader>
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4"/>
                    <CardTitle className="text-3xl font-bold text-white">تم استلام طلبك بنجاح!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-lg text-gray-300">
                    <p>طلبك لحجز درس "<span className="font-bold text-sand-ochre">{selectedLesson.subject}</span>" مع المعلمة <span className="font-bold text-sand-ochre">{selectedLesson.teacherName}</span> هو الآن قيد المراجعة.</p>
                    <p className="font-bold text-white bg-sand-ochre/10 p-3 rounded-lg">الخطوة التالية: ستقوم الإدارة بالتواصل معك عبر البريد الإلكتروني لتأكيد عملية الدفع وتفاصيل الدرس.</p>
                    <div className="pt-4">
                        <Button onClick={resetBooking} className="cta-button">
                             <Crown className="ml-2"/> حجز درس آخر
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return null; // Default return if no state matches
  }

  return (
    <div className="min-h-screen bg-nile-dark p-4 md:p-8 flex items-start justify-center" style={{ direction: 'rtl' }}>
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl dashboard-card text-white">
        
        <div className="p-6 md:p-8 border-b-4 border-gold-accent bg-nile/50 rounded-t-xl text-center">
          <h1 className="text-4xl font-black royal-title mb-2">حجز درس فرعوني خاص 🔱</h1>
          <p className="text-gray-300 text-lg">اختر الوقت المناسب لكِ من جداول المعلمات المعتمدات.</p>
        </div>

        <div className="p-6 md:p-8">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};
