
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Loader,
  Mic,
  StopCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle,
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
    recording: 'جاري التسجيل...',
    stop_recording: 'إيقاف التسجيل',
    next: 'التالي',
    go_back: 'العودة للوحة التحكم',
    play_audio: 'استمع للجملة',
    playing_audio: 'جاري التشغيل...',
    your_turn: 'حان دورك الآن!',
    record_prompt: 'يمكنك تسجيل صوتك ومقارنته.',
    next_prompt: 'رائع! سيتم نقلك للتحدي التالي.',
    audio_ready: 'الصوت جاهز',
    audio_ready_desc: 'يمكنك الآن الاستماع إلى الجملة.',
    audio_error_title: 'خطأ في الصوت',
    audio_error_desc: 'فشل في جلب المقطع الصوتي.',
    playback_error_title: 'خطأ في التشغيل',
    playback_error_desc: 'لم نتمكن من تشغيل الملف الصوتي.',
    mic_error_title: 'خطأ في الميكروفون',
    mic_error_desc: 'يرجى التأكد من إعطاء الإذن لاستخدام الميكروفون.',
    mic_unsupported_title: 'المتصفح غير مدعوم',
    mic_unsupported_desc: 'خاصية تسجيل الصوت غير مدعومة في هذا المتصفح.',
  },
  en: {
    title: 'The Royal Pronunciation Challenge',
    mentor: 'Disciple of the Nile Challenge - Opening Phrase',
    instructions: 'Listen to the sentence and repeat it clearly.',
    loading: "Preparing mentor's voice...",
    error: 'An error occurred: Cannot play audio.',
    record: 'Record Voice',
    recording: 'Recording...',
    stop_recording: 'Stop Recording',
    next: 'Next',
    go_back: 'Back to Dashboard',
    play_audio: 'Listen to Sentence',
    playing_audio: 'Playing...',
    your_turn: "It's your turn now!",
    record_prompt: 'You can record your voice and compare.',
    next_prompt: 'Great! You will be taken to the next challenge.',
    audio_ready: 'Audio Ready',
    audio_ready_desc: 'You can now listen to the sentence.',
    audio_error_title: 'Audio Error',
    audio_error_desc: 'Failed to fetch the audio clip.',
    playback_error_title: 'Playback Error',
    playback_error_desc: 'We could not play the audio file.',
    mic_error_title: 'Microphone Error',
    mic_error_desc: 'Please ensure you have given permission to use the microphone.',
    mic_unsupported_title: 'Browser Not Supported',
    mic_unsupported_desc: 'Audio recording is not supported in this browser.',
  },
};

