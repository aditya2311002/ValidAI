'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, FileText, ImageUp, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Application } from '@/lib/types'
import { PipelineProgress } from './pipeline-progress'
import { ScreenHeader } from './ui-bits'

async function readImage(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) return null
  return await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

function createMockApplication(fileName: string, image: string | null): Application {
  const flagged = /fake|bad|forged|tampered/i.test(fileName)
  const title = fileName.replace(/\.[^.]+$/, '') || 'Institutional document'
  return {
    id: `SCAN-${Date.now().toString().slice(-6)}`,
    college: flagged ? 'Document submitted for review' : 'Sri Venkateshwara Institute of Technology',
    city: 'Field scan',
    program: 'Institutional document',
    submittedAt: new Date().toISOString(),
    status: 'pending',
    verified: true,
    documents: [{
      id: `DOC-${Date.now().toString().slice(-6)}`,
      name: title,
      kind: 'Institutional document',
      image: image || '/docs/land-certificate.png',
      ocrConfidence: flagged ? 86 : 96,
      extractedText: flagged
        ? 'Document submitted for demo forensic review. The file name suggests a potentially forged or altered document.'
        : 'Government institutional document. College name, certificate details, official seal and authorized signature detected.',
      fields: {
        landAreaAcres: flagged ? 2.1 : 12.5,
        facultyCount: flagged ? 18 : 32,
        studentIntake: 600,
        builtUpAreaSqm: 18400,
        nocValidUntil: '2027-12-31',
        principalPhd: true,
      },
      forensic: {
        score: flagged ? 38 : 94,
        verdict: flagged ? 'tampered' : 'authentic',
        findings: flagged
          ? [{ title: 'Potentially altered document', detail: 'Demo mode flagged the filename for a high-risk forensic review. Inspect the source certificate before approval.', severity: 'high', box: { x: 20, y: 22, w: 60, h: 18 } }]
          : [{ title: 'No significant manipulation detected', detail: 'Seal, signature and text layers have consistent visual characteristics.', severity: 'low', box: null }],
      },
    }],
  }
}

export function ScanScreen({ onResult }: { onResult: (app: Application) => void }) {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState('institutional-document')
  const [status, setStatus] = useState<'idle' | 'running'>('idle')
  const [step, setStep] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status !== 'running') return
    const started = window.setTimeout(() => setStep(1), 750)
    const forensic = window.setTimeout(() => setStep(2), 1500)
    const rules = window.setTimeout(() => setStep(3), 2250)
    const complete = window.setTimeout(() => onResult(createMockApplication(fileName, image)), 3000)
    return () => [started, forensic, rules, complete].forEach(window.clearTimeout)
  }, [status, fileName, image, onResult])

  const onFile = async (file?: File) => {
    if (!file) return
    setFileName(file.name)
    setImage(await readImage(file))
    setStatus('running')
    setStep(0)
  }

  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader title="Scan a document" subtitle="Secure institutional verification" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs font-medium text-primary">
          Demo Mode: AI Forensic Engine Active
        </div>
        {status === 'running' ? (
          <>
            <div className="relative flex min-h-48 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 text-center">
              <FileText className="size-10 text-primary" />
              <p className="max-w-[240px] truncate text-sm font-semibold">{fileName}</p>
              <p className="text-xs text-muted-foreground">Secure demo scan in progress</p>
              <div className="absolute inset-x-8 bottom-0 h-px bg-primary/70 shadow-[0_0_18px_3px_hsl(var(--primary)/.3)] scan-line" />
            </div>
            <PipelineProgress activeStep={step} />
          </>
        ) : image ? (
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-2">
            <img src={image} alt="Selected institutional document" className="max-h-72 w-full rounded-xl object-contain" />
            <button type="button" onClick={() => setImage(null)} aria-label="Remove document" className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-foreground/70 text-background"><X className="size-4" /></button>
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-card px-6 py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary"><FileText className="size-8" /></div>
            <div><p className="text-sm font-semibold">Upload an institutional document</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">PDFs, certificates, land records, faculty rosters or scanned NOCs are supported in this demo.</p></div>
            <div className="grid w-full grid-cols-2 gap-2">
              <Button variant="outline" className="h-11" onClick={() => cameraRef.current?.click()}><Camera /> Camera</Button>
              <Button className="h-11" onClick={() => fileRef.current?.click()}><ImageUp /> Browse files</Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Your upload stays in this prototype demo.</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="*/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {status !== 'running' && (
        <div className="sticky bottom-0 border-t border-border bg-card p-4"><Button className="h-11 w-full" onClick={() => { setStatus('running'); setStep(0) }}><Sparkles /> Verify with AI</Button></div>
      )}
    </div>
  )
}
