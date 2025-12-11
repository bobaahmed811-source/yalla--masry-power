
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser, useAuth, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { updateProfileNonBlocking } from '@/firebase/non-blocking-login';
import {
  ArrowRight,
  BookOpen,
  Crown,
  Gem,
  LogIn,
  UserPlus,
  LogOut,
  GraduationCap,
  Mic,
  Smile,
  Palette,
  Shuffle,
  Map,
  Volume2,
  Users,
  CalendarCheck,
  Store,
  Landmark,
  BookMarked,
  Edit,
  Save,
  Loader2,
  Baby,
  BarChart3,
  Target,
  MessagesSquare,
  Globe,
} from 'lucide-react';
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

interface Progress {
    id: string;
    courseId: string;
    completedLessons: string[];
}

const getRoyalTitle = (points: number): string => {
  if (points >= 1000) return "يد الفرعون";
  if (points >= 750) return "كاهنة المعبد";
  if (points >= 500) return "مهندسة ملكية";
  if (points >= 250) return "كاتبة البردي";
  if (points >= 100) return "تلميذة النيل";
  return "مستجدة في المملكة";
};


const StatCard = ({
  icon,
  value,
  label,
  isLoading,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  isLoading?: boolean;
}) => (
  <Card className="stat-card p-4">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-sand-ochre">
        {label}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      ) : (
        <div className="text-2xl font-bold text-white">{value}</div>
      )}
    </CardContent>
  </Card>
);

