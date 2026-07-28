/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#070908",
        ivory: "#e7dfcc",
        amber: "#d59a4a",
        cyan: "#57c8d4",
        rupture: "#8f3d37",
        ash: "#718091",
        aeon: "#a85687"
      },
      fontFamily: {
        ritual: ['"Cormorant Garamond"', "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"]
      }
    }
  },
  plugins: []
};
