import type { NextConfig } from "next";

/**
 * next/image'in Supabase Storage'daki görselleri yükleyebilmesi için
 * proje host'unu allowlist'e ekliyoruz. Host .env.local'den okunur, böylece
 * student1 ve student2 farklı Supabase projesi kullansa bile dosya değişmez.
 */
function supabaseImagePatterns() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];

  try {
    const { hostname } = new URL(url);
    return [
      {
        protocol: "https" as const,
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    // .env.local henüz doldurulmadıysa build'i kırma.
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImagePatterns(),
  },
};

export default nextConfig;
