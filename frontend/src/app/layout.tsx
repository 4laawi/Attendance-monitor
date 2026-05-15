import type { Metadata } from "next";
import { Inter, Roboto_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: 'swap',
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: 'swap',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: "PFE Hub | Smart Attendance",
  description: "A professional attendance management system inspired by Notion's design language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable} ${notoArabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
