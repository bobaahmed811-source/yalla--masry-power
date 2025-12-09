import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome Back, {userName}!</h1>
        <p className="text-muted-foreground">Here are your courses in progress.</p>
      </div>
      <Button>
        <PlusCircle className="mr-2" />
        New Course
      </Button>
    </div>
  );
}
