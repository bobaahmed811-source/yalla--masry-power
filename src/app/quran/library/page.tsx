'use client';

import React from 'react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { ArrowRight, Library, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  cover?: string;
}

const BookCard = ({ book }: { book: Book }) => {
    const placeholder = PlaceHolderImages.find(p => p.id === `book-${book.id}`);
    const imageUrl = book.cover || placeholder?.imageUrl || 'https://picsum.photos/seed/default-book/300/400';
    const imageHint = placeholder?.imageHint || 'book cover';
    
    return (
      <div className="dashboard-card rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-gold-accent flex flex-col">
        <img src={imageUrl} alt={`غلاف كتاب ${book.title}`} className="w-full h-56 object-cover" data-ai-hint={imageHint} />
        <div className="p-5 flex flex-col flex-grow">
          <p className="text-xs text-sand-ochre font-semibold mb-1">{book.category}</p>
          <h3 className="text-xl font-bold text-white mb-2 truncate royal-title">{book.title}</h3>
          <p className="text-sm text-gray-400 mb-4 flex-grow">المؤلف: {book.author}</p>
          <button className="w-full mt-auto cta-button">
            تصفح الكتاب
          </button>
        </div>
      </div>
    );
}

export default function LibraryPage() {
  const firestore = useFirestore();
  const booksCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'books');
  }, [firestore]);

  const { data: books, isLoading, error } = useCollection<Book>(booksCollection);

  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col bg-nile-dark"
      style={{
        direction: 'rtl',
      }}
    >
      <header className="text-center my-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
          <Library className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          المكتبة الإسلامية الرقمية
        </h1>
        <p className="text-xl text-sand-ochre">
          بحر من العلوم الشرعية بين يديك.
        </p>
      </header>

      <main className="w-full max-w-7xl mx-auto flex-grow">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
            <p className="text-center text-lg text-sand-ochre ml-4">جاري تحميل الكتب...</p>
          </div>
        )}
        {error && <p className="text-center text-lg text-red-400">حدث خطأ أثناء تحميل الكتب: {error.message}</p>}
        
        {books && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
        
        {!isLoading && books?.length === 0 && (
            <p className="text-center text-sand-ochre py-10">لا توجد كتب في المكتبة حالياً.</p>
        )}
      </main>

      <footer className="mt-auto pt-12 text-center text-gray-400 text-sm">
         <Link href="/quran" className="utility-button px-6 py-2 text-md font-bold rounded-lg flex items-center justify-center mx-auto w-fit">
            <ArrowRight className="ml-2 h-4 w-4" />
            <span>العودة إلى واحة القرآن</span>
        </Link>
        <p className="mt-4">جميع الحقوق محفوظة لأكاديمية يلا مصري © 2024</p>
      </footer>
    </div>
  );
}
