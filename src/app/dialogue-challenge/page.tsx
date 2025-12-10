
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getDialogueEvaluation } from './actions';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Store, Crown, Medal, Skull, Loader2 } from 'lucide-react';

// === Story Data ===
const storyScenario = [
  {
    id: 1,
    speaker: "بائع الطماطم (عم محمد)",
    text: "صباح الخير يا ريس. محتاج حاجة من الخضار الجميل ده؟ الطماطم لسه جاية من الغيط.",
    isUser: false,
    options: null,
  },
  {
    id: 2,
    speaker: "تحتمس القوي",
    text: "صباح النور. عايز كيلو طماطم لو سمحت.",
    isUser: true,
    options: [
      { text: "الخيار 1: عايز كيلو طماطم لو سمحت.", nextId: 3, type: 'correct' },
      { text: "الخيار 2: بكم الأرز؟", nextId: 2, type: 'wrong' }, // Corrected nextId to repeat the question
    ],
  },
  {
    id: 3,
    speaker: "بائع الطماطم (عم محمد)",
    text: "من عيني. الكيلو بخمسة جنيه. وهاخد كمان معاه كيس خيار صغير هدية عشانك.",
    isUser: false,
    options: null,
  },
  {
    id: 4,
    speaker: "تحتمس القوي",
    text: "تمام، شكراً جزيلاً. اتفضل الحساب.",
    isUser: true,
    options: [
      { text: "الخيار 1: تمام، شكراً جزيلاً. اتفضل الحساب.", nextId: 5, type: 'excellent' },
      { text: "الخيار 2: ما عايز أي حاجة تانية.", nextId: 5, type: 'good' },
    ],
  },
  {
    id: 5,
    speaker: "بائع الطماطم (عم محمد)",
    text: "يا هلا بيك في أي وقت! مع السلامة.",
    isUser: false,
    options: null,
  },
];

// === Sub-components ===

const ScoreHeader = ({ alias, nilePoints }: { alias: string, nilePoints: number }) => (
  <div className="flex justify-between items-center p-4 bg-[#17365e] rounded-t-xl border-b-2 border-[#d6b876] shadow-lg">
    <div className="text-right">
      <p className="text-xs text-gray-400">الاسم المستعار</p>
      <p className="text-xl font-extrabold text-[#FFD700] user-alias">{alias}</p>
    </div>
    <div className="flex items-center space-x-2 space-x-reverse">
      <i className="fas fa-gem text-2xl text-[#FFD700]"></i>
      <p className="text-2xl font-black text-white">{nilePoints}</p>
      <p className="text-sm text-gray-400 mr-1">نقاط النيل</p>
    </div>
  </div>
);

const DialogueBubble = React.forwardRef<HTMLDivElement, { speaker: string; text: string; isUser: boolean; isEvaluating: boolean }>(
  ({ speaker, text, isUser, isEvaluating }, ref) => {
    const baseClasses = "max-w-[80%] p-3 rounded-xl shadow-lg mb-4 transition-all duration-300";
    const bubbleClasses = isUser
      ? "bg-gold-accent/20 text-white ml-auto rounded-br-none border border-gold-accent"
      : "bg-nile text-gray-100 mr-auto rounded-tl-none border border-sand-ochre/50";
    const Icon = isUser ? User : Store;
    const iconColor = isUser ? "text-gold-accent" : "text-sand-ochre";

    return (
      <div ref={ref} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && <div className={`p-2 bg-nile-dark rounded-full mt-1 ${iconColor}`}><Icon className="w-6 h-6"/></div>}
        <div className={`${baseClasses} ${bubbleClasses} ${isEvaluating ? 'opacity-70' : ''}`}>
          <p className="font-bold text-xs opacity-80 mb-1">{speaker}</p>
          <p className="text-base whitespace-pre-wrap">{text}</p>
          {isEvaluating && (
            <div className="text-xs text-center mt-2 text-white opacity-90 flex justify-center items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin"/> يتم تقييم ردك...
            </div>
          )}
        </div>
        {isUser && <div className={`p-2 bg-nile-dark rounded-full mt-1 ${iconColor}`}><Icon className="w-6 h-6" /></div>}
      </div>
    );
  }
);
DialogueBubble.displayName = "DialogueBubble";

