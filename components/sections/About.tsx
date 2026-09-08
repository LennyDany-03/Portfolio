"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText, MEDIA, fromLines } from "@/lib/gsap";
import { registerStops, sectionStop } from "@/lib/snap";
import { directionalReveal, retainDirectionObserver } from "@/lib/direction";
import { STAT_BLOCKS } from "@/lib/data";
import { NEXT_LABELS } from "@/lib/data";
import type { GithubStats } from "@/lib/github";

/**
 * Weekday index of an ISO date, Sunday first, matching GitHub's own calendar.
 * Read in UTC so the strip cannot shift a row depending on who is looking, and
 * so the server and the client agree on it.
 */
const weekday = (iso: string) => new Date(iso + "T00:00:00Z").getUTCDay();

/**
 * Contribution ramp, indexed by GitHub's own 0-4 level.
 *
 * Deliberately the page accent (#ff4655) rather than GitHub's green: this is
 * the one place a second brand colour could get in, and one accent per page is
 * the rule the rest of the site already follows.
 */
const HEAT = [
  "rgb(255 255 255 / 0.06)",
  "rgb(255 70 85 / 0.3)",
  "rgb(255 70 85 / 0.55)",
  "rgb(255 70 85 / 0.8)",
  "rgb(255 70 85 / 1)",
];

