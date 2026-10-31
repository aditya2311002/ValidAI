import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 60

const boxSchema = z.object({
  x: z.number().describe('Left edge as percent (0-100) of image width'),
  y: z.number().describe('Top edge as percent (0-100) of image height'),
  w: z.number().describe('Width as percent of image width'),
  h: z.number().describe('Height as percent of image height'),
})

const resultSchema = z.object({
  documentTitle: z.string().describe('Short title, e.g. "Fire Safety NOC"'),
  documentKind: z.string().describe('Category, e.g. Land record, Faculty record, Safety certificate'),
  institutionName: z.string().nullable(),
  ocrConfidence: z.number().describe('0-100 how legible the document text is'),
  extractedText: z.string().describe('Verbatim transcription of the main text, max ~1200 characters'),
  fields: z.object({
    landAreaAcres: z.number().nullable().describe('Land area in acres; convert from hectares (x2.471) or sq.m if needed'),
    facultyCount: z.number().nullable(),
    studentIntake: z.number().nullable(),
    builtUpAreaSqm: z.number().nullable(),
    nocValidUntil: z.string().nullable().describe('Fire NOC expiry as YYYY-MM-DD'),
    principalPhd: z.boolean().nullable(),
  }),
  forensic: z.object({
    score: z.number().describe('Authenticity score 0-100, 100 = no signs of tampering'),
    verdict: z.enum(['authentic', 'suspicious', 'tampered']),
    findings: z
      .array(
        z.object({
          title: z.string(),
          detail: z.string(),
          severity: z.enum(['high', 'medium', 'low']),
          box: boxSchema.nullable(),
        }),
      )
      .max(5),
  }),
})

const bodySchema = z.object({
  image: z.string().startsWith('data:image/').max(8_000_000),
})

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: 'Please upload a valid image (JPG or PNG).' }, { status: 400 })
  }

  try {
    const { output } = await generateText({
      model: 'google/gemini-3.8-flash',
      output: Output.object({ schema: resultSchema }),
      system:
        'You are a document verification officer for AICTE (All India Council for Technical Education). ' +
        'You perform OCR on college approval documents, extract regulatory fields, and run a forensic review for forgery: ' +
        'look for pasted or pixelated stamps, cloned seals, mismatched fonts, misaligned text baselines, inconsistent ink colour, ' +
        'white-out patches, digitally inserted signatures and compression inconsistencies. ' +
        'Only report a field if it is clearly present; otherwise return null. Be conservative and specific. ' +
        'For findings tied to a location, give a bounding box in percentages of the image.',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Verify this document submitted with an AICTE approval application.' },
            {
              type: 'file',
              mediaType: parsed.data.image.slice(5, parsed.data.image.indexOf(';')),
              data: parsed.data.image.slice(parsed.data.image.indexOf(',') + 1),
            },
          ],
        },
      ],
    })
    return Response.json(output)
  } catch (error) {
    console.error('[verify] AI verification failed', error)
    return Response.json({ error: 'Demo verification could not complete.' }, { status: 500 })
  }
}
