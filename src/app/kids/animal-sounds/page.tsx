'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Sparkles, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import placeholderData from '@/lib/placeholder-images.json';
import { getAnimalSoundFlow } from '@/ai/flows/animal-sound-flow';
import { useToast } from '@/hooks/use-toast';

type Animal = {
  id: string;
  name: string;
  imageHint: string;
  imageUrl: string;
};

const allAnimals: Animal[] = placeholderData.placeholderImages
  .filter(p => p.id.startsWith('animal-'))
  .map(p => ({
    id: p.id.replace('animal-', ''),
    name: p.metadata?.name || 'حيوان',
    imageHint: p.imageHint,
    imageUrl: p.imageUrl,
  }));

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function AnimalSoundsPage() {
  const { toast } = useToast();
  const [targetAnimal, setTargetAnimal] = useState<Animal | null>(null);
  const [options, setOptions] = useState<Animal[]>([]);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<{ [key: string]: 'correct' | 'incorrect' }>({});
  const [score, setScore] = useState(0);

  const startNewChallenge = useCallback(() => {
    setIsChallengeActive(true);
    setFeedback({});
    const shuffled = shuffleArray(allAnimals);
    const newOptions = shuffled.slice(0, 4);
    const newTarget = newOptions[Math.floor(Math.random() * newOptions.length)];
    
    setOptions(newOptions);
    setTargetAnimal(newTarget);

    // AI generates the sound for the target animal name
    getAnimalSoundFlow({ animalName: newTarget.name })
      .then(response => {
        if (response.audioDataUri) {
          const audio = new Audio(response.audioDataUri);
          audio.play();
        }
      })
      .catch(error => {
        console.error("Error generating animal sound:", error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "لم أتمكن من استدعاء صوت الحيوان. حاول مرة أخرى.",
        });
      });
  }, [toast]);

  useEffect(() => {
    // Automatically start the first challenge
    startNewChallenge();
  }, [startNewChallenge]);

  const handleOptionClick = (selectedAnimal: Animal) => {
    if (!targetAnimal || isChecking || feedback[selectedAnimal.id]) return;
    
    setIsChecking(true);
    const isCorrect = selectedAnimal.id === targetAnimal.id;

    if (isCorrect) {
      setFeedback({ [selectedAnimal.id]: 'correct' });
      setScore(s => s + 10);
      toast({
        title: "إجابة صحيحة!",
        description: `أحسنت! هذا هو صوت الـ${targetAnimal.name}.`,
      });
      // Automatically start next challenge after a short delay
      setTimeout(() => {
        startNewChallenge();
        setIsChecking(false);
      }, 1500);
    } else {
      setFeedback(prev => ({ ...prev, [selectedAnimal.id]: 'incorrect' }));
      toast({
        variant: 'destructive',
        title: "حاول مرة أخرى!",
        description: `هذا ليس صوت الـ${targetAnimal.name}.`,
      });
      setIsChecking(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-8 bg-nile-dark/30 p-6 rounded-2xl border-2 border-gold-accent/20">
        <h2 className="text-4xl font-bold kids-title">تحدي أصوات الحيوانات</h2>
        <p className="text-xl text-sand-ochre mt-2">
          استمع جيدًا للصوت، ثم اضغط على صورة الحيوان الصحيح!
        </p>
        <div className="mt-4 flex items-center justify-center gap-6">
            <Button onClick={startNewChallenge} disabled={isChecking} className="cta-button text-lg px-8 py-6">
                <Sparkles className="ml-2 h-5 w-5" />
                تحدي جديد
            </Button>
            <div className="text-2xl font-bold text-white bg-nile-blue/50 px-6 py-3 rounded-lg">
                النقاط: <span className="text-gold-accent">{score}</span>
            </div>
        </div>
        {isChallengeActive && targetAnimal && (
             <p className="text-lg text-white mt-4 animate-pulse">
                استمع... ما هو الحيوان الذي صوته يشبه هذا؟
             </p>
        )}
      </div>

      {!isChallengeActive && !targetAnimal ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-gold-accent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {options.map(animal => (
            <Card 
              key={animal.id} 
              className={`kids-card overflow-hidden text-center group cursor-pointer transition-all duration-300 ${feedback[animal.id] === 'correct' ? 'border-green-500 scale-105' : ''} ${feedback[animal.id] === 'incorrect' ? 'border-red-500' : ''}`}
              onClick={() => handleOptionClick(animal)}
            >
              <CardContent className="p-0 relative">
                <div className="relative aspect-square">
                  <Image
                    src={animal.imageUrl}
                    alt={animal.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint={animal.imageHint}
                  />
                   {feedback[animal.id] && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                       {feedback[animal.id] === 'correct' && <CheckCircle className="w-16 h-16 text-green-500"/>}
                       {feedback[animal.id] === 'incorrect' && <XCircle className="w-16 h-16 text-red-500"/>}
                     </div>
                   )}
                </div>
                <div className="p-4 bg-nile-blue/30">
                  <h3 className="text-2xl font-bold text-white font-cairo">{animal.name}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
