import type { Metadata } from "next";
import { Geist_Mono, Inter_Tight } from "next/font/google";

import { Navbar } from "@/components/Navbar";
import "./globals.css";

/*
 * Tek aile: Inter Tight. Referans tasarımdaki sıkı neo-grotesk duruşu bu.
 * Başlık/gövde ayrımını fonttan değil ağırlık ve kerningden alıyoruz —
 * dev başlıklarda 800 + negatif letter-spacing (bkz. .font-display),
 * gövdede 400/500. Değişken font olduğu için tek dosya yükleniyor.
 */
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Lost & Found",
  description:
    "Find what you've lost. Report lost and found items on campus and get them back to their owners.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // `dark` sınıfı sabit: tema tek modlu ve koyu, `dark:` varyantı buna bağlı
  // (bkz. globals.css içindeki @custom-variant açıklaması).
  return (
    <html
      lang="en"
      className={`dark ${interTight.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