const ChallengeLink = ({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title:string;
  description: string;
  icon: React.ReactNode;
}) => (
  <Link
    href={href}
    className="challenge-item group block p-4 rounded-lg transition-all duration-300"
  >
    <div className="flex items-center gap-4">
      <div className="icon-symbol text-3xl text-gold-accent w-8 flex justify-center">{icon}</div>
      <div>
        <h3 className="font-bold text-white group-hover:text-gold-accent transition-colors">
          {title}
        </h3>
        <p className="text-sm text-sand-ochre">{description}</p>
      </div>
      <ArrowRight className="mr-auto h-5 w-5 text-sand-ochre group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

const AliasManagement = ({ user, toast }: { user: any, toast: any }) => {
    const [alias, setAlias] = useState(user.displayName || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSaveAlias = () => {
        if (!alias.trim()) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لا يمكن ترك الاسم المستعار فارغاً.' });
            return;
        }
        setIsSubmitting(true);
        updateProfileNonBlocking(user, { displayName: alias }, (result) => {
            if (result.success) {
                toast({ title: 'تم التحديث بنجاح!', description: 'تم تغيير اسمك المستعار في جميع أنحاء المملكة.' });
                setIsEditing(false);
            } else {
                toast({ variant: 'destructive', title: 'فشل التحديث', description: result.error?.message || 'حدث خطأ غير متوقع.' });
            }
            setIsSubmitting(false);
        });
    };

    return (
        <Card className="alias-management-card p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-gold-accent"/>
                    {isEditing ? (
                        <Input
                            id="alias-input"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            className="bg-nile-dark border-sand-ochre text-white"
                            disabled={isSubmitting}
                        />
                    ) : (
                        <span className="text-lg font-bold text-white user-alias">{user.displayName || 'زائر ملكي'}</span>
                    )}
                </div>
                {isEditing ? (
                    <Button onClick={handleSaveAlias} size="sm" className="cta-button" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                        <span className="hidden sm:inline ml-2">حفظ</span>
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)} size="sm" variant="ghost" className="text-sand-ochre hover:text-gold-accent">
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">تغيير</span>
                    </Button>
                )}
            </div>
        </Card>
    );
}

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const progressCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/progress`);
  }, [user, firestore]);
  
  const { data: progresses, isLoading: isProgressLoading } = useCollection<Progress>(progressCollectionRef);
  
  const nilePoints = user?.nilePoints ?? 0;
  const royalTitle = getRoyalTitle(nilePoints);
  
  useEffect(() => {
    const fetchCourseData = async () => {
        if (!firestore) return;
        setIsStatsLoading(true);

        try {
            let completedCount = 0;
            let totalCount = 0;

            const coursesQuery = query(collection(firestore, 'courses'));
            const coursesSnapshot = await getDocs(coursesQuery);
            
            const lessonCountPromises = coursesSnapshot.docs.map(async (courseDoc) => {
                const lessonsQuery = query(collection(firestore, `courses/${courseDoc.id}/lessons`));
                const lessonsSnapshot = await getDocs(lessonsQuery);
                return lessonsSnapshot.size;
            });
            
            const lessonCounts = await Promise.all(lessonCountPromises);
            totalCount = lessonCounts.reduce((sum, count) => sum + count, 0);

            if (progresses) {
                completedCount = progresses.reduce((sum, progress) => sum + progress.completedLessons.length, 0);
            }
            
            setLessonsCompleted(completedCount);
            setTotalLessons(totalCount);
        } catch (error) {
            console.error("Error fetching course stats:", error);
            toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل إحصائيات الدورات." });
        } finally {
            setIsStatsLoading(false);
        }
    };

    if (user && !isProgressLoading) {
        fetchCourseData();
    } else if (!user) {
        setIsStatsLoading(false);
        setLessonsCompleted(0);
        setTotalLessons(0);
    }
  }, [progresses, firestore, isProgressLoading, user, toast]);


  const progressPercentage = totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0;


  const handleSignOut = () => {
    if (auth) {
      initiateSignOut(auth, () => {
         toast({
            title: "تم تسجيل الخروج",
            description: "نأمل أن نراك قريباً في المملكة.",
        });
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-nile-dark text-white p-4 md:p-8"
      style={{ direction: 'rtl' }}
    >
      <div className="max-w-7xl mx-auto">
        {isUserLoading ? (
          <div className="text-center p-10 flex justify-center items-center h-[80vh]">
            <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
            <p className="text-xl text-sand-ochre mr-4">
              جاري استدعاء السجلات الملكية...
            </p>
          </div>
        ) : user ? (
          // Authenticated User Dashboard
          <>
            <header className="mb-10 flex flex-wrap gap-4 justify-between items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-black royal-title mb-2">
                  ديوان الإنجازات الملكية
                </h1>
                <p className="text-xl text-sand-ochre">
                  مرحباً بعودتكِ يا <span className="font-bold text-white">{user.displayName || 'أيتها الملكة'}</span>!
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="utility-button"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </Button>
                <Link href="/admin" passHref>
                   <Button variant="outline" className="utility-button">
                      <Crown className="ml-2 h-4 w-4" />
                      الإدارة
                   </Button>
                </Link>
              </div>
            </header>

            <main>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="lg:col-span-2">
                     <AliasManagement user={user} toast={toast} />
                  </div>
                  <StatCard
                    icon={<Gem className="h-6 w-6 text-sand-ochre" />}
                    value={`${nilePoints}`}
                    label="نقاط النيل"
                    isLoading={isUserLoading}
                  />
                  <StatCard
                    icon={<BookOpen className="h-6 w-6 text-sand-ochre" />}
                    value={`${lessonsCompleted} من ${totalLessons}`}
                    label="الدروس المكتملة"
                    isLoading={isStatsLoading || isProgressLoading}
                  />
              </div>

               {/* Progress and Achievements Section */}
                <Card className="dashboard-card mb-8">
                    <CardHeader>
                        <CardTitle className="royal-title text-2xl">تقدمكِ في المملكة</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {isStatsLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-sand-ochre"/>
                       ) : (
                        <>
                          <p className="text-sand-ochre mb-4">لقبك الملكي الحالي: <span className="font-bold text-white text-lg">{royalTitle}</span></p>
                          <div className="progress-bar-royal mb-4">
                            <div className="progress-fill-royal" style={{ width: `${progressPercentage}%` }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-sand-ochre">
                              <span>المستوى الحالي</span>
                              <span>المستوى التالي: كاتب البردي</span>
                          </div>
                        </>
                       )}
                    </CardContent>
                </Card>


              {/* Main Content Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="royal-title text-2xl">
                      تحديات المملكة
                    </CardTitle>
                    <CardDescription className="text-sand-ochre">
                      صقلي مهاراتكِ واجمعي نقاط النيل.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ChallengeLink
                      href="/pronunciation-challenge"
                      title="قوة حتشبسوت"
                      description="تحدي النطق والتكرار."
                      icon={<Mic />}
                    />
                    <ChallengeLink
                      href="/dialogue-challenge"
                      title="حوارات السوق"
                      description="تحدي محاكاة المواقف اليومية."
                      icon={<Smile />}
                    />
                     <ChallengeLink
                      href="/comic-studio"
                      title="استوديو القصص المصورة"
                      description="اصنعي قصصاً بصوتكِ."
                      icon={<Palette />}
                    />
                    <ChallengeLink
                      href="/word-scramble"
                      title="ألغاز الكلمات"
                      description="أعيدي ترتيب الكلمات لتكوين جمل صحيحة."
                      icon={<Shuffle />}
                    />
                  </CardContent>
                </Card>

                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="royal-title text-2xl">
                      أدوات التعلم
                    </CardTitle>
                    <CardDescription className="text-sand-ochre">
                      استكشفي موارد الأكاديمية.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ChallengeLink
                      href="/learning-path"
                      title="مسار التعلم الملكي"
                      description="تابعي تقدمكِ في المنهج الدراسي."
                      icon={<Map />}
                    />
                    <ChallengeLink
                      href="/audio-library"
                      title="خزانة الأصوات"
                      description="استمعي للنطق الصحيح للعبارات."
                      icon={<Volume2 />}
                    />
                     <ChallengeLink
                      href="/tutor"
                      title="المعلم الخصوصي الذكي"
                      description="احصلي على إجابات فورية لأسئلتكِ."
                      icon={<GraduationCap />}
                    />
                     <ChallengeLink
                      href="/goals"
                      title="بوابة تحديد المصير"
                      description="حددي أهدافكِ التعليمية لتخصيص رحلتك."
                      icon={<Target />}
                    />
                    <ChallengeLink
                      href="/level-assessment"
                      title="اختبار تحديد المستوى"
                      description="اكتشفي مستواكِ الحالي وابدأي من حيث يجب."
                      icon={<BarChart3 />}
                    />
                  </CardContent>
                </Card>

                 <Card className="dashboard-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="royal-title text-2xl">
                      استكشاف المملكة
                    </CardTitle>
                    <CardDescription className="text-sand-ochre">
                      موارد إضافية لتجربة تعليمية فريدة.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <ChallengeLink
                      href="/instructors"
                      title="معلمات المملكة"
                      description="تصفحي ملفات المعلمات."
                      icon={<Users />}
                    />
                     <ChallengeLink
                      href="/booking"
                      title="حجز الدروس"
                      description="احجزي موعدكِ القادم."
                      icon={<CalendarCheck />}
                    />
                     <ChallengeLink
                      href="/store"
                      title="متجر الكنوز"
                      description="منتجات رقمية وهدايا."
                      icon={<Store />}
                    />
                     <ChallengeLink
                      href="/museum"
                      title="المتحف الافتراضي"
                      description="تجربة تفاعلية ثلاثية الأبعاد."
                      icon={<Landmark />}
                    />
                     <ChallengeLink
                      href="/quran"
                      title="واحة القرآن"
                      description="قسم خاص بالعلوم الشرعية."
                      icon={<BookMarked />}
                    />
                     <ChallengeLink
                      href="/kids"
                      title="ركن الأطفال"
                      description="تحديات ومواد تعليمية للصغار."
                      icon={<Baby />}
                    />
                  </CardContent>
                </Card>
                <Card className="dashboard-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="royal-title text-2xl">
                        التواصل والتوسع
                    </CardTitle>
                    <CardDescription className="text-sand-ochre">
                      تواصلي مع باقي أعضاء المملكة واستكشفي آفاقًا جديدة.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ChallengeLink
                      href="/community-chat"
                      title="ساحة الحوار الكبرى"
                      description="دردشة عامة مع جميع طلاب المملكة."
                      icon={<MessagesSquare />}
                    />
                    <ChallengeLink
                      href="/gulf-gateway"
                      title="بوابة الخليج"
                      description="قريباً: محتوى متخصص باللهجات الخليجية."
                      icon={<Globe />}
                    />
                  </CardContent>
                </Card>
              </div>
            </main>
          </>
        ) : (
          // Unauthenticated User Landing
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <Crown className="w-24 h-24 text-gold-accent mb-4" />
            <h1 className="text-5xl md:text-6xl font-black royal-title mb-4">
              أهلاً بكِ في أكاديمية يلا مصري
            </h1>
            <p className="text-2xl text-sand-ochre mb-10 max-w-2xl">
              البوابة الملكية للنساء والأطفال لإتقان اللهجة المصرية في بيئة آمنة
              وممتعة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="cta-button text-lg px-8 py-6">
                <Link href="/login">
                  <LogIn className="ml-2" /> تسجيل الدخول
                </Link>
              </Button>
              <Button asChild variant="outline" className="utility-button text-lg px-8 py-6">
                <Link href="/signup">
                  <UserPlus className="ml-2" /> انضمي إلى المملكة
                </Link>
              </Button>
            </div>
            <div className="mt-8">
              <Link
                href="/landing"
                className="text-sand-ochre hover:text-gold-accent transition-colors underline"
              >
                أو تصفحي المزيد عنا
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

    