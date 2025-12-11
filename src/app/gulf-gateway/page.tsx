
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { ArrowRight, Globe, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GulfPhrase {
  id: string;
  gulf_phrase: string;
  egyptian_phrase: string;
  explanation?: string;
  category: string;
}

// Group phrases by category
const groupPhrasesByCategory = (phrases: GulfPhrase[] | null) => {
    if (!phrases) return {};
    return phrases.reduce((acc, phrase) => {
        const category = phrase.category || 'مصطلحات عامة';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(phrase);
        return acc;
    }, {} as Record<string, GulfPhrase[]>);
};


export default function GulfGatewayPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const gulfPhrasesCollection = useMemoFirebase(() => {
    return firestore ? collection(firestore, 'gulf_phrases') : null;
  }, [firestore]);

  const { data: phrases, isLoading, error } = useCollection<GulfPhrase>(gulfPhrasesCollection);

  const filteredPhrases = useMemo(() => {
    if (!phrases) return null;
    if (!searchTerm) return phrases;
    return phrases.filter(p => 
        p.gulf_phrase.includes(searchTerm) || 
        p.egyptian_phrase.includes(searchTerm)
    );
  }, [phrases, searchTerm]);

  const phrasesByCategory = useMemo(() => groupPhrasesByCategory(filteredPhrases), [filteredPhrases]);

  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col bg-nile-dark"
      style={{
        direction: 'rtl',
      }}
    >
      <header className="text-center my-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
          <Globe className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          بوابة الخليج
        </h1>
        <p className="text-2xl text-sand-ochre">
          قاموسك لترجمة الكلمات من اللهجات الخليجية إلى العامية المصرية.
        </p>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow">
          <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-ochre" />
              <Input 
                type="text"
                placeholder="ابحث عن كلمة بالخليجي أو المصري..."
                className="w-full bg-nile-dark border-2 border-sand-ochre text-white text-lg p-6 pl-12 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>

        {isLoading && (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
                <p className="text-center text-lg text-sand-ochre ml-4">جاري تحميل قاموس اللهجات...</p>
            </div>
        )}
        {error && <p className="text-center text-lg text-red-400">حدث خطأ أثناء تحميل القاموس: {error.message}</p>}

        {!isLoading && filteredPhrases && Object.keys(phrasesByCategory).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(phrasesByCategory).map(([category, phraseList]) => (
              <div key={category}>
                <h2 className="text-3xl font-bold royal-title text-gold-accent mb-4 border-r-4 border-sand-ochre pr-4">{category}</h2>
                <div className="space-y-4">
                  {phraseList.map(phrase => (
                    <div key={phrase.id} className="dashboard-card p-5 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <div className="text-center">
                                <p className="text-sm text-sand-ochre">خليجي</p>
                                <p className="text-2xl font-bold text-white">{phrase.gulf_phrase}</p>
                            </div>
                            <div className="text-center border-r-2 border-sand-ochre/20">
                                <p className="text-sm text-sand-ochre">مصري</p>
                                <p className="text-2xl font-bold text-white">{phrase.egyptian_phrase}</p>
                            </div>
                        </div>
                        {phrase.explanation && (
                            <div className="mt-4 pt-3 border-t border-sand-ochre/20">
                                <p className="text-sm text-gray-300"><strong className="text-gold-accent">توضيح:</strong> {phrase.explanation}</p>
                            </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !isLoading && (
             <p className="text-center text-sand-ochre py-10 text-lg">
                {searchTerm ? `لم يتم العثور على نتائج للبحث عن "${searchTerm}".` : 'لا توجد عبارات في القاموس حالياً. يمكنك إضافتها من ديوان الإدارة الملكية.'}
            </p>
        )}
      </main>

      <footer className="mt-auto pt-12 text-center text-gray-400 text-sm">
         <Link href="/" className="utility-button px-6 py-2 text-md font-bold rounded-lg flex items-center justify-center mx-auto w-fit">
            <ArrowRight className="ml-2 h-4 w-4" />
            <span>العودة للوحة التحكم الرئيسية</span>
        </Link>
        <p className="mt-4">جميع الحقوق محفوظة لأكاديمية يلا مصري © 2024</p>
      </footer>
    </div>
  );
}

    

    