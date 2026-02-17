/** @type {import('next').NextConfig} */
// BASE_PATH set only in GitHub Actions (deploy); local dev uses root /
const basePath = process.env.BASE_PATH ?? "";

const nextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/out/**",
          "**/TurtlesPAC/**",
          "../**",
          "../../**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
