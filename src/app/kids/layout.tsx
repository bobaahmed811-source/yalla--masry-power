'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Sparkles } from 'lucide-react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function KidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="min-h-screen kids-bg flex justify-center items-center text-white" style={{ direction: 'rtl' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-accent animate-spin mx-auto" />
          <p className="text-xl text-sand-ochre mt-4 font-cairo">
            جاري تجهيز مملكة الصغار...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen kids-bg text-white" style={{ direction: 'rtl' }}>
        <header className="sticky top-0 z-10 bg-nile-dark/80 backdrop-blur-sm p-4 shadow-lg shadow-black/20">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/kids" className="flex items-center gap-3 group">
                    <Sparkles className="w-8 h-8 text-yellow-300 group-hover:scale-110 transition-transform" />
                    <h1 className="text-3xl kids-title">
                        أكاديمية الصغار
                    </h1>
                </Link>
                <Button asChild variant="outline" className="utility-button bg-nile/50 border-sand-ochre/50 hover:bg-nile">
                    <Link href="/">
                        <Home className="ml-2 h-4 w-4" />
                        الديوان الملكي
                    </Link>
                </Button>
            </div>
        </header>
        <main className="p-4 md:p-8">
             <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
    </div>
  );
}
