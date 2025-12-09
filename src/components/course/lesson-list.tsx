import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import type { Lesson } from '@/lib/data';
import { cn } from '@/lib/utils';

interface LessonListProps {
  lessons: Lesson[];
}

export function LessonList({ lessons }: LessonListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Lessons</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <a href="#" className="flex items-start gap-4 p-2 rounded-md transition-colors hover:bg-muted">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                    {lesson.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                    <PlayCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1">
                  <p className={cn("font-medium", lesson.completed && "text-muted-foreground line-through")}>{lesson.title}</p>
                  <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
