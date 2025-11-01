import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Uses CSS variable so you can change it in globals.css
        brand: "hsl(var(--brand))",
        line: "hsl(var(--line))",
        card: "var(--card)",
        bg: "var(--bg)",
      },
    },
  },
  plugins: [],
};
export default config;
