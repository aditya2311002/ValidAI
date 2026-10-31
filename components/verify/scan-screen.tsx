'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Camera, Check, FileText, ImageUp, Loader2, Sparkles, X } from 'lucide-react'
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

type ValidationState = 'intro' | 'checking' | 'success' | 'invalid' | 'quality' | null

const validationSteps = ['Checking file format', 'Detecting document content', 'Assessing image quality', 'Checking document relevance']

function classifyUpload(file: File) {
  const name = file.name.toLowerCase()
  if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type) && !file.type.startsWith('image/')) return 'invalid' as const
  if (/selfie|portrait|landscape|random|screenshot|wallpaper|vacation|photo/i.test(name)) return 'invalid' as const
  if (/blurry|blur|dark|cropped|unclear|low[- ]?quality/i.test(name)) return 'quality' as const
  return 'valid' as const
}

export function ScanScreen({ onResult }: { onResult: (app: Application) => void }) {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState('institutional-document')
  const [status, setStatus] = useState<'idle' | 'running'>('idle')
  const [step, setStep] = useState(0)
  const [validation, setValidation] = useState<ValidationState>('intro')
  const [validationStep, setValidationStep] = useState(0)
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

  useEffect(() => {
    if (validation !== 'checking') return
    const timers = validationSteps.map((_, index) => window.setTimeout(() => setValidationStep(index + 1), (index + 1) * 350))
    return () => timers.forEach(window.clearTimeout)
  }, [validation])

  const beginValidation = async (file?: File) => {
    if (!file) return
    setFileName(file.name)
    setImage(await readImage(file))
    setValidationStep(0)
    setValidation('checking')
    const outcome = classifyUpload(file)
    window.setTimeout(() => {
      if (outcome === 'invalid') setValidation('invalid')
      else if (outcome === 'quality') setValidation('quality')
      else {
        setValidation('success')
        window.setTimeout(() => { setValidation(null); setStatus('running'); setStep(0) }, 700)
      }
    }, 1500)
  }

  const openPicker = (picker: HTMLInputElement | null) => {
    if (validation === null) setValidation('intro')
    picker?.click()
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
              <Button variant="outline" className="h-11" onClick={() => openPicker(cameraRef.current)}><Camera /> Camera</Button>
              <Button className="h-11" onClick={() => openPicker(fileRef.current)}><ImageUp /> Browse files</Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Your upload stays in this prototype demo.</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="*/*" className="sr-only" onChange={(e) => beginValidation(e.target.files?.[0])} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => beginValidation(e.target.files?.[0])} />
      </div>
      {status !== 'running' && (
        <div className="sticky bottom-0 border-t border-border bg-card p-4"><Button className="h-11 w-full" onClick={() => openPicker(fileRef.current)}><Sparkles /> Verify with AI</Button></div>
      )}
      {validation && (
        <div className="absolute inset-0 z-20 flex items-end bg-black/55 p-3 sm:items-center">
          <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="validation-title">
            {validation === 'intro' && <>
              <div className="mb-4 flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Upload guidance</p><h2 id="validation-title" className="mt-1 text-xl font-semibold">Before you upload</h2></div><button type="button" onClick={() => setValidation(null)} aria-label="Cancel"><X className="size-5 text-muted-foreground" /></button></div>
              <p className="text-sm leading-relaxed text-muted-foreground">ValidAI is designed to analyze institutional documents related to AICTE approval and regulatory compliance. Please upload a relevant document for accurate verification.</p>
              <div className="my-4 rounded-xl bg-muted/50 p-3 text-sm"><p className="mb-2 font-semibold">Supported documents</p><ul className="space-y-1 text-muted-foreground"><li>AICTE approval letters</li><li>Institutional compliance reports</li><li>Faculty, infrastructure and certificate records</li></ul></div>
              <p className="mb-5 text-xs text-muted-foreground">Random photographs, selfies and unrelated images may not be processed correctly.</p>
              <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setValidation(null)}>Cancel</Button><Button className="flex-1" onClick={() => { setValidation(null); fileRef.current?.click() }}>I Understand, Continue</Button></div>
            </>}
            {validation === 'checking' && <div className="py-3"><div className="mb-5 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Loader2 className="size-5 animate-spin" /></div><div><h2 id="validation-title" className="font-semibold">Analyzing Uploaded Document...</h2><p className="text-xs text-muted-foreground">Pre-validation runs before the verification engine</p></div></div><div className="space-y-3">{validationSteps.map((label, index) => <div key={label} className="flex items-center gap-3 text-sm"><div className={`flex size-6 items-center justify-center rounded-full ${validationStep > index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{validationStep > index ? <Check className="size-3.5" /> : <span>{index + 1}</span>}</div><span className={validationStep > index ? 'text-foreground' : 'text-muted-foreground'}>{label}</span></div>)}</div></div>}
            {validation === 'success' && <div className="py-3 text-center"><div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500"><Check className="size-6" /></div><h2 id="validation-title" className="font-semibold">Document Recognized Successfully</h2><p className="mt-1 text-sm text-muted-foreground">Starting the existing ValidAI verification pipeline...</p></div>}
            {(validation === 'invalid' || validation === 'quality') && <><div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500"><AlertTriangle className="size-5" /></div><div><h2 id="validation-title" className="text-lg font-semibold">{validation === 'invalid' ? 'Invalid Document Detected' : 'Document Quality Issue'}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{validation === 'invalid' ? 'The uploaded file does not appear to be a relevant institutional document. Please upload a document related to AICTE approval or regulatory compliance.' : 'We detected a possible institutional document, but its quality is insufficient for reliable processing. Please upload a clearer scan or photograph.'}</p></div></div><div className="mt-5 flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setValidation(null)}>Cancel</Button><Button className="flex-1" onClick={() => { setValidation('intro'); setImage(null) }}>{validation === 'invalid' ? 'Upload Another Document' : 'Try Again'}</Button></div></>}
          </div>
        </div>
      )}
    </div>
  )
}
