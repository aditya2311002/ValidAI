'use client'

import { useMemo, useState } from 'react'
import { CircleCheck, CircleX, TriangleAlert, MessageSquareWarning, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { summarize } from '@/lib/rules'
import type { Application, AppStatus } from '@/lib/types'
import { ElaView } from './ela-view'
import { ScoreRing, ScreenHeader, SeverityDot, VerdictBadge, ruleTone, scoreColor } from './ui-bits'

type Tab = 'summary' | 'ocr' | 'forensics' | 'rules'
type Decision = 'approved' | 'query' | 'rejected'

const TABS: { id: Tab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'ocr', label: 'OCR' },
  { id: 'forensics', label: 'Forensics' },
  { id: 'rules', label: 'Rules' },
]

const FIELD_LABELS: Record<string, string> = {
  landAreaAcres: 'Land area (acres)',
  facultyCount: 'Faculty count',
  studentIntake: 'Student intake',
  builtUpAreaSqm: 'Built-up area (sq.m)',
  nocValidUntil: 'NOC valid until',
  principalPhd: 'Principal has PhD',
}

export function ReportScreen({
  app,
  onBack,
  onDecide,
}: {
  app: Application
  onBack: () => void
  onDecide: (status: AppStatus, remarks: string) => void
}) {
  const [tab, setTab] = useState<Tab>('summary')
  const [docIndex, setDocIndex] = useState(0)
  const [findingIndex, setFindingIndex] = useState<number | null>(null)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [remarks, setRemarks] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const s = useMemo(() => summarize(app.documents), [app.documents])
  const doc = app.documents[docIndex]

  const recText = {
    approve: { title: 'Recommended: Approve', body: 'All checks passed and documents appear authentic.', icon: CircleCheck, tone: 'text-success bg-success/10' },
    query: { title: 'Recommended: Raise query', body: 'Some required data is missing or a document needs a closer look.', icon: MessageSquareWarning, tone: 'text-[oklch(0.5_0.12_60)] bg-warning/15' },
    reject: { title: 'Recommended: Reject / escalate', body: 'Rule violations or likely forged documents were detected.', icon: CircleX, tone: 'text-destructive bg-destructive/10' },
  }[s.recommendation]
  const RecIcon = recText.icon

  const openDecision = (d: Decision) => {
    setDecision(d)
    setSubmitted(false)
    const issues = [
      ...s.rules.filter((r) => r.status !== 'pass').map((r) => `${r.title}: ${r.actual}`),
      ...app.documents.filter((x) => x.forensic.verdict !== 'authentic').map((x) => `${x.name} flagged as ${x.forensic.verdict}`),
    ]
    setRemarks(d === 'approved' ? 'All AICTE norms satisfied.' : issues.join('; '))
  }

  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader title="Verification report" subtitle={app.college} onBack={onBack} />

      <div className="sticky top-[61px] z-10 flex gap-1 border-b border-border bg-card px-3" role="tablist" aria-label="Report sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 border-b-2 py-2.5 text-xs font-medium transition-colors',
              tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {tab !== 'summary' && tab !== 'rules' && app.documents.length > 1 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
            {app.documents.map((d, i) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDocIndex(i)
                  setFindingIndex(null)
                }}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-xs font-medium',
                  i === docIndex ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground',
                )}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}

        {tab === 'summary' && (
          <>
            <section className="flex justify-around rounded-xl border border-border bg-card p-4">
              <ScoreRing score={s.overall} label="Overall" />
              <ScoreRing score={s.complianceScore} label="Compliance" />
              <ScoreRing score={s.forensicScore} label="Authenticity" />
            </section>
            <section className={cn('flex gap-3 rounded-xl p-4', recText.tone)}>
              <RecIcon className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{recText.title}</p>
                <p className="text-xs leading-relaxed opacity-90">{recText.body}</p>
              </div>
            </section>
            <section className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Rules passed', value: `${s.passed}/${s.rules.length}` },
                { label: 'Violations', value: s.failed },
                { label: 'Flagged docs', value: s.tamperedDocs },
              ].map((x) => (
                <div key={x.label} className="rounded-xl border border-border bg-card p-3">
                  <p className="text-lg font-semibold">{x.value}</p>
                  <p className="text-[11px] text-muted-foreground">{x.label}</p>
                </div>
              ))}
            </section>
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">Documents</h2>
              {app.documents.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDocIndex(i)
                    setFindingIndex(null)
                    setTab('forensics')
                  }}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 text-left hover:border-ring/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">OCR confidence {d.ocrConfidence}%</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={cn('text-sm font-semibold', scoreColor(d.forensic.score))}>{d.forensic.score}/100</span>
                    <VerdictBadge verdict={d.forensic.verdict} />
                  </div>
                </button>
              ))}
            </section>
          </>
        )}

        {tab === 'ocr' && doc && (
          <>
            <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Extracted fields</h2>
                <span className="text-xs text-muted-foreground">{doc.ocrConfidence}% confidence</span>
              </div>
              <dl className="flex flex-col divide-y divide-border text-sm">
                {Object.entries(doc.fields).filter(([, v]) => v != null).length === 0 && (
                  <p className="py-2 text-xs text-muted-foreground">No regulatory fields found on this document.</p>
                )}
                {Object.entries(doc.fields)
                  .filter(([, v]) => v != null)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 py-2">
                      <dt className="text-muted-foreground">{FIELD_LABELS[k] ?? k}</dt>
                      <dd className="font-medium">{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</dd>
                    </div>
                  ))}
              </dl>
            </section>
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">Raw OCR text</h2>
              <pre className="max-h-72 overflow-auto rounded-xl border border-border bg-card p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                {doc.extractedText}
              </pre>
            </section>
          </>
        )}

        {tab === 'forensics' && doc && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{doc.name}</p>
                <p className={cn('text-xs font-medium', scoreColor(doc.forensic.score))}>Authenticity {doc.forensic.score}/100</p>
              </div>
              <VerdictBadge verdict={doc.forensic.verdict} />
            </div>
            <ElaView
              src={doc.image}
              alt={doc.name}
              findings={doc.forensic.findings}
              activeIndex={findingIndex}
              onSelect={setFindingIndex}
            />
            <ul className="flex flex-col gap-2">
              {doc.forensic.findings.map((f, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setFindingIndex(i)}
                    className={cn(
                      'flex w-full gap-2.5 rounded-xl border bg-card p-3 text-left',
                      findingIndex === i ? 'border-primary' : 'border-border',
                    )}
                  >
                    <SeverityDot severity={f.severity} />
                    <div>
                      <p className="text-sm font-medium">
                        {f.box ? `${i + 1}. ` : ''}
                        {f.title}
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{f.detail}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === 'rules' && (
          <ul className="flex flex-col gap-2">
            {s.rules.map((r) => {
              const tone = ruleTone(r.status)
              const Icon = r.status === 'pass' ? CircleCheck : r.status === 'fail' ? CircleX : TriangleAlert
              return (
                <li key={r.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                  <Icon
                    className={cn(
                      'mt-0.5 size-5 shrink-0',
                      r.status === 'pass' ? 'text-success' : r.status === 'fail' ? 'text-destructive' : 'text-warning',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{r.title}</p>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', tone.className)}>{tone.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{r.clause}</p>
                    <dl className="mt-2 grid gap-1 text-xs">
                      <div className="flex gap-2">
                        <dt className="w-16 shrink-0 text-muted-foreground">Required</dt>
                        <dd>{r.requirement}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-16 shrink-0 text-muted-foreground">Found</dt>
                        <dd className="font-medium">{r.actual}</dd>
                      </div>
                    </dl>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="sticky bottom-0 grid grid-cols-3 gap-2 border-t border-border bg-card p-3">
        <Button variant="destructive" className="h-11" onClick={() => openDecision('rejected')}>
          Reject
        </Button>
        <Button variant="outline" className="h-11" onClick={() => openDecision('query')}>
          Query
        </Button>
        <Button className="h-11" onClick={() => openDecision('approved')}>
          Approve
        </Button>
      </div>

      {decision && (
        <div className="absolute inset-0 z-30 flex items-end bg-foreground/40" role="dialog" aria-modal="true" aria-labelledby="decision-title">
          <div className="flex w-full flex-col gap-3 rounded-t-3xl bg-card p-5">
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check className="size-6" />
                </div>
                <p id="decision-title" className="text-base font-semibold">Decision recorded</p>
                <p className="text-sm text-muted-foreground">The college will be notified on the AICTE portal.</p>
                <Button
                  className="h-11 w-full"
                  onClick={() => {
                    onDecide(decision, remarks)
                    setDecision(null)
                  }}
                >
                  Back to queue
                </Button>
              </div>
            ) : (
              <>
                <p id="decision-title" className="text-base font-semibold">
                  {decision === 'approved' ? 'Approve application' : decision === 'query' ? 'Raise a query' : 'Reject application'}
                </p>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">Remarks to the institution</span>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    className="rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <p className="text-xs text-muted-foreground">Remarks are pre-filled from the AI findings. Edit before submitting.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-11" onClick={() => setDecision(null)}>
                    Cancel
                  </Button>
                  <Button className="h-11" onClick={() => setSubmitted(true)} disabled={!remarks.trim()}>
                    Confirm
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
