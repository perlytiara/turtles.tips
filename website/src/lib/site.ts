const siteBasePath = process.env.BASE_PATH || "/turtles.tips";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (siteBasePath ? `https://perlytiara.github.io${siteBasePath}` : "https://turtles.tips");

export { siteBasePath, siteUrl };
