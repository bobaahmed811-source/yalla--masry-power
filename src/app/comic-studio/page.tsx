'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  WandSparkles,
  CheckCircle,
  Loader,
  XCircle,
  Mic,
  StopCircle,
  Save,
  Baby,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { getComicDialog } from './actions';

type StatusType = 'info' | 'loading' | 'success' | 'error';

const StatusDisplay = ({
  type,
  message,
}: {
  type: StatusType;
  message: string;
}) => {
  const ICONS: Record<StatusType, React.ReactNode> = {
    info: <CheckCircle className="w-4 h-4 text-gray-500" />,
    loading: <Loader className="w-4 h-4 text-blue-500 animate-spin" />,
    success: <CheckCircle className="w-4 h-4 text-green-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
  };

  const TEXT_COLORS: Record<StatusType, string> = {
    info: 'text-gray-500',
    loading: 'text-blue-500',
    success: 'text-green-500',
    error: 'text-red-500',
  };

  return (
    <div className={`flex items-center space-x-2 space-x-reverse ${TEXT_COLORS[type]}`}>
      {ICONS[type]}
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default function ComicStudioPage() {
  const searchParams = useSearchParams();
  const isKidsMode = searchParams.get('mode') === 'kids';

  const defaultScene = isKidsMode ? 'zoo' : 'family';
  const scenes = isKidsMode 
    ? [
        { value: 'zoo', label: '1. حديقة الحيوان' },
        { value: 'playground', label: '2. الملعب' },
        { value: 'birthday', label: '3. حفلة عيد ميلاد' },
      ]
    : [
        { value: 'market', label: '1. السوق الشعبي' },
        { value: 'school', label: '2. فناء المدرسة' },
        { value: 'family', label: '3. العشاء العائلي' },
      ];

  const [scene, setScene] = useState(defaultScene);
  const [dialogue, setDialogue] = useState<string[]>(isKidsMode ? ['يا سلام! الأسد كبير أوي.', 'والزرافة طويلة خالص!', 'أنا بحب حديقة الحيوان.'] : ['مرحباً!', 'كيف حالك اليوم؟', 'أنا بخير، شكراً لك!']);
  const [status, setStatus] = useState<{ type: StatusType; message: string }>({
    type: 'info',
    message: 'جاهز لتوليد الحوار.',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const appId = 'yalla-masry-academy'; // This would typically come from env variables

  useEffect(() => {
    // Cleanup audio URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerateDialog = async () => {
    setIsGenerating(true);
    setStatus({ type: 'loading', message: 'الذكاء الاصطناعي يكتب الحوار...' });
    const result = await getComicDialog({ scene });

    if (result.success && result.dialogue) {
      setDialogue(result.dialogue);
      setStatus({ type: 'success', message: 'تم توليد الحوار بنجاح!' });
    } else {
      setDialogue(['حدث خطأ ما.', 'لا يمكن توليد الحوار.', 'يرجى المحاولة مرة أخرى.']);
      setStatus({ type: 'error', message: result.error || 'فشل توليد الحوار.' });
      toast({
        variant: 'destructive',
        title: 'خطأ في توليد الحوار',
        description: result.error || 'حدث خطأ غير متوقع.',
      });
    }
    setIsGenerating(false);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'المتصفح غير مدعوم',
        description: 'خاصية تسجيل الصوت غير مدعومة في هذا المتصفح.',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const newAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(newAudioBlob);
        const newAudioUrl = URL.createObjectURL(newAudioBlob);
        setAudioUrl(newAudioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setStatus({ type: 'loading', message: 'جاري التسجيل...' });
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        variant: 'destructive',
        title: 'فشل الوصول للميكروفون',
        description: 'يرجى التأكد من إعطاء الإذن لاستخدام الميكروفون.',
      });
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus({
        type: 'info',
        message: 'تم الإيقاف. استمع للتسجيل أو احفظه.',
      });
    }
  };

  const handleSubmitAudio = async () => {
    if (!user) {
       toast({ variant: 'destructive', title: 'خطأ', description: 'يجب تسجيل الدخول لحفظ الأداء.' });
       return;
    }
     if (!audioBlob) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'لا يوجد تسجيل لحفظه.' });
       return;
    }
     if (!firestore) {
       toast({ variant: 'destructive', title: 'خطأ', description: 'خدمة قاعدة البيانات غير متاحة.' });
       return;
    }

    setStatus({ type: 'loading', message: 'جاري حفظ الأداء...' });

    // Note: In a real-world app, you'd upload the audioBlob to Firebase Storage
    // and then save the URL in Firestore. For this prototype, we'll just save the metadata.
    const performanceCollectionPath = `/artifacts/${appId}/users/${user.uid}/comic_performances`;
    const performanceData = {
      userId: user.uid,
      scene: scene,
      generatedDialog: dialogue,
      recordingDate: new Date().toISOString(),
      audioMimeType: audioBlob.type,
      status: 'Pending Review',
    };
    
    addDocumentNonBlocking(collection(firestore, performanceCollectionPath), performanceData);

    toast({
        title: 'تم حفظ الأداء بنجاح!',
        description: 'سيتم تقييمه قريبًا من قبل معلمك.',
    });
    setStatus({ type: 'success', message: 'تم حفظ الأداء بنجاح!' });
    setAudioBlob(null);
    if(audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };


  return (
    <div className="min-h-screen bg-[#e0f2f1] p-4 sm:p-6 lg:p-8" style={{direction: 'rtl'}}>
      <header className="comic-bg shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {isKidsMode ? 'مغامرة الدبلجة' : 'استوديو القصص المصورة'}
            </h1>
            <Link href={isKidsMode ? "/kids" : "/"} className="text-sm font-semibold text-white hover:text-gray-200 transition">
                 {isKidsMode ? 'العودة لركن الأطفال' : 'العودة للوحة التحكم'}
            </Link>
        </div>
      </header>
       <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">اصنع قصتك وكن نجم الدبلجة!</h2>
            <p className="text-lg text-gray-600 mb-10">اختر مشهداً، ثم اطلب من الذكاء الاصطناعي توليد حوار بالعامية، وسجل صوتك لتؤدي الدور!</p>

             <Card className="p-6 mb-10 border-t-4 border-amber-400">
                 <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3 space-x-reverse w-full md:w-auto">
                        <label htmlFor="scene-select" className="font-semibold text-gray-700 whitespace-nowrap">اختر مشهد:</label>
                        <Select onValueChange={setScene} defaultValue={scene}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="اختر مشهدًا" />
                            </SelectTrigger>
                            <SelectContent>
                                {scenes.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleGenerateDialog} disabled={isGenerating} className="comic-btn-primary">
                        <WandSparkles className="ml-2 h-4 w-4" />
                        {isGenerating ? 'جاري التوليد...' : 'توليد حوار العامية'}
                    </Button>
                    
                    <StatusDisplay type={status.type} message={status.message} />
                 </div>
            </Card>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {[1, 2, 3].map((panelNum) => (
                    <div key={panelNum} className="comic-panel">
                         <div className="absolute top-2 right-2 bg-black text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg">{panelNum}</div>
                         <div className="flex-grow flex items-center justify-center">
                            <Image src={`https://picsum.photos/seed/${scene}${panelNum}/400/400`} alt={`Scene panel ${panelNum}`} width={200} height={200} className="rounded-lg object-cover" data-ai-hint="comic scene" />
                        </div>
                         <div className="speech-bubble">
                            <p className="text-center font-semibold">
                                {dialogue[panelNum - 1] || `...`}
                            </p>
                        </div>
                    </div>
                ))}
            </section>
            
            <Card className="mt-8 p-6 bg-blue-50 shadow-inner">
                 <h3 className="text-xl font-bold text-gray-700 mb-4">تدريب النطق (أداء الأدوار)</h3>
                <div className="flex items-center justify-between space-x-4 space-x-reverse">
                    <p className="text-sm text-gray-500">سجل صوتك وأنت تقرأ الحوار بالترتيب. سيتم حفظ التسجيل.</p>
                     <div className="flex space-x-4 space-x-reverse">
                        <Button onClick={startRecording} disabled={isRecording || dialogue.length === 0} variant="destructive">
                            <Mic className="ml-2 h-4 w-4" /> تسجيل
                        </Button>
                         <Button onClick={stopRecording} disabled={!isRecording} variant="secondary">
                            <StopCircle className="ml-2 h-4 w-4" /> إيقاف
                        </Button>
                         <Button onClick={handleSubmitAudio} disabled={!audioBlob} className="bg-green-600 hover:bg-green-700">
                             <Save className="ml-2 h-4 w-4" /> حفظ الأداء
                        </Button>
                    </div>
                </div>
                 {isRecording && <div className="mt-3 text-sm text-red-600 font-medium animate-pulse">جاري التسجيل...</div>}
                {audioUrl && (
                    <div className="mt-4">
                        <audio src={audioUrl} controls className="w-full" />
                    </div>
                )}
            </Card>
        </div>
    </main>
    <style jsx>{`
      .comic-bg {
        background: linear-gradient(45deg, #f97316, #ef4444);
        border-radius: 0.75rem;
      }
      .comic-btn-primary {
        background-color: #2563eb;
        color: white;
        font-weight: bold;
        border-radius: 9999px;
        padding: 0.75rem 1.5rem;
        transition: background-color 0.3s;
      }
      .comic-btn-primary:hover:not(:disabled) {
        background-color: #1d4ed8;
      }
      .comic-btn-primary:disabled {
        background-color: #9ca3af;
        cursor: not-allowed;
      }
      .comic-panel {
        background-color: white;
        border: 4px solid black;
        border-radius: 0.5rem;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        position: relative;
        box-shadow: 5px 5px 0px black;
      }
      .speech-bubble {
        margin-top: 1rem;
        position: relative;
        background: #e0f2f1;
        border-radius: .4em;
        padding: 1rem;
        border: 2px solid black;
      }

      .speech-bubble:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 0;
        border: 20px solid transparent;
        border-top-color: #e0f2f1;
        border-bottom: 0;
        border-left: 0;
        margin-left: -10px;
        margin-bottom: -20px;
      }
    `}</style>
    </div>
  );
}
