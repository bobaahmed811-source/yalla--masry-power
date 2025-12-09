import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function CourseHeader({ title }: { title: string }) {
  return (
    <div className="mb-6">
      <Button asChild variant="ghost" className="mb-2 -ml-4">
        <Link href="/">
          <ArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
      </Button>
      <h1 className="text-4xl font-bold font-headline">{title}</h1>
    </div>
  );
}
