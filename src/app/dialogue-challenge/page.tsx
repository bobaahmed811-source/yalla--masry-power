
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getDialogueEvaluation } from './actions';
import { useUser } from '@/firebase';

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
      { text: "الخيار 2: بكم الأرز؟", nextId: 0, type: 'wrong' },
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

const DialogueBubble = ({ speaker, text, isUser, isEvaluating }: { speaker: string, text: string, isUser: boolean, isEvaluating: boolean }) => {
  const baseClasses = "max-w-[80%] p-3 rounded-xl shadow-lg mb-4 transition-all duration-300";
  const bubbleClasses = isUser
    ? "bg-green-600 text-white ml-auto rounded-br-none"
    : "bg-[#0b4e8d] text-gray-100 mr-auto rounded-tl-none";
  const icon = isUser ? "fas fa-user-circle" : "fas fa-store";
  const iconColor = isUser ? "text-green-300" : "text-[#d6b876]";

  return (
    <div className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <i className={`${icon} text-2xl ${iconColor} mt-2 ml-2 flex-shrink-0`}></i>}
      <div className={`${baseClasses} ${bubbleClasses} ${isEvaluating ? 'opacity-70' : ''}`}>
        <p className="font-bold text-xs opacity-80 mb-1">{speaker}</p>
        <p className="text-base whitespace-pre-wrap">{text}</p>
        {isEvaluating && (
          <div className="text-xs text-center mt-2 text-white opacity-90 flex justify-center items-center">
            <i className="fas fa-spinner fa-spin mr-2"></i> يتم تقييم ردك...
          </div>
        )}
      </div>
      {isUser && <i className={`${icon} text-2xl ${iconColor} mt-2 mr-2 flex-shrink-0`}></i>}
    </div>
  );
};


// === Main Component ===

export default function DialogueChallengePage() {
  const { user } = useUser();
  const [alias, setAlias] = useState("تحتمس القوي"); // Default alias
  const [nilePoints, setNilePoints] = useState(1200);

  const [dialogue, setDialogue] = useState<any[]>([]);
  const [currentStepId, setCurrentStepId] = useState(1);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; score: number; isPositive: boolean } | null>(null);
  const [isChallengeComplete, setIsChallengeComplete] = useState(false);

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

    const userText = choice.text.substring(choice.text.indexOf(':') + 2);
    const userDialogue = { id: currentStepId, speaker: alias, text: userText, isUser: true };
    
    setDialogue(prev => {
        const updated = prev.map(d => d.id === currentStepId ? { ...d, options: null } : d);
        return [...updated, userDialogue];
    });

    setIsEvaluating(true);
    setFeedback(null);

    const result = await getDialogueEvaluation({ userAnswer: userText, choiceType: choice.type });

    setIsEvaluating(false);

    if (result.success) {
      const evaluation = result.success;
      setNilePoints(prev => prev + evaluation.score);
      setFeedback({
        message: evaluation.feedback,
        score: evaluation.score,
        isPositive: evaluation.score > 0,
      });

      let nextStepId = evaluation.nextId;
      
      const nextStep = storyScenario.find(s => s.id === nextStepId);
      if (nextStep) {
        setTimeout(() => {
          setDialogue(prev => [...prev, nextStep]);
          setCurrentStepId(nextStepId);
          if (nextStep.options === null && !nextStep.isUser) {
              const finalStep = storyScenario.find(s => s.id === nextStep.id + 1);
              if(finalStep){
                  setTimeout(() => {
                      setDialogue(prev => [...prev, finalStep]);
                      setCurrentStepId(finalStep.id);
                      setIsChallengeComplete(true);
                  }, 1500);
              } else {
                setIsChallengeComplete(true);
              }
          }
        }, 1000);
      } else {
        setIsChallengeComplete(true);
      }

    } else {
      setFeedback({ message: 'حدث خطأ في التقييم. حاول مرة أخرى.', score: 0, isPositive: false });
    }
  }, [alias, currentStepId, isEvaluating, isChallengeComplete]);
  
  const currentDialogueItem = dialogue.find(d => d.id === currentStepId);
  const currentOptions = currentDialogueItem?.options;

  return (
    <div className="min-h-screen bg-[#0d284e] p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-[#0d284e] rounded-xl shadow-2xl dashboard-card" style={{ direction: 'rtl' }}>
        <ScoreHeader alias={alias} nilePoints={nilePoints} />
        
        <div className="p-4 md:p-6 h-[70vh] flex flex-col">
          <div className="flex-grow overflow-y-auto space-y-4 pb-4">
            {dialogue.map((item, index) => (
              <DialogueBubble key={index} speaker={item.speaker} text={item.text} isUser={item.isUser} isEvaluating={item.id === currentStepId && isEvaluating} />
            ))}
            {feedback && (
              <div className={`p-3 rounded-lg text-center shadow-inner mt-4 ${feedback.isPositive ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                <p className="font-bold text-lg mb-1">
                  <i className={`ml-2 fas ${feedback.isPositive ? 'fa-medal' : 'fa-skull-crossbones'}`}></i>
                  {feedback.isPositive ? `تقييم فرعوني: (+${feedback.score} نقطة)` : `تنبيه: (${feedback.score} نقطة)`}
                </p>
                <p className="text-sm">{feedback.message}</p>
              </div>
            )}
            {isChallengeComplete && (
              <div className="p-4 bg-[#FFD700] text-[#0d284e] font-bold text-center rounded-lg mt-6 shadow-2xl border-2 border-[#0d284e]">
                <i className="fas fa-crown text-3xl mb-2"></i>
                <p className="text-xl">تهانينا يا {alias}، لقد أتقنت حوار السوق!</p>
                <p className="text-sm mt-1">يمكنك الآن العودة إلى لوحة التحكم الملكية.</p>
              </div>
            )}
            <div className="h-4"></div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-gray-600">
            {currentOptions && !isEvaluating && !isChallengeComplete && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentOptions.map((choice:any, index:number) => (
                  <button key={index} onClick={() => handleUserChoice(choice)} className="w-full px-4 py-3 bg-[#d6b876] text-[#0d284e] font-bold rounded-lg shadow-md hover:bg-[#FFD700] transition-colors disabled:opacity-50" disabled={isEvaluating}>
                    {choice.text}
                  </button>
                ))}
              </div>
            )}
            {isEvaluating && (
              <div className="text-center py-4 text-[#d6b876]">
                <i className="fas fa-spinner fa-spin text-3xl"></i>
                <p className="mt-2 text-lg">الذكاء الاصطناعي يقوم بتقييم طلاقتك...</p>
              </div>
            )}
            {isChallengeComplete && (
              <button className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors mt-3" onClick={() => window.location.href='/'}>
                العودة إلى لوحة التحكم الملكية
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
