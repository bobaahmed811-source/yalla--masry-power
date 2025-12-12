'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle } from 'lucide-react';

const testimonials = [
  { name: 'سارة، الولايات المتحدة', quote: 'أفضل تجربة تعليمية مررت بها! تعلمت اللهجة المصرية في أسابيع قليلة وبدأت أفهم الأفلام.' },
  { name: 'أحمد، ألمانيا', quote: 'المعلمات محترفات والطريقة ممتعة جداً. نظام التحديات يجعل المذاكرة مثل اللعبة.' },
  { name: 'ماريا، إسبانيا', quote: 'الآن أستطيع التحدث مع أصدقائي المصريين بثقة. شكراً أكاديمية يلا مصري!' }
];

const results = [
    { duration: 'بعد أسبوع واحد', outcomes: ['إتقان التحيات اليومية', 'فهم الجمل الأساسية', 'حفظ 50+ كلمة شائعة'] },
    { duration: 'بعد شهر واحد', outcomes: ['إجراء محادثات قصيرة', 'فهم 50% من الأفلام', 'التسوق وطلب الطعام بثقة'] },
    { duration: 'بعد 3 أشهر', outcomes: ['الوصول لمستوى الطلاقة الحوارية', 'فهم النكت المصرية', 'التواصل كأنك من أهل البلد'] }
];

const bonuses = [
    { icon: '📱', title: 'تطبيق الممارسة اليومية', description: '50 عبارة مصرية أساسية مع نطق صوتي لتتدربي عليها كل يوم.' },
    { icon: '📚', title: 'دليل الثقافة المصرية', description: 'ملف شامل يشرح كل ما تحتاجين معرفته عن العادات والتقاليد في مصر.' },
    { icon: '🎯', title: 'خطة تعلم شخصية', description: 'مرشدتك الخاصة ستقوم ببناء خطة مصممة خصيصاً لأهدافك وسرعتك في التعلم.' },
    { icon: '💬', title: 'مجموعة دعم حصرية للسيدات', description: 'تواصلي مع طالبات جادات من جميع أنحاء العالم وشاركهن رحلتك.' }
];

const packages = [
  { name: 'الباقة السريعة', sessions: '4 حصص', duration: 'شهر واحد', price: '$60', price_note: '($15/حصة)', benefits: ['مواد تعليمية أساسية', 'دعم عبر البريد', 'جلسة تقييم المستوى'] },
  { name: 'الباقة المتقدمة', sessions: '8 حصص', duration: 'شهرين', price: '$104', price_note: '($13/حصة)', benefits: ['كل مزايا الباقة السريعة', '+ مجموعة واتساب للمتابعة', '+ جلسات مراجعة إضافية'] },
  { name: 'الباقة الملكية', sessions: '16 حصص', duration: '3 أشهر', price: '$176', price_note: '($11/حصة)', benefits: ['كل مزايا الباقة المتقدمة', '+ أولوية في حجز المواعيد', '+ شهادة إتمام معتمدة', '+ دعم فوري 24/7'] }
];

const faqs = [
  { q: 'هل أحتاج إلى أي معرفة سابقة باللغة العربية؟', a: 'لا على الإطلاق! نبدأ معكِ من الصفر. دروسنا مصممة للمبتدئات تماماً اللواتي لا يعرفن حتى الحروف.' },
  { q: 'كم مدة الحصة التعليمية؟', a: 'كل حصة مدتها 60 دقيقة كاملة من التعلم المكثف، والمحادثة المباشرة، والأنشطة الممتعة.' },
  { q: 'هل الدروس فردية أم جماعية؟', a: 'نقدم كلاً من الدروس الفردية (1-on-1) والجماعية. يمكنكِ اختيار ما يناسب أسلوب تعلمك وميزانيتك.' },
  { q: 'ما الفرق بين اللهجة المصرية والعربية الفصحى؟', a: 'اللهجة المصرية هي اللغة الحقيقية التي يتحدثها 100 مليون مصري في حياتهم اليومية. إنها عملية، ممتعة، وأسهل بكثير من الفصحى!' },
  { q: 'هل يمكنني إلغاء أو إعادة جدولة الحصة؟', a: 'نعم بالتأكيد! نحن نتميز بالمرونة. يمكنكِ إعادة الجدولة قبل 24 ساعة من موعد الحصة مجاناً.' },
  { q: 'كيف أعرف مستواي؟', a: 'لا تقلقي! نقدم جلسة تقييم مجانية تماماً لتحديد مستواكِ بدقة، وبناء خطة تعليمية مخصصة لكِ.' },
  { q: 'هل تقدمون شهادة إتمام؟', a: 'نعم! مع الباقة الملكية، ستحصلين على شهادة إتمام معتمدة من الأكاديمية يمكنك إضافتها إلى سيرتك الذاتية.' }
];

