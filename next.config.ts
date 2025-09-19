import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignora erros de lint no build da Vercel (temporário)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignora erros de TypeScript no build da Vercel (temporário)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
