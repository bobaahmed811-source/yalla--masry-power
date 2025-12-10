
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, Gem } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

// === Game Data ===
const ALIAS = "تحتمس الصغير"; // This will be replaced by user's display name
const PUZZLES = [
  {
    id: 1,
    sentence: "أنا عايز عيش بلدي", // I want local bread
    arabicTranslation: "أريد خبزاً محلياً.",
  },
  {
    id: 2,
    sentence: "الجو حر أوي النهارده", // The weather is very hot today
    arabicTranslation: "الطقس حار جداً اليوم.",
  },
  {
    id: 3,
    sentence: "يا جدعان أنا جعان", // Hey guys, I'm hungry
    arabicTranslation: "يا قوم، أنا جائع.",
  },
];

// Shuffle words function
const shuffleWords = (sentence: string) => {
  const words = sentence.split(' ');
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words;
};

// ===================================
// Drag and Drop Item Types
// ===================================
const ItemTypes = { WORD: 'word' };


// ===================================
// GameContent Component (uses DND Hooks)
// ===================================
const GameContent = () => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [message, setMessage] = useState('');
  const [nilePoints, setNilePoints] = useState(0);

  const alias = user?.displayName || ALIAS;
  const currentPuzzle = PUZZLES[currentPuzzleIndex];
  const correctSentence = currentPuzzle?.sentence;

  useEffect(() => {
    if (user && user.nilePoints) {
      setNilePoints(user.nilePoints);
    }
  }, [user]);
  
  useEffect(() => {
    if (currentPuzzle) {
      setShuffledWords(shuffleWords(currentPuzzle.sentence));
      setArrangedWords([]);
      setIsCorrect(false);
      setMessage('');
    }
  }, [currentPuzzleIndex, currentPuzzle]);

  const moveWordInArrangeArea = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setArrangedWords(prevWords => {
        const newWords = [...prevWords];
        const [removed] = newWords.splice(dragIndex, 1);
        newWords.splice(hoverIndex, 0, removed);
        return newWords;
      });
    },
    []
  );

  const dropWord = useCallback((item: { word: string, index: number, source: 'shuffled' | 'arranged' }) => {
    if (item.source === 'shuffled') {
      setArrangedWords(prev => [...prev, item.word]);
      setShuffledWords(prev => prev.filter((_, i) => i !== item.index));
    }
  }, []);

  const returnWord = useCallback((item: { word: string, index: number, source: 'shuffled' | 'arranged' }) => {
    if(item.source === 'arranged'){
        setShuffledWords(prev => [...prev, item.word]);
        setArrangedWords(prev => prev.filter((_, i) => i !== item.index));
    }
  }, []);


  const checkAnswer = useCallback(async () => {
    if (!correctSentence || !user || !firestore) return;
    const userSentence = arrangedWords.join(' ');

    if (userSentence === correctSentence) {
      const pointsToAward = 50;
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        nilePoints: increment(pointsToAward)
      });
      setNilePoints(prev => prev + pointsToAward);
      setIsCorrect(true);
      setMessage(`أحسنت يا ${alias}! بناء الجملة الفرعوني سليم. (+${pointsToAward} نقطة نيل)`);
    } else {
      setIsCorrect(false);
      setMessage('حاول مجدداً! ترتيب الكلمات غير صحيح.');
    }
  }, [arrangedWords, correctSentence, alias, user, firestore]);

  const nextPuzzle = useCallback(() => {
    const nextIndex = currentPuzzleIndex + 1;
    if (nextIndex < PUZZLES.length) {
      setCurrentPuzzleIndex(nextIndex);
    } else {
      setMessage(`تهانينا يا ${alias}! أكملت كل تحديات ترتيب الكلمات لهذا اليوم.`);
      setIsCorrect(true);
    }
  }, [currentPuzzleIndex, alias]);

  const ScoreHeader = ({ alias, nilePoints }: { alias: string, nilePoints: number }) => (
    <div className="flex justify-between items-center p-4 bg-[#17365e] rounded-t-xl border-b-2 border-[#d6b876] shadow-lg">
      <div className="text-right">
        <p className="text-xs text-gray-400">الاسم المستعار</p>
        <p className="text-xl font-extrabold text-[#FFD700] user-alias">{alias}</p>
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
        <Gem className="w-6 h-6 text-[#FFD700]" />
        <p className="text-2xl font-black text-white">{nilePoints}</p>
        <p className="text-sm text-gray-400 mr-1">نقاط النيل</p>
      </div>
    </div>
  );

  const [, arrangeDrop] = useDrop(() => ({ 
      accept: ItemTypes.WORD,
      drop: (item: any) => dropWord(item)
  }));
  
  const [, sourceDrop] = useDrop(() => ({ 
      accept: ItemTypes.WORD,
      drop: (item: any) => returnWord(item)
  }));

  if (!currentPuzzle || isUserLoading) {
    return (
      <div className="flex items-center justify-center text-white p-10">
        <p>جاري تحميل تحديات فرعونية جديدة...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl bg-[#0d284e] rounded-xl shadow-2xl dashboard-card" style={{ direction: 'rtl' }}>

      <ScoreHeader alias={alias} nilePoints={nilePoints} />

      <div className="p-4 md:p-8">
        <h2 className="text-3xl font-extrabold text-[#FFD700] mb-4 text-center royal-title">رتّب كلمات الفراعنة 👑</h2>
        <p className="text-gray-300 text-lg mb-6 text-center">اسحب الكلمات لترتيب الجملة بالعامية المصرية.</p>
        
        <div ref={arrangeDrop} className={`min-h-[120px] p-4 border-2 rounded-xl flex flex-wrap justify-center items-center transition-colors duration-300 ${isCorrect ? 'border-green-500 bg-green-900/30' : 'border-gray-500 border-dashed bg-[#1c3d6d]'}`}>
          {arrangedWords.length > 0 ? arrangedWords.map((word, index) => (
            <DraggableWord key={`${word}-${index}-arranged`} id={`${word}-${index}`} word={word} index={index} source="arranged" moveWord={moveWordInArrangeArea} isLocked={isCorrect} />
          )) : <p className="text-gray-400 text-lg">اسحب الكلمات إلى هنا...</p>}
        </div>

        <div ref={sourceDrop} className="min-h-[100px] mt-6 p-4 bg-[#17365e]/50 rounded-lg flex flex-wrap justify-center items-center">
            {shuffledWords.map((word, index) => (
               <DraggableWord key={`${word}-${index}-shuffled`} id={`${word}-${index}`} word={word} index={index} source="shuffled" moveWord={() => {}} isLocked={isCorrect} />
            ))}
        </div>
        
        <div className="mt-4 p-3 bg-[#17365e] rounded-lg shadow-inner">
          <p className="text-sm text-gray-400">المعنى المراد بالفصحى:</p>
          <p className="text-base font-bold text-white">{currentPuzzle.arabicTranslation}</p>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-lg text-center font-bold shadow-lg ${isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {message}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
          {!isCorrect ? (
            <Button onClick={checkAnswer} className="cta-button px-8 py-3 text-lg rounded-full w-full sm:w-auto" disabled={!user}>
              <Check className="ml-2 h-5 w-5" /> تحقق من الإجابة
            </Button>
          ) : (
            <Button onClick={nextPuzzle} className="cta-button bg-green-600 hover:bg-green-700 px-8 py-3 text-lg rounded-full w-full sm:w-auto">
              {currentPuzzleIndex < PUZZLES.length - 1 ? 'التحدي التالي' : 'إنهاء التحدي'}
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="utility-button w-full">العودة للوحة التحكم</Button>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          التحدي {currentPuzzleIndex + 1} من {PUZZLES.length}
        </p>
      </div>
    </div>
  );
};

const DraggableWord = ({ id, word, index, source, moveWord, isLocked } : { id: any, word: string, index: number, source: 'shuffled' | 'arranged', moveWord: Function, isLocked: boolean }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop({
        accept: ItemTypes.WORD,
        hover(item: { index: number, source: 'shuffled' | 'arranged' }, monitor) {
            if (!ref.current || isLocked || source === 'shuffled' || item.source === 'shuffled') return;
            if(item.source !== 'arranged') return;
            
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            
            moveWord(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.WORD,
        item: { word, index, source },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        canDrag: !isLocked,
    }));
    
    drag(drop(ref));

    const wordClasses = `px-4 py-2 mx-1 my-1 rounded-full text-lg font-semibold shadow-md transition-all duration-200 
    ${isLocked ? 'bg-green-700 text-white cursor-default' : 'bg-[#d6b876] text-[#0d284e] hover:bg-[#FFD700] cursor-grab active:cursor-grabbing'}
    `;

    return (
        <div ref={ref} className={wordClasses} style={{ opacity: isDragging ? 0.5 : 1 }}>
            {word}
        </div>
    );
};

const WordScramblePage = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#0d284e] p-4 md:p-8 flex items-center justify-center">
        <GameContent />
      </div>
    </DndProvider>
  );
};

export default WordScramblePage;
