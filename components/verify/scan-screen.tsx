'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, ImageUp, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Application, DocumentResult } from '@/lib/types'
import { PipelineProgress } from './pipeline-progress'
import { ScreenHeader } from './ui-bits'

async function compressImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new window.Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.92)
  } finally {
    URL.revokeObjectURL(url)
  }
}

interface VerifyResponse {
  documentTitle: string
  documentKind: string
  institutionName: string | null
  ocrConfidence: number
  extractedText: string
  fields: DocumentResult['fields']
  forensic: {
    score: number
    verdict: DocumentResult['forensic']['verdict']
    findings: { title: string; detail: string; severity: 'high' | 'medium' | 'low'; box: DocumentResult['forensic']['findings'][number]['box'] | null }[]
  }
}

export function ScanScreen({ onResult }: { onResult: (app: Application) => void }) {
  const [image, setImage] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle')
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status !== 'running') return
    const t = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 2500)
    return () => clearInterval(t)
  }, [status])

  const onFile = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG or PNG). Photograph PDFs page by page.')
      setStatus('error')
      return
    }
    setError('')
    setStatus('idle')
    setImage(await compressImage(file))
  }

  const run = async () => {
    if (!image) return
    setStatus('running')
    setStep(0)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Verification failed')
      const result = data as VerifyResponse
      const id = `SCAN-${Date.now().toString().slice(-6)}`
      onResult({
        id,
        college: result.institutionName || 'Uploaded document',
        city: 'Field scan',
        program: result.documentKind,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        verified: true,
        documents: [
          {
            id,
            name: result.documentTitle,
            kind: result.documentKind,
            image,
            ocrConfidence: Math.round(result.ocrConfidence),
            extractedText: result.extractedText,
            fields: result.fields,
            forensic: {
              score: Math.round(result.forensic.score),
              verdict: result.forensic.verdict,
              findings: result.forensic.findings.map((f) => ({ ...f, box: f.box ?? undefined })),
            },
          },
        ],
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed')
      setStatus('error')
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <ScreenHeader title="Scan a document" subtitle="Live AI: OCR, forensics & rule check" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {status === 'running' ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {image && <img src={image} alt="Document being verified" className="mx-auto max-h-56 rounded-xl border border-border" />}
            <PipelineProgress activeStep={step} />
          </>
        ) : image ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Selected document" className="w-full rounded-xl border border-border" />
            <button
              type="button"
              onClick={() => setImage(null)}
              aria-label="Remove image"
              className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-foreground/70 text-background"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <ImageUp className="size-7" />
            </div>
            <div>
              <p className="text-sm font-semibold">Upload any college document</p>
              <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
                Land deeds, fire NOCs, faculty rosters, building certificates. The AI will read it, check it for tampering and match it to AICTE norms.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              <Button variant="outline" className="h-11" onClick={() => cameraRef.current?.click()}>
                <Camera />
                Camera
              </Button>
              <Button className="h-11" onClick={() => fileRef.current?.click()}>
                <ImageUp />
                Gallery
              </Button>
            </div>
            <a href="/docs/fire-noc.png" download className="text-xs font-medium text-primary underline-offset-4 hover:underline">
              No document handy? Download a sample
            </a>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0])}
        />

        {status === 'error' && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      {image && status !== 'running' && (
        <div className="sticky bottom-0 border-t border-border bg-card p-4">
          <Button className="h-11 w-full" onClick={run}>
            <Sparkles />
            Verify with AI
          </Button>
        </div>
      )}
    </div>
  )
}
