'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { BookHeart, Brush, Rabbit, Search, Sparkles } from 'lucide-react';
import placeholderData from '@/lib/placeholder-images.json';

const ActivityCard = ({
  title,
  description,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  href: string;
}) => (
  <Link href={href} passHref>
    <Card className="kids-card flex flex-col items-center justify-center p-6 text-center h-full">
      <CardContent className="p-0 flex flex-col items-center">
        <div className="w-20 h-20 mb-4 rounded-full flex items-center justify-center bg-white/10" style={{border: `3px solid ${color}`}}>
            <Icon style={{ color }} className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-cairo">{title}</h3>
        <p className="text-sand-ochre/80 text-sm">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

export default function KidsPage() {
    const guide = placeholderData.placeholderImages.find(p => p.id === 'cat-guide');
  
    return (
        <>
            <div className="flex flex-col md:flex-row items-center justify-center text-center gap-6 mb-12 bg-nile-dark/30 p-8 rounded-2xl border-2 border-gold-accent/20">
                {guide && (
                     <Image
                        src={guide.imageUrl}
                        alt={guide.description}
                        width={150}
                        height={150}
                        data-ai-hint={guide.imageHint}
                        className="rounded-full border-4 border-sand-ochre"
                    />
                )}
                <div>
                    <h2 className="text-3xl font-bold text-white font-cairo mb-2">أهلاً بكم يا أبطال!</h2>
                    <p className="text-lg md:text-xl text-sand-ochre max-w-2xl">
                        أنا بسبس، القط الفرعوني! هنا في مملكة الصغار، التعلم مغامرة ممتعة مليئة بالألعاب والقصص والألوان. هل أنتم مستعدون للانطلاق؟
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <ActivityCard
                title="ألوان الفراعنة"
                description="لعبة تلوين ممتعة لشخصيات وآثار من مصر القديمة."
                icon={Brush}
                color="#34D399"
                href="/kids/coloring"
            />
            <ActivityCard
                title="أصوات الحيوانات"
                description="استمعوا لأصوات الحيوانات وتعلموا أسمائها بالمصري."
                icon={Rabbit}
                color="#F472B6"
                href="/kids/animal-sounds"
            />
            <ActivityCard
                title="قصص الأنبياء"
                description="قصص مصورة ومروية عن الأنبياء بأسلوب شيق."
                icon={BookHeart}
                color="#60A5FA"
                href="/kids/prophet-stories"
            />
            <ActivityCard
                title="اكتشف الأثر"
                description="لعبة ذاكرة ممتعة مع كنوز الملك توت عنخ آمون."
                icon={Search}
                color="#FBBF24"
                href="/kids/artifact-match"
            />
            </div>
        </>
  );
}
