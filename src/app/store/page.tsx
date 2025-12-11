'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query, where } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, PiggyBank, ShoppingCart, History, ArrowLeft, Loader2, Ankh, ScrollText, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


// Define the structure for a payment message
type PaymentMessage = {
  type: 'success' | 'error' | 'info' | null;
  title: string;
  body: string;
};

// Define the structure for a purchase document
interface Purchase {
    id: string;
    productId: string;
    price: number;
    purchaseDate: string;
    status: 'Awaiting Payment' | 'Completed' | 'Refunded';
    isGift?: boolean;
    recipientEmail?: string;
}

export default function StorePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [paymentMessage, setPaymentMessage] = useState<PaymentMessage | null>(null);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftProduct, setGiftProduct] = useState('wisdom_papyrus');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appId = 'yalla-masry-academy'; // This ID would typically come from your environment configuration

  const purchasesCollectionPath = `/artifacts/${appId}/public/data/digital_purchases`;

  // Firestore query for the user's purchase history
  const userPurchasesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, purchasesCollectionPath), where('userId', '==', user.uid));
  }, [firestore, user, purchasesCollectionPath]);

  const { data: purchases, isLoading: isLoadingPurchases } = useCollection<Purchase>(userPurchasesQuery);


  const buyProduct = async (productName: string, price: number, isGift: boolean = false, recipientEmail: string | null = null) => {
    setIsSubmitting(true);
    setPaymentMessage(null);

    if (!user || !firestore) {
      setPaymentMessage({ 
        type: 'info', 
        title: 'محتوى محمي للملوك فقط', 
        body: 'لا يمكن إتمام عملية الشراء لأنكِ لم تسجلي دخولك. يرجى <a href="/login" class="font-bold underline text-gold-accent">تسجيل الدخول</a> أولاً لتتمكني من الحصول على كنوز المملكة.' 
      });
      setIsSubmitting(false);
      return;
    }

    if (isGift && (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail))) {
        toast({ variant: 'destructive', title: 'خطأ في بيانات الهدية', description: 'الرجاء إدخال بريد إلكتروني صحيح للشخص الذي ستهديه المنتج.' });
        setIsSubmitting(false);
        return;
    }

    const purchaseData: any = {
      userId: user.uid,
      productId: productName,
      price: price,
      status: 'Awaiting Payment',
      purchaseDate: new Date().toISOString(),
      isGift: isGift,
    };
    if (isGift) {
        purchaseData.recipientEmail = recipientEmail;
    }
    
    // Non-blocking write to Firestore
    addDocumentNonBlocking(collection(firestore, purchasesCollectionPath), purchaseData);

    // Display optimistic success message immediately
    const successMessageBody = isGift 
      ? `<strong>تم تسجيل طلبك بنجاح!</strong><br/><br/>
         شكراً لك على كرمك! طلبك لإهداء <strong>"${productName}"</strong> إلى ${recipientEmail} قيد المراجعة.<br/><br/>
         سيتم التواصل معك عبر بريدك لإتمام الدفع، وبعدها سنقوم بإرسال الهدية بالنيابة عنك.`
      : `<strong>تم تسجيل طلبك بنجاح!</strong><br/><br/>
         مرحباً بك في خطوتك الأولى نحو الإتقان! طلبك لشراء <strong>"${productName}"</strong> هو الآن قيد المراجعة.<br/><br/>
         <strong>الخطوة التالية:</strong> لإتمام عملية الشراء، سيقوم فريق الإدارة لدينا بالتواصل معك عبر البريد الإلكتروني المسجل لدينا خلال الساعات القادمة لتزويدك برابط دفع آمن ومباشر.`;

    setPaymentMessage({
        type: 'success',
        title: '✅ تم استلام طلبك بنجاح!',
        body: successMessageBody,
    });
    toast({
        title: "تم تسجيل طلبك بنجاح!",
        description: "سيتم التواصل معك قريباً لتأكيد الدفع.",
    });

    if (isGift) setGiftEmail('');
    setIsSubmitting(false);
  };

  const getStatusChip = (status: Purchase['status']) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'Awaiting Payment': return 'bg-yellow-100 text-yellow-800';
        case 'Refunded': return 'bg-gray-100 text-gray-800';
        default: return 'bg-blue-100 text-blue-800';
    }
  }

  const handleSendGift = () => {
    const productPrice = giftProduct === 'wisdom_papyrus' ? 120 : 180;
    const productName = giftProduct === 'wisdom_papyrus' ? 'بردية حكمة بتاح حتب' : 'مفتاح الحياة الصوتي';
    buyProduct(productName, productPrice, true, giftEmail);
  }
  
  if (isUserLoading) {
      return (
        <div className="flex justify-center items-center h-screen bg-nile-dark">
            <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
            <p className="text-center text-lg text-sand-ochre ml-4">جاري تحميل خزانة الكنوز...</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-nile-dark text-white p-4 md:p-8" style={{ direction: 'rtl' }}>
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-black royal-title mb-2">
          متجر كنوز المملكة
        </h1>
        <p className="text-xl text-sand-ochre">
          برديات حصرية وكنوز فرعونية لتعزيز رحلتك التعليمية.
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
         {paymentMessage && (
            <div className={`p-6 rounded-xl mb-8 shadow-lg transition-all duration-300 ${paymentMessage.type === 'success' ? 'bg-green-800/20 border-green-500' : paymentMessage.type === 'error' ? 'bg-red-800/20 border-red-500' : 'bg-blue-800/20 border-blue-500'} border`}>
              <p className={`font-extrabold text-2xl mb-3 ${paymentMessage.type === 'success' ? 'text-green-300' : paymentMessage.type === 'error' ? 'text-red-300' : 'text-blue-300'}`}>{paymentMessage.title}</p>
              <div className={`text-md ${paymentMessage.type === 'success' ? 'text-green-200' : paymentMessage.type === 'error' ? 'text-red-200' : 'text-blue-200'} space-y-2`} dangerouslySetInnerHTML={{ __html: paymentMessage.body }}></div>
            </div>
          )}

          <Tabs defaultValue="treasures" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-nile/50 p-2 rounded-xl border border-sand-ochre/30">
              <TabsTrigger value="treasures" className="tab-trigger"><ShoppingCart className="w-5 h-5 ml-2"/> كنوز المملكة</TabsTrigger>
              <TabsTrigger value="gifts" className="tab-trigger"><Gift className="w-5 h-5 ml-2"/> إرسال هدية</TabsTrigger>
              <TabsTrigger value="history" className="tab-trigger" disabled={!user}><History className="w-5 h-5 ml-2"/> {user ? 'سجل طلباتك' : 'سجل الطلبات (للمسجلين)'}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="treasures" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <div className="dashboard-card p-6 rounded-xl flex flex-col text-center items-center">
                    <ScrollText className="w-20 h-20 text-gold-accent mb-4"/>
                    <h3 className="text-2xl font-bold royal-title mb-3">بردية حكمة بتاح حتب</h3>
                    <p className="text-sand-ochre mb-4 flex-grow">نسخة رقمية طبق الأصل من بردية نادرة تحتوي على حكم ومواعظ قديمة لتعميق فهمك الثقافي.</p>
                    <div className="flex justify-between items-center mt-6 w-full">
                      <span className="text-4xl font-extrabold text-white">$120</span>
                      <Button onClick={() => buyProduct('بردية حكمة بتاح حتب', 120)} disabled={isSubmitting} className="cta-button">
                        {isSubmitting ? <Loader2 className="animate-spin"/> : 'اطلب الآن'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="dashboard-card p-6 rounded-xl flex flex-col text-center items-center">
                     <Ankh className="w-20 h-20 text-gold-accent mb-4"/>
                    <h3 className="text-2xl font-bold royal-title mb-3">مفتاح الحياة الصوتي</h3>
                    <p className="text-sand-ochre mb-4 flex-grow">مجموعة صوتية حصرية بجودة استوديو، تحتوي على تأملات وقصص من مصر القديمة لتدريب أذنك على اللغة.</p>
                    <div className="flex justify-between items-center mt-6 w-full">
                      <span className="text-4xl font-extrabold text-white">$180</span>
                      <Button onClick={() => buyProduct('مفتاح الحياة الصوتي', 180)} disabled={isSubmitting} className="cta-button">
                         {isSubmitting ? <Loader2 className="animate-spin"/> : 'اطلب الآن'}
                      </Button>
                    </div>
                  </div>
                </div>
            </TabsContent>
            
            <TabsContent value="gifts" className="mt-8">
                <div className="dashboard-card p-8 rounded-xl max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold text-center royal-title mb-3">أهدِ العلم لصديق</h3>
                    <p className="text-sand-ochre mb-6 text-center">شارك متعة تعلم العامية المصرية مع أصدقائك. اختر هدية وأرسلها لهم مع رسالة خاصة.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="friend_email" className="font-bold text-sand-ochre">بريد الصديق الإلكتروني:</label>
                            <input type="email" id="friend_email" placeholder="friend@example.com" value={giftEmail} onChange={(e) => setGiftEmail(e.target.value)} className="w-full p-2 mt-1 border-2 bg-nile-dark border-sand-ochre/50 rounded-lg focus:ring-gold-accent focus:border-gold-accent text-white" />
                        </div>
                        <div>
                            <label htmlFor="gift_product" className="font-bold text-sand-ochre">اختر الهدية:</label>
                             <select id="gift_product" value={giftProduct} onChange={(e) => setGiftProduct(e.target.value)} className="w-full p-2 mt-1 border-2 bg-nile-dark border-sand-ochre/50 rounded-lg focus:ring-gold-accent focus:border-gold-accent text-white">
                                <option value="wisdom_papyrus">بردية حكمة بتاح حتب ($120)</option>
                                <option value="ankh_audio">مفتاح الحياة الصوتي ($180)</option>
                             </select>
                        </div>
                        <Button onClick={handleSendGift} disabled={isSubmitting} className="w-full cta-button text-lg">
                           {isSubmitting ? <Loader2 className="animate-spin"/> : <><Gift className="inline-block ml-2"/> إرسال الهدية</>}
                        </Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="history" className="mt-8">
                <div className="dashboard-card p-8 rounded-xl">
                    <h3 className="text-2xl font-bold royal-title mb-6 text-center">سجل الطلبات الملكية</h3>
                    {isLoadingPurchases ? (
                        <p className="text-center text-sand-ochre">جاري تحميل سجل طلباتك...</p>
                    ) : purchases && purchases.length > 0 ? (
                        <div className="space-y-4">
                            {purchases.map(p => (
                                <div key={p.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border border-sand-ochre/20 rounded-lg bg-nile/50">
                                    <div className="md:col-span-2">
                                        <p className="font-bold text-white">{p.productId}</p>
                                        <p className="text-sm text-gray-400">{new Date(p.purchaseDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                                         {p.isGift && <p className="text-xs text-pink-400 font-semibold"> (هدية إلى: {p.recipientEmail})</p>}
                                    </div>
                                    <p className="text-lg font-bold text-white text-center">${p.price}</p>
                                    <div className="text-center">
                                       <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChip(p.status)}`}>{p.status === 'Awaiting Payment' ? 'بانتظار الدفع' : p.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sand-ochre py-8">لا يوجد لديك أي طلبات شراء مسجلة حتى الآن.</p>
                    )}
                </div>
            </TabsContent>
          </Tabs>
      </main>

      <footer className="mt-12 text-center">
        <Link href="/" className="utility-button px-6 py-2">
          <ArrowLeft className="inline-block ml-2"/> العودة للوحة التحكم
        </Link>
      </footer>
    </div>
  );
}

// Add custom styles for better theming
const style = document.createElement('style');
style.innerHTML = `
.tab-trigger {
  color: var(--sand-ochre);
  font-weight: bold;
  border-radius: 0.5rem;
  transition: all 0.3s;
}
.tab-trigger[data-state=active] {
  background-color: var(--gold-accent);
  color: var(--nile-dark);
  box-shadow: 0 4px 14px 0 rgba(255, 215, 0, 0.4);
}
.tab-trigger:hover:not([data-state=active]) {
  background-color: rgba(214, 184, 118, 0.1);
}
.tab-trigger[disabled] {
    color: #6b7280;
    cursor: not-allowed;
}
`;
document.head.appendChild(style);