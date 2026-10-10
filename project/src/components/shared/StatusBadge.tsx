import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  AlertCircle,
  Circle,
  HelpCircle,
  SkipForward,
} from 'lucide-react';
import type { ApplicationStatus } from '@/types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
  showDot?: boolean;
}

const config: Record<
  ApplicationStatus,
  { label: string; className: string; icon: typeof CheckCircle2; dotColor: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-[#F5EBDD] text-[#755C49] border-[#D8C2AA]',
    icon: Circle,
    dotColor: 'bg-[#D8C2AA]',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-[#FFF8ED] text-[#6F4028] border-[#D8C2AA]',
    icon: Loader2,
    dotColor: 'bg-[#C58B55]',
  },
  under_verification: {
    label: 'Under Verification',
    className: 'bg-[#EAD8C2] text-[#6F4028] border-[#D8C2AA] font-bold',
    icon: Clock,
    dotColor: 'bg-[#6F4028]',
  },
  processing: {
    label: 'Processing',
    className: 'bg-[#FFF8ED] text-[#C58B55] border-[#D8C2AA] font-bold',
    icon: Loader2,
    dotColor: 'bg-[#C58B55]',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
    icon: CheckCircle2,
    dotColor: 'bg-emerald-600',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
    icon: XCircle,
    dotColor: 'bg-rose-600',
  },
  info_requested: {
    label: 'Info Requested',
    className: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
    icon: HelpCircle,
    dotColor: 'bg-amber-600',
  },
};

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const c = config[status] || config.draft;
  const Icon = c.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs transition-all',
        c.className,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            c.dotColor,
            status === 'processing' || status === 'under_verification' ? 'animate-pulse' : ''
          )}
        />
      )}
      <Icon
        className={cn(
          'h-3 w-3',
          status === 'processing' || status === 'submitted' ? 'animate-spin' : ''
        )}
      />
      {c.label}
    </span>
  );
}

export function TimelineDot({
  status,
}: {
  status: 'done' | 'current' | 'pending' | 'skipped';
}) {
  if (status === 'done') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/20 animate-check-pop">
        <CheckCircle2 className="h-4.5 w-4.5" />
      </div>
    );
  }
  if (status === 'current') {
    return (
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6F4028] text-[#FFF8ED] shadow-md shadow-[#6F4028]/30">
        <span className="absolute -inset-1 rounded-full border border-[#C58B55]/60 animate-ping opacity-60" />
        <Clock className="h-4.5 w-4.5 animate-pulse text-[#FFF8ED]" />
      </div>
    );
  }
  if (status === 'skipped') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5EBDD] text-[#755C49] border border-[#D8C2AA]">
        <SkipForward className="h-3.5 w-3.5" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#D8C2AA] bg-[#FFF8ED] text-[#755C49]">
      <Circle className="h-3.5 w-3.5" />
    </div>
  );
}

export function SlaBadge({ status }: { status: 'on_track' | 'due_soon' | 'breached' }) {
  const cfg = {
    on_track: {
      label: 'SLA: On Track',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
      dot: 'bg-emerald-600',
    },
    due_soon: {
      label: 'SLA: Due Soon',
      className: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
      dot: 'bg-amber-600 animate-pulse',
    },
    breached: {
      label: 'SLA: Breached',
      className: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
      dot: 'bg-rose-600 animate-ping',
    },
  };
  const c = cfg[status] || cfg.on_track;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs',
        c.className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  );
}

export function NotificationDot({
  type,
}: {
  type: 'info' | 'success' | 'warning' | 'action';
}) {
  const colors = {
    info: 'bg-[#FFF8ED] text-[#6F4028] border border-[#D8C2AA] shadow-xs',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs',
    warning: 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs',
    action: 'bg-[#EAD8C2] text-[#6F4028] border border-[#D8C2AA] shadow-xs',
  };
  const icons = {
    info: AlertCircle,
    success: CheckCircle2,
    warning: AlertCircle,
    action: AlertCircle,
  };
  const Icon = icons[type] || AlertCircle;
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs',
        colors[type]
      )}
    >
      <Icon className="h-4.5 w-4.5" />
    </div>
  );
}
