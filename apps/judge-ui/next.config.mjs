const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/MemeMe";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

