"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  gsap,
  useGSAP,
  Observer,
  SplitText,
  MEDIA,
  fromLines,
} from "@/lib/gsap";
import { directionalReveal, retainDirectionObserver } from "@/lib/direction";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import { JOURNEY } from "@/lib/data";

/** Collage cell spans, keyed by the frame's native aspect. */
const CELL: Record<string, string> = {
  wide: "sm:col-span-7 aspect-[16/9]",
  tall: "sm:col-span-5 aspect-[9/16]",
  portrait: "sm:col-span-5 aspect-[3/4]",
  square: "sm:col-span-7 aspect-square sm:aspect-[4/3]",
};

export default function Frames() {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpen((i) =>
        i === null ? i : (i + delta + JOURNEY.length) % JOURNEY.length,
      ),
    [],
  );

  /* ------------------------------------------------------------------
     Collage reveals. Each frame scales up out of a clip as it crosses the
     line, and the whole set is direction-aware via the shared Observer.
  ------------------------------------------------------------------ */
  useGSAP(
    () => {
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

        directionalReveal("[data-frame]", {
          distance: 64,
          duration: 0.8,
          start: "top 88%",
        });

        // The photo inside each frame counter-scales as the cell arrives, so
        // the image settles into its crop instead of arriving flat. Separate
        // from the directional reveal above because that owns y/opacity on the
        // CELL — this owns scale on the IMAGE inside it.
        gsap.utils.toArray<HTMLElement>("[data-frame-img]").forEach((img) => {
          gsap.fromTo(
            img,
            { scale: 1.18 },
            {
              scale: 1,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: img, start: "top 92%", once: true },
            },
          );
        });

        return release;
      });

      mm.add(MEDIA.reduced, () => {
        gsap.from([heading.current, "[data-frame]"], {
          opacity: 0,
          duration: 0.2,
          ease: "none",
          stagger: 0.03,
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            once: true,
          },
        });
      });
    },
    { scope: root },
  );

  /* ------------------------------------------------------------------
     Lightbox: keyboard, scroll lock, and an Observer so a wheel flick or a
     touch drag moves between photos the same way a swipe would.
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (open === null) return;

    lockScroll();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    // One step per gesture. A diagonal drag satisfies both the vertical and
    // the horizontal threshold, so onUp and onLeft would otherwise both fire
    // and the gallery would jump two photos from one swipe.
    let settling = false;
    const once = (delta: number) => () => {
      if (settling) return;
      settling = true;
      window.setTimeout(() => {
        settling = false;
      }, 350);
      step(delta);
    };

    // preventDefault:true here is correct and safe — unlike the global
    // direction observer, this one is only alive while a modal owns the
    // screen, and it is killed the moment the modal closes.
    const observer = Observer.create({
      type: "wheel,touch",
      preventDefault: true,
      allowClicks: true,
      tolerance: 40,
      onUp: once(1),
      onDown: once(-1),
      onRight: once(-1),
      onLeft: once(1),
    });

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      observer.kill();
      unlockScroll();
    };
  }, [open, close, step]);

  const active = open === null ? null : JOURNEY[open];

  return (
    <section
      ref={root}
      id="frames"
      className="border-hair relative border-t px-5 py-24 md:px-10 md:py-[170px] lg:px-[60px]"
      aria-label="Frames"
    >
      <div className="mx-auto grid max-w-[1240px] gap-12 md:gap-16">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20">
          <p className="text-accent font-mono text-[11px] tracking-[0.22em]">
            05 / FRAMES
          </p>
          <h2
            ref={heading}
            className="text-hi font-display m-0 max-w-[820px] text-[clamp(30px,4.4vw,68px)] leading-[0.98] font-semibold tracking-[-0.04em]"
          >
            The part that does not fit in a repo.
          </h2>
        </div>

        {/* 12-col collage. Cells span unevenly so the grid reads as a scatter
            rather than a gallery, and every cell stays a real grid child so
            nothing needs absolute positioning to hold its place. */}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-12 md:gap-6">
          {JOURNEY.map((frame, i) => (
            <li
              key={frame.src}
              data-frame
              className={`${CELL[frame.ratio]} group relative`}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                data-cursor-label="View"
                aria-label={`Open photo: ${frame.caption}`}
                className="border-hair-2 bg-panel relative block h-full w-full overflow-hidden border text-left"
              >
                <span
                  data-frame-img
                  className="absolute inset-0 block will-change-transform"
                >
                  <Image
                    src={frame.src}
                    alt={frame.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1240px) 50vw, 620px"
                    className="object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                  />
                </span>

                {/* Bottom scrim so the mono stamp stays legible on any photo. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 block h-1/2 bg-gradient-to-t from-[rgb(10_10_12_/_0.92)] to-transparent"
                />

                <span className="absolute inset-x-0 bottom-0 grid gap-1.5 p-4 md:p-5">
                  <span className="text-accent block font-mono text-[9px] tracking-[0.2em] md:text-[10px]">
                    {frame.meta}
                  </span>
                  <span className="text-body block font-mono text-[11px] leading-[1.5] tracking-[0.04em] md:text-xs">
                    {frame.caption}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.caption}
          className="fixed inset-0 z-[930] grid grid-rows-[auto_minmax(0,1fr)_auto] gap-4 bg-[rgb(10_10_12_/_0.97)] p-4 backdrop-blur-sm md:gap-6 md:p-8"
          onClick={close}
        >
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase">
            <span className="text-accent">
              {String(open! + 1).padStart(2, "0")} /{" "}
              {String(JOURNEY.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={close}
              data-cursor-label="Close"
              className="text-dim hover:text-body transition-colors"
            >
              Close ✕
            </button>
          </div>

          {/* stopPropagation so clicking the photo itself doesn't dismiss. */}
          <div
            className="relative min-h-0"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              key={active.src}
              src={active.src}
              alt={active.alt}
              fill
              sizes="100vw"
              priority
              className="animate-frame-in object-contain"
            />
          </div>

          <div
            className="flex items-end justify-between gap-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-1.5">
              <span className="text-accent block font-mono text-[10px] tracking-[0.2em]">
                {active.meta}
              </span>
              <span className="text-body block font-mono text-xs tracking-[0.04em]">
                {active.caption}
              </span>
            </div>

            <div className="flex shrink-0 gap-3 font-mono text-[10px] tracking-[0.18em] uppercase">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="border-hair-3 text-dim hover:text-accent hover:border-accent border px-4 py-2.5 transition-colors"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="border-hair-3 text-dim hover:text-accent hover:border-accent border px-4 py-2.5 transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
