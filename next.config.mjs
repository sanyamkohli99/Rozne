/** @type {import('next').NextConfig} */

const s3Bucket = process.env.NEXT_PUBLIC_S3_BUCKET;
const s3Region = process.env.NEXT_PUBLIC_S3_REGION;

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  images: {
    remotePatterns: [
      ...(s3Bucket && s3Region
        ? [
            {
              protocol: "https",
              hostname: `${s3Bucket}.s3.${s3Region}.amazonaws.com`,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@aws-sdk/client-s3", "sharp"],
  },
}

export default nextConfig
