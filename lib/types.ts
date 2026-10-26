export type Severity = 'high' | 'medium' | 'low'

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface Finding {
  title: string
  detail: string
  severity: Severity
  box?: Box
}

export interface ExtractedFields {
  landAreaAcres?: number | null
  facultyCount?: number | null
  studentIntake?: number | null
  builtUpAreaSqm?: number | null
  nocValidUntil?: string | null
  principalPhd?: boolean | null
}

export type ForensicVerdict = 'authentic' | 'suspicious' | 'tampered'

export interface DocumentResult {
  id: string
  name: string
  kind: string
  image: string
  ocrConfidence: number
  extractedText: string
  fields: ExtractedFields
  forensic: {
    score: number
    verdict: ForensicVerdict
    findings: Finding[]
  }
}

export type AppStatus = 'pending' | 'flagged' | 'approved' | 'rejected' | 'query'

export interface Application {
  id: string
  college: string
  city: string
  program: string
  submittedAt: string
  status: AppStatus
  documents: DocumentResult[]
  verified: boolean
  remarks?: string
}

export type RuleStatus = 'pass' | 'fail' | 'missing'

export interface RuleResult {
  id: string
  title: string
  clause: string
  requirement: string
  actual: string
  status: RuleStatus
}
