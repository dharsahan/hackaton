import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.scoular.com',
      },
      {
        protocol: 'https',
        hostname: 'img.jagranjosh.com',
      },
      {
        protocol: 'https',
        hostname: 'lirp.cdn-website.com',
      },
      {
        protocol: 'https',
        hostname: 'alnassaj.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com',
      },
    ],
  },
};

export default nextConfig;
