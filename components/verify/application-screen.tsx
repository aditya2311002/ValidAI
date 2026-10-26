'use client'

import Image from 'next/image'
import { Sparkles, FileText, MapPin, CalendarDays, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Application } from '@/lib/types'
import { ScreenHeader, StatusBadge } from './ui-bits'

export function ApplicationScreen({
  app,
  onBack,
  onVerify,
  onViewReport,
}: {
  app: Application
  onBack: () => void
  onVerify: () => void
  onViewReport: () => void
}) {
  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader title={app.college} subtitle={app.id} onBack={onBack} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-sm font-semibold">Application details</h2>
            <StatusBadge status={app.status} />
          </div>
          <dl className="grid gap-2 text-sm">
            {[
              { icon: MapPin, label: 'Location', value: app.city },
              { icon: GraduationCap, label: 'Request', value: app.program },
              {
                icon: CalendarDays,
                label: 'Submitted',
                value: new Date(app.submittedAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <dt className="w-20 text-muted-foreground">{label}</dt>
                <dd className="min-w-0 flex-1 truncate font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {app.remarks && (
            <p className="rounded-lg bg-muted p-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Remarks: </span>
              {app.remarks}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Submitted documents ({app.documents.length})</h2>
          <ul className="grid grid-cols-2 gap-2">
            {app.documents.map((doc) => (
              <li key={doc.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative aspect-[3/4] bg-muted">
                  <Image src={doc.image || '/placeholder.svg'} alt={doc.name} fill sizes="180px" className="object-cover object-top" />
                </div>
                <div className="flex items-start gap-1.5 p-2">
                  <FileText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{doc.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{doc.kind}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-card p-4">
        {app.verified ? (
          <>
            <Button className="h-11" onClick={onViewReport}>
              View verification report
            </Button>
            <Button variant="outline" className="h-11" onClick={onVerify}>
              Re-run AI verification
            </Button>
          </>
        ) : (
          <Button className="h-11" onClick={onVerify}>
            <Sparkles />
            Run AI verification
          </Button>
        )}
      </div>
    </div>
  )
}