// === Main Component ===

export default function DialogueChallengePage() {
  const { user, isUserLoading } = useUser();
  const [alias, setAlias] = useState("تحتمس القوي"); // Default alias
  const [nilePoints, setNilePoints] = useState(1200);

  const [dialogue, setDialogue] = useState<any[]>([]);
  const [currentStepId, setCurrentStepId] = useState(1);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; score: number; isPositive: boolean } | null>(null);
  const [isChallengeComplete, setIsChallengeComplete] = useState(false);
  const dialogueEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToBottom();
  }, [dialogue, feedback]);


  useEffect(() => {
    // In a real app, fetch user alias and points from Firestore
    if (user?.displayName) {
        setAlias(user.displayName);
    }
    const firstStep = storyScenario.find(s => s.id === 1);
    if (firstStep) {
      setDialogue([firstStep]);
    }
  }, [user]);

  const handleUserChoice = useCallback(async (choice: any) => {
    if (isEvaluating || isChallengeComplete) return;
  
    // 1. Add user's choice bubble to dialogue
    const userText = choice.text.substring(choice.text.indexOf(':') + 2);
    const userDialogueStep = { ...storyScenario.find(s => s.id === currentStepId), text: userText };
    setDialogue(prev => [...prev, userDialogueStep]);
  
    // 2. Start evaluation
    setIsEvaluating(true);
    setFeedback(null);
  
    // 3. Get evaluation from AI
    const result = await getDialogueEvaluation({ userAnswer: userText, choiceType: choice.type });
  
    if (result.success) {
      const evaluation = result.success;
      
      // Use setTimeout to create a cinematic delay before showing feedback
      setTimeout(() => {
        setIsEvaluating(false);
        setNilePoints(prev => prev + evaluation.score);
        setFeedback({
          message: evaluation.feedback,
          score: evaluation.score,
          isPositive: evaluation.score >= 0,
        });

        const nextStepId = evaluation.nextId;

        // If the choice was wrong and we need to repeat, don't proceed
        if (nextStepId === currentStepId) {
          // Re-add the question options for the user to try again
          setTimeout(() => {
            const currentQuestionStep = storyScenario.find(s => s.id === currentStepId);
            setDialogue(prev => [...prev, currentQuestionStep]);
            setFeedback(null);
          }, 2000);
          return;
        }

        const nextStep = storyScenario.find(s => s.id === nextStepId);
        
        // Another delay before the next character speaks
        setTimeout(() => {
          if (nextStep) {
            setDialogue(prev => [...prev, nextStep]);
            setCurrentStepId(nextStepId);

            // Check if this is a final statement before the end
            if (!nextStep.isUser && !nextStep.options) {
                const finalStep = storyScenario.find(s => s.id === nextStep.id + 1);
                if (finalStep && !finalStep.isUser && !finalStep.options) {
                    setTimeout(() => {
                        setDialogue(prev => [...prev, finalStep]);
                        setIsChallengeComplete(true);
                    }, 1500);
                } else if (!finalStep) {
                   setIsChallengeComplete(true);
                }
            }
          } else {
             setIsChallengeComplete(true);
          }
        }, 1500);
      }, 1000); 

    } else {
      setIsEvaluating(false);
      setFeedback({ message: result.error || 'حدث خطأ في التقييم. حاول مرة أخرى.', score: 0, isPositive: false });
    }
  }, [alias, currentStepId, isEvaluating, isChallengeComplete]);
  
  
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d284e]">
        <p className="text-white text-xl flex items-center gap-2"><Loader2 className="animate-spin"/> جاري التحقق من هوية الفرعون...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-nile-dark text-white p-4 text-center">
        <i className="fas fa-lock text-5xl text-gold-accent mb-6"></i>
        <h1 className="text-3xl font-bold royal-title mb-4">محتوى ملكي محمي</h1>
        <p className="text-sand-ochre mb-8 max-w-md">
          عفواً أيها الزائر، هذه القاعة مخصصة فقط لأفراد المملكة المسجلين. يرجى تسجيل الدخول للوصول إلى هذا التحدي.
        </p>
        <Link href="/login">
            <Button className="cta-button text-lg px-8">تسجيل الدخول إلى المملكة</Button>
        </Link>
      </div>
    );
  }

  const currentDialogueItem = dialogue[dialogue.length - 1];
  const currentOptions = currentDialogueItem?.options;

  return (
    <div className="min-h-screen bg-[#0d284e] p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-[#0d284e] rounded-xl shadow-2xl dashboard-card" style={{ direction: 'rtl' }}>
        <ScoreHeader alias={alias} nilePoints={nilePoints} />
        
        <div className="p-4 md:p-6 h-[70vh] flex flex-col">
          <div className="flex-grow overflow-y-auto space-y-4 pb-4 px-2">
            {dialogue.map((item, index) => (
                <DialogueBubble 
                    key={index}
                    ref={index === dialogue.length - 1 ? dialogueEndRef : null}
                    speaker={item.speaker} 
                    text={item.text} 
                    isUser={item.isUser} 
                    isEvaluating={isEvaluating && item.id === currentStepId && item.isUser}
                />
            ))}
            {feedback && (
              <div ref={dialogueEndRef} className={`p-3 rounded-lg text-center shadow-inner mt-4 ${feedback.isPositive ? 'bg-green-800/50 text-green-200 border-green-600' : 'bg-red-800/50 text-red-200 border-red-600'} border`}>
                <p className="font-bold text-lg mb-1 flex items-center justify-center gap-2">
                  {feedback.isPositive ? <Medal /> : <Skull />}
                  {feedback.isPositive ? `تقييم فرعوني: (+${feedback.score} نقطة)` : `تنبيه: (${feedback.score} نقطة)`}
                </p>
                <p className="text-sm">{feedback.message}</p>
              </div>
            )}
            {isChallengeComplete && !isEvaluating && (
              <div ref={dialogueEndRef} className="p-4 bg-gold-accent text-nile-dark font-bold text-center rounded-lg mt-6 shadow-2xl border-2 border-nile-dark">
                <Crown className="w-12 h-12 mx-auto mb-2"/>
                <p className="text-xl">تهانينا يا {alias}، لقد أتقنت حوار السوق!</p>
                <p className="text-sm mt-1">يمكنك الآن العودة إلى لوحة التحكم الملكية.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t-2 border-sand-ochre/30">
            {currentOptions && !isEvaluating && !isChallengeComplete && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentOptions.map((choice:any, index:number) => (
                  <Button key={index} onClick={() => handleUserChoice(choice)} className="w-full text-right justify-start px-4 py-6 text-base bg-nile text-sand-ochre font-bold rounded-lg shadow-md hover:bg-sand-ochre/20 hover:text-white transition-colors disabled:opacity-50 border border-sand-ochre/50" disabled={isEvaluating}>
                    {choice.text}
                  </Button>
                ))}
              </div>
            )}
            {isEvaluating && (
              <div className="text-center py-4 text-sand-ochre">
                <Loader2 className="h-8 w-8 animate-spin mx-auto"/>
                <p className="mt-2 text-lg">الذكاء الاصطناعي يقوم بتقييم طلاقتك...</p>
              </div>
            )}
            {isChallengeComplete && !isEvaluating && (
                <Link href="/" className="w-full block text-center mt-3">
                  <Button className="cta-button px-8 py-3 text-lg">
                    العودة إلى لوحة التحكم الملكية
                  </Button>
                </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