export default function About({ github }: { github: GithubStats }) {
  // The commits figure is the ONE number here that is not a claim about the
  // past: it is whatever GitHub reported when this page was last revalidated.
  const statBlocks = STAT_BLOCKS.map((stat) =>
    stat.id === "commits" ? { ...stat, value: github.commits } : stat,
  );

  const root = useRef<HTMLElement>(null);
  const lead = useRef<HTMLParagraphElement>(null);
  const body = useRef<HTMLParagraphElement>(null);
  const stats = useRef<HTMLDListElement>(null);

  useGSAP(
    () => {
      const unregister = registerStops(
        sectionStop(root.current, "about", NEXT_LABELS.about),
      );
      const mm = gsap.matchMedia();

      mm.add(MEDIA.motionOK, () => {
        const release = retainDirectionObserver();

        /* Lead paragraph: word-by-word focus pull.
           Replaces the old ScrambleText decode. Each word resolves out of blur
           while rising inside a clipped line — it reads as the sentence coming
           into focus rather than as a terminal effect, which sits better next
           to the editorial type. Splitting to 'words,lines' with mask:'lines'
           gives per-word targets AND the line clip in one pass.

           Removing the scramble is also what makes this possible at all: the
           old <span data-scramble> could not survive SplitText rewriting the
           paragraph into per-line wrappers. */
        SplitText.create(lead.current, {
          type: "words,lines",
          mask: "lines",
          autoSplit: true,
          aria: "auto",
          onSplit: (self) =>
            fromLines(self.words, {
              yPercent: 60,
              opacity: 0,
              filter: "blur(10px)",
              duration: 0.8,
              stagger: 0.022,
              ease: "power3.out",
              scrollTrigger: {
                trigger: lead.current,
                start: "top 82%",
                once: true,
              },
            }),
        });

        // Body paragraph reveals line by line as the section enters.
        SplitText.create(body.current, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          aria: "auto",
          onSplit: (self) =>
            fromLines(self.lines, {
              yPercent: 105,
              duration: 0.7,
              stagger: 0.06,
              ease: "power3.out",
              scrollTrigger: {
                trigger: body.current,
                start: "top 82%",
                once: true,
              },
            }),
        });

        // The contribution strip fills in left to right behind the counter, so
        // the number and the history it came from arrive together. One tween
        // with a stagger, not 126 tweens.
        gsap.from("[data-heat-cell]", {
          opacity: 0,
          scale: 0.4,
          duration: 0.5,
          stagger: 0.006,
          ease: "power2.out",
          scrollTrigger: {
            trigger: stats.current,
            start: "top 88%",
            once: true,
          },
        });

        // Stat row moves as one unit, direction-aware.
        directionalReveal("[data-reveal-clip]", {
          trigger: stats.current,
          distance: 40,
          start: "top 88%",
          reversible: false,
        });

        // Stat counters. The tween mutates a plain object and writes text in
        // onUpdate — no layout reads, one text write per frame.
        //
        // ONE ScrollTrigger on the <dl> driving all four at position 0, rather
        // than one trigger per number: with a per-number trigger the 2x2 mobile
        // grid fires in two waves. Equal durations + a shared start is what
        // makes them land together regardless of digit count.
        const counters = gsap.timeline({
          scrollTrigger: {
            trigger: stats.current,
            start: "top 88%",
            once: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count);
          const decimals = Number(el.dataset.decimals ?? 0);
          const proxy = { value: 0 };

          counters.to(
            proxy,
            {
              value: target,
              duration: 1.8,
              ease: "power2.out",
              snap: { value: decimals ? 0.01 : 1 },
              onUpdate: () => {
                el.textContent = proxy.value.toLocaleString("en-IN", {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                });
              },
            },
            0,
          );
        });

        return release;
      });

      mm.add(MEDIA.reduced, () => {
        // The two paragraphs are named explicitly: they animate via SplitText,
        // which never runs under reduced motion, so they carry no marker class.
        gsap.from([lead.current, body.current, "[data-reveal-clip]"], {
          opacity: 0,
          duration: 0.2,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            once: true,
          },
        });
      });
      return unregister;
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="border-hair relative border-t px-5 py-16 md:px-10 md:py-[180px] lg:px-[60px]"
    >
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20">
        <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
          01 / ABOUT
        </p>

        <div className="grid max-w-[860px] gap-8 md:gap-10">
          <p
            ref={lead}
            className="text-hi font-display m-0 text-[clamp(24px,3vw,44px)] leading-[1.22] tracking-[-0.025em] text-pretty"
          >
            Second-year CSE (AI &amp; ML) at SRM IST. I build production systems
            end-to-end: backend, frontend, infra, release pipeline, alone.
          </p>

          <p
            ref={body}
            className="text-muted-2 m-0 max-w-[640px] text-base leading-[1.75] text-pretty md:text-lg"
          >
            Native Windows overlays in Rust/Tauri. HRMS platforms on Flutter
            with biometric attendance. Registration systems holding 1,800+ live
            users. Three internships, one freelance venture (Ascendry,
            Udyam-registered), and Tide, a habit tracker selling on Gumroad. The
            pattern is the same every time: pick the hard part, ship it, keep it
            running.
          </p>

          <dl
            ref={stats}
            data-reveal-clip
            className="bg-hair-2 mt-5 grid grid-cols-2 gap-px lg:grid-cols-4"
          >
            {statBlocks.map((stat) => (
              <div key={stat.label} className="bg-ink px-5 py-6 md:px-[22px]">
                {/* tabular-nums so the counter does not reflow its own row on
                    every frame while it counts up. */}
                <dd className="text-hi font-display text-[32px] tracking-[-0.03em] tabular-nums md:text-[40px]">
                  <span data-count={stat.value} data-decimals={stat.decimals}>
                    0
                  </span>
                  {stat.suffix && (
                    <span className="text-accent">{stat.suffix}</span>
                  )}
                </dd>
                <dt className="text-dim mt-2 font-mono text-[10px] tracking-[0.16em]">
                  {stat.label}
                </dt>

                {/* The commits figure is live, so it gets to show its working:
                    the trailing 18 weeks of the contribution calendar the
                    number was summed from. Decorative and aria-hidden, because
                    the number above already carries the information. */}
                {stat.id === "commits" && github.recent.length > 0 && (
                  <div
                    aria-hidden
                    className="mt-3 grid w-max grid-flow-col grid-rows-[repeat(7,3px)] gap-[2px]"
                  >
                    {/* Pad to the first day's real weekday, so the rows line up
                        with GitHub's own Sunday-first calendar instead of
                        wherever the 126-day slice happened to begin. */}
                    {Array.from(
                      { length: weekday(github.recent[0].date) },
                      (_, i) => (
                        <span key={"pad" + i} className="h-[3px] w-[3px]" />
                      ),
                    )}
                    {github.recent.map((day) => (
                      <span
                        key={day.date}
                        data-heat-cell
                        className="h-[3px] w-[3px] rounded-[1px]"
                        style={{ backgroundColor: HEAT[day.level] ?? HEAT[0] }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
