export type Project = {
  index: string;
  title: string;
  meta: string;
  summary: string;
  detail: string;
  stack: string[];
  links: { label: string; href: string; primary?: boolean }[];
  note?: string;
};

export const PROJECTS: Project[] = [
  {
    index: "01",
    title: "Crest",
    meta: "v0.6.x · WINDOWS",
    summary:
      "The dynamic notch, built for Windows. A Mica-glass panel pinned to the top of any screen — media, files, notes, system load.",
    detail:
      "50+ installer downloads, organic. Tag-triggered NSIS releases via GitHub Actions. Microsoft Store submission next.",
    stack: ["Tauri 2", "Rust", "TypeScript", "React"],
    links: [
      { label: "Live", href: "https://crest-beta.vercel.app", primary: true },
      {
        label: "GitHub",
        href: "https://github.com/LennyDany-03/Dynamic-Notch",
      },
    ],
  },
  {
    index: "02",
    title: "Bloom",
    meta: "SAAS · IN BUILD",
    summary:
      "A Django + Next.js SaaS — typed API, multi-tenant data model, billing wired through Razorpay.",
    detail: "Placeholder copy — swap in the real one-liner and metrics.",
    stack: ["Django", "DRF", "Next.js", "Postgres"],
    links: [],
    note: "In build",
  },
  {
    index: "03",
    title: "NukePC HRMS",
    meta: "MOBILE · DESKTOP · WEB",
    summary:
      "A 3-in-1 HR platform built solo: recruitment ATS, GPS-geofenced attendance, leave management.",
    detail:
      "ZKTeco F22 biometrics over TCP/pyzk. API-level RBAC, 5 roles × 8 resources. S3 storage, Brevo SMTP.",
    stack: ["Flutter", "FastAPI", "AWS S3", "pyzk"],
    links: [],
    note: "Internal build",
  },
  {
    index: "04",
    title: "SIMS SmartAssist",
    meta: "KIOSK · HOSPITAL",
    summary:
      "A walk-in kiosk that lets patients register, book appointments and look up records without staff.",
    detail:
      "Wired into a hospital SOAP API. Designed for non-technical users: error-tolerant flows over feature density.",
    stack: ["React", "Django", "SOAP API"],
    links: [
      { label: "GitHub", href: "https://github.com/LennyDany-03/SIMS-Kiosk" },
    ],
  },
  {
    index: "05",
    title: "NIC Platform",
    meta: "13 EVENTS · LIVE",
    summary:
      "Registration platform for every event of SRM IST's Nextgen Intelligence Club fest. 1,800+ live registrations.",
    detail:
      "Redis rate limiting, client-side image compression, S3 storage, automated confirmations. Architected and maintained as Joint Head of Technical.",
    stack: ["Next.js", "Supabase", "Upstash Redis", "AWS S3"],
    links: [
      { label: "Live", href: "https://nic-srm.vercel.app", primary: true },
      { label: "GitHub", href: "https://github.com/LennyDany-03/NIC-Website" },
    ],
  },
];

export type Stat = {
  value: number;
  suffix: string;
  label: string;
  decimals: number;
};

export const STAT_BLOCKS: Stat[] = [
  { value: 8, suffix: "+", label: "PRODUCTS SHIPPED", decimals: 0 },
  { value: 1800, suffix: "+", label: "LIVE REGISTRATIONS", decimals: 0 },
  { value: 1331, suffix: "", label: "GITHUB COMMITS", decimals: 0 },
  { value: 8.49, suffix: "", label: "CGPA / 10", decimals: 2 },
];

export const MARQUEE_ROW_A = [
  "Python",
  "TypeScript",
  "React",
  "Django",
  "Flutter",
  "Tauri",
  "FastAPI",
  "Rust",
  "Next.js",
  "Dart",
];

export const MARQUEE_ROW_B = [
  "AWS S3",
  "Supabase",
  "PostgreSQL",
  "Docker",
  "Celery",
  "LangChain",
  "Redis",
  "GitHub Actions",
  "Razorpay",
  "Whisper",
];

/* MARQUEE_ACCENT / MARQUEE_BRIGHT removed: word emphasis is no longer a fixed
   set of names. Stack.tsx now sweeps a scroll-driven spotlight across the rows,
   so whichever words fall under it light up. See .spot-wide / .spot-core. */

