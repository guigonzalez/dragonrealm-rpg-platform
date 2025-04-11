import { useState, useCallback } from 'react';

export interface UseTruncateOptions {
  maxLength: number;
  expandText?: string;
  collapseText?: string;
}

export function useTruncate(text: string, options: UseTruncateOptions) {
  const { maxLength, expandText = 'Ver mais', collapseText = 'Ver menos' } = options;
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isTruncable = text.length > maxLength;
  
  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);
  
  const displayText = isExpanded ? text : (isTruncable ? `${text.substring(0, maxLength).trim()}...` : text);
  const actionText = isExpanded ? collapseText : expandText;
  
  return {
    displayText,
    actionText,
    isExpanded,
    isTruncable,
    toggleExpand,
  };
}