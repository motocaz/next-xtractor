import type { Appearance } from "@clerk/types";

export const clerkAppearance = {
  baseTheme: "dark",
  variables: {
    colorBackground: "#09090b",
    colorInputBackground: "#1f1f23",
    colorInputText: "#d1d5db",
    colorPrimary: "oklch(53.3% .075 182.04)",
    colorText: "#d1d5db",
    colorTextSecondary: "#9ca3af",
    colorDanger: "#ef4444",
    colorSuccess: "#50bfae",
    colorWarning: "#f59e0b",
    colorNeutral: "#374151",
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  },
  elements: {
    formButtonPrimary: {
      backgroundColor: "oklch(53.3% .075 182.04)",
      "&:hover": {
        backgroundColor: "oklch(43.1% .061 182.71)",
      },
    },
    formButtonSecondary: {
      backgroundColor: "#1f1f23",
      borderColor: "#374151",
      "&:hover": {
        backgroundColor: "#374151",
      },
    },
    
    formFieldInput: {
      backgroundColor: "#1f1f23",
      borderColor: "#374151",
      "&:focus": {
        borderColor: "oklch(53.3% .075 182.04)",
      },
    },
    
    formFieldAction: {
      color: "oklch(73.6% .104 181.65)",
      "&:hover": {
        color: "oklch(79.6% .113 181.45)",
      },
    },
    
    socialButtonsBlockButton: {
      backgroundColor: "#1f1f23",
      borderColor: "#374151",
      "&:hover": {
        backgroundColor: "#374151",
      },
    },
    footerActionLink: {
      color: "oklch(73.6% .104 181.65)",
      "&:hover": {
        color: "oklch(79.6% .113 181.45)",
      },
    },
    identityPreviewEditButton: {
      color: "oklch(73.6% .104 181.65)",
      "&:hover": {
        color: "oklch(79.6% .113 181.45)",
      },
    },
  },
} as unknown as Appearance;

