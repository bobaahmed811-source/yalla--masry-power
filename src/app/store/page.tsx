'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, PiggyBank, ShoppingCart } from 'lucide-react';

// Define the structure for a payment message
type PaymentMessage = {
  type: 'success' | 'error' | null;
  title: string;
  body: string;
};

export default function StorePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [showProducts, setShowProducts] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<PaymentMessage | null>(null);
  const [nilePoints, setNilePoints] = useState(1250); // Mock points

  // This ID would typically come from your environment configuration
  const appId = 'yalla-masry-academy';

  useEffect(() => {
    if (!isUserLoading) {
      setShowProducts(true);
    }
  }, [isUserLoading, user]);

  const buyProduct = async (productName: string, price: number) => {
    setPaymentMessage(null); // Clear previous messages

    if (!firestore) {
      setPaymentMessage({
        type: 'error',
        title: 'فشل الاتصال بالنظام.',
        body: 'خدمة قاعدة البيانات غير متاحة حالياً. يرجى المحاولة لاحقاً.',
      });
      return;
    }
    
    if (!user) {
      setPaymentMessage({
        type: 'error',
        title: 'يرجى تسجيل الدخول أولاً!',
        body: 'لا يمكننا تسجيل طلب الشراء دون معرفة هويتك.',
      });
      return;
    }

    const purchaseCollectionPath = `/artifacts/${appId}/public/data/digital_purchases`;
    const purchaseData = {
      userId: user.uid,
      productId: productName,
      price: price,
      status: 'Awaiting Payment',
      purchaseDate: new Date().toISOString(),
    };

    // Use the non-blocking Firestore update
    addDocumentNonBlocking(collection(firestore, purchaseCollectionPath), purchaseData);
    
    setPaymentMessage({
      type: 'success',
      title: '✅ تم تسجيل طلب الشراء بنجاح!',
      body: `يرجى دفع مبلغ <strong>${price} ج.م</strong> لإكمال العملية. <br/>
             <strong>خطوات الدفع:</strong> قم بالتحويل البنكي أو تواصل معنا عبر واتساب الآن لتزويدك برابط دفع آمن. <br/>
             <span class="font-bold text-blue-600">سنرسل لك المنتج (${productName}) فور تأكيد الدفع يدوياً.</span>`,
    });
  };

  const redeemWithPoints = (productName: string, pointsCost: number) => {
    setPaymentMessage(null);

    if (!user) {
        setPaymentMessage({ type: 'error', title: 'يرجى تسجيل الدخول أولاً!', body: 'يجب أن تكون مسجلاً لاستخدام نقاطك.' });
        return;
    }

    if (nilePoints < pointsCost) {
        setPaymentMessage({ type: 'error', title: 'نقاط النيل غير كافية!', body: `تحتاج إلى ${pointsCost} نقطة وأنت تملك ${nilePoints} نقطة فقط.` });
        return;
    }

    // Simulate point deduction
    setNilePoints(prev => prev - pointsCost);
    
    setPaymentMessage({
        type: 'success',
        title: '🎉 تم الاستبدال بنجاح!',
        body: `لقد استخدمت ${pointsCost} نقطة للحصول على "${productName}". تم تحديث رصيدك.`,
    });
  };

  return (
    <div className="store-body antialiased">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center" style={{ direction: 'rtl' }}>
          <a href="/store" className="text-3xl font-bold text-[#0b4e8d]">كنوز النيل</a>
          <div className="text-sm text-gray-600">متجر برديات العامية والهدايا</div>
        </div>
      </header>

      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ direction: 'rtl' }}>
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-4">
            برديات العامية والكنوز الملكية
          </h1>
          <p className="text-center text-gray-600 mb-12">
            منتجات فورية تساعدك على فهم الثقافة المصرية وإهداء أصدقائك.
          </p>
          
          {isUserLoading && (
            <div className="text-center mb-8">
              <p className="text-lg font-semibold text-blue-600">جاري تأمين الاتصال بالنظام...</p>
            </div>
          )}

          {paymentMessage && (
            <div className={`p-4 rounded-lg text-right mb-8 ${paymentMessage.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`} role="alert">
              <p className="font-bold text-lg mb-2">{paymentMessage.title}</p>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: paymentMessage.body }}></p>
            </div>
          )}
            
          <Tabs defaultValue="digital_products" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-200 p-2 rounded-xl">
              <TabsTrigger value="digital_products" className="flex items-center gap-2 font-bold"><ShoppingCart className="w-5 h-5"/> منتجات رقمية</TabsTrigger>
              <TabsTrigger value="redeem_points" className="flex items-center gap-2 font-bold"><PiggyBank className="w-5 h-5"/> استبدال بالنقاط</TabsTrigger>
              <TabsTrigger value="gifts" className="flex items-center gap-2 font-bold"><Gift className="w-5 h-5"/> قسم الهدايا</TabsTrigger>
            </TabsList>
            
            <TabsContent value="digital_products" className="mt-8">
                {showProducts ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="product-card bg-white p-6 rounded-xl border-t-4 border-yellow-500">
                          <h3 className="text-2xl font-bold text-gray-800 mb-3">1. برديّة وصفة الماموث</h3>
                          <p className="text-gray-600 mb-4">وثيقة تاريخية ممتعة تشرح طريقة طبخ الطعام المصري عبر العصور القديمة بالعامية.</p>
                          <div className="flex justify-between items-center mt-6">
                            <span className="text-3xl font-extrabold text-yellow-600">300 ج.م</span>
                            <button onClick={() => buyProduct('Bardiyyat_Mammoth', 300)} className="buy-button bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold shadow-md transform hover:scale-105 transition duration-200">
                              شراء البرديّة الآن
                            </button>
                          </div>
                        </div>
                        
                        <div className="product-card bg-white p-6 rounded-xl border-t-4 border-purple-500">
                          <h3 className="text-2xl font-bold text-gray-800 mb-3">2. مجموعة تحديات التاكسي المتقدمة</h3>
                          <p className="text-gray-600 mb-4">50 حواراً إضافياً بمستويات متقدمة لمواقف حياتية أكثر تعقيداً في الشارع المصري.</p>
                          <div className="flex justify-between items-center mt-6">
                            <span className="text-3xl font-extrabold text-purple-600">500 ج.م</span>
                            <button onClick={() => buyProduct('Adult_Challenges_Pack', 500)} className="buy-button bg-purple-500 text-white px-6 py-2 rounded-lg font-bold shadow-md transform hover:scale-105 transition duration-200">
                              شراء التحديات الآن
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {!user && !isUserLoading && (
                        <div className="text-center mt-8 p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                          <strong>يرجى تسجيل الدخول أولاً!</strong> يجب أن تكون مسجلاً لتتمكن من تسجيل طلب الشراء الخاص بك.
                        </div>
                      )}
                    </>
                ) : null}
            </TabsContent>

            <TabsContent value="redeem_points" className="mt-8">
              <div className="text-center mb-6 p-4 bg-blue-100 border border-blue-400 rounded-lg">
                  <p className="text-lg font-bold text-blue-800">رصيدك الحالي: <span className="text-2xl">{nilePoints}</span> نقطة نيل <i className="fas fa-gem text-yellow-500"></i></p>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="product-card bg-white p-6 rounded-xl border-t-4 border-green-500">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">اسم فرعوني نادر</h3>
                        <p className="text-gray-600 mb-4">افتح قفل اسم "أخناتون الحكيم" لتستخدمه كاسمك المستعار في المملكة.</p>
                        <div className="flex justify-between items-center mt-6">
                        <span className="text-3xl font-extrabold text-green-600">800 نقطة</span>
                        <button onClick={() => redeemWithPoints('Rare_Alias_Akhenaten', 800)} className="buy-button bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow-md transform hover:scale-105 transition duration-200">
                            استبدال بالنقاط
                        </button>
                        </div>
                    </div>
                    <div className="product-card bg-white p-6 rounded-xl border-t-4 border-red-500">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">تلميح لغز المتحف</h3>
                        <p className="text-gray-600 mb-4">احصل على مساعدة إضافية لحل أحد ألغاز القطع الأثرية في المتحف الافتراضي.</p>
                        <div className="flex justify-between items-center mt-6">
                        <span className="text-3xl font-extrabold text-red-600">250 نقطة</span>
                        <button onClick={() => redeemWithPoints('Museum_Puzzle_Hint', 250)} className="buy-button bg-red-500 text-white px-6 py-2 rounded-lg font-bold shadow-md transform hover:scale-105 transition duration-200">
                            استبدال بالنقاط
                        </button>
                        </div>
                    </div>
                </div>
            </TabsContent>
            
            <TabsContent value="gifts" className="mt-8">
                <div className="product-card bg-white p-8 rounded-xl border-t-4 border-pink-500">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">أهدِ العلم لصديق</h3>
                    <p className="text-gray-600 mb-6 text-center">شارك متعة تعلم العامية المصرية مع أصدقائك. اختر هدية وأرسلها لهم مع رسالة خاصة.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="friend_email" className="font-bold text-gray-700">بريد الصديق الإلكتروني:</label>
                            <input type="email" id="friend_email" placeholder="friend@example.com" className="w-full p-2 mt-1 border-2 border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500" />
                        </div>
                        <div>
                            <label htmlFor="gift_product" className="font-bold text-gray-700">اختر الهدية:</label>
                             <select id="gift_product" className="w-full p-2 mt-1 border-2 border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 bg-white">
                                <option value="mammoth_scroll">برديّة وصفة الماموث (300 ج.م)</option>
                                <option value="taxi_challenges">مجموعة تحديات التاكسي (500 ج.m)</option>
                             </select>
                        </div>
                        <button onClick={() => setPaymentMessage({ type: 'success', title: 'تم إرسال إشعار الهدية!', body: 'سيتم إعلام صديقك بالهدية وسيتم التواصل معك لإتمام عملية الدفع.' })} className="w-full buy-button bg-pink-500 text-white px-6 py-3 rounded-lg font-bold shadow-md transform hover:scale-105 transition duration-200 text-lg">
                           <Gift className="inline-block ml-2"/> إرسال الهدية
                        </button>
                    </div>
                </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      <style jsx>{`
        .store-body {
          background-color: #f7fafc;
          font-family: 'Cairo', sans-serif;
        }
        .product-card {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease-in-out;
        }
        .product-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}
