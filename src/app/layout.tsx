
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: {
    template: '%s | Yalla Masry Academy',
    default: 'Yalla Masry Academy - The Royal Way to Learn Egyptian Arabic',
  },
  description: 'The premier online academy for mastering Egyptian Colloquial Arabic through interactive challenges, live tutors, and a vibrant community. Start your journey to fluency today!',
  keywords: ['Learn Egyptian Arabic', 'Egyptian Colloquial Arabic', 'ECA', 'Study Arabic in Egypt', 'Egyptian Dialect', 'يلا مصري', 'تعلم العامية المصرية'],
  openGraph: {
    title: 'Yalla Masry Academy',
    description: 'The fun and effective way to master the Egyptian dialect.',
    type: 'website',
    url: 'https://www.yallamasry.com', // To be replaced with the actual domain
    images: [
      {
        url: '/og-image.png', // To be created
        width: 1200,
        height: 630,
        alt: 'Yalla Masry Academy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yalla Masry Academy',
    description: 'Master Egyptian Colloquial Arabic with our unique, gamified platform.',
    // creator: '@YourTwitterHandle', // To be added later
    images: ['/twitter-image.png'], // To be created
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&family=El+Messiri:wght@400;700;900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
