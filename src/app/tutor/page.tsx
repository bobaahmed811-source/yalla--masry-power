
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getTutorResponse } from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  courseMaterial: z.string().min(10, {
    message: 'يجب أن يكون محتوى المادة الدراسية 10 أحرف على الأقل.',
  }),
  question: z.string().min(5, {
    message: 'يجب أن يكون السؤال 5 أحرف على الأقل.',
  }),
});

export default function TutorPage() {
  const [tutorResponse, setTutorResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseMaterial: '',
      question: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTutorResponse('');

    const result = await getTutorResponse(values);

    if (result.success) {
      setTutorResponse(result.success);
      toast({
        title: '✅ تم استلام إجابة المعلم',
        description: 'ها هي إجابة المعلم الخصوصي على سؤالك.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: '❌ حدث خطأ',
        description:
          result.error ||
          'فشل الحصول على إجابة. يرجى المحاولة مرة أخرى.',
      });
    }

    setIsLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-nile-dark p-4">
      <Card className="w-full max-w-2xl dashboard-card text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <i className="fas fa-user-graduate text-4xl text-gold-accent"></i>
          </div>
          <CardTitle className="text-3xl royal-title">
            المعلم الخصوصي الذكي
          </CardTitle>
          <CardDescription className="text-sand-ochre">
            ضع المادة التي تذاكرها هنا، واطرح أي سؤال يخطر ببالك!
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="courseMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sand-ochre">
                      المادة الدراسية (السياق)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="الصق هنا النص أو الفقرة التي تحتاج مساعدة فيها..."
                        {...field}
                        className="bg-nile-dark border-sand-ochre text-white min-h-[150px] resize-y placeholder:text-sand-ochre/50 focus:ring-gold-accent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sand-ochre">سؤالك</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="اطرح سؤالك عن النص أعلاه..."
                        {...field}
                        className="bg-nile-dark border-sand-ochre text-white placeholder:text-sand-ochre/50 focus:ring-gold-accent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full cta-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التفكير...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    اسأل المعلم الذكي
                  </>
                )}
              </Button>
              <Link href="/" className="text-sm font-semibold text-sand-ochre hover:text-gold-accent transition">
                 العودة للوحة التحكم
            </Link>
            </CardFooter>
          </form>
        </Form>
        {tutorResponse && (
          <div className="p-6 pt-0">
            <Card className="bg-nile-dark border-sand-ochre p-4">
              <CardHeader>
                <CardTitle className="text-lg royal-title">إجابة المعلم:</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white whitespace-pre-wrap">{tutorResponse}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}

    