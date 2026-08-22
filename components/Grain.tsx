/**
 * Static film-grain overlay. Server component — no JS shipped for it.
 */
export default function Grain() {
  return (
    <div
      aria-hidden
      className="grain pointer-events-none fixed inset-0 z-[900] opacity-[0.22]"
    />
  );
}
