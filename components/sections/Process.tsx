"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText, MEDIA, fromLines } from "@/lib/gsap";
import { directionalReveal, retainDirectionObserver } from "@/lib/direction";
import { registerStops, sectionStop } from "@/lib/snap";
import { PROCESS_STEPS } from "@/lib/data";
import { NEXT_LABELS } from "@/lib/data";

/**
 * 04 / PROCESS — replaces the previous OFF THE CLOCK section.
 *
 * Four numbered steps on a hairline rule, each one a snap stop of its own so a
 * gesture walks down the list rather than jumping the whole section at once.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const list = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const unregister = registerStops(
        sectionStop(root.current, "process", NEXT_LABELS.process),
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

        directionalReveal("[data-step]", {
          distance: 44,
          duration: 0.7,
          start: "top 88%",
        });

        // The rule between steps draws downward as the list arrives, so the
        // four items read as one continuous sequence rather than four cards.
        gsap.fromTo(
          "[data-step-rule]",
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "top center",
            duration: 0.5,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: list.current,
              start: "top 80%",
              once: true,
            },
          },
        );

        return release;
      });

      mm.add(MEDIA.reduced, () => {
        gsap.from([heading.current, "[data-step]"], {
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
      id="process"
      className="border-hair relative border-t px-5 py-16 md:px-10 md:py-[170px] lg:px-[60px]"
      aria-label="Process"
    >
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20">
        <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
          04 / PROCESS
        </p>

        <div className="grid max-w-[860px] gap-12 md:gap-16">
          <h2
            ref={heading}
            className="text-hi font-display m-0 text-[clamp(30px,4.4vw,68px)] leading-[0.98] font-semibold tracking-[-0.04em]"
          >
            The same four moves, every time.
          </h2>

          <ol ref={list} className="m-0 grid list-none gap-0 p-0">
            {PROCESS_STEPS.map((step) => (
              <li
                key={step.index}
                data-step
                className="relative grid gap-4 py-8 pl-6 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-10 md:py-10 md:pl-8"
              >
                <span
                  data-step-rule
                  aria-hidden
                  className="bg-hair-3 absolute top-0 bottom-0 left-0 block w-px"
                />

                <div className="flex items-baseline gap-4">
                  <span className="text-accent font-mono text-[11px] tracking-[0.22em]">
                    {step.index}
                  </span>
                  <h3 className="text-hi font-display m-0 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:text-[26px]">
                    {step.title}
                  </h3>
                </div>

                <p className="text-muted-2 m-0 max-w-[560px] text-base leading-[1.75] text-pretty md:text-lg">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
