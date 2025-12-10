'use client';

import React, { useState, useMemo, useCallback } from 'react';

// === Mock Data (Teachers, Lessons, Reviews) ===
const MOCK_SCHEDULE = [
  { id: 101, date: '2025-11-29', time: '10:00 صباحاً', teacher: 'أحمد الحكيم', subject: 'مقدمة في الهيروغليفية', character: '🦉', price: 150, duration: 45 },
  { id: 102, date: '2025-11-29', time: '04:00 مساءً', teacher: 'نورهان الفرعونية', subject: 'قصص من العصر القديم', character: '👑', price: 180, duration: 60 },
  { id: 103, date: '2025-11-30', time: '11:30 صباحاً', teacher: 'أحمد الحكيم', subject: 'بناء الجملة المصرية', character: '🦉', price: 150, duration: 45 },
  { id: 104, date: '2025-12-01', time: '05:00 مساءً', teacher: 'نورهان الفرعونية', subject: 'تلوين الآثار', character: '👑', price: 180, duration: 60 },
  { id: 105, date: '2025-12-01', time: '07:00 مساءً', teacher: 'يوسف العسكري', subject: 'اللغة العامية للأطفال', character: '🏹', price: 130, duration: 45 },
];


export default function BookingPage() {
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [lessonStatus, setLessonStatus] = useState('unbooked'); // 'unbooked', 'booked', 'completed'
  const [loading, setLoading] = useState(false);
  const [ratingData, setRatingData] = useState({ rating: 0, comment: '' });
  const [isReviewed, setIsReviewed] = useState(false);

  // Classify lessons by date for display
  const scheduleByDate = useMemo(() => {
    return MOCK_SCHEDULE.reduce((acc: Record<string, any[]>, lesson) => {
      const dateKey = lesson.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(lesson);
      return acc;
    }, {});
  }, []);

  // Date formatting function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString + 'T12:00:00').toLocaleDateString('ar-EG', options);
    } catch (e) {
      return dateString;
    }
  };

  // Click handler for the booking button
  const handleBooking = useCallback(() => {
    if (!selectedLesson) return;

    setLoading(true);
    // Simulate a virtual booking process
    setTimeout(() => {
      setLoading(false);
      setLessonStatus('booked');
      // Simulate lesson completion after a short period
      setTimeout(() => {
          setLessonStatus('completed');
      }, 3000); // 3 seconds to simulate lesson completion

    }, 1500);

  }, [selectedLesson]);

  // Submit the review
  const submitReview = useCallback(() => {
    if (ratingData.rating === 0) {
      alert('الرجاء اختيار تقييم بالنجوم قبل الإرسال.'); // We use a simple alert here for ease of display
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsReviewed(true);
      // In a real application, the review is sent to Firestore
    }, 1000);
  }, [ratingData]);

  // Lesson card component
  const LessonCard = ({ lesson }: { lesson: any }) => (
    <div
      onClick={() => {
        if (lessonStatus === 'unbooked') {
          setSelectedLesson(lesson);
        }
      }}
      className={`p-4 rounded-xl shadow-lg border-4 transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative 
        ${selectedLesson?.id === lesson.id && lessonStatus === 'unbooked'
          ? 'bg-[#FFD700] border-[#0d284e] transform scale-105'
          : 'bg-[#d6b876] border-transparent hover:border-[#0d284e]'
        }
        ${lessonStatus !== 'unbooked' ? 'opacity-60 cursor-default' : ''}
      `}
    >
      {/* Teacher's visual symbol */}
      <div className="text-4xl p-3 mb-2 rounded-full bg-[#0d284e] border-4 border-[#FFD700] leading-none w-16 h-16 flex items-center justify-center shadow-md">
        <span role="img" aria-label={lesson.teacher}>{lesson.character}</span>
      </div>

      <h3 className="text-xl font-extrabold text-[#0d284e] truncate mt-1 w-full">{lesson.subject}</h3>
      
      {/* Price and duration */}
      <div className="flex justify-around w-full mt-2 border-t border-b border-gray-400 py-1">
        <p className="text-sm font-semibold text-green-700">
            <i className="fas fa-money-bill-wave ml-1"></i> {lesson.price} ج.م
        </p>
        <p className="text-sm font-semibold text-[#1c3d6d]">
            <i className="fas fa-clock ml-1"></i> {lesson.duration} دقيقة
        </p>
      </div>
      
      <p className="text-sm text-[#1c3d6d] mt-2">المعلم: <span className="font-bold">{lesson.teacher}</span></p>
    </div>
  );

  // Review interface
  const ReviewSection = () => (
    <div className="bg-white p-8 rounded-xl shadow-2xl booking-card border-green-500 border-4 text-center">
      <h2 className="text-3xl font-extrabold text-green-700 mb-4">كيف كانت تجربتك؟ ✨</h2>
      <p className="text-lg text-gray-700 mb-6">الرجاء تقييم أداء المعلم <span className="font-extrabold">{selectedLesson.teacher}</span> في درس "{selectedLesson.subject}".</p>
      
      {!isReviewed ? (
        <>
            {/* Star system */}
            <div className="flex justify-center text-4xl mb-6 space-x-2 space-x-reverse">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                        key={star}
                        onClick={() => setRatingData(prev => ({ ...prev, rating: star }))}
                        className={`cursor-pointer transition-colors ${star <= ratingData.rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400`}
                    >
                        {star <= ratingData.rating ? <i className="fas fa-star"></i> : <i className="far fa-star"></i>}
                    </span>
                ))}
            </div>

            <textarea
                value={ratingData.comment}
                onChange={(e) => setRatingData(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg h-24 focus:ring-[#17365e] focus:border-[#17365e] text-right"
                placeholder="أخبرنا عن تجربتك (اختياري)..."
            />
            
            <button
                onClick={submitReview}
                disabled={loading || ratingData.rating === 0}
                className="mt-6 w-full py-3 bg-[#0d284e] text-white font-bold rounded-lg shadow-xl hover:bg-[#17365e] transition-colors transform hover:scale-[1.01] disabled:bg-gray-400 flex items-center justify-center"
            >
                {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
        </>
      ) : (
          <div className="bg-yellow-50 p-6 rounded-lg text-lg text-yellow-800 font-bold">
            شكراً جزيلاً! تم تسجيل تقييمك بنجاح. سنستخدم ملاحظاتك لتحسين جودة التعليم.
          </div>
      )}
    </div>
  );
  
  // Booking confirmation and switch to completion mode screen
  const BookingConfirmedScreen = () => (
    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-8 rounded-lg shadow-md">
      {lessonStatus === 'booked' ? (
        <>
            <h3 className="text-2xl font-bold mb-2">تم الحجز بنجاح! 🎉</h3>
            <p className="text-lg">
                تم تأكيد حجزك لدرس "{selectedLesson.subject}" مع المعلم <span className="font-extrabold">{selectedLesson.teacher}</span>.
            </p>
            <p className="mt-2 text-sm">سيتم إرسال رابط الدرس إليك قبل الموعد. (سيتم محاكاة اكتمال الدرس قريباً...)</p>
        </>
      ) : (
          <h3 className="text-2xl font-bold mb-2">الدرس اكتمل! ✅</h3>
      )}
    </div>
  );


  // Logic for displaying the main content
  let mainContent;

  if (lessonStatus === 'completed') {
    mainContent = <ReviewSection />;
  } else if (lessonStatus === 'booked') {
      mainContent = (
        <>
            <BookingConfirmedScreen />
            {/* Other information can be added here after booking */}
        </>
      );
  } else {
    // unbooked state (show booking schedule)
    mainContent = (
      <>
        <h2 className="text-2xl font-bold text-[#0d284e] mb-4">المواعيد المتاحة:</h2>
        <div className="space-y-6">
          {Object.keys(scheduleByDate).map(dateKey => (
            <div key={dateKey} className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm">
              <h3 className="text-xl font-extrabold text-[#17365e] mb-3 border-b pb-2">
                {formatDate(dateKey)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduleByDate[dateKey].map(lesson => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Booking area */}
        <div className="mt-8 p-6 bg-[#f0f4f8] rounded-xl shadow-inner">
          <h3 className="text-xl font-bold text-[#0d284e] mb-4">ملخص الحجز</h3>
          {selectedLesson ? (
            <div className="text-lg text-gray-700">
              <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
                  <div className="text-3xl">{selectedLesson.character}</div>
                  <p className="font-extrabold text-[#17365e] text-2xl">{selectedLesson.teacher}</p>
              </div>
              
              <p>الدرس المختار: <span className="font-extrabold text-[#17365e]">{selectedLesson.subject}</span></p>
              <p className="mt-1">التاريخ: <span className="font-extrabold text-[#17365e]">{formatDate(selectedLesson.date)}</span></p>
              <p className="mt-1">الوقت: <span className="font-extrabold text-[#17365e]">{selectedLesson.time}</span></p>
              
              <div className="mt-4 p-3 bg-white rounded-lg shadow-md border-2 border-green-500 flex justify-between items-center">
                  <p className="font-extrabold text-xl text-[#0d284e]">التكلفة النهائية:</p>
                  <p className="font-extrabold text-2xl text-green-700">{selectedLesson.price} ج.م</p>
              </div>

              <button
                onClick={handleBooking}
                disabled={loading}
                className="mt-6 w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow-xl hover:bg-green-700 transition-colors transform hover:scale-[1.01] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <i className="fas fa-calendar-check ml-2"></i> تأكيد حجز الدرس
                  </>
                )}
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">الرجاء اختيار درس من الجدول أعلاه للمتابعة.</p>
          )}
        </div>
      </>
    );
  }


  return (
    <div className="min-h-screen bg-[#0d284e] p-4 md:p-8 flex items-start justify-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl booking-card" style={{ direction: 'rtl' }}>
        
        <div className="p-6 md:p-8 border-b border-gray-200 bg-[#17365e] rounded-t-xl text-center">
          <h1 className="text-4xl font-extrabold text-[#FFD700] mb-2">حجز درس فرعوني خاص 🔱</h1>
          <p className="text-gray-300 text-lg">اختر الوقت المناسب لابنك/ابنتك لتبدأ رحلة التعلم.</p>
        </div>

        <div className="p-6 md:p-8">
          {mainContent}
        </div>
      </div>
    </div>
  );
};
