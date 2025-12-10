'use client';

import React from 'react';
import Link from 'next/link';

// Mock data for Hadith
const mockHadiths = [
  { id: 1, text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى...", source: 'صحيح البخاري', topic: 'الإخلاص' },
  { id: 2, text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.", source: 'سنن الترمذي', topic: 'فضل العلم' },
  { id: 3, text: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.", source: 'صحيح مسلم', topic: 'حقوق المسلم' },
  { id: 4, text: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ.", source: 'صحيح البخاري', topic: 'الأخلاق' },
  { id: 5, text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.", source: 'صحيح البخاري', topic: 'فضل القرآن' },
];

const HadithCard = ({ hadith }: { hadith: (typeof mockHadiths)[0] }) => (
  <div className="dashboard-card text-white rounded-xl shadow-lg p-6 border-l-4 border-gold-accent transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
    <p className="text-lg md:text-xl font-serif mb-4 leading-relaxed text-sand-ochre">"{hadith.text}"</p>
    <div className="flex justify-between items-center border-t border-sand-ochre/20 pt-4">
        <span className="text-xs font-bold text-gold-accent bg-nile-dark/50 px-3 py-1 rounded-full">{hadith.topic}</span>
        <span className="text-sm text-gray-400">{hadith.source}</span>
    </div>
  </div>
);

export default function SunnahPage() {
  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col bg-nile-dark"
      style={{
        direction: 'rtl',
      }}
    >
      <header className="text-center my-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
          <i className="fas fa-book-open text-5xl text-white"></i>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          روضة السنة النبوية
        </h1>
        <p className="text-xl text-sand-ochre">
          قطوف من كلام سيد المرسلين صلى الله عليه وسلم.
        </p>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow">
        <div className="space-y-6">
          {mockHadiths.map(hadith => (
            <HadithCard key={hadith.id} hadith={hadith} />
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
