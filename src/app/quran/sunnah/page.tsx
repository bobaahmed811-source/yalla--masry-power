'use client';

import React from 'react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';

interface Hadith {
  id: string;
  text: string;
  source: string;
  topic: string;
}

const HadithCard = ({ hadith }: { hadith: Hadith }) => (
  <div className="dashboard-card text-white rounded-xl shadow-lg p-6 border-l-4 border-gold-accent transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
    <p className="text-lg md:text-xl font-serif mb-4 leading-relaxed text-sand-ochre">"{hadith.text}"</p>
    <div className="flex justify-between items-center border-t border-sand-ochre/20 pt-4">
        <span className="text-xs font-bold text-gold-accent bg-nile-dark/50 px-3 py-1 rounded-full">{hadith.topic}</span>
        <span className="text-sm text-gray-400">{hadith.source}</span>
    </div>
  </div>
);

export default function SunnahPage() {
  const firestore = useFirestore();
  const hadithsCollection = useMemoFirebase(() => {
    return firestore ? collection(firestore, 'hadiths') : null;
  }, [firestore]);

  const { data: hadiths, isLoading, error } = useCollection<Hadith>(hadithsCollection);

  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col bg-nile-dark"
      style={{
        direction: 'rtl',
      }}
    >
      <header className="text-center my-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
          <BookOpen className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          روضة السنة النبوية
        </h1>
        <p className="text-xl text-sand-ochre">
          قطوف من كلام سيد المرسلين صلى الله عليه وسلم.
        </p>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
            <p className="text-center text-lg text-sand-ochre ml-4">جاري تحميل الأحاديث...</p>
          </div>
        )}
        {error && <p className="text-center text-lg text-red-400">حدث خطأ أثناء تحميل الأحاديث: {error.message}</p>}
        
        {hadiths && hadiths.length > 0 ? (
          <div className="space-y-6">
            {hadiths.map(hadith => (
              <HadithCard key={hadith.id} hadith={hadith} />
            ))}
          </div>
        ) : !isLoading && (
            <p className="text-center text-sand-ochre py-10">لا توجد أحاديث في الروضة حالياً.</p>
        )}
      </main>

       <footer className="mt-auto pt-12 text-center text-gray-400 text-sm">
         <Link href="/quran" className="utility-button px-6 py-2 text-md font-bold rounded-lg flex items-center justify-center mx-auto w-fit">
            <ArrowRight className="ml-2 h-4 w-4" />
            <span>العودة إلى واحة القرآن</span>
        </Link>
        <p className="mt-4">جميع الحقوق محفوظة لأكاديمية يلا مصري © 2024</p>
      </footer>
    </div>
  );
}
