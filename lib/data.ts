export type Project = {
  index: string
  title: string
  meta: string
  summary: string
  detail: string
  stack: string[]
  links: { label: string; href: string; primary?: boolean }[]
  note?: string
}

export const PROJECTS: Project[] = [
  {
    index: '01',
    title: 'Crest',
    meta: 'v0.6.x · WINDOWS',
    summary:
      'The dynamic notch, built for Windows. A Mica-glass panel pinned to the top of any screen — media, files, notes, system load.',
    detail:
      '50+ installer downloads, organic. Tag-triggered NSIS releases via GitHub Actions. Microsoft Store submission next.',
    stack: ['Tauri 2', 'Rust', 'TypeScript', 'React'],
    links: [
      { label: 'Live', href: 'https://crest-beta.vercel.app', primary: true },
      { label: 'GitHub', href: 'https://github.com/LennyDany-03/Dynamic-Notch' },
    ],
  },
  {
    index: '02',
    title: 'Bloom',
    meta: 'SAAS · IN BUILD',
    summary:
      'A Django + Next.js SaaS — typed API, multi-tenant data model, billing wired through Razorpay.',
    detail: 'Placeholder copy — swap in the real one-liner and metrics.',
    stack: ['Django', 'DRF', 'Next.js', 'Postgres'],
    links: [],
    note: 'In build',
  },
  {
    index: '03',
    title: 'NukePC HRMS',
    meta: 'MOBILE · DESKTOP · WEB',
    summary:
      'A 3-in-1 HR platform built solo: recruitment ATS, GPS-geofenced attendance, leave management.',
    detail:
      'ZKTeco F22 biometrics over TCP/pyzk. API-level RBAC, 5 roles × 8 resources. S3 storage, Brevo SMTP.',
    stack: ['Flutter', 'FastAPI', 'AWS S3', 'pyzk'],
    links: [],
    note: 'Internal build',
  },
  {
    index: '04',
    title: 'SIMS SmartAssist',
    meta: 'KIOSK · HOSPITAL',
    summary:
      'A walk-in kiosk that lets patients register, book appointments and look up records without staff.',
    detail:
      'Wired into a hospital SOAP API. Designed for non-technical users: error-tolerant flows over feature density.',
    stack: ['React', 'Django', 'SOAP API'],
    links: [{ label: 'GitHub', href: 'https://github.com/LennyDany-03/SIMS-Kiosk' }],
  },
  {
    index: '05',
    title: 'NIC Platform',
    meta: '13 EVENTS · LIVE',
    summary:
      "Registration platform for every event of SRM IST's Nextgen Intelligence Club fest. 1,800+ live registrations.",
    detail:
      'Redis rate limiting, client-side image compression, S3 storage, automated confirmations. Architected and maintained as Joint Head of Technical.',
    stack: ['Next.js', 'Supabase', 'Upstash Redis', 'AWS S3'],
    links: [
      { label: 'Live', href: 'https://nic-srm.vercel.app', primary: true },
      { label: 'GitHub', href: 'https://github.com/LennyDany-03/NIC-Website' },
    ],
  },
]

export type Stat = {
  value: number
  suffix: string
  label: string
  decimals: number
}

export const STAT_BLOCKS: Stat[] = [
  { value: 8, suffix: '+', label: 'PRODUCTS SHIPPED', decimals: 0 },
  { value: 1800, suffix: '+', label: 'LIVE REGISTRATIONS', decimals: 0 },
  { value: 1331, suffix: '', label: 'GITHUB COMMITS', decimals: 0 },
  { value: 8.49, suffix: '', label: 'CGPA / 10', decimals: 2 },
]

export const MARQUEE_ROW_A = [
  'Python', 'TypeScript', 'React', 'Django', 'Flutter',
  'Tauri', 'FastAPI', 'Rust', 'Next.js', 'Dart',
]

export const MARQUEE_ROW_B = [
  'AWS S3', 'Supabase', 'PostgreSQL', 'Docker', 'Celery',
  'LangChain', 'Redis', 'GitHub Actions', 'Razorpay', 'Whisper',
]

/** Words rendered in the accent colour inside the marquee rows. */
export const MARQUEE_ACCENT = new Set(['Tauri', 'Redis'])
/** Words rendered at full brightness inside the marquee rows. */
export const MARQUEE_BRIGHT = new Set(['React', 'Docker'])

export const STACK_GRID = [
  {
    label: 'BACKEND / CLOUD',
    items: 'Django · DRF · FastAPI · Celery · PostgreSQL · AWS S3 · Upstash Redis',
  },
  {
    label: 'FRONTEND / MOBILE',
    items: 'React · Next.js · React Native · Flutter · Tauri',
  },
  { label: 'AI / ML', items: 'LangChain · Ollama · Whisper · RAG · ChromaDB' },
  {
    label: 'DEVOPS',
    items: 'Git · GitHub Actions · CI/CD · Docker · Vercel · Postman',
  },
  {
    label: 'INTEGRATIONS',
    items: 'Razorpay · Cashfree · Brevo · ElevenLabs · ZKTeco',
  },
  {
    label: 'LANGUAGES',
    items: 'Python · JavaScript / TypeScript · Dart · Rust · C / C++',
  },
]

export const NAV_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'Stack', href: '#stack' },
  { label: 'Offline', href: '#offline' },
  { label: 'Contact', href: '#contact' },
]

export const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/LennyDany-03' },
  { label: 'Instagram', href: 'https://instagram.com/lennydany3' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/lenny-dany-derek-d' },
  { label: 'Ascendry', href: 'https://lenny3.vercel.app' },
]

export const EMAIL = 'lennydany3@gmail.com'
