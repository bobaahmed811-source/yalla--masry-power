'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock data for a single lesson - in a real app, this would be fetched from Firestore
const mockLessonData = {
  '1-2': { // Corresponds to level 1, module 2
    title: 'الوحدة 2: في السوق',
    videoUrl: 'https://www.youtube.com/embed/ABCDEFG', // Placeholder video ID
    content: `
<h3 class="text-2xl font-bold text-sand-ochre mb-4">مفردات أساسية في السوق:</h3>
<ul class="list-disc list-inside space-y-2 mb-6">
  <li><strong>بكام ده؟</strong> (Bikam da?) - How much is this?</li>
  <li><strong>عايز / عايزة...</strong> (Aayiz / Aayza) - I want...</li>
  <li><strong>كيلو</strong> (Kilo) - Kilogram</li>
  <li><strong>طماطم</strong> (Tamatem) - Tomatoes</li>
  <li><strong>خيار</strong> (Khiyar) - Cucumber</li>
  <li><strong>فلوس</strong> (Feloos) - Money</li>
  <li><strong>حساب</strong> (Hesab) - The bill</li>
</ul>
<h3 class="text-2xl font-bold text-sand-ochre mb-4">حوار نموذجي:</h3>
<div class="space-y-3 p-4 bg-nile-dark/50 rounded-lg">
  <p><strong>أنت:</strong> صباح الخير، بكام كيلو الطماطم؟</p>
  <p><strong>البائع:</strong> صباح النور، الكيلو بعشرة جنيه.</p>
  <p><strong>أنت:</strong> تمام، عايز اتنين كيلو.</p>
  <p><strong>البائع:</strong> من عنيا. أي خدمة تانية؟</p>
</div>
    `,
    nextLessonId: '1-3',
    prevLessonId: '1-1',
  },
   'default': {
    title: 'الدرس غير موجود',
    videoUrl: '',
    content: '<p>عفواً، هذا الدرس غير متوفر حالياً. يرجى العودة إلى مسار التعلم.</p>',
    nextLessonId: null,
    prevLessonId: null,
  }
};

type LessonKey = keyof typeof mockLessonData;

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  
  // A simple way to handle potential lesson IDs for mock purposes
  const lesson = mockLessonData[lessonId as LessonKey] || mockLessonData['default'];

  const handleNavigate = (id: string | null) => {
    if (id) {
      router.push(`/learning-path/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-nile-dark text-white p-4 md:p-8" style={{ direction: 'rtl' }}>
      <main className="max-w-4xl mx-auto">
        <div className="dashboard-card p-6 md:p-8 rounded-2xl">
          
          <header className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold royal-title mb-3">
              {lesson.title}
            </h1>
             <Link href="/learning-path" className="text-sm text-sand-ochre hover:text-gold-accent transition-colors">
                &larr; العودة إلى مسار التعلم
            </Link>
          </header>

          {/* Video Player */}
          <section className="mb-8">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-2xl border-4 border-gold-accent">
               {lesson.videoUrl ? (
                 <iframe
                    src={lesson.videoUrl}
                    title="Lesson Video Player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                ></iframe>
               ) : (
                <div className="w-full h-full bg-nile flex items-center justify-center">
                    <p className="text-sand-ochre">لا يوجد فيديو لهذا الدرس.</p>
                </div>
               )}
            </div>
          </section>

          {/* Lesson Content */}
          <section className="prose prose-invert max-w-none text-white text-lg leading-loose" dangerouslySetInnerHTML={{ __html: lesson.content }} />

          {/* Navigation */}
          <footer className="mt-10 pt-6 border-t-2 border-sand-ochre/20 flex justify-between items-center">
            <Button onClick={() => handleNavigate(lesson.prevLessonId)} disabled={!lesson.prevLessonId} className="utility-button">
              <ArrowRight className="ml-2 h-5 w-5" />
              الدرس السابق
            </Button>
            <Button onClick={() => handleNavigate(lesson.nextLessonId)} disabled={!lesson.nextLessonId} className="cta-button">
              الدرس التالي
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </footer>
        </div>
      </main>
    </div>
  );
}
