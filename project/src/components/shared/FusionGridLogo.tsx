import { cn } from '@/lib/utils';

interface FusionGridLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'auto';
}

export function FusionGridLogo({ className, size = 'md', variant = 'auto' }: FusionGridLogoProps) {
  const dimensions = {
    sm: { box: 'h-8 w-8', text: 'text-lg', sub: 'text-[10px]' },
    md: { box: 'h-10 w-10', text: 'text-xl', sub: 'text-[11px]' },
    lg: { box: 'h-14 w-14', text: 'text-2xl', sub: 'text-xs' },
  };
  const d = dimensions[size];

  const isDark = variant === 'dark';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#38241B] via-[#6F4028] to-[#C58B55] shadow-md shadow-[#6F4028]/25', d.box)}>
        <svg viewBox="0 0 32 32" className="h-2/3 w-2/3" fill="none">
          <path d="M4 22L16 6L28 22" stroke="#FFF8ED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 22V26M16 22V26M24 22V26" stroke="#C58B55" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="14" r="2.5" fill="#C58B55" />
        </svg>
      </div>
      <div className="flex flex-col leading-none text-left">
        <span className={cn('font-display font-extrabold tracking-tight', isDark ? 'text-[#FFF9F0]' : 'text-[#38241B]', d.text)}>
          Fusion<span className="text-[#C58B55]">Grid</span>
        </span>
        <span className={cn('font-medium tracking-wide', isDark ? 'text-[#D8C2AA]' : 'text-[#755C49]', d.sub)}>
          FusionGrid · Connected Government
        </span>
      </div>
    </div>
  );
}
