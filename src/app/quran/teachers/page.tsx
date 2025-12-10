'use client';

import React from 'react';
import Link from 'next/link';

// Mock data for teachers
const mockTeachers = [
  { id: 1, name: 'الشيخ أيمن سويد', specialty: 'أحكام التجويد والقراءات العشر', photo: 'https://picsum.photos/seed/ayman-swid/200/200', available: true, rate: 45 },
  { id: 2, name: 'الأستاذة فاطمة علي', specialty: 'تحفيظ وتثبيت القرآن الكريم للسيدات', photo: 'https://picsum.photos/seed/fatima-ali/200/200', available: true, rate: 40 },
  { id: 3, name: 'الشيخ محمد العريفي', specialty: 'تفسير وتدبر آيات القرآن الكريم', photo: 'https://picsum.photos/seed/al-arifi/200/200', available: false, rate: 50 },
  { id: 4, name: 'الأستاذ أحمد السيد', specialty: 'تصحيح التلاوة للمبتدئين والأطفال', photo: 'https://picsum.photos/seed/ahmed-sayed/200/200', available: true, rate: 35 },
];

const TeacherCard = ({ teacher }: { teacher: (typeof mockTeachers)[0] }) => (
  <div className="dashboard-card text-white p-6 rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-gold-accent flex flex-col">
    <div className="relative w-32 h-32 mx-auto mb-4">
      <img src={teacher.photo} alt={`صورة ${teacher.name}`} className="rounded-full w-full h-full object-cover border-4 border-gold-accent" />
      <span 
        className={`absolute bottom-1 right-1 block h-5 w-5 rounded-full border-2 border-nile-dark ${teacher.available ? 'bg-green-400' : 'bg-gray-500'}`}
        title={teacher.available ? 'متاح' : 'غير متاح'}
      ></span>
    </div>
    <h3 className="text-xl font-bold royal-title mb-1">{teacher.name}</h3>
    <p className="text-sm text-sand-ochre mb-3 flex-grow">{teacher.specialty}</p>
    <div className="text-lg font-bold text-white mb-4 bg-nile-dark/30 py-1 px-3 rounded-full self-center">${teacher.rate} / ساعة</div>
    <button
      disabled={!teacher.available}
      className="w-full mt-auto cta-button"
    >
      {teacher.available ? 'احجز الآن' : 'غير متاح'}
    </button>
  </div>
);

export default function TeachersPage() {
  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col bg-nile-dark"
      style={{
        direction: 'rtl',
      }}
    >
      <header className="text-center my-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
            <i className="fas fa-chalkboard-teacher text-5xl text-white"></i>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          نخبة معلمي القرآن
        </h1>
        <p className="text-xl text-sand-ochre">
          اختر من بين أفضل المعلمين والمعلمات لبدء رحلتك مع القرآن.
        </p>
      </header>

      <main className="w-full max-w-6xl mx-auto flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockTeachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </main>

      <footer className="mt-auto pt-12 text-center text-gray-400 text-sm">
         <Link href="/quran" className="utility-button px-6 py-2 text-md font-bold rounded-lg flex items-center justify-center mx-auto w-fit">
            <i className="fas fa-arrow-right ml-2"></i>
            <span>العودة إلى واحة القرآن</span>
        </Link>
        <p className="mt-4">جميع الحقوق محفوظة لأكاديمية يلا مصري © 2024</p>
      </footer>
    </div>
  );
}
