import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameTrack | Discover Amazing Games",
  description: "Your premium source for finding and tracking the best free-to-play games.",
  openGraph: {
    title: "GameTrack",
    description: "Discover Amazing Free-to-Play Games",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
