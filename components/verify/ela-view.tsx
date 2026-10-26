'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Finding } from '@/lib/types'

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Error Level Analysis: re-compress the image as JPEG and amplify the per-pixel
 * difference. Regions edited after the original save recompress differently and glow.
 */
async function computeEla(src: string, canvas: HTMLCanvasElement) {
  const original = await loadImage(src)
  const scale = Math.min(1, 900 / original.width)
  const w = Math.round(original.width * scale)
  const h = Math.round(original.height * scale)
  const work = document.createElement('canvas')
  work.width = w
  work.height = h
  const ctx = work.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(original, 0, 0, w, h)
  const a = ctx.getImageData(0, 0, w, h)
  const recompressed = await loadImage(work.toDataURL('image/jpeg', 0.9))
  ctx.drawImage(recompressed, 0, 0, w, h)
  const b = ctx.getImageData(0, 0, w, h)

  canvas.width = w
  canvas.height = h
  const out = canvas.getContext('2d')!
  const result = out.createImageData(w, h)
  for (let i = 0; i < a.data.length; i += 4) {
    const diff =
      (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2])) / 3
    const v = Math.min(255, diff * 18)
    result.data[i] = v
    result.data[i + 1] = v * 0.55
    result.data[i + 2] = 255 - v * 0.8
    result.data[i + 3] = 255
  }
  out.putImageData(result, 0, 0)
}

export function ElaView({
  src,
  alt,
  findings,
  activeIndex,
  onSelect,
}: {
  src: string
  alt: string
  findings: Finding[]
  activeIndex: number | null
  onSelect: (i: number) => void
}) {
  const [mode, setMode] = useState<'original' | 'ela'>('original')
  const [elaState, setElaState] = useState<'idle' | 'ready' | 'error'>('idle')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (mode !== 'ela' || !canvasRef.current) return
    let cancelled = false
    setElaState('idle')
    computeEla(src, canvasRef.current)
      .then(() => !cancelled && setElaState('ready'))
      .catch(() => !cancelled && setElaState('error'))
    return () => {
      cancelled = true
    }
  }, [mode, src])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex rounded-lg bg-muted p-1 text-xs font-medium" role="tablist" aria-label="Image view">
        {(['original', 'ela'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn('flex-1 rounded-md py-1.5 transition-colors', mode === m ? 'bg-card shadow-sm' : 'text-muted-foreground')}
          >
            {m === 'original' ? 'Original + flags' : 'ELA heatmap'}
          </button>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src || '/placeholder.svg'} alt={alt} className={cn('block w-full', mode === 'ela' && 'invisible')} />
        <canvas
          ref={canvasRef}
          className={cn('absolute inset-0 h-full w-full', mode === 'ela' ? 'block' : 'hidden')}
          aria-label="Error level analysis heatmap"
        />
        {mode === 'ela' && elaState === 'idle' && (
          <p className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground">
            Computing error-level analysis...
          </p>
        )}
        {mode === 'ela' && elaState === 'error' && (
          <p className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-destructive">
            Could not analyse this image.
          </p>
        )}
        {findings.map((f, i) =>
          f.box ? (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Show finding: ${f.title}`}
              className={cn(
                'absolute rounded-md border-2 transition-all',
                f.severity === 'high' ? 'border-destructive' : f.severity === 'medium' ? 'border-warning' : 'border-success',
                activeIndex === i ? 'bg-current/10 ring-4 ring-ring/30' : 'bg-transparent',
              )}
              style={{ left: `${f.box.x}%`, top: `${f.box.y}%`, width: `${f.box.w}%`, height: `${f.box.h}%` }}
            >
              <span
                className={cn(
                  'absolute -top-2.5 -left-2.5 flex size-5 items-center justify-center rounded-full text-[10px] font-semibold text-primary-foreground',
                  f.severity === 'high' ? 'bg-destructive' : f.severity === 'medium' ? 'bg-warning' : 'bg-success',
                )}
              >
                {i + 1}
              </span>
            </button>
          ) : null,
        )}
      </div>
      {mode === 'ela' && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Bright regions recompress differently from the rest of the page - a common sign of digital editing.
        </p>
      )}
    </div>
  )
}
