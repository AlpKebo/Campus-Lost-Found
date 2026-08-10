import type { Metadata } from "next";
import { Figtree, Geist_Mono } from "next/font/google";

import { AppChrome } from "@/components/AppChrome";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

/*
 * Tek aile: Figtree. Referans görseldeki kalın, geometrik, yumuşak
 * terminalli grotesk bu. Başlık/gövde ayrımını fonttan değil ağırlıktan
 * alıyoruz: başlıklar 800 + negatif kerning (bkz. .font-display), gövde
 * 400/500. Değişken font olduğu için tek dosya iniyor.
 *
 * Okunabilirlik gerekçesi: Figtree'nin x-height'i yüksek ve harf boşlukları
 * açık — koyu zeminde uzun metinler serif bir display fonta göre çok daha
 * rahat okunuyor.
 */
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Lost & Found",
  description:
    "We find what you've lost — like finding a folder you thought was gone.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // `dark` sınıfı sabit: tema tek modlu ve koyu, `dark:` varyantı buna bağlı
  // (bkz. globals.css içindeki @custom-variant açıklaması).
  return (
    <html
      lang="en"
      className={`dark ${figtree.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <AppChrome navbar={<Navbar />}>{children}</AppChrome>
      </body>
    </html>
  );
}
