"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Anything the cursor should react to. `data-cursor-label` also supplies text. */
const INTERACTIVE = "[data-cursor-label], a, button, [data-cursor-grow]";

/** Collapsed dot scale. 48px * 0.15 reads as a ~7px dot, border invisible. */
const DOT = 0.15;

/**
 * Custom cursor: a small solid dot that lags the pointer, expanding into a
 * hollow accent ring that carries a contextual label (VIEW / OPEN / SEND) over
 * interactive elements.
 *
 * One element moves (the root, via quickTo — pointermove never allocates a
 * tween) and one element scales. The label is a sibling of the ring, not a
 * child, so it stays at a fixed size while the ring scales around it.
 *
 * Disabled outright on touch/coarse pointers and under reduced motion:
 * matchMedia tears the whole thing down and restores the native cursor.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const rootEl = root.current;
    const ringEl = ring.current;
    const labelEl = label.current;
    if (!rootEl || !ringEl || !labelEl) return;

    const mm = gsap.matchMedia();

    mm.add(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        document.body.dataset.customCursor = "true";

        gsap.set(rootEl, { xPercent: -50, yPercent: -50, opacity: 0 });
        gsap.set(ringEl, { scale: DOT });

        const xTo = gsap.quickTo(rootEl, "x", {
          duration: 0.35,
          ease: "power3",
        });
        const yTo = gsap.quickTo(rootEl, "y", {
          duration: 0.35,
          ease: "power3",
        });

        let seen = false;
        const onMove = (event: PointerEvent) => {
          // First sighting: jump to the pointer, then fade in — otherwise the
          // cursor visibly flies in from 0,0.
          if (!seen) {
            seen = true;
            gsap.set(rootEl, { x: event.clientX, y: event.clientY });
            gsap.to(rootEl, { opacity: 1, duration: 0.3 });
          }
          xTo(event.clientX);
          yTo(event.clientY);
        };

        // Delegated hover detection: one listener, not one per element.
        const interactiveOf = (target: EventTarget | null) =>
          target instanceof Element ? target.closest(INTERACTIVE) : null;

        // Tracks which element we're currently expanded over, so that moving
        // between children *inside* one link doesn't flicker the ring.
        let current: Element | null = null;

        const onOver = (event: PointerEvent) => {
          const hit = interactiveOf(event.target);
          if (!hit || hit === current) return;
          current = hit;

          labelEl.textContent = hit.getAttribute("data-cursor-label") ?? "";

          gsap.to(ringEl, {
            scale: 1,
            backgroundColor: "rgb(255 70 85 / 0.08)",
            duration: 0.35,
            ease: "power3.out",
          });
          gsap.to(labelEl, { opacity: 1, duration: 0.25, ease: "power2.out" });
        };

        const onOut = (event: PointerEvent) => {
          if (!current) return;
          // Still inside the same interactive element — not a real exit.
          if (interactiveOf(event.relatedTarget) === current) return;
          current = null;

          gsap.to(ringEl, {
            scale: DOT,
            backgroundColor: "rgb(255 70 85 / 1)",
            duration: 0.35,
            ease: "power3.out",
          });
          gsap.to(labelEl, { opacity: 0, duration: 0.2, ease: "power2.out" });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerover", onOver);
        document.addEventListener("pointerout", onOut);

        return () => {
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerover", onOver);
          document.removeEventListener("pointerout", onOut);
          delete document.body.dataset.customCursor;
        };
      },
    );
  });

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[950] grid h-12 w-12 place-items-center opacity-0 will-change-transform"
    >
      <span
        ref={ring}
        className="border-accent bg-accent col-start-1 row-start-1 block h-12 w-12 rounded-full border will-change-transform"
      />
      <span
        ref={label}
        className="text-accent col-start-1 row-start-1 block font-mono text-[9px] leading-none font-bold tracking-[0.16em] uppercase opacity-0"
      />
    </div>
  );
}
