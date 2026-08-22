import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Work from "@/components/sections/Work";
import Stack from "@/components/sections/Stack";
import Process from "@/components/sections/Process";
import Reach from "@/components/sections/Reach";
import Contact from "@/components/sections/Contact";

/*
 * FRAMES (components/sections/Frames.tsx) is intentionally not rendered.
 * The section, its photo data (JOURNEY in lib/data.ts) and the images in
 * public/journey/ are all still here — re-import it below and add
 * { label: 'Frames', href: '#frames' } back to NAV_LINKS to bring it back.
 * It would sit between Reach and Contact. Bringing it back means renumbering
 * everything from there down.
 */

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <Stack />
      <Process />
      <Reach />
      <Contact />
    </>
  );
}