const Logo = () => (
    <div className="flex items-center justify-center space-x-2 space-x-reverse">
        <svg
            className="w-12 h-12 text-gold-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
            <path d="M12 18a6 6 0 0 0-6-6h12a6 6 0 0 0-6 6z"></path>
            <path d="M12 2v4"></path>
            <path d="M12 12v6"></path>
            <path d="M4.93 4.93l2.83 2.83"></path>
            <path d="M16.24 16.24l2.83 2.83"></path>
            <path d="M2 12h4"></path>
            <path d="M18 12h4"></path>
            <path d="M4.93 19.07l2.83-2.83"></path>
            <path d="M16.24 7.76l2.83-2.83"></path>
        </svg>
        <span className="text-4xl md:text-6xl font-black royal-title text-gold-accent">
            يلا مصري
        </span>
    </div>
);

const SIGNUP_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScP9wcegTMCjY_l3B2dMhlRXE3KL32j4-dbqCsio0QiBXuURA/viewform?usp=preview";


export default function LandingPage() {
  return (
    <div className="bg-nile-dark text-white" style={{ direction: 'rtl' }}>
      {/* Hero Section */}
      <header className="py-12 md:py-20 bg-gray-900/50 text-center">
        <div className="max-w-4xl mx-auto px-4">
            <div className="mb-4">
                <Logo />
            </div>
          <p className="text-2xl md:text-3xl text-sand-ochre mb-8">
            بيئة آمنة وممتعة للنساء والأطفال لإتقان اللهجة المصرية
          </p>
          <div className="aspect-w-16 aspect-h-9 max-w-2xl mx-auto rounded-lg overflow-hidden shadow-2xl mb-8 border-4 border-gold-accent">
            <iframe
              src="https://www.youtube.com/embed/TNtIUkPaG30"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-4">🔥 توقفي عن دراسة العربية، وابدئي بعيشها.</p>
          <p className="text-lg md:text-xl mb-6">انضمي الآن وابدئي رحلتك نحو الطلاقة.</p>
          <p className="text-gray-300 max-w-3xl mx-auto mb-10">
            أتقني اللهجة المصرية عبر الإنترنت مع معلمات متخصصات في بيئة آمنة ومخصصة للنساء والأطفال. دروس خصوصية فردية ونظام تحديات "حتشبسوت" الحصري.
          </p>
          
          <Card className="dashboard-card max-w-lg mx-auto text-left">
            <CardHeader>
                <CardTitle className="royal-title text-2xl">🎁 عرض خاص للملكات الجديدات</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2 text-sand-ochre">
                    <li>✅ جلسة تقييم مستوى مجانية تماماً.</li>
                    <li>✅ خطة تعليمية مخصصة لأهدافك.</li>
                    <li>✅ مواد تعليمية حصرية وثرية.</li>
                </ul>
                <Button asChild className="cta-button w-full mt-6 text-lg">
                    <a href={SIGNUP_FORM_URL} target="_blank" rel="noopener noreferrer">
                        احجزي جلستك الفرعونية المجانية الآن!
                    </a>
                </Button>
            </CardContent>
          </Card>
        </div>
      </header>

      {/* Testimonials */}
      <section className="py-16 bg-nile">
          <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center royal-title mb-12">🌟 ماذا تقول طالباتنا</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                      <Card key={index} className="bg-nile-dark border-sand-ochre text-center p-6">
                          <p className="text-lg font-semibold text-white mb-4">"{testimonial.quote}"</p>
                          <p className="font-bold text-sand-ochre">- {testimonial.name}</p>
                      </Card>
                  ))}
              </div>
          </div>
      </section>
      
      {/* Guaranteed Results */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center royal-title mb-12">📊 نتائج مضمونة ترينها بنفسك</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {results.map((result, index) => (
              <div key={index} className="stat-card p-6 rounded-lg text-center">
                <h3 className="text-2xl font-black text-sand-ochre mb-4">{result.duration}</h3>
                <ul className="text-left text-white space-y-2">
                  {result.outcomes.map((outcome, i) => <li key={i}>• {outcome}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign-up Bonus */}
      <section className="py-16 bg-nile-dark">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center royal-title mb-12">🎁 هديتك عند الانضمام للمملكة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bonuses.map((bonus, index) => (
              <div key={index} className="flex items-start space-x-4 space-x-reverse">
                <span className="text-4xl">{bonus.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-sand-ochre">{bonus.title}</h3>
                  <p className="text-gray-300">{bonus.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing */}
      <section className="py-16 bg-nile">
          <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center royal-title mb-2">💰 باقات التعلم الملكية</h2>
              <p className="text-center text-sand-ochre mb-12">اختر باقتك المناسبة من قصر الفراعنة</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                  {packages.map((pkg, index) => (
                      <Card key={index} className={`dashboard-card flex flex-col ${pkg.name === 'الباقة المتقدمة' ? 'border-4 border-gold-accent' : ''}`}>
                          <CardHeader className="text-center">
                              <CardTitle className="text-3xl font-black royal-title">{pkg.name}</CardTitle>
                              <CardDescription className="text-sand-ochre">{pkg.sessions} / {pkg.duration}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                              <p className="text-5xl font-extrabold text-center text-white mb-2">{pkg.price}</p>
                              <p className="text-center text-gray-400 mb-6">{pkg.price_note}</p>
                              <ul className="space-y-2 text-white">
                                  {pkg.benefits.map((benefit, i) => <li key={i} className="flex items-center"><CheckCircle className="w-4 h-4 text-green-400 ml-2" />{benefit}</li>)}
                              </ul>
                          </CardContent>
                          <div className="p-6 pt-0">
                               <Button asChild className="cta-button w-full mt-4 text-lg">
                                  <a href={SIGNUP_FORM_URL} target="_blank" rel="noopener noreferrer">
                                      اختاري هذه الباقة
                                  </a>
                              </Button>
                          </div>
                      </Card>
                  ))}
              </div>
          </div>
      </section>
      
      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center royal-title mb-12">❓ أسئلة شائعة</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-sand-ochre">
                <AccordionTrigger className="text-lg font-bold text-white hover:text-sand-ochre text-right">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base text-right">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact */}
      <footer className="py-12 bg-nile-dark border-t-2 border-gold-accent">
          <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold royal-title mb-8">📞 تواصلي معنا</h2>
              <div className="space-y-4 text-lg text-sand-ochre">
                  <p>📧 <strong>البريد الإلكتروني:</strong> your-email@yallamasry.com</p>
                  <p>💬 <strong>واتساب:</strong> +20 123 456 7890</p>
                  <p>📱 <strong>انستجرام:</strong> @YallaMasryAcademy</p>
                  <p>🎥 <strong>يوتيوب:</strong> Yalla Masry Academy</p>
              </div>
              <div className="mt-10">
                  <p className="text-2xl font-bold text-white mb-4">✨ رحلتك لإتقان اللهجة المصرية تبدأ من هنا!</p>
                  <Button asChild className="cta-button text-xl px-8 py-6 rounded-full">
                      <a href={SIGNUP_FORM_URL} target="_blank" rel="noopener noreferrer">🚀 احجزي جلستك المجانية الآن</a>
                  </Button>
              </div>
              <div className="mt-12 text-sm text-gray-500">
                  <Link href="/" className="hover:text-gold-accent">العودة للوحة التحكم</Link>
              </div>
          </div>
      </footer>
    </div>
  );
}
