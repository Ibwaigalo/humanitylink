import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "hl-navy": "#1F3864",
        "hl-gold": "#B8860B",
      },
    },
  },
  plugins: [],
};

export default config;
