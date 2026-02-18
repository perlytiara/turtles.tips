/** @type {import('next').NextConfig} */
// BASE_PATH set only in GitHub Actions (deploy); local dev uses root /
const basePath = process.env.BASE_PATH ?? "";
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  // Static export only for production; dev server needs normal mode for CSS
  ...(isDev ? {} : { output: "export" }),
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  // false avoids EISDIR during static export when community [slug]/[[...path]] has both index and nested routes
  trailingSlash: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 800,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/out/**",
          "**/TurtlesPAC/**",
          "**/public/**",
          "**/content/**",
          "**/scripts/**",
          "**/.env*",
          "../**",
          "../../**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
