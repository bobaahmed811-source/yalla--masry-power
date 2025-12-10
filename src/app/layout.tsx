
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  // Use a template to dynamically set the title for each page
  title: {
    template: '%s | Yalla Masry Academy',
    default: 'Yalla Masry Academy - The Royal Way to Learn Egyptian Arabic',
  },
  description: 'The premier online academy for mastering Egyptian Colloquial Arabic through interactive challenges, live tutors, and a vibrant community. Start your journey to fluency today!',
  keywords: ['Learn Egyptian Arabic', 'Egyptian Colloquial Arabic', 'ECA', 'Study Arabic in Egypt', 'Egyptian Dialect', 'يلا مصري', 'تعلم العامية المصرية'],
  
  // Open Graph metadata for social sharing (Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'Yalla Masry Academy: The Royal Way to Learn Egyptian Arabic',
    description: 'The fun and effective way to master the Egyptian dialect with interactive challenges, live tutors, and a vibrant community.',
    type: 'website',
    url: 'https://www.yallamasry.com', // To be replaced with the actual domain
    images: [
      {
        url: '/og-image.png', // To be created. Recommended size: 1200x630
        width: 1200,
        height: 630,
        alt: 'Yalla Masry Academy Royal Banner',
      },
    ],
    siteName: 'Yalla Masry Academy',
  },

  // Twitter specific metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Yalla Masry Academy: Master the Egyptian Dialect',
    description: 'The fun, gamified platform for mastering Egyptian Colloquial Arabic.',
    // creator: '@YourTwitterHandle', // To be added later
    images: ['/twitter-image.png'], // To be created. Recommended size: 1200x675
  },
  
  // Other important metadata
  metadataBase: new URL('https://www.yallamasry.com'), // Replace with actual domain
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
