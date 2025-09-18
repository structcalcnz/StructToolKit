import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode; // To pass the call-to-action button
}

export function EmptyState({ Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full">
      <div className="bg-muted rounded-full p-4 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-xs">{description}</p>
      {children}
    </div>
  );
}