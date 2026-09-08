import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Work from "@/components/sections/Work";
import Stack from "@/components/sections/Stack";
import Process from "@/components/sections/Process";
import Reach from "@/components/sections/Reach";
import Contact from "@/components/sections/Contact";
import { getGithubStats } from "@/lib/github";

/*
 * FRAMES (components/sections/Frames.tsx) is intentionally not rendered.
 * The section, its photo data (JOURNEY in lib/data.ts) and the images in
 * public/journey/ are all still here — re-import it below and add
 * { label: 'Frames', href: '#frames' } back to NAV_LINKS to bring it back.
 * It would sit between Reach and Contact. Bringing it back means renumbering
 * everything from there down.
 */

/**
 * Re-fetch the GitHub numbers hourly.
 *
 * The page is otherwise fully static, and this keeps it that way: visitors are
 * served prerendered HTML with the commit count already in it, and Next
 * refreshes that HTML in the background once an hour. Fetching client-side
 * instead would mean every visitor spending GitHub's per-IP rate limit, a
 * number that pops in after paint, and a layout shift under it.
 */
export const revalidate = 3600;

export default async function Home() {
  const github = await getGithubStats();

  return (
    <>
      <Hero />
      <About github={github} />
      <Work />
      <Stack />
      <Process />
      <Reach />
      <Contact />
    </>
  );
}
