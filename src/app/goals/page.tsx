
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function GoalsPage() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const router = useRouter();

  const handleSelectGoal = (goal: string) => {
    setSelectedGoal(goal);
  };

  const handleNextStep = () => {
    if (selectedGoal) {
      // In a real app, you'd save the goal to Firestore here.
      console.log(
        `Goal selected: ${selectedGoal}. Redirecting to placement test.`
      );
      router.push('/placement-test');
    }
  };

  return (
    <div className="antialiased flex items-center justify-center min-h-screen bg-nile-dark p-4">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-2xl dashboard-card text-white">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-dark-granite mb-2 royal-title text-gold-accent">
            مرحباً بك في قاعة تحديد المصير
          </h1>
          <p className="text-xl text-sand-ochre font-semibold mb-6 flex items-center justify-center">
            <span className="ml-2">رسالة من مرشدك</span>
            <svg
              className="pharaoh-mentor-icon w-12 h-12 inline-block mx-2"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="40" r="30" fill="#fadc99" />
              <path
                d="M 20 25 Q 50 10 80 25 L 80 40 Q 50 60 20 40 Z"
                fill="#0b4e8d"
              />
              <path
                d="M 20 25 Q 50 10 80 25 L 80 40 Q 50 60 20 40 Z"
                fill="none"
                stroke="#FFD700"
                strokeWidth="3"
              />
              <line
                x1="25"
                y1="30"
                x2="75"
                y2="30"
                stroke="#FFD700"
                strokeWidth="3"
              />
              <line
                x1="25"
                y1="40"
                x2="75"
                y2="40"
                stroke="#FFD700"
                strokeWidth="3"
              />
              <path
                d="M 40 70 C 40 85, 60 85, 60 70 L 55 60 L 45 60 Z"
                fill="#0b4e8d"
                stroke="#FFD700"
                strokeWidth="2"
              />
              <circle cx="40" cy="40" r="4" fill="#0b4e8d" />
              <circle cx="60" cy="40" r="4" fill="#0b4e8d" />
              <path
                d="M 45 55 Q 50 58 55 55"
                stroke="#0b4e8d"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <span className="mr-2">: "اختر هدفك بحكمة، فهو ما سيحدد مسار رحلتك في المملكة."</span>
          </p>
          <div className="w-20 h-1 bg-gold-accent mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <GoalCard
            goal="social"
            icon="fas fa-users"
            title="نقرة الحياة (التواصل الاجتماعي)"
            description="إتقان اللهجة للحديث اليومي، فهم الأفلام، والاندماج مع الأصدقاء."
            selectedGoal={selectedGoal}
            onSelect={handleSelectGoal}
          />
          <GoalCard
            goal="business"
            icon="fas fa-chart-line"
            title="نقرة التجارة (الأعمال)"
            description="القدرة على التفاوض وإدارة الاجتماعات والعمل في بيئات احترافية مصرية."
            selectedGoal={selectedGoal}
            onSelect={handleSelectGoal}
          />
          <GoalCard
            goal="travel"
            icon="fas fa-map-marked-alt"
            title="نقرة الاكتشاف (السفر والسياحة)"
            description="التحدث بثقة في الشوارع، الأسواق، والمطاعم أثناء زيارة مصر."
            selectedGoal={selectedGoal}
            onSelect={handleSelectGoal}
          />
          <GoalCard
            goal="academic"
            icon="ankh"
            title="نقرة البردية (الدراسات المتقدمة)"
            description="إتقان النحو والصرف والمفردات التاريخية للبحث الأكاديمي."
            selectedGoal={selectedGoal}
            onSelect={handleSelectGoal}
          />
        </div>

        <div className="text-center">
          <Button
            id="next-button"
            className="cta-button px-10 py-3 text-lg rounded-full"
            disabled={!selectedGoal}
            onClick={handleNextStep}
          >
            الخطوة التالية: تحديد المستوى{' '}
            <i className="fas fa-arrow-left mr-2"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}

const GoalCard = ({
  goal,
  icon,
  title,
  description,
  selectedGoal,
  onSelect,
}: {
  goal: string;
  icon: string;
  title: string;
  description: string;
  selectedGoal: string | null;
  onSelect: (goal: string) => void;
}) => {
  const isSelected = selectedGoal === goal;

  return (
    <div
      className={cn(
        'goal-card bg-nile rounded-2xl p-6 shadow-lg transition-all duration-300 border-2 border-transparent cursor-pointer h-full',
        {
          'selected-card border-gold-accent bg-sand-ochre/20 shadow-2xl transform scale-105': isSelected,
          'hover:transform hover:-translate-y-1 hover:border-sand-ochre':
            !isSelected,
        }
      )}
      onClick={() => onSelect(goal)}
    >
      <div className="text-center">
        {icon === 'ankh' ? (
          <svg
            className="pharaonic-icon-ankh icon-royal mx-auto mb-3 w-12 h-12 text-gold-accent"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v6m-4 4h8m-4 0v10m-2 0h4m-4 0c0 1.104.896 2 2 2s2-.896 2-2h-4z" />
            <circle cx="12" cy="8" r="4" />
          </svg>
        ) : (
          <i className={cn(icon, 'icon-royal text-5xl mb-3 text-gold-accent')}></i>
        )}
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-sand-ochre">{description}</p>
      </div>
    </div>
  );
};
