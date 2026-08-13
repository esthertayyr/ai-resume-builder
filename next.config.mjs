/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Serve modern formats when the browser supports them; next/image falls back
    // to the original otherwise. No new dependency — this is built-in.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
