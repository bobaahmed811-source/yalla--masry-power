'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, User, Crown, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Define the types
interface Instructor {
  id: string;
  teacherName: string;
  email: string;
  shortBio: string;
  lessonPrice: number;
}
interface Course {
    id: string;
    title: string;
    description: string;
}
interface Lesson {
    id: string;
    title: string;
    content: string;
    order: number;
    courseId?: string; // To know which course it belongs to
}


const AdminDashboardPage = () => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // State for instructors
  const [isInstructorSubmitting, setIsInstructorSubmitting] = useState(false);
  const [currentInstructor, setCurrentInstructor] = useState<Partial<Instructor>>({});
  const [isInstructorDialogOpen, setIsInstructorDialogOpen] = useState(false);
  
  // State for courses
  const [isCourseSubmitting, setIsCourseSubmitting] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);

  // State for lessons
  const [isLessonSubmitting, setIsLessonSubmitting] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({});
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);

  // Firestore collections
  const instructorsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'instructors') : null, [firestore]);
  const coursesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'courses') : null, [firestore]);
  const lessonsCollection = useMemoFirebase(() => selectedCourseForLessons ? collection(firestore!, `courses/${selectedCourseForLessons.id}/lessons`) : null, [firestore, selectedCourseForLessons]);

  const { data: instructors, isLoading: isLoadingInstructors, error: instructorsError } = useCollection<Instructor>(instructorsCollection);
  const { data: courses, isLoading: isLoadingCourses, error: coursesError } = useCollection<Course>(coursesCollection);
  const { data: lessons, isLoading: isLoadingLessons, error: lessonsError } = useCollection<Lesson>(lessonsCollection);

  // --- Handlers for Instructors ---
  const handleInstructorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentInstructor(prev => ({ ...prev, [name]: name === 'lessonPrice' ? Number(value) : value }));
  };

  const handleSaveInstructor = async () => {
    if (!firestore || !instructorsCollection) return;
    const { teacherName, email, shortBio, lessonPrice } = currentInstructor;
    if (!teacherName || !email || !shortBio || lessonPrice === undefined || lessonPrice < 0) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء ملء جميع الحقول المطلوبة للمعلمة.' });
      return;
    }
    setIsInstructorSubmitting(true);
    const instructorData = { teacherName, email, shortBio, lessonPrice };
    try {
      if (currentInstructor.id) {
        setDocumentNonBlocking(doc(firestore, 'instructors', currentInstructor.id), instructorData, { merge: true });
        toast({ title: 'تم التحديث', description: 'تم تحديث بيانات المعلمة بنجاح.' });
      } else {
        addDocumentNonBlocking(instructorsCollection, instructorData);
        toast({ title: 'تمت الإضافة', description: 'تم إضافة معلمة جديدة بنجاح.' });
      }
      setIsInstructorDialogOpen(false);
      setCurrentInstructor({});
    } catch (error) { console.error(error); toast({ variant: 'destructive', title: 'خطأ فادح', description: 'فشل حفظ بيانات المعلمة.'}); }
    finally { setIsInstructorSubmitting(false); }
  };

  const handleDeleteInstructor = (instructorId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'instructors', instructorId));
    toast({ title: 'تم الحذف', description: 'تم حذف المعلمة بنجاح.' });
  };

  // --- Handlers for Courses ---
  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCurrentCourse(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveCourse = async () => {
      if (!firestore || !coursesCollection) return;
      const { title, description } = currentCourse;
      if (!title || !description) {
          toast({ variant: 'destructive', title: 'خطأ', description: 'عنوان الدورة ووصفها حقول إلزامية.' });
          return;
      }
      setIsCourseSubmitting(true);
      const courseData = { title, description };
      try {
          if (currentCourse.id) {
              setDocumentNonBlocking(doc(firestore, 'courses', currentCourse.id), courseData, { merge: true });
              toast({ title: 'تم التحديث', description: 'تم تحديث بيانات الدورة بنجاح.' });
          } else {
              addDocumentNonBlocking(coursesCollection, courseData);
              toast({ title: 'تمت الإضافة', description: 'تم إضافة دورة جديدة بنجاح.' });
          }
          setIsCourseDialogOpen(false);
          setCurrentCourse({});
      } catch (error) { console.error(error); toast({ variant: 'destructive', title: 'خطأ فادح', description: 'فشل حفظ بيانات الدورة.' }); }
      finally { setIsCourseSubmitting(false); }
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!firestore) return;
    // Note: This doesn't delete subcollections like lessons. For a production app, a Cloud Function would be needed for cascading deletes.
    deleteDocumentNonBlocking(doc(firestore, 'courses', courseId));
    toast({ title: 'تم الحذف', description: `تم حذف الدورة. (الدروس التابعة لها لم تحذف)` });
    if(selectedCourseForLessons?.id === courseId) setSelectedCourseForLessons(null);
  };
  
  // --- Handlers for Lessons ---
  const handleLessonInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentLesson(prev => ({ ...prev, [name]: name === 'order' ? Number(value) : value }));
  };

  const handleSaveLesson = async () => {
    if (!lessonsCollection || !firestore) return;
    const { title, content, order } = currentLesson;
    if (!title || !content || order === undefined) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'عنوان الدرس ومحتواه وترتيبه حقول إلزامية.' });
      return;
    }
    setIsLessonSubmitting(true);
    const lessonData = { title, content, order };
    try {
      if (currentLesson.id) {
        setDocumentNonBlocking(doc(lessonsCollection, currentLesson.id), lessonData, { merge: true });
        toast({ title: 'تم التحديث', description: 'تم تحديث بيانات الدرس بنجاح.' });
      } else {
        addDocumentNonBlocking(lessonsCollection, lessonData);
        toast({ title: 'تمت الإضافة', description: 'تم إضافة درس جديد بنجاح.' });
      }
      setIsLessonDialogOpen(false);
      setCurrentLesson({});
    } catch (error) { console.error(error); toast({ variant: 'destructive', title: 'خطأ فادح', description: 'فشل حفظ بيانات الدرس.' }); }
    finally { setIsLessonSubmitting(false); }
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!lessonsCollection) return;
    deleteDocumentNonBlocking(doc(lessonsCollection, lessonId));
    toast({ title: 'تم الحذف', description: 'تم حذف الدرس بنجاح.' });
  };
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-nile-dark text-white p-4 text-center">
          <Crown className="w-20 h-20 text-gold-accent mb-6"/>
          <h1 className="text-3xl font-bold royal-title mb-4">ديوان الإدارة الملكية (محتوى محمي)</h1>
          <p className="text-sand-ochre mb-8 max-w-md">عفواً أيها الزائر، هذه القاعة مخصصة فقط لحكام المملكة. يرجى تسجيل الدخول باستخدام أوراق اعتمادك الملكية للوصول إلى ديوان الإدارة.</p>
          <Link href="/login">
              <Button className="cta-button text-lg px-8">تسجيل الدخول إلى الديوان</Button>
          </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nile-dark p-8 text-white" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10 pb-4 border-b-4 border-gold-accent">
          <h1 className="text-4xl royal-title flex items-center gap-3"><Crown className="w-10 h-10"/>ديوان إدارة المملكة</h1>
          <Link href="/" className="utility-button px-4 py-2 text-sm font-bold rounded-lg flex items-center justify-center">
                <span>العودة للوحة التحكم الرئيسية</span>
          </Link>
        </header>

        {/* --- Dialogs --- */}
        <Dialog open={isInstructorDialogOpen} onOpenChange={setIsInstructorDialogOpen}>
          <DialogContent className="dashboard-card text-white">
            <DialogHeader><DialogTitle className="royal-title">{currentInstructor.id ? 'تعديل بيانات المعلمة' : 'إضافة معلمة جديدة'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Input name="teacherName" placeholder="اسم المعلمة" value={currentInstructor.teacherName || ''} onChange={handleInstructorInputChange} className="bg-nile-dark border-sand-ochre text-white" />
              <Input name="email" type="email" placeholder="البريد الإلكتروني" value={currentInstructor.email || ''} onChange={handleInstructorInputChange} className="bg-nile-dark border-sand-ochre text-white" />
              <Textarea name="shortBio" placeholder="وصف قصير" value={currentInstructor.shortBio || ''} onChange={handleInstructorInputChange} className="bg-nile-dark border-sand-ochre text-white" />
              <Input name="lessonPrice" type="number" placeholder="سعر الساعة (بالدولار)" value={currentInstructor.lessonPrice || ''} onChange={handleInstructorInputChange} className="bg-nile-dark border-sand-ochre text-white" />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline" className="utility-button">إلغاء</Button></DialogClose>
                <Button onClick={handleSaveInstructor} disabled={isInstructorSubmitting} className="cta-button">{isInstructorSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
          <DialogContent className="dashboard-card text-white">
            <DialogHeader><DialogTitle className="royal-title">{currentCourse.id ? 'تعديل بيانات الدورة' : 'إضافة دورة جديدة'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Input name="title" placeholder="عنوان الدورة" value={currentCourse.title || ''} onChange={handleCourseInputChange} className="bg-nile-dark border-sand-ochre text-white" />
              <Textarea name="description" placeholder="وصف الدورة" value={currentCourse.description || ''} onChange={handleCourseInputChange} className="bg-nile-dark border-sand-ochre text-white" />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" className="utility-button">إلغاء</Button></DialogClose>
              <Button onClick={handleSaveCourse} disabled={isCourseSubmitting} className="cta-button">{isCourseSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
          <DialogContent className="dashboard-card text-white">
            <DialogHeader><DialogTitle className="royal-title">{currentLesson.id ? 'تعديل الدرس' : 'إضافة درس جديد'}</DialogTitle></DialogHeader>
             <div className="grid gap-4 py-4">
               <Input name="title" placeholder="عنوان الدرس" value={currentLesson.title || ''} onChange={handleLessonInputChange} className="bg-nile-dark border-sand-ochre text-white" />
               <Textarea name="content" placeholder="محتوى الدرس (يدعم HTML)" value={currentLesson.content || ''} onChange={handleLessonInputChange} className="bg-nile-dark border-sand-ochre text-white h-48" />
               <Input name="order" type="number" placeholder="رقم ترتيب الدرس" value={currentLesson.order || ''} onChange={handleLessonInputChange} className="bg-nile-dark border-sand-ochre text-white" />
             </div>
             <DialogFooter>
               <DialogClose asChild><Button variant="outline" className="utility-button">إلغاء</Button></DialogClose>
               <Button onClick={handleSaveLesson} disabled={isLessonSubmitting} className="cta-button">{isLessonSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Instructors Card */}
            <Card className="dashboard-card">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="royal-title text-2xl">إدارة المعلمات</CardTitle><Button onClick={() => { setCurrentInstructor({}); setIsInstructorDialogOpen(true); }} className="cta-button"><PlusCircle className="ml-2 h-4 w-4" /> إضافة</Button></CardHeader>
              <CardContent>{isLoadingInstructors ? <p>جاري التحميل...</p> : <div className="space-y-4">{instructors?.map(instructor => (<div key={instructor.id} className="flex items-center justify-between p-4 rounded-lg bg-nile"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-sand-ochre text-nile-dark flex items-center justify-center"><User/></div><div><p className="font-bold text-lg">{instructor.teacherName}</p><p className="text-sm text-gray-400">{instructor.email}</p></div></div><div className="flex gap-2"><Button variant="ghost" size="icon" onClick={() => {setCurrentInstructor(instructor); setIsInstructorDialogOpen(true);}}><Edit/></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400"><Trash2/></Button></AlertDialogTrigger><AlertDialogContent className="dashboard-card text-white"><AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle><AlertDialogDescription>هذا الإجراء سيحذف المعلمة نهائياً.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="utility-button">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteInstructor(instructor.id)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>))}</div>}</CardContent>
            </Card>

            {/* Courses Card */}
            <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="royal-title text-2xl">إدارة الدورات</CardTitle><Button onClick={() => { setCurrentCourse({}); setIsCourseDialogOpen(true); }} className="cta-button"><PlusCircle className="ml-2 h-4 w-4" /> إضافة</Button></CardHeader>
                <CardContent>{isLoadingCourses ? <p>جاري التحميل...</p> : <div className="space-y-4">{courses?.map(course => (<div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-nile cursor-pointer hover:bg-sand-ochre/10" onClick={() => setSelectedCourseForLessons(course)}><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-sand-ochre text-nile-dark flex items-center justify-center"><BookOpen/></div><div><p className="font-bold text-lg">{course.title}</p></div></div><div className="flex gap-2"><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setCurrentCourse(course); setIsCourseDialogOpen(true); }}><Edit/></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400" onClick={(e) => e.stopPropagation()}><Trash2/></Button></AlertDialogTrigger><AlertDialogContent className="dashboard-card text-white"><AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle><AlertDialogDescription>سيؤدي هذا إلى حذف الدورة وجميع دروسها بشكل دائم.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="utility-button" onClick={(e) => e.stopPropagation()}>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCourse(course.id)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>))}</div>}</CardContent>
            </Card>

            {/* Lessons Card */}
            {selectedCourseForLessons && (
                 <Card className="dashboard-card lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="royal-title text-2xl">دروس دورة: {selectedCourseForLessons.title}</CardTitle>
                        <Button onClick={() => { setCurrentLesson({}); setIsLessonDialogOpen(true); }} className="cta-button"><PlusCircle className="ml-2 h-4 w-4" /> إضافة درس</Button>
                    </CardHeader>
                    <CardContent>
                        {isLoadingLessons ? <p>جاري تحميل الدروس...</p> : <div className="space-y-2">
                            {lessons?.sort((a,b) => a.order - b.order).map(lesson => (
                                <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-nile">
                                    <p className="font-bold">({lesson.order}) {lesson.title}</p>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => {setCurrentLesson(lesson); setIsLessonDialogOpen(true);}}><Edit/></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400"><Trash2/></Button></AlertDialogTrigger>
                                            <AlertDialogContent className="dashboard-card text-white">
                                                <AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle><AlertDialogDescription>هذا الإجراء سيحذف الدرس نهائياً.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="utility-button">إلغاء</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteLesson(lesson.id)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                            {lessons?.length === 0 && <p className="text-center text-sand-ochre py-4">لا توجد دروس في هذه الدورة بعد.</p>}
                        </div>}
                    </CardContent>
                 </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
