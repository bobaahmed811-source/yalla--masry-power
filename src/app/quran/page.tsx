'use client';

import React from 'react';
import Link from 'next/link';

// Reusable component for the section cards
const FeatureCard = ({ icon, title, description, link }: { icon: string; title: string; description: string; link: string; }) => (
  <Link href={link}>
    <div className="dashboard-card text-white p-8 rounded-2xl shadow-lg border-2 border-gold-accent/50 hover:border-gold-accent hover:bg-nile/50 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col items-center text-center">
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gold-accent/10 mb-5 border-2 border-gold-accent/30">
        <i className={`fas ${icon} text-4xl text-gold-accent`}></i>
      </div>
      <h3 className="text-2xl font-bold royal-title mb-3">{title}</h3>
      <p className="text-sand-ochre flex-grow">{description}</p>
    </div>
  </Link>
);


export default function QuranOasisPage() {
  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-nile-dark"
      style={{
        direction: 'rtl',
      }}
    >
      <header className="text-center my-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
            <i className="fas fa-quran text-5xl text-white"></i>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          واحة القرآن والسنة
        </h1>
        <p className="text-xl text-sand-ochre">
          بوابتك لتعلم ونور القرآن الكريم والسنة النبوية الشريفة
        </p>
      </header>

      <main className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="fa-chalkboard-teacher"
            title="معلمو القرآن"
            description="تصفح قائمة بمعلمي ومعلمات القرآن الكريم، واطلع على ملفاتهم الشخصية لحجز الدروس."
            link="/quran/teachers"
          />
          <FeatureCard
            icon="fa-book-open"
            title="روضة السنة النبوية"
            description="استكشف أحاديث النبي صلى الله عليه وسلم وتفسيرها، مع شروحات مبسطة."
            link="/quran/sunnah"
          />
          <FeatureCard
            icon="fa-book-atlas"
            title="المكتبة الإسلامية"
            description="مكتبة رقمية شاملة تحتوي على أمهات الكتب الإسلامية ومصادر علمية موثوقة."
            link="/quran/library"
          />
        </div>
      </main>

       <footer className="mt-auto pt-12 text-center text-gray-400 text-sm">
         <Link href="/" className="utility-button px-6 py-2 text-md font-bold rounded-lg flex items-center justify-center mx-auto w-fit">
            <i className="fas fa-arrow-right ml-2"></i>
            <span>العودة للوحة التحكم الفرعونية</span>
        </Link>
        <p className="mt-4">أكاديمية يلا مصري - قسم العلوم الشرعية</p>
      </footer>
    </div>
  );
}
