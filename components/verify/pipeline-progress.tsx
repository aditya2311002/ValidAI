import { Check, Loader2, ScanText, Fingerprint, Scale, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PIPELINE_STEPS = [
  { icon: ScanText, title: 'Reading documents (OCR)', detail: 'Extracting text and key fields' },
  { icon: Fingerprint, title: 'Forensic analysis', detail: 'Error-level analysis on stamps & signatures' },
  { icon: Scale, title: 'Rulebook cross-check', detail: 'Comparing data with AICTE norms' },
  { icon: FileCheck, title: 'Generating report', detail: 'Scoring and recommendation' },
]

export function PipelineProgress({ activeStep }: { activeStep: number }) {
  return (
    <ol className="flex flex-col gap-3" aria-live="polite">
      {PIPELINE_STEPS.map((step, i) => {
        const done = i < activeStep
        const active = i === activeStep
        const Icon = step.icon
        return (
          <li
            key={step.title}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 transition-colors',
              active ? 'border-primary/40 bg-secondary' : 'border-border bg-card',
              !done && !active && 'opacity-60',
            )}
          >
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full',
                done ? 'bg-success text-primary-foreground' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {done ? <Check className="size-4" /> : active ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
