"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText, MEDIA } from "@/lib/gsap";
import { registerStops, sectionStop } from "@/lib/snap";
import { directionalReveal, retainDirectionObserver } from "@/lib/direction";
import { useMagnetic } from "@/hooks/useMagnetic";
import { SOCIAL_LINKS, EMAIL } from "@/lib/data";
import { NEXT_LABELS } from "@/lib/data";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const mail = useMagnetic<HTMLAnchorElement>();

  useGSAP(
    () => {
      const unregister = registerStops(sectionStop(root.current, NEXT_LABELS.contact));
      const mm = gsap.matchMedia();

      mm.add(MEDIA.motionOK, () => {
        const release = retainDirectionObserver();

        SplitText.create(heading.current, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          aria: "auto",
          onSplit: (self) => {
            // "shipping?" is the accent word and the payoff of the sentence, so
            // it travels further, runs longer, and overlaps the tail of the
            // lines above it instead of landing on the same even beat.
            //
            // Selected by CONTENT, not by index: at narrow widths "Got
            // something" wraps and lines[2] would no longer be the right line.
            const isShip = (l: Element) =>
              !!l.textContent?.includes("shipping");
            const ship = self.lines.filter(isShip);
            const rest = self.lines.filter((l) => !isShip(l));

            // Guarded the same way as fromLines(): autoSplit can re-run this
            // with zero lines, and .from([]) logs "GSAP target not found".
            if (!self.lines.length) return;

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: heading.current,
                start: "top 82%",
                once: true,
              },
            });

            if (rest.length) {
              tl.from(rest, {
                yPercent: 115,
                duration: 1,
                stagger: 0.08,
                ease: "expo.out",
              });
            }
            if (ship.length) {
              tl.from(
                ship,
                { yPercent: 125, duration: 1.25, ease: "expo.out" },
                rest.length ? "-=0.75" : 0,
              );
            }

            return tl;
          },
        });

        directionalReveal("[data-contact-item]", {
          distance: 32,
          start: "top 88%",
          reversible: false,
        });

        // Footer links stagger individually — [data-contact-item] only reveals
        // the two big blocks, so without this the four socials arrive as a slab.
        directionalReveal("[data-social]", {
          trigger: root.current,
          distance: 14,
          duration: 0.5,
          stagger: 0.05,
          start: "top 45%",
          reversible: false,
        });

        /* ---------------- Email character ripple ----------------
           Replaces the old ScrambleText hover (the plugin is no longer
           registered anywhere). Each character lifts and settles in sequence,
           so a wave runs left-to-right across the address — tactile and quick,
           without the "hacker terminal" register scrambling brings.

           The label is wrapped in its own span so the trailing arrow glyph is
           not swept up in the split. */
        const label =
          mail.current?.querySelector<HTMLElement>("[data-email-text]");
        let detachRipple: (() => void) | undefined;

        if (label) {
          const split = SplitText.create(label, { type: "chars" });

          // Built once and replayed, rather than allocating a timeline per
          // hover — the address is 20 characters, so that would be 20 tweens
          // discarded on every pointerenter.
          const ripple = gsap
            .timeline({ paused: true })
            .to(split.chars, {
              yPercent: -55,
              duration: 0.16,
              stagger: 0.012,
              ease: "power2.in",
            })
            .to(
              split.chars,
              {
                yPercent: 0,
                duration: 0.3,
                stagger: 0.012,
                ease: "back.out(2.2)",
              },
              0.1,
            );

          const onEnter = () => ripple.restart();
          mail.current?.addEventListener("pointerenter", onEnter);

          detachRipple = () => {
            mail.current?.removeEventListener("pointerenter", onEnter);
            split.revert();
          };
        }

        return () => {
          detachRipple?.();
          release();
        };
      });

      mm.add(MEDIA.reduced, () => {
        gsap.from([heading.current, "[data-contact-item]"], {
          opacity: 0,
          duration: 0.2,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
        });
      });
      return unregister;
    },
    { scope: root },
  );

  return (
    <footer
      ref={root}
      id="contact"
      className="border-hair relative overflow-hidden border-t px-5 pt-24 pb-14 md:px-10 md:pt-[190px] md:pb-[70px] lg:px-[60px]"
    >
      <div className="mx-auto grid max-w-[1240px] gap-16 md:gap-[90px]">
        <div className="grid justify-items-start gap-8 md:gap-10">
          <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
            05 / CONTACT
          </p>

          <h2
            ref={heading}
            className="text-hi font-display m-0 text-[clamp(40px,8vw,132px)] leading-[0.9] font-semibold tracking-[-0.045em]"
          >
            <span className="block">Got something</span>
            <span className="block">that needs</span>
            <span className="text-accent block">shipping?</span>
          </h2>

          {/* The reveal (y) and the magnetic pull (also y, via quickTo) would
              fight over the same transform if they shared an element, so the
              wrapper owns the reveal and the anchor owns the magnetism. The
              width classes mirror the anchor's, keeping the grid layout
              byte-identical to before. */}
          <div data-contact-item className="w-full sm:w-auto">
            <a
              ref={mail}
              data-cursor-label="Send"
              href={"mailto:" + EMAIL}
              className="border-accent text-accent hover:bg-accent hover:text-ink inline-flex w-full items-center justify-center gap-4 border px-8 py-5 font-mono text-[11px] font-bold tracking-[0.2em] break-all uppercase transition-colors duration-300 will-change-transform sm:w-auto sm:px-[38px] sm:text-xs"
            >
              <span data-email-text>{EMAIL}</span> <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        <div
          data-contact-item
          className="border-hair-2 flex flex-wrap justify-between gap-8 border-t pt-10 font-mono text-[11px] tracking-[0.14em] uppercase"
        >
          <nav aria-label="Elsewhere" className="flex flex-wrap gap-6 md:gap-7">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                data-social
                data-cursor-label="Open"
                className="text-muted hover:text-accent inline-block transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-dim-2">
            © 2026 · Built solo · Chennai, IN
            <span aria-hidden className="text-accent animate-blink ml-1.5">
              ▊
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
