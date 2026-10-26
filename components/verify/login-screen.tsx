'use client'

import { useState } from 'react'
import { ShieldCheck, ScanText, Fingerprint, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LoginScreen({ onLogin }: { onLogin: (name: string) => void }) {
  const [officerId, setOfficerId] = useState('EVAL-2041')
  const [pin, setPin] = useState('1234')

  return (
    <div className="flex min-h-full flex-col bg-primary text-primary-foreground">
      <div className="flex flex-1 flex-col justify-center gap-8 px-6 pt-12 pb-6">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-foreground/10">
          <ShieldCheck className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-balance">AICTE Verify</h1>
          <p className="text-sm leading-relaxed text-primary-foreground/75 text-pretty">
            AI assistant that reads, authenticates and rule-checks college approval documents in minutes.
          </p>
        </div>
        <ul className="flex flex-col gap-3 text-sm">
          {[
            { icon: ScanText, text: 'OCR reads every uploaded document' },
            { icon: Fingerprint, text: 'Forensics flags edited stamps & signatures' },
            { icon: Scale, text: 'Checks data against the AICTE rulebook' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <Icon className="size-4 text-primary-foreground/70" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      <form
        className="flex flex-col gap-4 rounded-t-3xl bg-card px-6 pt-6 pb-8 text-card-foreground"
        onSubmit={(e) => {
          e.preventDefault()
          onLogin(officerId.trim() || 'Evaluator')
        }}
      >
        <h2 className="text-lg font-semibold">Evaluator sign in</h2>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Officer ID</span>
          <input
            value={officerId}
            onChange={(e) => setOfficerId(e.target.value)}
            className="h-11 rounded-lg border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            autoComplete="username"
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">PIN</span>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="h-11 rounded-lg border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            autoComplete="current-password"
            required
          />
        </label>
        <Button type="submit" className="h-11 text-sm">
          Sign in
        </Button>
        <p className="text-center text-xs text-muted-foreground">Prototype - demo credentials are pre-filled</p>
      </form>
    </div>
  )
}
