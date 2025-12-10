'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  VolumeUp,
  Loader,
  Mic,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { getSpeechAudio } from './actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Dictionary for all UI texts
const lang: Record<string, Record<string, string>> = {
  ar: {
    title: 'تحدي النطق الملكي',
    mentor: 'تحدي تلميذ النيل - الجملة الافتتاحية',
    instructions: 'استمع إلى الجملة ورددها بصوت واضح.',
    loading: 'جارٍ تجهيز صوت المرشد...',
    error: 'حدث خطأ: لا يمكن تشغيل الصوت.',
    record: 'سجل صوتك',
    next: 'التالي',
    go_back: 'العودة للوحة التحكم',
  },
  en: {
    title: 'The Royal Pronunciation Challenge',
    mentor: 'Disciple of the Nile Challenge - Opening Phrase',
    instructions: 'Listen to the sentence and repeat it clearly.',
    loading: "Preparing mentor's voice...",
    error: 'An error occurred: Cannot play audio.',
    record: 'Record Your Voice',
    next: 'Next',
    go_back: 'Back to Dashboard',
  },
    fr: {
        title: "Défi de Prononciation Royal",
        mentor: "Défi du Disciple du Nil - Phrase d'Ouverture",
        instructions: "Écoutez la phrase et répétez-la clairement.",
        loading: "Préparation de la voix du mentor...",
        error: "Une erreur s'est produite: lecture audio impossible.",
        record: "Enregistrer votre voix",
        next: "Suivant",
        go_back: "Retour au tableau de bord",
    },
    es: {
        title: "Desafío de Pronunciación Real",
        mentor: "Desafío del Discípulo del Nilo - Frase Inicial",
        instructions: "Escuche la frase y repítala claramente.",
        loading: "Preparando la voz del mentor...",
        error: "Ocurrió un error: No se puede reproducir el audio.",
        record: "Grabe su voz",
        next: "Siguiente",
        go_back: "Volver al Panel",
    },
     zh: {
        title: "皇家发音挑战",
        mentor: "尼罗河弟子挑战 - 开场白",
        instructions: "听句子并清晰地重复。",
        loading: "正在准备导师的声音...",
        error: "发生错误：无法播放音频。",
        record: "录制您的声音",
        next: "下一步",
        go_back: "返回仪表板",
    },
    it: {
        title: "Sfida di Pronuncia Reale",
        mentor: "Sfida del Discepolo del Nilo - Frase d'Apertura",
        instructions: "Ascolta la frase e ripetila chiaramente.",
        loading: "Preparando la voce del mentore...",
        error: "Si è verificato un errore: impossibile riprodurre l'audio.",
        record: "Registra la tua voce",
        next: "Avanti",
        go_back: "Torna alla Dashboard",
    },
    nl: {
        title: "Koninklijke Uitspraakuitdaging",
        mentor: "Leerling van de Nijl Uitdaging - Openingszin",
        instructions: "Luister naar de zin en herhaal deze duidelijk.",
        loading: "Bezig met het voorbereiden van de stem van de mentor...",
        error: "Er is een fout opgetreden: kan audio niet afspelen.",
        record: "Neem uw stem op",
        next: "Volgende",
        go_back: "Terug naar Dashboard",
    },
    de: {
        title: "Königliche Aussprache-Herausforderung",
        mentor: "Schüler des Nils Herausforderung - Eröffnungssatz",
        instructions: "Hören Sie sich den Satz an und wiederholen Sie ihn deutlich.",
        loading: "Stimme des Mentors wird vorbereitet...",
        error: "Ein Fehler ist aufgetreten: Audio kann nicht abgespielt werden.",
        record: "Nimm deine Stimme auf",
        next: "Weiter",
        go_back: "Zurück zum Dashboard",
    }
};

