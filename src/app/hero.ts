import { heroui } from "@heroui/react";

const primary = {
  50: "#EAEEF8",
  100: "#D5DDF0",
  200: "#B5C3E5",
  300: "#95AADB",
  400: "#607FC8",
  500: "#2B54B6",
  600: "#25479B",
  700: "#1E3B7F",
  800: "#182E64",
  900: "#112249",
  DEFAULT: "#2B54B6",
  foreground: "#FFFFFF",
} as const;

const primaryDark = {
  50: primary[900],
  100: primary[800],
  200: primary[700],
  300: primary[600],
  400: primary[500],
  500: primary[400],
  600: primary[300],
  700: primary[200],
  800: primary[100],
  900: primary[50],
  DEFAULT: primary[300],
  foreground: "#000000",
} as const;

export default heroui({
  themes: {
    light: {
      colors: {
        primary,
        focus: primary.DEFAULT,
      },
    },
    dark: {
      colors: {
        primary: primaryDark,
        focus: primary.DEFAULT,
      },
    },
  },
});
