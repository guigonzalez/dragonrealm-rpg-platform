import React from 'react';
import { useTruncate } from '@/hooks/use-truncate';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  expandText?: string;
  collapseText?: string;
  className?: string;
  textClassName?: string;
  buttonClassName?: string;
}

export function TruncatedText({
  text,
  maxLength = 100,
  expandText = 'Ver mais',
  collapseText = 'Ver menos',
  className,
  textClassName,
  buttonClassName,
}: TruncatedTextProps) {
  const { displayText, actionText, isTruncable, toggleExpand } = useTruncate(text, {
    maxLength,
    expandText,
    collapseText,
  });

  if (!text) return null;
  
  return (
    <div className={cn('space-y-1', className)}>
      <p className={cn('text-xs', textClassName)}>{displayText}</p>
      {isTruncable && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className={cn('h-auto p-0 text-xs text-primary', buttonClassName)}
          onClick={toggleExpand}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}