
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  // Use a template to dynamically set the title for each page
  title: {
    template: '%s | Yalla Masry Academy',
    default: 'Yalla Masry Academy - The Royal Way for Women & Children to Learn Egyptian Arabic',
  },
  description: 'The premier online academy for women and children to master Egyptian Colloquial Arabic with expert female tutors, interactive challenges, and a vibrant, safe community.',
  keywords: ['Learn Egyptian Arabic for women', 'Egyptian Colloquial Arabic for children', 'ECA for women', 'Study Arabic online', 'Female Arabic tutors', 'Egyptian Dialect for kids', 'يلا مصري', 'تعلم العامية المصرية للنساء والأطفال'],
  
  // Open Graph metadata for social sharing (Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'Yalla Masry Academy: The Royal Way for Women & Children to Learn Egyptian Arabic',
    description: 'The fun, safe, and effective way for women and children to master the Egyptian dialect with expert female tutors.',
    type: 'website',
    url: 'https://www.yallamasry.com', // To be replaced with the actual domain
    images: [
      {
        url: '/og-image.png', // To be created. Recommended size: 1200x630
        width: 1200,
        height: 630,
        alt: 'Yalla Masry Academy Royal Banner for Women and Children',
      },
    ],
    siteName: 'Yalla Masry Academy',
  },

  // Twitter specific metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Yalla Masry Academy: Master the Egyptian Dialect for Women & Children',
    description: 'The fun, gamified platform for women and kids to master Egyptian Colloquial Arabic.',
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
  // PWA manifest
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&family=El+Messiri:wght@400;700;900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0d284e" />
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
