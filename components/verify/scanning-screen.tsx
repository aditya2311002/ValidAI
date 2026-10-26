'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Application } from '@/lib/types'
import { PIPELINE_STEPS, PipelineProgress } from './pipeline-progress'

export function ScanningScreen({ app, onComplete }: { app: Application; onComplete: () => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= PIPELINE_STEPS.length) {
      const t = setTimeout(onComplete, 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1100)
    return () => clearTimeout(t)
  }, [step, onComplete])

  const doc = app.documents[Math.min(step, app.documents.length - 1)]

  return (
    <div className="flex min-h-full flex-col gap-6 p-5">
      <div className="flex flex-col gap-1 pt-4">
        <p className="text-xs font-medium text-primary">AI verification in progress</p>
        <h1 className="text-lg font-semibold text-balance">{app.college}</h1>
      </div>

      <div className="relative mx-auto aspect-[3/4] w-44 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
        {doc && <Image src={doc.image || '/placeholder.svg'} alt={`Scanning ${doc.name}`} fill sizes="176px" className="object-cover object-top" />}
        <div className="scan-line absolute inset-x-0 h-1 bg-primary/70 shadow-[0_0_16px_4px] shadow-primary/40" />
      </div>

      <PipelineProgress activeStep={step} />
    </div>
  )
}