export const STACK_GRID = [
  {
    label: "BACKEND / CLOUD",
    items:
      "Django · DRF · FastAPI · Celery · PostgreSQL · AWS S3 · Upstash Redis",
  },
  {
    label: "FRONTEND / MOBILE",
    items: "React · Next.js · React Native · Flutter · Tauri",
  },
  { label: "AI / ML", items: "LangChain · Ollama · Whisper · RAG · ChromaDB" },
  {
    label: "DEVOPS",
    items: "Git · GitHub Actions · CI/CD · Docker · Vercel · Postman",
  },
  {
    label: "INTEGRATIONS",
    items: "Razorpay · Cashfree · Brevo · ElevenLabs · ZKTeco",
  },
  {
    label: "LANGUAGES",
    items: "Python · JavaScript / TypeScript · Dart · Rust · C / C++",
  },
];

export type Frame = {
  src: string;
  alt: string;
  /** Mono stamp shown under the frame — mirrors the camera overlay in the shots. */
  meta: string;
  caption: string;
  /** Native aspect, used to reserve space and drive the collage rhythm. */
  ratio: "wide" | "tall" | "portrait" | "square";
};

/**
 * The FRAMES collage. Captions are intentionally observational rather than
 * claims about specific events — swap them for the real stories any time, the
 * layout adapts to whatever length you write.
 */
export const JOURNEY: Frame[] = [
  {
    src: "/journey/01-srm-award.jpeg",
    alt: "Lenny with three others holding certificates at SRM Institute of Science and Technology, Vadapalani campus",
    meta: "SRM IST · VADAPALANI",
    caption: "Paperwork catches up with the shipping.",
    ratio: "wide",
  },
  {
    src: "/journey/02-auditorium.jpeg",
    alt: "Lenny and friends in a packed university auditorium",
    meta: "CHENNAI · 08.10.26",
    caption: "Full house.",
    ratio: "wide",
  },
  {
    src: "/journey/03-focus.jpeg",
    alt: "Candid portrait of Lenny with earbuds in, hand to chin",
    meta: "29MM F/2.0 · ISO 2916",
    caption: "The face that means the bug is not where I thought.",
    ratio: "portrait",
  },
  {
    src: "/journey/04-lanyard.jpeg",
    alt: "Lenny wearing a Science and Technology lanyard on campus",
    meta: "29MM F/2.0 · ISO 3027",
    caption: "Between sessions.",
    ratio: "portrait",
  },
  {
    src: "/journey/05-offscreen.jpeg",
    alt: "Lenny posing beside a cinema poster at PVR",
    meta: "OFF THE CLOCK",
    caption: "Shipping is half the job.",
    ratio: "tall",
  },
  {
    src: "/journey/06-standing.jpeg",
    alt: "Lenny standing with arms crossed beside a cinema poster",
    meta: "OFF THE CLOCK",
    caption: "The other half is getting people to open it.",
    ratio: "tall",
  },
  {
    src: "/journey/07-portrait.jpeg",
    alt: "Studio portrait of Lenny Dany Derek D.",
    meta: "PORTRAIT · 2026",
    caption: "Second year, eight products deep.",
    ratio: "square",
  },
];

export type ProcessStep = {
  index: string;
  title: string;
  body: string;
};

/**
 * 04 / PROCESS. Replaces the old OFF THE CLOCK section.
 *
 * Every claim here is already supported elsewhere on the page (solo, end-to-end,
 * tagged releases, systems still running) rather than being new biography —
 * rewrite freely, the layout takes any length.
 */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    index: "01",
    title: "Pick the hard part",
    body: "The interesting problem is usually the one nobody wants to own — biometrics over TCP, a native Windows overlay, rate limiting under real load. Start there, not at the scaffolding.",
  },
  {
    index: "02",
    title: "Build it end to end",
    body: "Backend, frontend, infra, release pipeline. One person holding every layer means no handoffs, no waiting, and no part of the system nobody understands.",
  },
  {
    index: "03",
    title: "Ship it",
    body: "Tagged releases, real installers, real users. A branch that never merges is not work — it is a hobby with extra steps.",
  },
  {
    index: "04",
    title: "Keep it running",
    body: "Shipping starts the maintenance, it does not end the project. Eight products still up is the number that actually matters.",
  },
];

export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/LennyDany-03" },
  { label: "Instagram", href: "https://instagram.com/lennydany3" },
  { label: "LinkedIn", href: "https://linkedin.com/in/lenny-dany-derek-d" },
  { label: "Ascendry", href: "https://lenny3.vercel.app" },
];

export const EMAIL = "lennydany3@gmail.com";
