import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { discussions } from '@/lib/data';
import type { Course } from '@/lib/data';
import { AiTutorClient } from './ai-tutor-client';

interface CourseContentProps {
  course: Course;
}

export function CourseContent({ course }: CourseContentProps) {
  return (
    <div>
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted mb-6">
        <Image
          src={course.thumbnail.imageUrl.replace('400', '720').replace('600', '1280')}
          alt={course.title}
          width={1280}
          height={720}
          className="w-full h-full object-cover"
          data-ai-hint={course.thumbnail.imageHint}
        />
      </div>

      <Tabs defaultValue="material">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="material">Course Material</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="ai-tutor">AI Tutor</TabsTrigger>
        </TabsList>
        <TabsContent value="material">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-stone dark:prose-invert max-w-none">
                <p>{course.material}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discussion">
          <Card>
            <CardContent className="p-6 space-y-6">
              {discussions.map((post) => (
                <div key={post.id} className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatar.imageUrl} alt={post.author.name} data-ai-hint={post.author.avatar.imageHint} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{post.author.name}</p>
                      <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                    </div>
                    <p className="text-sm">{post.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai-tutor">
          <AiTutorClient courseMaterial={course.material} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
