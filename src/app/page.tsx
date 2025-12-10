
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import LandingPage from './landing/page'; // Import the LandingPage component

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [pharaonicAlias, setPharaonicAlias] = useState("زائر فرعوني");
  const [aliasInput, setAliasInput] = useState("زائر فرعوني");
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  useEffect(() => {
    async function fetchUserAlias() {
      if (userDocRef && user) {
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists() && docSnap.data().alias) {
              const userData = docSnap.data();
              setPharaonicAlias(userData.alias);
              setAliasInput(userData.alias);
            } else if (user && !docSnap.exists()) {
              // If no alias and no doc, set initial one in db
              const initialAlias = "تحتمس القوي";
              const initialData = { 
                alias: initialAlias, 
                id: user.uid, 
                email: user.email, 
                name: user.displayName || 'Anonymous', 
                registrationDate: new Date().toISOString() 
              };
              await setDoc(userDocRef, initialData);
              setPharaonicAlias(initialAlias);
              setAliasInput(initialAlias);
            }
        } catch (error) {
            console.error("Error fetching user alias:", error);
        }
      } else {
        // Not logged in
        setPharaonicAlias("زائر فرعوني");
        setAliasInput("");
      }
    }
    fetchUserAlias();
  }, [userDocRef, user]);

  const updateAliasInFirestore = async () => {
    if (!userDocRef) {
      toast({ variant: 'destructive', title: "خطأ", description: "يجب تسجيل الدخول لتحديث الاسم." });
      return;
    }
    const newAlias = aliasInput.trim();
    if (newAlias) {
      try {
        await updateDoc(userDocRef, { alias: newAlias });
        setPharaonicAlias(newAlias);
        toast({ title: "تم", description: `تم تحديث الاسم بنجاح إلى: ${newAlias}`});
      } catch (error) {
        console.error("Error updating alias: ", error);
        toast({ variant: 'destructive', title: "خطأ", description: "فشل تحديث الاسم. حاول مرة أخرى."});
      }
    } else {
      toast({  variant: 'destructive', title: "خطأ", description: 'الرجاء إدخال اسم فرعوني صحيح.'});
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d284e]">
        <p className="text-white text-xl">جاري التحقق من هوية الفرعون...</p>
      </div>
    );
  }

  // If user is not logged in, show the landing page
  if (!user) {
    return <LandingPage />;
  }
  
  // If user is logged in, show the royal dashboard
  return (
    <div className="antialiased min-h-screen bg-nile-dark p-6 md:p-12" style={{direction: 'rtl'}}>
       <div className="fixed top-4 left-4 z-50">
           <Link href={user ? '/api/auth/logout' : '/login'} className="utility-button px-4 py-2 text-md font-bold rounded-lg flex items-center justify-center">
                <i className={`fas ${user ? 'fa-sign-out-alt' : 'fa-sign-in-alt'} text-lg ml-2`}></i> 
                <span>{user ? 'تسجيل الخروج' : 'تسجيل الدخول'}</span>
            </Link>
        </div>

        <div className="max-w-7xl mx-auto w-full">
            <header className="text-center mb-6 pb-4 border-b-4 border-gold-accent">
                <h1 className="text-5xl md:text-6xl royal-title mb-2">لوحة التحكم الملكية</h1>
                <p className="text-xl text-gray-300 font-bold">
                    المستوى الحالي: <span className="text-sand-ochre">تلميذ النيل</span>
                </p>
            </header>

            <div className="alias-management-card p-4 rounded-lg mb-8 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
                <label htmlFor="alias-input" className="text-lg font-bold text-sand-ochre whitespace-nowrap">اسمك الفرعوني المستعار:</label>
                <input 
                  type="text" 
                  id="alias-input" 
                  className="w-full md:w-auto flex-grow focus:ring-2 focus:ring-gold-accent focus:outline-none" 
                  placeholder="اكتب اسمك الفرعوني هنا..." 
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  disabled={!user || isUserLoading}
                />
                <button 
                  id="update-alias-button" 
                  className="cta-button px-6 py-2 rounded-full w-full md:w-auto"
                  onClick={updateAliasInFirestore}
                  disabled={!user || isUserLoading}
                >
                    تحديث الاسم
                </button>
            </div>
            
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                <Link href="/admin" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-red-400 text-red-400">
                    <i className="fas fa-crown text-xl ml-3"></i>
                    <span>ديوان الإدارة</span>
                </Link>
                <Link href="/instructors" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-blue-400 text-blue-400">
                    <i className="fas fa-chalkboard-teacher text-xl ml-3"></i>
                    <span>مقابلة المعلمين</span>
                </Link>
                <Link href="/booking" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-teal-400 text-teal-400">
                    <i className="fas fa-calendar-check text-xl ml-3"></i>
                    <span>حجز الدروس الملكية</span>
                </Link>
                <Link href="/comic-studio" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-amber-400 text-amber-400">
                    <i className="fas fa-paint-brush text-xl ml-3"></i>
                    <span>استوديو القصص المصورة</span>
                </Link>
                 <Link href="/museum" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-cyan-400 text-cyan-400">
                    <i className="fas fa-landmark text-xl ml-3"></i>
                    <span>المتحف الافتراضي</span>
                </Link>
                <Link href="/store" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-emerald-400 text-emerald-400">
                    <i className="fas fa-store text-xl ml-3"></i>
                    <span>متجر البرديات</span>
                </Link>
                <Link href="/tutor" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-rose-400 text-rose-400">
                    <i className="fas fa-user-graduate text-xl ml-3"></i>
                    <span>المعلم الخصوصي</span>
                </Link>
                <Link href="/word-scramble" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-indigo-400 text-indigo-400">
                    <i className="fas fa-random text-xl ml-3"></i>
                    <span>تحدي الكلمات</span>
                </Link>
                 <Link href="/dialogue-challenge" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-purple-400 text-purple-400">
                    <i className="fas fa-comments text-xl ml-3"></i>
                    <span>تحدي الحوار</span>
                </Link>
                 <Link href="/pronunciation-challenge" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-pink-400 text-pink-400">
                    <i className="fas fa-bullhorn text-xl ml-3"></i>
                    <span>تحدي النطق</span>
                </Link>
                <Link href="/community-chat" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-lime-400 text-lime-400">
                    <i className="fas fa-users text-xl ml-3"></i>
                    <span>ساحة الحوار المجتمعي</span>
                </Link>
                 <Link href="/quran" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-sky-300 text-sky-300">
                    <i className="fas fa-quran text-xl ml-3"></i>
                    <span>واحة القرآن والسنة</span>
                </Link>
                <Link href="/audio-library" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-orange-300 text-orange-300">
                    <i className="fas fa-volume-up text-xl ml-3"></i>
                    <span>خزانة الأصوات</span>
                </Link>
                <Link href="/placement-test" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-orange-400 text-orange-400 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
                    <i className="fas fa-tasks text-xl ml-3"></i>
                    <span>إعادة اختبار تحديد المستوى</span>
                </Link>
            </div>

            <div className="dashboard-card p-6 md:p-10 rounded-2xl">
                <div className="text-2xl royal-title mb-6 text-center">
                    إحصائيات التقدم والموارد
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {/* Stat Cards */}
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-book-open text-2xl icon-symbol mb-2"></i>
                        <p className="text-3xl font-bold text-white">45</p>
                        <p className="text-sm text-gray-400">كلمات مُتقنة</p>
                    </div>
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-gem text-2xl icon-symbol mb-2"></i>
                        <p className="text-3xl font-bold text-white">1200</p>
                        <p className="text-sm text-gray-400">نقاط النيل</p>
                    </div>
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-calendar-alt text-2xl icon-symbol mb-2"></i>
                        <p className="text-3xl font-bold text-white">7</p>
                        <p className="text-sm text-gray-400">أيام متواصلة</p>
                    </div>
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-clock text-2xl icon-symbol mb-2"></i>
                        <p className="text-3xl font-bold text-white">3.5</p>
                        <p className="text-sm text-gray-400">إجمالي الوقت (س)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl royal-title mb-4 text-white pb-2 border-b-2 border-sand-ochre">تحدياتك القادمة</h2>
                        {/* Challenges List */}
                        <div className="space-y-3">
                            <div className="challenge-item p-4 rounded-lg flex items-center justify-between text-white opacity-60">
                                <div className="flex items-center flex-row">
                                    <i className="fas fa-check-circle text-lg text-green-400 ml-3"></i>
                                    <div>
                                        <p className="font-bold text-lg">تحدي النطق الملكي</p>
                                        <p className="text-sm text-gray-300">صباح الخير، أنا كويس.</p>
                                    </div>
                                </div>
                                <span className="text-sm text-green-400 font-bold">مُكتمل</span>
                            </div>
                            <div className="challenge-item p-4 rounded-lg flex items-center justify-between text-white bg-nile border-gold-accent shadow-xl border-r-4">
                               <div className="flex items-center flex-row">
                                    <i className="fas fa-comments text-lg icon-symbol ml-3"></i>
                                    <div>
                                        <p className="font-bold text-lg">القصة المصورة: في السوق</p>
                                        <p className="text-sm text-gray-300">تدريب على حوارات الشراء والبيع.</p>
                                    </div>
                                </div>
                                <button className="cta-button px-4 py-2 text-sm rounded-full flex items-center">
                                    <span>ابدأ التحدي التالي</span> <i className="fas fa-chevron-left mr-1"></i>
                                </button>
                            </div>
                             <div className="challenge-item p-4 rounded-lg flex items-center justify-between text-white opacity-80">
                                <div className="flex items-center flex-row">
                                    <i className="fas fa-lightbulb text-lg icon-symbol ml-3"></i>
                                    <div>
                                        <p className="font-bold text-lg">مفردات: الأطعمة والمشروبات</p>
                                        <p className="text-sm text-gray-300">تحدي الذاكرة للمفردات اليومية.</p>
                                    </div>
                                </div>
                                <span className="text-sm text-sand-ochre font-bold"><i className="fas fa-lock ml-1"></i> مُغلق</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <h2 className="text-2xl royal-title mb-4 text-white pb-2 border-b-2 border-sand-ochre">تقدم المستوى</h2>
                        {/* Progress Bar */}
                        <div className="progress-bar-royal mb-6">
                            <div className="progress-fill-royal" style={{width: '40%'}}></div>
                        </div>
                        <p className="text-2xl font-bold text-white text-center mb-1">40%</p>
                        <p className="text-sm text-gray-400 text-center mb-6">متبقي لكاتب البردي</p>
                        
                        <h3 className="text-xl font-bold text-sand-ochre mb-3 text-center">لوحة صدارة الأهرامات</h3>
                        {/* Leaderboard */}
                        <div className="leaderboard-card p-4 rounded-lg text-white space-y-3">
                            <div className="flex items-center justify-between font-bold text-lg text-gold-accent">
                                <div className="flex items-center"><i className="fas fa-trophy mr-2 text-xl"></i><span>الملكة حتشبسوت</span></div>
                                <span>1500 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                            <div className="flex items-center justify-between text-lg text-gray-300">
                                <div className="flex items-center"><span className="ml-2 w-5 text-center">2.</span><span>امنحتب الحكيم</span></div>
                                <span>1350 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                            <div className="flex items-center justify-between text-lg font-extrabold text-white bg-[#0b4e8d] p-2 rounded-md border-r-4 border-gold-accent">
                                <div className="flex items-center"><span className="ml-2 w-5 text-center">3.</span><span className="user-alias">{pharaonicAlias}</span></div>
                                <span>1200 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                            <div className="flex items-center justify-between text-lg text-gray-300">
                                <div className="flex items-center"><span className="ml-2 w-5 text-center">4.</span><span>نفرتيتي الرشيقة</span></div>
                                <span>980 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
