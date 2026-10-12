import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "images.pexels.com" },
    { protocol: "https", hostname: "cdn.pixabay.com" },
    { protocol: "https", hostname: "media.istockphoto.com" },
    { protocol: "https", hostname: "plus.unsplash.com" },
    { protocol: "https", hostname: "images-eu.ssl-images-amazon.com" },
    { protocol: "https", hostname: "m.media-amazon.com" }
  ],
},

};

export default nextConfig;
