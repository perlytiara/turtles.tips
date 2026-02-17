import type { Config } from "tailwindcss";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  content: [
    path.join(__dirname, "src", "**", "*.{js,ts,jsx,tsx}"),
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
