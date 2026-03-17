import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lenny Dany | Full-Stack Developer & AI Builder",
  description:
    "Portfolio of Lenny Dany Derek D — Full-Stack Developer, AI Builder, and Founder of Ascendry. Building the future with Next.js, FastAPI, and AI.",
  keywords: [
    "Lenny Dany",
    "Full-Stack Developer",
    "AI Builder",
    "Ascendry",
    "Portfolio",
    "Next.js",
    "FastAPI",
    "React",
  ],
  authors: [{ name: "Lenny Dany Derek D" }],
  openGraph: {
    title: "Lenny Dany | Full-Stack Developer & AI Builder",
    description:
      "Full-Stack Developer, AI Builder, and Founder of Ascendry.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.variable}>
        {children}
      </body>
    </html>
  );
}
