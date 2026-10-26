import { BookOpen } from 'lucide-react'
import { RULEBOOK } from '@/lib/rules'
import { ScreenHeader } from './ui-bits'

export function RulebookScreen() {
  return (
    <div className="flex flex-col">
      <ScreenHeader title="AICTE rulebook" subtitle="Norms the AI checks every application against" />
      <div className="flex flex-col gap-3 p-4">
        <p className="rounded-xl bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
          Prototype rule set modelled on the AICTE Approval Process Handbook (APH). Thresholds are illustrative and can be updated each academic year.
        </p>
        <ul className="flex flex-col gap-2">
          {RULEBOOK.map((r) => (
            <li key={r.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <BookOpen className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.requirement}</p>
                <p className="mt-1 text-[11px] font-medium text-primary">{r.clause}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
