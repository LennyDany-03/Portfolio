import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import Grain from "@/components/Grain";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import ScrollSnap from "@/components/ScrollSnap";
import SectionCurtain from "@/components/SectionCurtain";

/* All three families are variable fonts, so no `weight` is needed — next/font
   self-hosts them and exposes each as a CSS variable consumed by @theme. */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex",
  display: "swap",
});

const jetBrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lennydany.vercel.app"),
  title: "Lenny Dany Derek D. — Full-stack · Desktop · AI/ML",
  description:
    "I don't write the code, I ship the code. Full-stack, desktop and AI/ML engineer. 8+ shipped products, 1,800+ live registrations, built solo.",
  keywords: [
    "Lenny Dany Derek",
    "full-stack developer",
    "Tauri",
    "Rust",
    "Next.js",
    "Flutter",
    "AI ML engineer",
    "Chennai",
  ],
  authors: [{ name: "Lenny Dany Derek D." }],
  openGraph: {
    title: "Lenny Dany Derek D. — Full-stack · Desktop · AI/ML",
    description:
      "I don't write the code, I ship the code. 8+ shipped products, built solo.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lenny Dany Derek D.",
    description: "I don't write the code, I ship the code.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlex.variable} ${jetBrains.variable}`}
    >
      <body className="bg-ink text-body font-body">
        <SmoothScroll>
          {/* Loader is an overlay, not a gate — the document below is fully
              rendered and crawlable while it plays. */}
          <Loader />
          <Grain />
          <Cursor />
          <Nav />
          <ScrollSnap />
          <SectionCurtain />
          <main>{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
