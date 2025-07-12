import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: "#801B2B",
          cream: "#F8F6F0",
          pearl: "#F5F5F5",
        },
        black: colors.black,
        white: colors.white,
      },
      borderRadius: {
        DEFAULT: "6px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config; 