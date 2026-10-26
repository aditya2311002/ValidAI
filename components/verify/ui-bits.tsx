import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppStatus, ForensicVerdict, RuleStatus, Severity } from '@/lib/types'

const STATUS_STYLES: Record<AppStatus, { label: string; className: string }> = {
  pending: { label: 'Pending review', className: 'bg-secondary text-secondary-foreground' },
  flagged: { label: 'Flagged', className: 'bg-destructive/10 text-destructive' },
  approved: { label: 'Approved', className: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
  query: { label: 'Query raised', className: 'bg-warning/15 text-[oklch(0.5_0.12_60)]' },
}

export function StatusBadge({ status }: { status: AppStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', s.className)}>
      {s.label}
    </span>
  )
}

export function VerdictBadge({ verdict }: { verdict: ForensicVerdict }) {
  const map = {
    authentic: 'bg-success/10 text-success',
    suspicious: 'bg-warning/15 text-[oklch(0.5_0.12_60)]',
    tampered: 'bg-destructive/10 text-destructive',
  }
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize', map[verdict])}>
      {verdict}
    </span>
  )
}

export function SeverityDot({ severity }: { severity: Severity }) {
  const map = { high: 'bg-destructive', medium: 'bg-warning', low: 'bg-success' }
  return <span aria-hidden className={cn('mt-1.5 size-2 shrink-0 rounded-full', map[severity])} />
}

export function ruleTone(status: RuleStatus) {
  return {
    pass: { label: 'Pass', className: 'bg-success/10 text-success' },
    fail: { label: 'Fail', className: 'bg-destructive/10 text-destructive' },
    missing: { label: 'Missing', className: 'bg-warning/15 text-[oklch(0.5_0.12_60)]' },
  }[status]
}

export function scoreColor(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 55) return 'text-[oklch(0.6_0.14_65)]'
  return 'text-destructive'
}

export function ScoreRing({ score, label, size = 88 }: { score: number; label: string; size?: number }) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={8} className="fill-none stroke-muted" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (score / 100) * c}
            className={cn('fill-none stroke-current transition-all duration-700', scoreColor(score))}
          />
        </svg>
        <span className={cn('absolute inset-0 flex items-center justify-center text-xl font-semibold', scoreColor(score))}>
          {score}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/95 px-3 py-3 backdrop-blur">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label="Go back"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}
