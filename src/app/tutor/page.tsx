'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, User, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { getTutorResponse } from '../ai-actions';

const formSchema = z.object({
  courseMaterial: z.string().min(10, {
    message: 'يجب أن يكون محتوى المادة الدراسية 10 أحرف على الأقل.',
  }),
  question: z.string().min(5, {
    message: 'يجب أن يكون السؤال 5 أحرف على الأقل.',
  }),
});

interface ChatMessage {
    type: 'user' | 'tutor';
    text: string;
}

export default function TutorPage() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
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

    const userMessage: ChatMessage = { type: 'user', text: values.question };
    setChatHistory(prev => [...prev, userMessage]);

    const result = await getTutorResponse(values);
    
    let tutorMessageText: string;
    if (result.error) {
        tutorMessageText = result.error;
        toast({
            variant: 'destructive',
            title: '❌ خطأ في المعلم الذكي',
            description: result.error,
        });
    } else {
        tutorMessageText = result.answer || "عفواً، لم أتمكن من إيجاد إجابة.";
    }

    const tutorMessage: ChatMessage = { 
        type: 'tutor', 
        text: tutorMessageText
    };

    setChatHistory(prev => [...prev, tutorMessage]);
    setIsLoading(false);
    form.resetField('question');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-nile-dark p-4">
      <Card className="w-full max-w-2xl dashboard-card text-white flex flex-col h-[90vh]">
        <CardHeader className="text-center flex-shrink-0">
          <div className="flex justify-center items-center mb-4">
            <GraduationCap className="text-4xl text-gold-accent" />
          </div>
          <CardTitle className="text-3xl royal-title">
            المعلم الخصوصي الذكي
          </CardTitle>
          <CardDescription className="text-sand-ochre">
            ضع المادة التي تذاكرها، واطرح أي سؤال يخطر ببالك!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
           <Form {...form}>
            <form id="context-form" className="space-y-4">
                <FormField
                    control={form.control}
                    name="courseMaterial"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Textarea
                            placeholder="الصق هنا النص أو الفقرة التي تحتاج مساعدة فيها (السياق)..."
                            {...field}
                            className="bg-nile-dark border-sand-ochre text-white min-h-[100px] resize-y placeholder:text-sand-ochre/50 focus:ring-gold-accent"
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </form>
           </Form>

            {chatHistory.map((chat, index) => (
                <div key={index} className={`flex items-start gap-3 ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {chat.type === 'tutor' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sand-ochre flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-nile-dark" />
                        </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-xl shadow-md ${chat.type === 'user' ? 'bg-gold-accent text-nile-dark rounded-br-none' : 'bg-nile text-white rounded-tl-none'}`}>
                        <p className="whitespace-pre-wrap">{chat.text}</p>
                    </div>
                     {chat.type === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-nile-dark flex items-center justify-center border-2 border-gold-accent">
                            <User className="w-5 h-5 text-gold-accent" />
                        </div>
                    )}
                </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sand-ochre flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-nile-dark animate-spin" />
                    </div>
                    <div className="max-w-[80%] p-3 rounded-xl shadow-md bg-nile text-white rounded-tl-none">
                       <p>جاري التفكير...</p>
                    </div>
                </div>
            )}
        </CardContent>

        <CardFooter className="p-4 border-t-2 border-gold-accent/50 flex-shrink-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-center gap-3">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input
                        placeholder="اطرح سؤالك عن النص أعلاه..."
                        {...field}
                        disabled={isLoading}
                        className="bg-nile-dark border-sand-ochre text-white placeholder:text-sand-ochre/50 focus:ring-gold-accent"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="cta-button !p-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                 <span className="sr-only">اسأل</span>
              </Button>
            </form>
          </Form>
        </CardFooter>
      </Card>
      <Link href="/" className="text-sm font-semibold text-sand-ochre hover:text-gold-accent transition mt-4">
            العودة للوحة التحكم
      </Link>
    </div>
  );
}
