
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { PlusCircle, Edit, Trash2, Crown, Loader2 } from 'lucide-react';
import Link from 'next/link';

// --- Type Definitions ---
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
    courseId?: string;
}
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
}
interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
}
interface Hadith {
    id: string;
    text: string;
    source: string;
    topic: string;
}
interface Phrase {
    id: string;
    category: string;
    text: string;
    translation: string;
}


const AdminDashboardPage = () => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // --- Component State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState({
      instructor: false,
      course: false,
      lesson: false,
      product: false,
      book: false,
      hadith: false,
      phrase: false,
  });
  const [currentState, setCurrentState] = useState<any>({});
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);

  // --- Firestore Collections ---
  const instructorsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'instructors') : null, [firestore]);
  const coursesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'courses') : null, [firestore]);
  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const booksCollection = useMemoFirebase(() => firestore ? collection(firestore, 'books') : null, [firestore]);
  const hadithsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'hadiths') : null, [firestore]);
  const phrasesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'phrases') : null, [firestore]);
  const lessonsCollection = useMemoFirebase(() => (firestore && selectedCourseForLessons) ? collection(firestore, `courses/${selectedCourseForLessons.id}/lessons`) : null, [firestore, selectedCourseForLessons]);

  // --- Data Hooks ---
  const { data: instructors, isLoading: isLoadingInstructors } = useCollection<Instructor>(instructorsCollection);
  const { data: courses, isLoading: isLoadingCourses } = useCollection<Course>(coursesCollection);
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsCollection);
  const { data: books, isLoading: isLoadingBooks } = useCollection<Book>(booksCollection);
  const { data: hadiths, isLoading: isLoadingHadiths } = useCollection<Hadith>(hadithsCollection);
  const { data: phrases, isLoading: isLoadingPhrases } = useCollection<Phrase>(phrasesCollection);
  const { data: lessons, isLoading: isLoadingLessons } = useCollection<Lesson>(lessonsCollection);

  // --- Generic Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentState((prev: any) => ({ ...prev, [name]: (e.target.type === 'number') ? Number(value) : value }));
  };

  const openDialog = (type: keyof typeof dialogState, data = {}) => {
    setCurrentState(data);
    setDialogState(prev => ({ ...prev, [type]: true }));
  };
  
  const closeDialog = (type: keyof typeof dialogState) => {
    setDialogState(prev => ({ ...prev, [type]: false }));
    setCurrentState({});
  }

  const handleSave = async (collectionPath: string, data: any, requiredFields: string[], type: keyof typeof dialogState) => {
    if (!firestore) return;

    if (requiredFields.some(field => !data[field] && data[field] !== 0)) { // Allow 0 as a valid value for price/order
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء ملء جميع الحقول المطلوبة.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (data.id) {
        await setDocumentNonBlocking(doc(firestore, collectionPath, data.id), data, { merge: true });
        toast({ title: 'تم التحديث', description: 'تم تحديث البيانات بنجاح.' });
      } else {
        await addDocumentNonBlocking(collection(firestore, collectionPath), data);
        toast({ title: 'تمت الإضافة', description: 'تمت إضافة البيانات بنجاح.' });
      }
      closeDialog(type);
    } catch (error) { 
      console.error(error); 
      toast({ variant: 'destructive', title: 'خطأ فادح', description: `فشل حفظ البيانات في ${collectionPath}.`}); 
    } finally { 
      setIsSubmitting(false); 
    }
  };
  
  const handleDelete = (collectionName: string, docId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, collectionName, docId));
    toast({ title: 'تم الحذف', description: 'تم حذف العنصر بنجاح.' });
  };
  
  // --- Specific Save Handlers ---
  const handleSaveInstructor = () => handleSave('instructors', currentState, ['teacherName', 'email', 'shortBio', 'lessonPrice'], 'instructor');
  const handleSaveCourse = () => handleSave('courses', currentState, ['title', 'description'], 'course');
  const handleSaveProduct = () => handleSave('products', currentState, ['name', 'description', 'price', 'icon'], 'product');
  const handleSaveBook = () => handleSave('books', currentState, ['title', 'author', 'category'], 'book');
  const handleSaveHadith = () => handleSave('hadiths', currentState, ['text', 'source', 'topic'], 'hadith');
  const handleSavePhrase = () => handleSave('phrases', currentState, ['category', 'text', 'translation'], 'phrase');
  const handleSaveLesson = () => {
      if (!selectedCourseForLessons) return;
      const data = { ...currentState, courseId: selectedCourseForLessons.id };
      handleSave(`courses/${selectedCourseForLessons.id}/lessons`, data, ['title', 'content', 'order'], 'lesson');
  }


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

        {/* --- Generic Dialogs --- */}
        <Dialog open={dialogState.instructor} onOpenChange={(isOpen) => !isOpen && closeDialog('instructor')}>
          <DialogContent className="dashboard-card text-white">
            <DialogHeader><DialogTitle className="royal-title">{currentState.id ? 'تعديل بيانات المعلمة' : 'إضافة معلمة جديدة'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Input name="teacherName" placeholder="اسم المعلمة" value={currentState.teacherName || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
              <Input name="email" type="email" placeholder="البريد الإلكتروني" value={currentState.email || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
              <Textarea name="shortBio" placeholder="وصف قصير" value={currentState.shortBio || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
              <Input name="lessonPrice" type="number" placeholder="سعر الساعة (بالدولار)" value={currentState.lessonPrice || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline" className="utility-button">إلغاء</Button></DialogClose><Button onClick={handleSaveInstructor} disabled={isSubmitting} className="cta-button">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={dialogState.course} onOpenChange={(isOpen) => !isOpen && closeDialog('course')}>
          <DialogContent className="dashboard-card text-white">
            <DialogHeader><DialogTitle className="royal-title">{currentState.id ? 'تعديل بيانات الدورة' : 'إضافة دورة جديدة'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4"><Input name="title" placeholder="عنوان الدورة" value={currentState.title || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" /><Textarea name="description" placeholder="وصف الدورة" value={currentState.description || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" /></div>
            <DialogFooter><DialogClose asChild><Button variant="outline" className="utility-button">إلغاء</Button></DialogClose><Button onClick={handleSaveCourse} disabled={isSubmitting} className="cta-button">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogState.lesson} onOpenChange={(isOpen) => !isOpen && closeDialog('lesson')}>
          <DialogContent className="dashboard-card text-white">
            <DialogHeader><DialogTitle className="royal-title">{currentState.id ? 'تعديل الدرس' : 'إضافة درس جديد'}</DialogTitle></DialogHeader>
             <div className="grid gap-4 py-4"><Input name="title" placeholder="عنوان الدرس" value={currentState.title || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" /><Textarea name="content" placeholder="محتوى الدرس (يدعم HTML)" value={currentState.content || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white h-48" /><Input name="order" type="number" placeholder="رقم ترتيب الدرس" value={currentState.order || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" /></div>
             <DialogFooter><DialogClose asChild><Button variant="outline" className="utility-button">إلغاء</Button></DialogClose><Button onClick={handleSaveLesson} disabled={isSubmitting} className="cta-button">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogState.product} onOpenChange={(isOpen) => !isOpen && closeDialog('product')}>
            <DialogContent className="dashboard-card text-white">
                <DialogHeader><DialogTitle className="royal-title">{currentState.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input name="name" placeholder="اسم المنتج" value={currentState.name || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                    <Textarea name="description" placeholder="وصف المنتج" value={currentState.description || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                    <Input name="price" type="number" placeholder="السعر" value={currentState.price || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                    <Input name="icon" placeholder="أيقونة (مثل ScrollText)" value={currentState.icon || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                </div>
                <DialogFooter><DialogClose asChild><Button variant="outline" className="utility-button">إلغاء</Button></DialogClose><Button onClick={handleSaveProduct} disabled={isSubmitting} className="cta-button">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button></DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={dialogState.book} onOpenChange={(isOpen) => !isOpen && closeDialog('book')}>
            <DialogContent className="dashboard-card text-white">
                <DialogHeader><DialogTitle className="royal-title">{currentState.id ? 'تعديل الكتاب' : 'إضافة كتاب جديد'}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input name="title" placeholder="عنوان الكتاب" value={currentState.title || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                    <Input name="author" placeholder="المؤلف" value={currentState.author || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                    <Input name="category" placeholder="التصنيف (مثال: تفسير)" value={currentState.category || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                </div>
                <DialogFooter><DialogClose asChild><Button variant="outline" className="utility-button">إلغاء</Button></DialogClose><Button onClick={handleSaveBook} disabled={isSubmitting} className="cta-button">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button></DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={dialogState.hadith} onOpenChange={(isOpen) => !isOpen && closeDialog('hadith')}>
            <DialogContent className="dashboard-card text-white">
                <DialogHeader><DialogTitle className="royal-title">{currentState.id ? 'تعديل الحديث' : 'إضافة حديث جديد'}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea name="text" placeholder="نص الحديث" value={currentState.text || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                    <Input name="source" placeholder="المصدر (مثال: صحيح البخاري)" value={currentState.source || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                    <Input name="topic" placeholder="الموضوع (مثال: الإيمان)" value={currentState.topic || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                </div>
                <DialogFooter><DialogClose asChild><Button variant="outline" className="utility-button">إلغاء</Button></DialogClose><Button onClick={handleSaveHadith} disabled={isSubmitting} className="cta-button">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button></DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={dialogState.phrase} onOpenChange={(isOpen) => !isOpen && closeDialog('phrase')}>
            <DialogContent className="dashboard-card text-white">
                <DialogHeader><DialogTitle className="royal-title">{currentState.id ? 'تعديل العبارة' : 'إضافة عبارة جديدة'}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input name="category" placeholder="الفئة (مثل: التحيات)" value={currentState.category || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                    <Input name="text" placeholder="النص بالعامية المصرية" value={currentState.text || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                    <Input name="translation" placeholder="الترجمة بالإنجليزية" value={currentState.translation || ''} onChange={handleInputChange} className="bg-nile-dark border-sand-ochre text-white" />
                </div>
                <DialogFooter><DialogClose asChild><Button variant="outline" className="utility-button">إلغاء</Button></DialogClose><Button onClick={handleSavePhrase} disabled={isSubmitting} className="cta-button">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button></DialogFooter>
            </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Instructors Card */}
            <Card className="dashboard-card">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="royal-title text-2xl">إدارة المعلمات</CardTitle><Button onClick={() => openDialog('instructor')} className="cta-button"><PlusCircle className="ml-2 h-4 w-4" /> إضافة</Button></CardHeader>
              <CardContent>{isLoadingInstructors ? <Loader2 className="animate-spin" /> : <div className="space-y-2">{instructors?.map(item => (<div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-nile"><div><p className="font-bold">{item.teacherName}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openDialog('instructor', item)}><Edit/></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2/></Button></AlertDialogTrigger><AlertDialogContent className="dashboard-card text-white"><AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="utility-button">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('instructors', item.id)} className="bg-red-600">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>))}</div>}</CardContent>
            </Card>

            {/* Courses Card */}
            <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="royal-title text-2xl">إدارة الدورات</CardTitle><Button onClick={() => openDialog('course')} className="cta-button"><PlusCircle className="ml-2 h-4 w-4" /> إضافة</Button></CardHeader>
                <CardContent>{isLoadingCourses ? <Loader2 className="animate-spin" /> : <div className="space-y-2">{courses?.map(item => (<div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-nile cursor-pointer" onClick={() => setSelectedCourseForLessons(item)}><div><p className="font-bold">{item.title}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); openDialog('course', item);}}><Edit/></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500" onClick={(e) => e.stopPropagation()}><Trash2/></Button></AlertDialogTrigger><AlertDialogContent className="dashboard-card text-white"><AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="utility-button" onClick={(e) => e.stopPropagation()}>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('courses', item.id)} className="bg-red-600">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>))}</div>}</CardContent>
            </Card>

            {/* Products Card */}
            <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="royal-title text-2xl">إدارة المنتجات</CardTitle><Button onClick={() => openDialog('product')} className="cta-button"><PlusCircle className="ml-2 h-4 w-4" /> إضافة</Button></CardHeader>
                <CardContent>{isLoadingProducts ? <Loader2 className="animate-spin" /> : <div className="space-y-2">{products?.map(item => (<div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-nile"><div><p className="font-bold">{item.name}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openDialog('product', item)}><Edit/></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2/></Button></AlertDialogTrigger><AlertDialogContent className="dashboard-card text-white"><AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="utility-button">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('products', item.id)} className="bg-red-600">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>))}</div>}</CardContent>
            </Card>

             {/* Books Card */}
            <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="royal-title text-2xl">إدارة الكتب</CardTitle><Button onClick={() => openDialog('book')} className="cta-button"><PlusCircle className="ml-2 h-4 w-4" /> إضافة</Button></CardHeader>
                <CardContent>{isLoadingBooks ? <Loader2 className="animate-spin" /> : <div className="space-y-2">{books?.map(item => (<div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-nile"><div><p className="font-bold">{item.title}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openDialog('book', item)}><Edit/></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2/></Button></AlertDialogTrigger><AlertDialogContent className="dashboard-card text-white"><AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="utility-button">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('books', item.id)} className="bg-red-600">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>))}</div>}</CardContent>
            </Card>

            {/* Hadiths Card */}
            <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="royal-title text-2xl">إدارة الأحاديث</CardTitle><Button onClick={() => openDialog('hadith')} className="cta-button"><PlusCircle className="ml-2 h-4 w-4" /> إضافة</Button></CardHeader>
                <CardContent>{isLoadingHadiths ? <Loader2 className="animate-spin" /> : <div className="space-y-2">{hadiths?.map(item => (<div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-nile"><div><p className="font-bold truncate max-w-xs">{item.text}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openDialog('hadith', item)}><Edit/></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2/></Button></AlertDialogTrigger><AlertDialogContent className="dashboard-card text-white"><AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="utility-button">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('hadiths', item.id)} className="bg-red-600">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>))}</div>}</CardContent>
            </Card>
            
            {/* Phrases Card */}
            <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="royal-title text-2xl">إدارة العبارات (للتحديات)</CardTitle><Button onClick={() => openDialog('phrase')} className="cta-button"><PlusCircle className="ml-2 h-4 w-4" /> إضافة</Button></CardHeader>
                <CardContent>{isLoadingPhrases ? <Loader2 className="animate-spin" /> : <div className="space-y-2">{phrases?.map(item => (<div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-nile"><div><p className="font-bold truncate max-w-xs">{item.text}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openDialog('phrase', item)}><Edit/></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2/></Button></AlertDialogTrigger><AlertDialogContent className="dashboard-card text-white"><AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="utility-button">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('phrases', item.id)} className="bg-red-600">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>))}</div>}</CardContent>
            </Card>

            {/* Lessons Card */}
            {selectedCourseForLessons && (
                 <Card className="dashboard-card xl:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="royal-title text-2xl">دروس دورة: {selectedCourseForLessons.title}</CardTitle>
                        <Button onClick={() => openDialog('lesson')} className="cta-button"><PlusCircle className="ml-2 h-4 w-4" /> إضافة درس</Button>
                    </CardHeader>
                    <CardContent>
                        {isLoadingLessons ? <Loader2 className="animate-spin" /> : <div className="space-y-2">
                            {lessons?.sort((a,b) => a.order - b.order).map(lesson => (
                                <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-nile">
                                    <p className="font-bold">({lesson.order}) {lesson.title}</p>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openDialog('lesson', lesson)}><Edit/></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2/></Button></AlertDialogTrigger>
                                            <AlertDialogContent className="dashboard-card text-white">
                                                <AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel className="utility-button">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(`courses/${selectedCourseForLessons.id}/lessons`, lesson.id)} className="bg-red-600">حذف</AlertDialogAction></AlertDialogFooter>
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
