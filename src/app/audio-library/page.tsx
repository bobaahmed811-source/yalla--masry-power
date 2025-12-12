'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Volume2, Handshake, ShoppingBasket, MessagesSquare, ArrowRight, Library, Loader2 } from 'lucide-react';
import { getSpeechAudio } from '@/app/ai-actions';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

// Define the type for a phrase from Firestore
interface Phrase {
  id: string;
  category: string;
  text: string;
  translation: string;
}

// Group phrases by category
const groupPhrasesByCategory = (phrases: Phrase[] | null) => {
    if (!phrases) return {};
    return phrases.reduce((acc, phrase) => {
        const category = phrase.category || 'متفرقات';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(phrase);
        return acc;
    }, {} as Record<string, Phrase[]>);
};

// Phrase Row Component
const PhraseRow = ({ phrase }: { phrase: Phrase }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handlePlayAudio = async () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
      return;
    }

    setIsLoading(true);
    toast({ title: 'جاري توليد الصوت...', description: 'قد يستغرق هذا بضع ثوانٍ.' });
    try {
        const result = await getSpeechAudio(phrase.text);
        if (result.error || !result.media) {
            throw new Error(result.error || 'لم يتم إرجاع أي مقطع صوتي.');
        }
        const audio = new Audio(result.media);
        audio.play();
        setAudioUrl(result.media); // Cache the audio URL
        toast({ title: 'تم!', description: `تشغيل: "${phrase.text}"` });
    } catch (error) {
        console.error("Error playing audio:", error);
        toast({
            variant: 'destructive',
            title: '❌ خطأ في توليد الصوت',
            description: (error as Error).message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-nile-dark/50 rounded-lg hover:bg-nile-dark/80 transition-colors">
      <div>
        <p className="text-lg font-bold text-white">{phrase.text}</p>
        <p className="text-sm text-sand-ochre">{phrase.translation}</p>
      </div>
      <Button
        size="icon"
        onClick={handlePlayAudio}
        disabled={isLoading}
        className="cta-button rounded-full w-12 h-12 flex-shrink-0 disabled:bg-gray-500 disabled:opacity-50"
        aria-label={`Listen to "${phrase.text}"`}
      >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className="w-6 h-6" />}
      </Button>
    </div>
  );
};


export default function AudioLibraryPage() {
  const firestore = useFirestore();
  const phrasesCollection = useMemoFirebase(() => {
    return firestore ? collection(firestore, 'phrases') : null;
  }, [firestore]);

  const { data: phrases, isLoading, error } = useCollection<Phrase>(phrasesCollection);

  const phrasesByCategory = useMemo(() => groupPhrasesByCategory(phrases), [phrases]);
  const categoryIcons: Record<string, React.ReactNode> = {
    'التحيات والمجاملات': <Handshake className="w-6 h-6 text-gold-accent" />,
    'في السوق': <ShoppingBasket className="w-6 h-6 text-gold-accent" />,
    'تعبيرات يومية': <MessagesSquare className="w-6 h-6 text-gold-accent" />,
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col bg-nile-dark"
      style={{ direction: 'rtl' }}
    >
      <header className="text-center my-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
          <Library className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          خزانة كنوز الأصوات
        </h1>
        <p className="text-xl text-sand-ochre">
          مكتبتك الخاصة للاستماع إلى النطق الصحيح للعامية المصرية.
        </p>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow">
        {isLoading && (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
                <p className="text-center text-lg text-sand-ochre ml-4">جاري تحميل العبارات من السجلات...</p>
            </div>
        )}
        {error && <p className="text-center text-lg text-red-400">حدث خطأ أثناء تحميل العبارات: {error.message}</p>}

        {!isLoading && Object.keys(phrasesByCategory).length > 0 ? (
            <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-6">
            {Object.entries(phrasesByCategory).map(([category, phraseList], index) => (
                <AccordionItem key={category} value={`item-${index}`} className="dashboard-card border-gold-accent/50 rounded-xl overflow-hidden">
                <AccordionTrigger className="p-6 text-xl text-white royal-title hover:no-underline hover:bg-gold-accent/10">
                    <div className="flex items-center gap-4">
                    {categoryIcons[category] || <Volume2 className="w-6 h-6 text-gold-accent" />}
                    <span>{category}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="bg-nile-dark/30 px-6 pb-6">
                    <div className="space-y-4 pt-4 border-t-2 border-sand-ochre/20">
                    {phraseList.map((phrase) => (
                        <PhraseRow key={phrase.id} phrase={phrase} />
                    ))}
                    </div>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        ) : !isLoading && (
             <p className="text-center text-sand-ochre py-10">لا توجد عبارات في المكتبة حالياً. يمكنك إضافتها من ديوان الإدارة الملكية.</p>
        )}
      </main>

      <footer className="mt-auto pt-12 text-center text-gray-400 text-sm">
         <Link href="/" className="utility-button px-6 py-2 text-md font-bold rounded-lg flex items-center justify-center mx-auto w-fit">
            <ArrowRight className="ml-2 h-4 w-4" />
            <span>العودة للوحة التحكم</span>
        </Link>
        <p className="mt-4">جميع الحقوق محفوظة لأكاديمية يلا مصري © 2024</p>
      </footer>
    </div>
  );
}
