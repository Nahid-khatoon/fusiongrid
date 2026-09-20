import { cn } from '@/lib/utils';

export function FusionGridLogo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    sm: { box: 'h-8 w-8', text: 'text-lg', sub: 'text-[10px]' },
    md: { box: 'h-10 w-10', text: 'text-xl', sub: 'text-[11px]' },
    lg: { box: 'h-14 w-14', text: 'text-2xl', sub: 'text-xs' },
  };
  const d = dimensions[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md', d.box)}>
        <svg viewBox="0 0 32 32" className="h-2/3 w-2/3" fill="none">
          <path d="M4 22L16 6L28 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 22V26M16 22V26M24 22V26" stroke="hsl(33 100% 60%)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="14" r="2.5" fill="hsl(33 100% 60%)" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn('font-display font-extrabold tracking-tight text-foreground', d.text)}>
          Fusion<span className="text-primary">Grid</span>
        </span>
        <span className={cn('font-medium text-muted-foreground tracking-wide', d.sub)}>
          FusionGrid · Connected Government
        </span>
      </div>
    </div>
  );
}
