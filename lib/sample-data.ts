import type { Application } from './types'

export const SAMPLE_APPLICATIONS: Application[] = [
  {
    id: 'AICTE-2026-04812',
    college: 'Sri Venkateshwara Institute of Technology',
    city: 'Pune, Maharashtra',
    program: 'B.Tech - New Institution',
    submittedAt: '2026-10-22',
    status: 'pending',
    verified: false,
    documents: [
      {
        id: 'svit-land',
        name: 'Land Ownership Certificate',
        kind: 'Land record',
        image: '/docs/land-certificate.png',
        ocrConfidence: 97,
        extractedText:
          'GOVERNMENT OF MAHARASHTRA - REVENUE DEPARTMENT\nLAND OWNERSHIP CERTIFICATE\nThis is to certify that the land bearing Survey No. 214/2 stands in favour of Sri Venkateshwara Institute of Technology, Pune.\nTotal Area: 12.5 Acres\nDate: 14/03/2024\nTehsildar, Haveli',
        fields: { landAreaAcres: 12.5 },
        forensic: {
          score: 96,
          verdict: 'authentic',
          findings: [
            {
              title: 'Stamp texture consistent',
              detail: 'Ink bleed and compression noise of the seal match the surrounding paper.',
              severity: 'low',
            },
          ],
        },
      },
      {
        id: 'svit-faculty',
        name: 'Faculty Strength Roster',
        kind: 'Faculty record',
        image: '/docs/faculty-roster.png',
        ocrConfidence: 93,
        extractedText:
          'SRI VENKATESHWARA INSTITUTE OF TECHNOLOGY - FACULTY STRENGTH 2026-27\nS.No | Name | Designation | Qualification | Department\n1 | Dr. A. Kulkarni | Professor & Principal | PhD | CSE\n2 | Dr. S. Iyer | Professor | PhD | ECE\n...\nTotal Sanctioned Intake: 600 | Total Faculty: 32',
        fields: { facultyCount: 32, studentIntake: 600, principalPhd: true },
        forensic: {
          score: 91,
          verdict: 'authentic',
          findings: [
            {
              title: 'Signature stroke pressure natural',
              detail: 'Variable stroke width indicates a wet-ink signature, not a pasted image.',
              severity: 'low',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'AICTE-2026-03977',
    college: 'Northfield College of Engineering',
    city: 'Nagpur, Maharashtra',
    program: 'B.Tech - Intake Increase',
    submittedAt: '2026-10-19',
    status: 'pending',
    verified: false,
    documents: [
      {
        id: 'nce-deed',
        name: 'Registered Sale Deed',
        kind: 'Land record',
        image: '/docs/land-deed-northfield.png',
        ocrConfidence: 89,
        extractedText:
          'INDIA NON JUDICIAL - FIVE HUNDRED RUPEES\nSALE DEED\nTHIS SALE DEED is made at Nagpur on this 2nd day of August 2019...\nThe purchaser NORTHFIELD COLLEGE OF ENGINEERING, NAGPUR...\nsituated in Village Kalmeshwar, Tahsil Nagpur. KHASRA NO. 77.\nAREA: 2.1 ACRES (equivalent to 0.85 Hectares)\nSub-Registrar, Nagpur - 02/08/2019',
        fields: { landAreaAcres: 2.1 },
        forensic: {
          score: 34,
          verdict: 'tampered',
          findings: [
            {
              title: 'Edited value in area field',
              detail:
                'The "2.1 ACRES" text uses a different typeface and sits on a brighter, uniform patch. Error-level analysis shows a compression mismatch with the rest of the page.',
              severity: 'high',
              box: { x: 20, y: 66, w: 30, h: 6 },
            },
            {
              title: 'Hectare conversion mismatch',
              detail: '0.85 hectares equals 2.1 acres, but the khasra record on the state land portal lists 0.85 ha as the original plot - value likely altered.',
              severity: 'medium',
            },
            {
              title: 'Registrar seal intact',
              detail: 'Seal shows natural ink spread; no cloning detected.',
              severity: 'low',
              box: { x: 63, y: 79, w: 28, h: 15 },
            },
          ],
        },
      },
      {
        id: 'nce-noc',
        name: 'Fire Safety NOC',
        kind: 'Safety certificate',
        image: '/docs/fire-noc.png',
        ocrConfidence: 98,
        extractedText:
          'MUNICIPAL FIRE DEPARTMENT, NAGPUR\nFIRE SAFETY NO OBJECTION CERTIFICATE\nIssued to "Northfield College of Engineering, Nagpur"\nBuilt-up Area: 18,400 sq.m.\nValid Until: 31/12/2025\nCertificate Number: FS/NGP/2023/0871\nChief Fire Officer',
        fields: { builtUpAreaSqm: 18400, nocValidUntil: '2025-12-31' },
        forensic: {
          score: 52,
          verdict: 'suspicious',
          findings: [
            {
              title: 'Pasted / resampled stamp',
              detail:
                'The red seal is heavily pixelated with blocky 8x8 artefacts while the surrounding text is sharp - typical of a low-resolution stamp image pasted onto the page.',
              severity: 'high',
              box: { x: 11, y: 74, w: 25, h: 19 },
            },
            {
              title: 'Certificate number not in registry',
              detail: 'FS/NGP/2023/0871 could not be matched to the issuing department format for 2023.',
              severity: 'medium',
            },
          ],
        },
      },
    ],
  },
]
