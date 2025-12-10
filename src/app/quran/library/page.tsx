'use client';

import React from 'react';
import Link from 'next/link';

// Mock data for books
const mockBooks = [
  { id: 1, title: 'صحيح البخاري', author: 'الإمام البخاري', description: 'أصح الكتب بعد القرآن الكريم، يضم الأحاديث النبوية الصحيحة.', category: 'الحديث الشريف', cover: 'https://picsum.photos/seed/bukhari/300/400' },
  { id: 2, title: 'تفسير ابن كثير', author: 'ابن كثير الدمشقي', description: 'من أشهر كتب تفسير القرآن الكريم بالمأثور.', category: 'التفسير', cover: 'https://picsum.photos/seed/ibn-kathir/300/400' },
  { id: 3, title: 'الرحيق المختوم', author: 'صفي الرحمن المباركفوري', description: 'بحث في السيرة النبوية على صاحبها أفضل الصلاة والسلام.', category: 'السيرة النبوية', cover: 'https://picsum.photos/seed/raheeq/300/400' },
  { id: 4, title: 'رياض الصالحين', author: 'الإمام النووي', description: 'مجموعة من الأحاديث النبوية مقسمة حسب الأبواب.', category: 'الحديث الشريف', cover: 'https://picsum.photos/seed/riyadh/300/400' },
  { id: 5, title: 'بداية المجتهد ونهاية المقتصد', author: 'ابن رشد', description: 'كتاب في الفقه المقارن، يعرض آراء المذاهب المختلفة.', category: 'الفقه', cover: 'https://picsum.photos/seed/ibn-rushd/300/400' },
  { id: 6, title: 'الأربعون النووية', author: 'الإمام النووي', description: 'متن يضم اثنين وأربعين حديثاً نبوياً في مختلف جوانب الدين.', category: 'الحديث الشريف', cover: 'https://picsum.photos/seed/nawawi/300/400' },
];

const BookCard = ({ book }: { book: (typeof mockBooks)[0] }) => (
  <div className="dashboard-card rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-gold-accent flex flex-col">
    <img src={book.cover} alt={`غلاف كتاب ${book.title}`} className="w-full h-56 object-cover" />
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

export default function LibraryPage() {
  return (
    <div 
      className="min-h-screen p-4 md:p-8 flex flex-col bg-nile-dark"
      style={{
        direction: 'rtl',
      }}
    >
      <header className="text-center my-12">
        <div className="inline-block p-4 bg-nile rounded-full shadow-lg mb-4 border-2 border-gold-accent">
          <i className="fas fa-book-atlas text-5xl text-white"></i>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 royal-title">
          المكتبة الإسلامية الرقمية
        </h1>
        <p className="text-xl text-sand-ochre">
          بحر من العلوم الشرعية بين يديك.
        </p>
      </header>

      <main className="w-full max-w-7xl mx-auto flex-grow">
        {/* TODO: Add search and filter controls here */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {mockBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </main>

      <footer className="mt-auto pt-12 text-center text-gray-400 text-sm">
         <Link href="/quran" className="utility-button px-6 py-2 text-md font-bold rounded-lg flex items-center justify-center mx-auto w-fit">
            <i className="fas fa-arrow-right ml-2"></i>
            <span>العودة إلى واحة القرآن</span>
        </Link>
        <p className="mt-4">جميع الحقوق محفوظة لأكاديمية يلا مصري © 2024</p>
      </footer>
    </div>
  );
}
