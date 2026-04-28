import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NexLabs | AI-Powered Software Development",
  description:
    "Transform your ideas into production-ready software with AI-assisted development. Expert team, transparent pricing, 24-hour quotes.",
  keywords: ["software development", "AI", "web development", "mobile apps", "consulting"],
  openGraph: {
    title: "NexLabs | AI-Powered Software Development",
    description: "Transform your ideas into production-ready software with AI-assisted development.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
