
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import LandingPage from './landing/page'; // Import the LandingPage component
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';

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
        <span className="text-4xl md:text-5xl font-black royal-title text-gold-accent">
            يلا مصري
        </span>
    </div>
);

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
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
              const initialAlias = user.displayName || "تحتمس القوي";
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

  const handleLogout = () => {
    if (auth) {
      initiateSignOut(auth, () => {
        toast({
          title: "تم تسجيل الخروج",
          description: "نراك قريباً في رحلة أخرى في مملكة مصر القديمة!",
        });
        router.push('/landing');
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d284e]">
        <p className="text-white text-xl">جاري التحقق من هوية الفرعون...</p>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }
  
  return (
    <div className="antialiased min-h-screen bg-nile-dark p-6 md:p-12" style={{direction: 'rtl'}}>
       <div className="fixed top-4 left-4 z-50">
           {user ? (
                <button onClick={handleLogout} className="utility-button px-4 py-2 text-md font-bold rounded-lg flex items-center justify-center">
                    <i className="fas fa-sign-out-alt text-lg ml-2"></i> 
                    <span>تسجيل الخروج</span>
                </button>
            ) : (
                <Link href="/login" className="utility-button px-4 py-2 text-md font-bold rounded-lg flex items-center justify-center">
                    <i className="fas fa-sign-in-alt text-lg ml-2"></i> 
                    <span>تسجيل الدخول</span>
                </Link>
            )}
        </div>

        <div className="max-w-7xl mx-auto w-full">
            <header className="text-center mb-6 pb-4 border-b-4 border-gold-accent">
                <Logo />
                <p className="text-xl text-gray-300 font-bold mt-2">
                    المستوى الحالي: <span className="text-sand-ochre">تلميذ النيل</span>
                </p>
            </header>

            <div className="alias-management-card p-4 rounded-lg mb-8 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 md:space-x-reverse">
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
            
            {/* Main Learning Path Section */}
            <div className="mb-12">
                <h2 className="text-3xl royal-title text-center mb-4">الرحلة الأساسية</h2>
                <Link href="/learning-path" className="col-span-full utility-button px-6 py-4 text-2xl font-black rounded-full flex items-center justify-center border-green-400 text-green-400 hover:bg-green-900/50">
                    <i className="fas fa-map-signs text-2xl ml-3"></i>
                    <span>ابدأ من هنا: مسار التعلم الملكي</span>
                </Link>
            </div>

            {/* Specialization Sections */}
            <div className="space-y-12">

                {/* Challenges Section */}
                <div>
                    <h2 className="text-3xl royal-title text-center mb-4">قسم التحديات</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Link href="/dialogue-challenge" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-purple-400 text-purple-400">
                            <i className="fas fa-comments text-xl ml-3"></i>
                            <span>تحدي حوار السوق</span>
                        </Link>
                        <Link href="/pronunciation-challenge" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-pink-400 text-pink-400">
                            <i className="fas fa-bullhorn text-xl ml-3"></i>
                            <span>تحديات قوة حتشبسوت</span>
                        </Link>
                        <Link href="/word-scramble" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-indigo-400 text-indigo-400">
                            <i className="fas fa-random text-xl ml-3"></i>
                            <span>تحدي خلط الكلمات</span>
                        </Link>
                    </div>
                </div>
                
                {/* Archaeology and Tourism Section */}
                <div>
                    <h2 className="text-3xl royal-title text-center mb-4">ديوان الآثار والسياحة</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Link href="/museum" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-cyan-400 text-cyan-400">
                            <i className="fas fa-landmark text-xl ml-3"></i>
                            <span>المتحف الافتراضي</span>
                        </Link>
                    </div>
                </div>

                {/* Business and Professional Section */}
                <div>
                    <h2 className="text-3xl royal-title text-center mb-4">ديوان الأعمال والاحتراف</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Link href="/booking" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-teal-400 text-teal-400">
                            <i className="fas fa-calendar-check text-xl ml-3"></i>
                            <span>حجز الدروس الملكية</span>
                        </Link>
                         <Link href="/tutor" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-rose-400 text-rose-400">
                            <i className="fas fa-user-graduate text-xl ml-3"></i>
                            <span>المعلم الخصوصي الذكي</span>
                        </Link>
                    </div>
                </div>

                {/* Culture and Arts Section */}
                <div>
                    <h2 className="text-3xl royal-title text-center mb-4">قاعة الثقافة والفنون</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Link href="/comic-studio" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-amber-400 text-amber-400">
                            <i className="fas fa-paint-brush text-xl ml-3"></i>
                            <span>استوديو القصص المصورة</span>
                        </Link>
                        <Link href="/audio-library" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-orange-300 text-orange-300">
                            <i className="fas fa-volume-up text-xl ml-3"></i>
                            <span>خزانة الأصوات</span>
                        </Link>
                         <Link href="#" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-red-400 text-red-400">
                            <i className="fas fa-utensils text-xl ml-3"></i>
                            <span>وصفات فرعونية (قريباً)</span>
                        </Link>
                    </div>
                </div>

                {/* Social and Community Section */}
                <div>
                    <h2 className="text-3xl royal-title text-center mb-4">الديوان الاجتماعي</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Link href="/community-chat" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-lime-400 text-lime-400">
                            <i className="fas fa-users text-xl ml-3"></i>
                            <span>ساحة الحوار المجتمعي</span>
                        </Link>
                         <Link href="/instructors" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-blue-400 text-blue-400">
                            <i className="fas fa-chalkboard-teacher text-xl ml-3"></i>
                            <span>مقابلة المعلمات</span>
                        </Link>
                    </div>
                </div>
                 {/* Special Future Sections */}
                 <div className="mt-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="#" className="col-span-1 utility-button px-6 py-4 text-xl font-black rounded-full flex items-center justify-center border-blue-400 text-blue-400 hover:bg-blue-900/50">
                            <i className="fas fa-gem text-xl ml-3"></i>
                            <span>الديوان الخليجي (قريباً)</span>
                        </Link>
                        <Link href="/quran" className="utility-button px-6 py-4 text-xl font-bold rounded-full flex items-center justify-center border-sky-300 text-sky-300 col-span-1">
                            <i className="fas fa-quran text-xl ml-3"></i>
                            <span>واحة القرآن والسنة</span>
                        </Link>
                    </div>
                </div>

            </div>

             <div className="dashboard-card p-6 md:p-10 rounded-2xl mt-12">
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

    
    