export default function PronunciationChallengePage() {
  const [currentLang, setCurrentLang] = useState('ar');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);

  const { toast } = useToast();
  const challengePhrase = 'صباح الخير، أنا كويس، متشكر.';
  const texts = lang[currentLang] || lang.ar;
  const isRtl = currentLang === 'ar';

  const fetchAudio = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    const result = await getSpeechAudio({ text: challengePhrase });

    if (result.success) {
      setAudioUrl(result.success);
      toast({
        title: '✅ الصوت جاهز',
        description: 'يمكنك الآن الاستماع إلى الجملة.',
      });
    } else {
      setError(result.error || texts.error);
      toast({
        variant: 'destructive',
        title: '❌ خطأ في الصوت',
        description: result.error || 'فشل في جلب المقطع الصوتي.',
      });
    }
    setIsLoading(false);
  }, [challengePhrase, texts.error, toast]);

  useEffect(() => {
    fetchAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        setIsChallengeCompleted(true); // Enable next step after listening
        toast({
            title: ' دورك الآن!',
            description: 'يمكنك تسجيل صوتك للممارسة.',
        });
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setError(texts.error);
        toast({
          variant: 'destructive',
          title: '❌ خطأ في التشغيل',
          description: 'لم نتمكن من تشغيل الملف الصوتي.',
        });
      }
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    if(document.documentElement) {
        document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = langCode;
    }
  };

   useEffect(() => {
    handleLanguageChange(currentLang);
   }, [currentLang]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
       <div className="fixed top-4 right-4 z-10 flex items-center gap-4">
        <Select onValueChange={handleLanguageChange} defaultValue={currentLang}>
          <SelectTrigger className="w-[180px] bg-nile text-white border-none royal-title">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">العربية (AR)</SelectItem>
            <SelectItem value="en">English (EN)</SelectItem>
            <SelectItem value="fr">Français (FR)</SelectItem>
            <SelectItem value="es">Español (ES)</SelectItem>
            <SelectItem value="zh">中文 (ZH)</SelectItem>
            <SelectItem value="it">Italiano (IT)</SelectItem>
            <SelectItem value="nl">Nederlands (NL)</SelectItem>
            <SelectItem value="de">Deutsch (DE)</SelectItem>
          </SelectContent>
        </Select>
         <Link href="/" className="utility-button px-4 py-2 text-md font-bold rounded-lg flex items-center justify-center">
            <i className={`fas fa-arrow-left ${isRtl ? 'ml-2' : 'mr-2'}`}></i>
            <span>{texts.go_back}</span>
        </Link>
      </div>

      <div className="w-full max-w-xl p-6 bg-white rounded-2xl shadow-2xl border-t-8 border-gold-accent">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-dark-granite mb-2">
            <span className="royal-title text-nile">{texts.title}</span>
          </h1>
          <p className="text-lg text-gray-600">{texts.mentor}</p>
        </div>

        <div className="challenge-card bg-white p-10 rounded-xl shadow-inner border border-gray-100 text-center">
          <div className="mb-8 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-4xl font-extrabold text-nile royal-title">
              {challengePhrase}
            </p>
          </div>

          <p className="text-xl mb-8 text-dark-granite font-bold">
            {texts.instructions}
          </p>

          <Button
            id="play-button"
            onClick={handlePlayAudio}
            disabled={isLoading || !audioUrl || isPlaying}
            className="shadow-lg mb-8 w-20 h-20 rounded-full bg-nile text-white text-3xl mx-auto flex items-center justify-center hover:bg-nile-dark transition-all duration-300 disabled:bg-gray-400"
          >
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : isPlaying ? (
                <i className="fas fa-pause"></i>
            ) : (
                <i className="fas fa-volume-up"></i>
            )}
          </Button>

          {isLoading && (
               <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                 <Loader className="animate-spin" size={16} /> {texts.loading}
               </p>
          )}

          {error && (
            <p className="text-sm text-red-600 flex items-center justify-center gap-2">
              <AlertTriangle size={16} /> {error}
            </p>
          )}

          <div className={`mt-8 flex ${isRtl ? 'justify-between' : 'justify-between flex-row-reverse'}`}>
            <Button
              disabled={!isChallengeCompleted} 
              className="cta-button px-6 py-3 text-lg rounded-full flex items-center"
            >
              <Mic className={isRtl ? 'ml-2' : 'mr-2'} />
              <span>{texts.record}</span>
            </Button>
            <Button
              disabled={!isChallengeCompleted}
              className="cta-button px-6 py-3 text-lg rounded-full flex items-center"
              onClick={() => {
                toast({ title: 'رائع!', description: 'سيتم نقلك للتحدي التالي.' });
              }}
            >
              <span>{texts.next}</span>
              {isRtl ? <ChevronLeft className="mr-2" /> : <ChevronRight className="ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
