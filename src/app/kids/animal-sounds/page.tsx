'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';
import placeholderData from '@/lib/placeholder-images.json';
import { Button } from '@/components/ui/button';

type Animal = {
    id: string;
    name: string;
    imageHint: string;
    imageUrl: string;
    soundUrl: string; // We'll use placeholder audio URLs for now
};

const animalData = [
    { id: 'cat', name: 'قطة', placeholderId: 'animal-cat', soundUrl: '/sounds/cat.mp3' },
    { id: 'dog', name: 'كلب', placeholderId: 'animal-dog', soundUrl: '/sounds/dog.mp3' },
    { id: 'horse', name: 'حصان', placeholderId: 'animal-horse', soundUrl: '/sounds/horse.mp3' },
    { id: 'donkey', name: 'حمار', placeholderId: 'animal-donkey', soundUrl: '/sounds/donkey.mp3' },
    { id: 'camel', name: 'جمل', placeholderId: 'animal-camel', soundUrl: '/sounds/camel.mp3' },
    { id: 'duck', name: 'بطة', placeholderId: 'animal-duck', soundUrl: '/sounds/duck.mp3' },
];

const animals: Animal[] = animalData.map(animal => {
    const placeholder = placeholderData.placeholderImages.find(p => p.id === animal.placeholderId);
    if (!placeholder) {
        // Return a default or throw an error if a placeholder is essential
        return {
            ...animal,
            imageUrl: 'https://placehold.co/400x400/0d284e/FFD700?text=Not+Found',
            imageHint: 'not found',
        };
    }
    return {
        ...animal,
        imageUrl: placeholder.imageUrl,
        imageHint: placeholder.imageHint,
    };
}).filter((animal): animal is Animal => animal !== null);


const AnimalCard = ({ animal }: { animal: Animal }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = () => {
    // In a real app, we would use a more robust audio solution.
    // For now, we'll simulate the audio playing.
    setIsPlaying(true);
    console.log(`Playing sound for ${animal.name}: ${animal.soundUrl}`);
    // This is where you would use the Web Audio API or a library like howler.js
    // const audio = new Audio(animal.soundUrl);
    // audio.play();
    // audio.onended = () => setIsPlaying(false);
    setTimeout(() => setIsPlaying(false), 1000); // Simulate sound playing for 1 second
  };

  return (
    <Card className="kids-card overflow-hidden text-center group">
      <CardContent className="p-0">
        <div className="relative aspect-square">
           <Image
              src={animal.imageUrl}
              alt={animal.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              data-ai-hint={animal.imageHint}
            />
        </div>
        <div className="p-4 bg-nile-blue/30">
            <h3 className="text-2xl font-bold text-white font-cairo mb-2">{animal.name}</h3>
            <Button onClick={playSound} disabled={isPlaying} className="cta-button bg-sand-ochre text-dark-granite hover:bg-gold-accent w-full">
                {isPlaying ? '...' : <Volume2 className="w-5 h-5 ml-2" />}
                {isPlaying ? 'جاري التشغيل' : 'اسمع الصوت'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};


export default function AnimalSoundsPage() {
  return (
    <div>
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold kids-title">أصوات الحيوانات</h2>
            <p className="text-xl text-sand-ochre mt-2">اضغط على صورة الحيوان لتسمع صوته وتتعلم اسمه بالمصري!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {animals.map(animal => (
                <AnimalCard key={animal.id} animal={animal} />
            ))}
        </div>
    </div>
  );
}
