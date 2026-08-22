"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText, MEDIA, fromLines } from "@/lib/gsap";
import { directionalReveal, retainDirectionObserver } from "@/lib/direction";
import { registerStops, sectionStop } from "@/lib/snap";
import { REACH_CHANNELS, NEXT_LABELS, EMAIL } from "@/lib/data";

/**
 * 05 / REACH ME — bridges Process and Contact.
 *
 * This gap used to be dead space: Process's bottom padding running straight
 * into Contact's top padding, with a scroll stop landing in the middle of it
 * and nothing to show. It now carries the one thing a bare row of footer links
 * cannot — which channel is the right one for what.
 */
export default function Reach() {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const unregister = registerStops(
        sectionStop(root.current, "reach", NEXT_LABELS.reach),
      );
      const mm = gsap.matchMedia();

      mm.add(MEDIA.motionOK, () => {
        const release = retainDirectionObserver();

        SplitText.create(heading.current, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          aria: "auto",
          onSplit: (self) =>
            fromLines(self.lines, {
              yPercent: 110,
              duration: 0.9,
              stagger: 0.08,
              ease: "expo.out",
              scrollTrigger: {
                trigger: heading.current,
                start: "top 82%",
                once: true,
              },
            }),
        });

        directionalReveal("[data-reach-row]", {
          distance: 40,
          duration: 0.7,
          start: "top 90%",
        });

        directionalReveal("[data-reach-note]", {
          distance: 28,
          duration: 0.7,
          start: "top 90%",
          reversible: false,
        });

        return release;
      });

      mm.add(MEDIA.reduced, () => {
        gsap.from([heading.current, "[data-reach-row]"], {
          opacity: 0,
          duration: 0.2,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
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
      id="reach"
      className="border-hair relative border-t px-5 py-24 md:px-10 md:py-[150px] lg:px-[60px]"
      aria-label="Reach me"
    >
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20">
        <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
          05 / REACH ME
        </p>

        <div className="grid max-w-[860px] gap-10 md:gap-14">
          <h2
            ref={heading}
            className="text-hi font-display m-0 text-[clamp(30px,4.4vw,68px)] leading-[0.98] font-semibold tracking-[-0.04em]"
          >
            Open to work that ships.
          </h2>

          <p
            data-reach-note
            className="text-muted-2 m-0 max-w-[620px] text-base leading-[1.75] text-pretty md:text-lg"
          >
            Internships, freelance builds, or anything that needs one person to
            own it end to end. Chennai-based, remote-friendly. Pick whichever
            channel fits — they all reach me.
          </p>

          {/* Hairline-separated rows rather than cards: this section sits
              directly before Contact, and a second grid of boxes so close to
              the stat grid above would read as repetition. */}
          <ul className="m-0 grid list-none gap-0 p-0">
            {REACH_CHANNELS.map((channel) => (
              <li key={channel.href} data-reach-row>
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor-label="Open"
                  className="border-hair-2 hover:border-hair-3 group grid gap-3 border-t py-6 transition-colors md:grid-cols-[minmax(0,200px)_minmax(0,1fr)_auto] md:items-baseline md:gap-8 md:py-7"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="text-hi font-display text-[22px] leading-none font-semibold tracking-[-0.02em] md:text-[26px]">
                      {channel.label}
                    </span>
                    <span className="text-dim-2 font-mono text-[10px] tracking-[0.12em]">
                      {channel.handle}
                    </span>
                  </span>

                  <span className="text-muted-2 text-[15px] leading-[1.6] md:text-base">
                    {channel.best}
                  </span>

                  <span
                    aria-hidden
                    className="text-dim group-hover:text-accent font-mono text-[11px] tracking-[0.14em] transition-colors"
                  >
                    ↗
                  </span>
                </a>
              </li>
            ))}

            {/* Email closes the list, so the section hands straight off to the
                Contact CTA below rather than ending on a social link. */}
            <li data-reach-row>
              <a
                href={"mailto:" + EMAIL}
                data-cursor-label="Send"
                className="border-hair-2 hover:border-hair-3 group grid gap-3 border-t border-b py-6 transition-colors md:grid-cols-[minmax(0,200px)_minmax(0,1fr)_auto] md:items-baseline md:gap-8 md:py-7"
              >
                <span className="flex items-baseline gap-3">
                  <span className="text-hi font-display text-[22px] leading-none font-semibold tracking-[-0.02em] md:text-[26px]">
                    Email
                  </span>
                  <span className="text-dim-2 font-mono text-[10px] tracking-[0.12em]">
                    direct
                  </span>
                </span>

                <span className="text-muted-2 text-[15px] leading-[1.6] md:text-base">
                  Everything else. Scope, timelines, or just the question.
                </span>

                <span
                  aria-hidden
                  className="text-dim group-hover:text-accent font-mono text-[11px] tracking-[0.14em] transition-colors"
                >
                  →
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
