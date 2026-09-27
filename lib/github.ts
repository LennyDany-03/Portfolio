/**
 * Live GitHub numbers for the About stat row.
 *
 * Runs on the SERVER only (imported from app/page.tsx, which is an async
 * server component). That matters for three reasons: the request never leaves
 * a visitor's browser so nobody spends their own rate limit, there is no
 * client fetch waterfall and therefore no number that pops in late, and the
 * response is shared by every visitor through Next's data cache instead of
 * being re-fetched per session.
 *
 * SOURCE, in order of preference:
 *
 *  1. The contribution calendar behind github.com/users/<user>/contributions.
 *     This is the number the profile page shows, which is the number a
 *     visitor would see if they clicked through — it counts private
 *     contributions and every branch. It is HTML, not JSON, so it is parsed
 *     defensively and any shape change falls through to (2) rather than
 *     throwing.
 *  2. The commit search API. One request, no token, but it only indexes the
 *     DEFAULT branch of PUBLIC repos, so it reads low — a floor, not a total.
 *  3. COMMITS_FALLBACK, the last hand-counted figure.
 *
 * `source` is returned alongside the number so the UI can tell the difference
 * between "live" and "we could not reach GitHub".
 */

export const GITHUB_USER = "lennydany3";

/** Last hand-counted total. Only used when every live source is unreachable. */
export const COMMITS_FALLBACK = 1330;

/** Account creation year. Nothing can be counted before it. */
const FIRST_YEAR = 2024;

/** Cache lifetime, seconds. A commit counter does not need to be fresher. */
const REVALIDATE = 3600;

/** Days shown in the heat strip. 18 weeks reads at ~60px wide. */
const STRIP_DAYS = 126;

/** Per-request ceiling, so a hanging GitHub can never stall a build. */
const TIMEOUT_MS = 6000;

export type ContribDay = {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  count: number;
  /** GitHub's own 0-4 bucketing. Drives the strip's opacity ramp. */
  level: number;
};

export type GithubStats = {
  commits: number;
  /** Trailing daily contributions, oldest first. Empty unless source is live. */
  recent: ContribDay[];
  source: "contributions" | "search" | "fallback";
};

/**
 * Read one attribute out of a raw tag string.
 *
 * Anchored on the preceding whitespace rather than on \b, so `id` cannot match
 * the tail of a longer attribute name that happens to end in it.
 */
function attr(tag: string, name: string): string {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? "";
}

/**
 * Pull one year of days out of the contribution calendar markup.
 *
 * The calendar pads to whole weeks, so a "2025" request also returns a few
 * days of 2024 and 2026. Those are dropped here rather than deduplicated
 * later: the same date arriving from two different years is the one way this
 * could silently double-count.
 */
function parseCalendar(html: string, year: number): ContribDay[] {
  // Counts live in the tooltip text ("5 contributions on March 3rd."), levels
  // and dates live on the cell. They are joined on the cell id rather than on
  // document order, which is not guaranteed to match.
  const counts = new Map<string, number>();
  const tips = html.matchAll(
    /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g,
  );
  for (const [, id, text] of tips) {
    counts.set(
      id,
      Number(text.trim().match(/^(\d+)\s+contribution/)?.[1] ?? 0),
    );
  }

  const days: ContribDay[] = [];
  const cells = html.matchAll(
    /<td\b[^>]*\bclass="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g,
  );
  for (const [tag] of cells) {
    const date = attr(tag, "data-date");
    if (!date.startsWith(`${year}-`)) continue;

    days.push({
      date,
      count: counts.get(attr(tag, "id")) ?? 0,
      level: Number(attr(tag, "data-level") || 0),
    });
  }

  return days;
}

async function fetchYear(year: number): Promise<ContribDay[]> {
  const res = await fetch(
    `https://github.com/users/${GITHUB_USER}/contributions?from=${year}-01-01&to=${year}-12-31`,
    {
      headers: {
        accept: "text/html",
        // The endpoint serves the bare calendar fragment to XHR callers.
        "x-requested-with": "XMLHttpRequest",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE, tags: ["github"] },
    },
  );

  if (!res.ok) throw new Error(`contributions ${year}: HTTP ${res.status}`);
  return parseCalendar(await res.text(), year);
}

/** Public, default-branch commits only. A floor, used when the calendar fails. */
async function fetchSearchCount(): Promise<number> {
  const res = await fetch(
    `https://api.github.com/search/commits?q=author:${GITHUB_USER}&per_page=1`,
    {
      headers: { accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE, tags: ["github"] },
    },
  );

  if (!res.ok) throw new Error(`search: HTTP ${res.status}`);
  const body: unknown = await res.json();
  const total = (body as { total_count?: unknown })?.total_count;
  return typeof total === "number" ? total : 0;
}

export async function getGithubStats(): Promise<GithubStats> {
  const thisYear = new Date().getUTCFullYear();
  const years = Array.from(
    { length: Math.max(1, thisYear - FIRST_YEAR + 1) },
    (_, i) => FIRST_YEAR + i,
  );

  // allSettled, not all: one bad year should cost that year's commits, not the
  // whole number.
  const settled = await Promise.allSettled(years.map(fetchYear));

  const days: ContribDay[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") days.push(...result.value);
  }

  if (days.length) {
    days.sort((a, b) => (a.date < b.date ? -1 : 1));
    const commits = days.reduce((sum, day) => sum + day.count, 0);

    // A parse that finds cells but no counts means the tooltip markup moved.
    // Zero is not a plausible answer for this account, so treat it as failure.
    if (commits > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const past = days.filter((day) => day.date <= today);
      return {
        commits,
        recent: past.slice(-STRIP_DAYS),
        source: "contributions",
      };
    }
  }

  const searched = await fetchSearchCount().catch(() => 0);
  if (searched > 0) return { commits: searched, recent: [], source: "search" };

  return { commits: COMMITS_FALLBACK, recent: [], source: "fallback" };
}
