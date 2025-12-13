
'use client';

import { Crown } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-nile-dark text-white p-4 md:p-8 flex items-center justify-center"
      style={{ direction: 'rtl' }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <Crown className="w-24 h-24 text-gold-accent mx-auto mb-6" />
        <h1 className="text-5xl md:text-7xl font-black royal-title mb-4">
          مملكة يلا مصري
        </h1>
        <p className="text-2xl text-sand-ochre mb-10 max-w-2xl mx-auto">
          تم إعادة تأسيس المملكة بنجاح. البوابة الآن جاهزة للعمل.
        </p>
        <p className="text-lg text-gray-300">
          هذه هي صفحتك الرئيسية الجديدة. يمكنك الآن البدء في إضافة المحتوى والتحديات من جديد.
        </p>
        <div className="mt-8">
            <Link href="/login" className="cta-button text-lg px-8 py-4">
                الانتقال إلى بوابة الدخول
            </Link>
        </div>
      </div>
    </div>
  );
}
