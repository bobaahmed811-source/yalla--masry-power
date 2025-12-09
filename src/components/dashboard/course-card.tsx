import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Course } from '@/lib/data';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <CardHeader className="p-0">
          <Image
            src={course.thumbnail.imageUrl}
            alt={course.title}
            width={600}
            height={400}
            className="rounded-t-lg object-cover aspect-[3/2]"
            data-ai-hint={course.thumbnail.imageHint}
          />
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <CardTitle className="text-lg font-headline leading-tight mb-1">{course.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">By {course.instructor}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-semibold">{course.progress}%</span>
                </div>
                <Progress value={course.progress} aria-label={`${course.progress}% complete`} />
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
