/** @type {import('next').NextConfig} */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

function buildRemotePatterns() {
  try {
    if (!SUPABASE_URL) return [];
    const u = new URL(SUPABASE_URL);
    return [
      {
        protocol: u.protocol.replace(":", ""),
        hostname: u.hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig = {
  images: {
    remotePatterns: buildRemotePatterns(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: 5 * 1024 * 1024, // 5 MB
    },
  },
};

export default nextConfig;
