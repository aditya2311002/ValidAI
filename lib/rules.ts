import type { DocumentResult, ExtractedFields, RuleResult } from './types'

interface Rule {
  id: string
  title: string
  clause: string
  requirement: string
  evaluate: (f: ExtractedFields, today: Date) => Pick<RuleResult, 'actual' | 'status'>
}

const missing = { actual: 'Not found in submitted documents', status: 'missing' as const }

export const RULEBOOK: Rule[] = [
  {
    id: 'land',
    title: 'Minimum land area',
    clause: 'APH Ch. 2 - Land',
    requirement: 'At least 2.5 acres (metro / urban region)',
    evaluate: (f) => {
      if (f.landAreaAcres == null) return missing
      return {
        actual: `${f.landAreaAcres} acres`,
        status: f.landAreaAcres >= 2.5 ? 'pass' : 'fail',
      }
    },
  },
  {
    id: 'fsr',
    title: 'Faculty : student ratio',
    clause: 'APH Ch. 5 - Faculty',
    requirement: '1:20 or better',
    evaluate: (f) => {
      if (!f.facultyCount || !f.studentIntake) return missing
      const ratio = f.studentIntake / f.facultyCount
      return {
        actual: `1:${ratio.toFixed(1)} (${f.facultyCount} faculty / ${f.studentIntake} intake)`,
        status: ratio <= 20 ? 'pass' : 'fail',
      }
    },
  },
  {
    id: 'builtup',
    title: 'Built-up area',
    clause: 'APH Ch. 3 - Infrastructure',
    requirement: 'At least 8,000 sq.m for intake up to 600',
    evaluate: (f) => {
      if (f.builtUpAreaSqm == null) return missing
      return {
        actual: `${f.builtUpAreaSqm.toLocaleString('en-IN')} sq.m`,
        status: f.builtUpAreaSqm >= 8000 ? 'pass' : 'fail',
      }
    },
  },
  {
    id: 'noc',
    title: 'Valid fire safety NOC',
    clause: 'APH Ch. 3 - Safety',
    requirement: 'Must be valid on the date of verification',
    evaluate: (f, today) => {
      if (!f.nocValidUntil) return missing
      const expiry = new Date(f.nocValidUntil)
      if (Number.isNaN(expiry.getTime())) return { actual: f.nocValidUntil, status: 'fail' }
      return {
        actual: `Valid until ${expiry.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        status: expiry >= today ? 'pass' : 'fail',
      }
    },
  },
  {
    id: 'principal',
    title: 'Principal qualification',
    clause: 'APH Ch. 5 - Faculty',
    requirement: 'Principal must hold a PhD',
    evaluate: (f) => {
      if (f.principalPhd == null) return missing
      return {
        actual: f.principalPhd ? 'PhD holder' : 'No PhD on record',
        status: f.principalPhd ? 'pass' : 'fail',
      }
    },
  },
]

export function mergeFields(docs: DocumentResult[]): ExtractedFields {
  return docs.reduce<ExtractedFields>((acc, doc) => {
    for (const [key, value] of Object.entries(doc.fields)) {
      if (value != null) (acc as Record<string, unknown>)[key] = value
    }
    return acc
  }, {})
}

export function evaluateCompliance(docs: DocumentResult[], today = new Date()): RuleResult[] {
  const fields = mergeFields(docs)
  return RULEBOOK.map((rule) => ({
    id: rule.id,
    title: rule.title,
    clause: rule.clause,
    requirement: rule.requirement,
    ...rule.evaluate(fields, today),
  }))
}

export function summarize(docs: DocumentResult[]) {
  const rules = evaluateCompliance(docs)
  const passed = rules.filter((r) => r.status === 'pass').length
  const failed = rules.filter((r) => r.status === 'fail').length
  const missingCount = rules.filter((r) => r.status === 'missing').length
  const forensicScore = docs.length
    ? Math.round(docs.reduce((s, d) => s + d.forensic.score, 0) / docs.length)
    : 0
  const tamperedDocs = docs.filter((d) => d.forensic.verdict !== 'authentic').length
  const complianceScore = Math.round((passed / rules.length) * 100)
  const overall = Math.round(complianceScore * 0.5 + forensicScore * 0.5)
  let recommendation: 'approve' | 'query' | 'reject' = 'approve'
  if (failed > 0 || docs.some((d) => d.forensic.verdict === 'tampered')) recommendation = 'reject'
  else if (missingCount > 0 || tamperedDocs > 0) recommendation = 'query'
  return { rules, passed, failed, missingCount, forensicScore, tamperedDocs, complianceScore, overall, recommendation }
}
