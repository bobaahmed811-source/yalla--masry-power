
'use client';

import React, { useState } from 'react';
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

// Mock Data for the Audio Library
const audioLibraryData = [
  {
    category: 'التحيات والمجاملات',
    icon: <Handshake className="w-6 h-6 text-gold-accent" />,
    phrases: [
      { id: 'g1', text: 'صباح الخير', translation: 'Good morning' },
      { id: 'g2', text: 'مساء الخير', translation: 'Good evening' },
      { id: 'g3', text: 'ازيك؟ عامل ايه؟', translation: "How are you? (to a male)" },
      { id: 'g4', text: 'انا كويس، الحمد لله', translation: "I'm fine, thank God" },
      { id: 'g5', text: 'من فضلك / لو سمحت', translation: 'Please' },
    ],
  },
  {
    category: 'في السوق',
    icon: <ShoppingBasket className="w-6 h-6 text-gold-accent" />,
    phrases: [
      { id: 'm1', text: 'بكام ده؟', translation: 'How much is this?' },
      { id: 'm2', text: 'عايز كيلو طماطم', translation: 'I want a kilo of tomatoes' },
      { id: 'm3', text: 'ممكن كيس؟', translation: 'Can I have a bag?' },
      { id: 'm4', text: 'شكراً، الحساب كام؟', translation: 'Thanks, how much is the total?' },
    ],
  },
  {
    category: 'تعبيرات يومية',
    icon: <MessagesSquare className="w-6 h-6 text-gold-accent" />,
    phrases: [
      { id: 'd1', text: 'يلا بينا', translation: "Let's go" },
      { id: 'd2', text: 'معلش', translation: "Sorry / It's okay / Never mind" },
      { id: 'd3', text: 'خلاص، تمام', translation: "Okay, fine" },
      { id: 'd4', text: 'مش فاهم', translation: "I don't understand" },
    ],
  },
];

// Phrase Row Component
const PhraseRow = ({ phrase }: { phrase: { id: string, text: string, translation: string }}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayAudio = async () => {
    setIsLoading(true);
    toast({ title: 'جاري توليد الصوت...', description: 'قد يستغرق هذا بضع ثوانٍ.' });
    try {
        const result = await getSpeechAudio(phrase.text);
        if (result.error || !result.media) {
            throw new Error(result.error || 'لم يتم إرجاع أي مقطع صوتي.');
        }
        const audio = new Audio(result.media);
        audio.play();
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
        <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-6">
          {audioLibraryData.map((category, index) => (
            <AccordionItem key={category.category} value={`item-${index}`} className="dashboard-card border-gold-accent/50 rounded-xl overflow-hidden">
              <AccordionTrigger className="p-6 text-xl text-white royal-title hover:no-underline hover:bg-gold-accent/10">
                <div className="flex items-center gap-4">
                  {category.icon}
                  <span>{category.category}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-nile-dark/30 px-6 pb-6">
                <div className="space-y-4 pt-4 border-t-2 border-sand-ochre/20">
                  {category.phrases.map((phrase) => (
                    <PhraseRow key={phrase.id} phrase={phrase} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
