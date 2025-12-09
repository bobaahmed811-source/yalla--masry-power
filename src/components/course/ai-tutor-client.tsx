'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Loader2, User } from 'lucide-react';
import { getTutorResponse } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface AiTutorClientProps {
  courseMaterial: string;
}

export function AiTutorClient({ courseMaterial }: AiTutorClientProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    startTransition(async () => {
      const result = await getTutorResponse({ courseMaterial, question });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setAnswer('');
      } else if (result.success) {
        setAnswer(result.success);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle>AI Tutoring Assistant</CardTitle>
            <CardDescription>Ask a question about the course material.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="flex items-start gap-2">
            <Textarea
              placeholder="e.g., 'What is the difference between let and const in JavaScript?'"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isPending}
              rows={2}
            />
            <Button type="submit" size="icon" disabled={isPending || !question.trim()}>
              {isPending ? <Loader2 className="animate-spin" /> : <Send />}
              <span className="sr-only">Send</span>
            </Button>
          </form>

          {(isPending || answer) && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
              {isPending && (
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-primary/20 rounded"></div>
                  </div>
                </div>
              )}
              {answer && !isPending && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2 pt-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{answer}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
