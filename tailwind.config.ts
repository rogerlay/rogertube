import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./client/src/**/*.{ts,tsx}", "./client/index.html"],
  theme: {
    extend: {
      colors: {
        yt: {
          red: "#FF0000",
          dark: "#0f0f0f",
          card: "#272727",
          hover: "#3d3d3d",
          text: "#f1f1f1",
          muted: "#aaaaaa",
          border: "#3d3d3d",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
