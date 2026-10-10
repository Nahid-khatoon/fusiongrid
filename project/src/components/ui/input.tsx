import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-[#D8C2AA] bg-[#FFF8ED] px-3 py-1 text-sm text-[#38241B] shadow-2xs transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#38241B] placeholder:text-[#755C49]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C58B55]/50 focus-visible:border-[#C58B55] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