export default function PronunciationChallengePage() {
  const [currentLang, setCurrentLang] = useState('ar');
  const [mentorAudioUrl, setMentorAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMentorPlaying, setIsMentorPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const { toast } = useToast();
  const challengePhrase = 'صباح الخير، أنا كويس، متشكر.';
  const texts = lang[currentLang] || lang.ar;
  const isRtl = currentLang === 'ar';

  const fetchAudio = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMentorAudioUrl(null);

    const result = await getSpeechAudio({ text: challengePhrase });

    if (result.success) {
      setMentorAudioUrl(result.success);
      toast({
        title: `✅ ${texts.audio_ready}`,
        description: texts.audio_ready_desc,
      });
    } else {
      setError(result.error || texts.error);
      toast({
        variant: 'destructive',
        title: `❌ ${texts.audio_error_title}`,
        description: result.error || texts.audio_error_desc,
      });
    }
    setIsLoading(false);
  }, [challengePhrase, texts, toast]);

  useEffect(() => {
    fetchAudio();
  }, [fetchAudio]);
  
  useEffect(() => {
    // Cleanup user audio URL on unmount
    return () => {
      if (userAudioUrl) {
        URL.revokeObjectURL(userAudioUrl);
      }
    };
  }, [userAudioUrl]);


  const handlePlayMentorAudio = () => {
    if (mentorAudioUrl && !isRecording) {
      const audio = new Audio(mentorAudioUrl);
      setIsMentorPlaying(true);
      audio.play();
      audio.onended = () => {
        setIsMentorPlaying(false);
        toast({
            title: `✅ ${texts.your_turn}`,
            description: texts.record_prompt,
        });
      };
      audio.onerror = () => {
        setIsMentorPlaying(false);
        setError(texts.error);
        toast({
          variant: 'destructive',
          title: `❌ ${texts.playback_error_title}`,
          description: texts.playback_error_desc,
        });
      }
    }
  };
  
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ variant: 'destructive', title: texts.mic_unsupported_title, description: texts.mic_unsupported_desc });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => audioChunks.push(event.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const newAudioUrl = URL.createObjectURL(audioBlob);
        setUserAudioUrl(newAudioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
      setUserAudioUrl(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({ variant: 'destructive', title: texts.mic_error_title, description: texts.mic_error_desc });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
    <div className="flex items-center justify-center min-h-screen bg-nile-dark p-4">
       <div className="fixed top-4 left-4 z-10 flex items-center gap-4">
        <Select onValueChange={handleLanguageChange} defaultValue={currentLang}>
          <SelectTrigger className="w-[180px] bg-gold-accent text-dark-granite border-none royal-title font-bold shadow-lg">
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

      <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-2xl dashboard-card text-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-dark-granite mb-2">
            <span className="royal-title text-gold-accent">{texts.title}</span>
          </h1>
          <p className="text-lg text-sand-ochre">{texts.mentor}</p>
        </div>

        <div className="bg-nile p-8 md:p-12 rounded-xl shadow-inner border-2 border-sand-ochre/20 text-center">
          <div className="mb-8 p-4 bg-nile-dark rounded-lg border-2 border-dashed border-sand-ochre">
            <p className="text-4xl font-extrabold text-white royal-title">
              {challengePhrase}
            </p>
          </div>

          <p className="text-xl mb-8 text-sand-ochre font-bold">
            {texts.instructions}
          </p>

          <div className="flex justify-center items-center gap-6 mb-8">
            {/* Mentor Audio Button */}
            <div className="flex flex-col items-center gap-2">
                <Button
                    id="play-button"
                    onClick={handlePlayMentorAudio}
                    disabled={isLoading || !mentorAudioUrl || isMentorPlaying || isRecording}
                    className="shadow-lg w-24 h-24 rounded-full bg-gold-accent text-nile-dark text-3xl mx-auto flex items-center justify-center hover:bg-yellow-300 transition-all duration-300 disabled:bg-gray-400 transform hover:scale-110"
                >
                    {isLoading ? <Loader className="animate-spin" /> : isMentorPlaying ? <Pause /> : <Play />}
                </Button>
                <span className="text-sm font-bold text-sand-ochre">{texts.play_audio}</span>
            </div>

            {/* User Record Button */}
            <div className="flex flex-col items-center gap-2">
                <Button
                    id="record-button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isMentorPlaying}
                    className={`shadow-lg w-24 h-24 rounded-full text-white text-3xl mx-auto flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isRecording ? <StopCircle /> : <Mic />}
                </Button>
                 <span className="text-sm font-bold text-sand-ochre">{isRecording ? texts.stop_recording : texts.record}</span>
            </div>
          </div>
          
          {userAudioUrl && (
            <div className="mt-6">
                <h3 className="text-sand-ochre font-bold mb-2">استمع لتسجيلك:</h3>
                <audio src={userAudioUrl} controls className="w-full" />
            </div>
           )}

          {isLoading && (
               <p className="text-sm text-sand-ochre flex items-center justify-center gap-2">
                 <Loader className="animate-spin" size={16} /> {texts.loading}
               </p>
          )}

          {error && (
            <p className="text-sm text-red-500 flex items-center justify-center gap-2">
              <AlertTriangle size={16} /> {error}
            </p>
          )}

          <div className={`mt-10 flex justify-end`}>
            <Button
              disabled={!userAudioUrl}
              className="cta-button px-6 py-3 text-lg rounded-full flex items-center"
              onClick={() => {
                toast({ title: 'رائع!', description: texts.next_prompt });
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
