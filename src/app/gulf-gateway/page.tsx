
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Construction } from 'lucide-react';

export default function GulfGatewayPage() {
  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center bg-nile-dark text-center"
      style={{
        direction: 'rtl',
      }}
    >
      <header className="my-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
          <Globe className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          بوابة الخليج
        </h1>
        <p className="text-2xl text-sand-ochre">
          قريباً... نافذتك على عالم اللهجات الخليجية.
        </p>
      </header>

      <main className="w-full max-w-2xl mx-auto flex-grow bg-nile-dark/50 dashboard-card p-8 rounded-2xl">
        <div className="flex items-center justify-center gap-4 text-yellow-400 mb-6">
            <Construction className="w-12 h-12" />
            <h2 className="text-3xl font-bold">تحت الإنشاء</h2>
            <Construction className="w-12 h-12" />
        </div>
        <p className="text-lg text-gray-300">
            يعمل فريقنا بجد لبناء هذا القسم الجديد والمثير. استعدي لرحلة جديدة لتعلم اللهجات الخليجية بأحدث وأمتع الطرق.
            <br/><br/>
            <strong>ترقبي الإعلان الرسمي قريباً!</strong>
        </p>
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

    