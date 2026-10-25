/** Token desain dari Stitch: Intellisys Talent Hub Design System */
/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    "extend": {
      "colors": {
        // Warna primer & aksen mengikuti logo resmi Intellisys (marun #780001); netral abu hangat.
        "aksen": "#780001",
        "aksen-hover": "#5c0001",
        "aksen-container": "#fbeae8",
        "on-background": "#1c1b1b",
        "on-secondary": "#ffffff",
        "inverse-surface": "#313030",
        "tertiary-container": "#157347",
        "on-secondary-fixed": "#1f1a1a",
        "primary": "#780001",
        "on-tertiary-fixed": "#002114",
        "surface-dim": "#dbd8d8",
        "on-primary-fixed": "#410001",
        "primary-fixed-dim": "#f2c4bf",
        "on-primary-fixed-variant": "#780001",
        "surface-container": "#efeded",
        "secondary-fixed": "#ebe5e4",
        "surface-container-lowest": "#ffffff",
        "surface-bright": "#faf9f9",
        "error": "#ba1a1a",
        "inverse-on-surface": "#f4f0ef",
        "outline": "#7d7576",
        "on-secondary-fixed-variant": "#4a4444",
        "background": "#faf9f9",
        "on-tertiary-container": "#1f8a5a",
        "surface-variant": "#e8e5e5",
        "on-secondary-container": "#625b5b",
        "tertiary-fixed": "#d3f3e2",
        "on-tertiary": "#ffffff",
        "surface": "#faf9f9",
        "surface-container-highest": "#e1dede",
        "tertiary-fixed-dim": "#9fdcbd",
        "tertiary": "#0f5132",
        "on-error": "#ffffff",
        "on-surface": "#1c1b1b",
        "on-primary-container": "#ffdad5",
        "outline-variant": "#d6cfcf",
        "secondary-container": "#ebe5e4",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "secondary-fixed-dim": "#d5cdcc",
        "surface-container-high": "#e8e5e5",
        "on-tertiary-fixed-variant": "#0f5132",
        "on-primary": "#ffffff",
        "secondary": "#625b5b",
        "primary-fixed": "#fbeae8",
        "surface-container-low": "#f5f3f3",
        "inverse-primary": "#ffb4aa",
        "on-surface-variant": "#4e4848",
        "primary-container": "#9a1416",
        "surface-tint": "#9a1416",
        // Nada status (lihat NADA di src/components/ui.jsx): kuning = menunggu, biru = diproses/informasi.
        "warning": "#a06c00",
        "warning-container": "#fdf0c8",
        "on-warning-container": "#6b4e00",
        "info": "#2f5bb5",
        "info-container": "#dde8fb",
        "on-info-container": "#1e4087"
      },
      // lg = tombol & input, xl = kartu & panel, 2xl = kartu halaman masuk, full = pil/lingkaran.
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      // Bayangan kartu seragam (shadow-sm), tidak terlalu tebal.
      "boxShadow": {
        "sm": "0 1px 2px rgba(28, 27, 27, 0.04), 0 1px 3px rgba(28, 27, 27, 0.06)",
        "md": "0 4px 12px -2px rgba(28, 27, 27, 0.08), 0 2px 4px rgba(28, 27, 27, 0.04)",
        "lg": "0 12px 32px -8px rgba(28, 27, 27, 0.16)"
      },
      "spacing": {
        "space-xs": "0.25rem",
        "space-md": "1rem",
        "space-xl": "2rem",
        "space-lg": "1.5rem",
        "gutter-mobile": "1rem",
        "margin-mobile": "1rem",
        "margin": "2rem",
        "gutter": "1.5rem",
        "space-sm": "0.5rem"
      },
      "fontFamily": {
        "headline-xl": [
          "Plus Jakarta Sans"
        ],
        "headline-lg-mobile": [
          "Plus Jakarta Sans"
        ],
        "label-sm": [
          "Inter"
        ],
        "body-lg": [
          "Inter"
        ],
        "body-sm": [
          "Inter"
        ],
        "title-md": [
          "Plus Jakarta Sans"
        ],
        "headline-md": [
          "Plus Jakarta Sans"
        ],
        "headline-xl-mobile": [
          "Plus Jakarta Sans"
        ],
        "label-md": [
          "Inter"
        ],
        "title-sm": [
          "Plus Jakarta Sans"
        ],
        "headline-sm": [
          "Plus Jakarta Sans"
        ],
        "headline-lg": [
          "Plus Jakarta Sans"
        ],
        "body-md": [
          "Inter"
        ],
        "label-lg": [
          "Inter"
        ]
      },
      "fontSize": {
        "headline-xl": [
          "36px",
          {
            "lineHeight": "44px",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "headline-lg-mobile": [
          "24px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "label-sm": [
          "11px",
          {
            "lineHeight": "14px",
            "letterSpacing": "0.03em",
            "fontWeight": "600"
          }
        ],
        "body-lg": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ],
        "body-sm": [
          "12px",
          {
            "lineHeight": "16px",
            "fontWeight": "400"
          }
        ],
        "title-md": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "600"
          }
        ],
        "headline-md": [
          "24px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "headline-xl-mobile": [
          "28px",
          {
            "lineHeight": "36px",
            "letterSpacing": "-0.01em",
            "fontWeight": "700"
          }
        ],
        "label-md": [
          "12px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.01em",
            "fontWeight": "500"
          }
        ],
        "title-sm": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "600"
          }
        ],
        "headline-sm": [
          "20px",
          {
            "lineHeight": "28px",
            "fontWeight": "600"
          }
        ],
        "headline-lg": [
          "30px",
          {
            "lineHeight": "38px",
            "letterSpacing": "-0.02em",
            "fontWeight": "600"
          }
        ],
        "body-md": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "400"
          }
        ],
        "label-lg": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "500"
          }
        ]
      }
    }
  },
  plugins: [],
};
