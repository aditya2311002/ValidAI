'use client'

import { useCallback, useState } from 'react'
import { House, ScanLine, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SAMPLE_APPLICATIONS } from '@/lib/sample-data'
import { summarize } from '@/lib/rules'
import type { Application, AppStatus } from '@/lib/types'
import { LoginScreen } from './login-screen'
import { HomeScreen } from './home-screen'
import { ApplicationScreen } from './application-screen'
import { ScanningScreen } from './scanning-screen'
import { ReportScreen } from './report-screen'
import { ScanScreen } from './scan-screen'
import { RulebookScreen } from './rulebook-screen'

type Screen =
  | { name: 'home' }
  | { name: 'scan' }
  | { name: 'rules' }
  | { name: 'application'; id: string }
  | { name: 'scanning'; id: string }
  | { name: 'report'; id: string }

const TABS = [
  { name: 'home', label: 'Queue', icon: House },
  { name: 'scan', label: 'Scan', icon: ScanLine },
  { name: 'rules', label: 'Rulebook', icon: BookOpen },
] as const

export function AppShell() {
  const [officer, setOfficer] = useState<string | null>(null)
  const [apps, setApps] = useState<Application[]>(SAMPLE_APPLICATIONS)
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  const current = 'id' in screen ? apps.find((a) => a.id === screen.id) : undefined

  const finishScan = useCallback(() => {
    if (screen.name !== 'scanning') return
    const id = screen.id
    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        const flagged = summarize(a.documents).recommendation === 'reject'
        return { ...a, verified: true, status: a.status === 'pending' && flagged ? 'flagged' : a.status }
      }),
    )
    setScreen({ name: 'report', id })
  }, [screen])

  const decide = (status: AppStatus, remarks: string) => {
    if (!current) return
    setApps((prev) => prev.map((a) => (a.id === current.id ? { ...a, status, remarks } : a)))
    setScreen({ name: 'home' })
  }

  const showNav = screen.name === 'home' || screen.name === 'scan' || screen.name === 'rules'

  let content: React.ReactNode
  if (!officer) {
    content = <LoginScreen onLogin={setOfficer} />
  } else if (screen.name === 'home') {
    content = (
      <HomeScreen
        officer={officer}
        applications={apps}
        onOpen={(id) => setScreen({ name: 'application', id })}
        onLogout={() => setOfficer(null)}
      />
    )
  } else if (screen.name === 'scan') {
    content = (
      <ScanScreen
        existingApplications={apps}
        onResult={(app) => {
          setApps((prev) => {
            const existing = prev.some((item) => item.id === app.id)
            return existing ? prev.map((item) => item.id === app.id ? { ...item, documents: [...item.documents, ...app.documents] } : item) : [app, ...prev]
          })
          setScreen({ name: 'report', id: app.id })
        }}
      />
    )
  } else if (screen.name === 'rules') {
    content = <RulebookScreen />
  } else if (current && screen.name === 'application') {
    content = (
      <ApplicationScreen
        app={current}
        onBack={() => setScreen({ name: 'home' })}
        onVerify={() => setScreen({ name: 'scanning', id: current.id })}
        onViewReport={() => setScreen({ name: 'report', id: current.id })}
      />
    )
  } else if (current && screen.name === 'scanning') {
    content = <ScanningScreen app={current} onComplete={finishScan} />
  } else if (current && screen.name === 'report') {
    content = (
      <ReportScreen
        app={current}
        onBack={() => setScreen({ name: 'application', id: current.id })}
        onDecide={decide}
      />
    )
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[oklch(0.2_0.03_262)] sm:py-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground sm:h-[820px] sm:max-h-[calc(100dvh-3rem)] sm:w-[400px] sm:rounded-[2.5rem] sm:border-[10px] sm:border-[oklch(0.12_0.02_262)] sm:shadow-2xl">
        <div className="flex-1 overflow-y-auto">{content}</div>
        {officer && showNav && (
          <nav className="grid grid-cols-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]" aria-label="Main">
            {TABS.map(({ name, label, icon: Icon }) => {
              const active = screen.name === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setScreen({ name } as Screen)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-5" />
                  {label}
                </button>
              )
            })}
          </nav>
        )}
      </div>
    </main>
  )
}
