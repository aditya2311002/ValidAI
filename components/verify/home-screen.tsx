'use client'

import { useState } from 'react'
import { ChevronRight, Search, Clock, FileWarning, CircleCheck, Inbox, LogOut } from 'lucide-react'
import type { Application, AppStatus } from '@/lib/types'
import { StatusBadge } from './ui-bits'
import { cn } from '@/lib/utils'

const FILTERS: { id: 'all' | AppStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'flagged', label: 'Flagged' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'query', label: 'Query' },
]

export function HomeScreen({
  officer,
  applications,
  onOpen,
  onLogout,
}: {
  officer: string
  applications: Application[]
  onOpen: (id: string) => void
  onLogout: () => void
}) {
  const [filter, setFilter] = useState<'all' | AppStatus>('all')
  const [query, setQuery] = useState('')

  const visible = applications.filter(
    (a) =>
      (filter === 'all' || a.status === filter) &&
      (a.college.toLowerCase().includes(query.toLowerCase()) || a.id.toLowerCase().includes(query.toLowerCase())),
  )
  const pending = applications.filter((a) => a.status === 'pending').length
  const flagged = applications.filter((a) => a.status === 'flagged' || a.status === 'rejected').length
  const done = applications.filter((a) => a.status === 'approved').length

  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-4 bg-primary px-5 pt-6 pb-16 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-primary-foreground/70">Welcome back</p>
            <h1 className="text-lg font-semibold">Officer {officer}</h1>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out"
            className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <div className="rounded-xl bg-primary-foreground/10 p-3 text-xs leading-relaxed">
          <span className="font-semibold">Avg. review time: 4 min</span>
          <span className="text-primary-foreground/70"> vs ~3 days manual - 80% faster processing</span>
        </div>
      </header>

      <div className="-mt-10 grid grid-cols-3 gap-2 px-4">
        {[
          { label: 'Pending', value: pending, icon: Clock, tone: 'text-primary' },
          { label: 'Flagged', value: flagged, icon: FileWarning, tone: 'text-destructive' },
          { label: 'Approved', value: done, icon: CircleCheck, tone: 'text-success' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 shadow-sm">
            <Icon className={cn('size-4', tone)} />
            <span className="text-xl font-semibold">{value}</span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3 px-4 pt-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Application queue</h2>
          <span className="text-xs text-muted-foreground">{applications.length} total</span>
        </div>
        <label className="relative">
          <span className="sr-only">Search applications</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search college or application ID"
            className="h-10 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </label>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filter === f.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className="flex flex-col gap-2">
          {visible.map((app) => (
            <li key={app.id}>
              <button
                type="button"
                onClick={() => onOpen(app.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-ring/50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground">
                  {app.college
                    .split(' ')
                    .filter((w) => /^[A-Z]/.test(w))
                    .slice(0, 3)
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{app.college}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {app.id} - {app.documents.length} docs
                  </p>
                  <div className="mt-1.5">
                    <StatusBadge status={app.status} />
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <Inbox className="size-6" />
              No applications match this filter.
            </li>
          )}
        </ul>
      </section>
    </div>
  )
}
