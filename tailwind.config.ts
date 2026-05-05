import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0d12",
        panel: "#11141b",
        line: "#1f2330",
        leak: "#ff4d6d",
        ok: "#22c55e",
        warn: "#f59e0b",
      },
    },
  },
  plugins: [],
};
export default config;
