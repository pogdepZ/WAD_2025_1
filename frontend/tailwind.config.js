/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ĐỊNH NGHĨA MÀU TRỰC TIẾP (KHÔNG DÙNG BIẾN colors CỦA THƯ VIỆN)
        primary: "#e74c3c",
        "primary-dark": "#c0392b",
        secondary: "#2c3e50",
        success: "#27ae60",
        warning: "#f39c12",
        danger: "#e74c3c",
        light: "#ecf0f1",
        dark: "#2c3e50",
        // Tự định nghĩa màu gray để không bị lỗi
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        "gray-light": "#bdc3c7",
        bg: "#f5f6fa",

        kds: {
          bg: "#1a1a2e",
          panel: "#16213e",
          card: "#1a1a2e",
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', "Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
      boxShadow: {
        DEFAULT: "0 2px 10px rgba(0,0,0,0.1)",
        lg: "0 4px 20px rgba(0,0,0,0.15)",
      },
      borderRadius: {
        DEFAULT: "12px",
        xl: "12px",
        "2xl": "20px",
        "3xl": "30px",
      },
    },
  },
  plugins: [],
};
