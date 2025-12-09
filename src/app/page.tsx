'use client';

import { MainLayout } from '@/components/layout/main-layout';

export default function HomePage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-4xl font-bold font-headline">Welcome to Your Academy</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Let's build your vision together.
        </p>
        <p className="mt-2 text-md text-muted-foreground">
          Tell me what you'd like to see on this page.
        </p>
      </div>
    </MainLayout>
  );
}
