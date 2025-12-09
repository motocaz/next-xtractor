import type { Appearance } from "@clerk/types";

export const clerkAppearance = {
  variables: {
    colorBackground: "var(--background)",
    colorInputBackground: "var(--input)",
    colorInputText: "var(--foreground)",
    colorPrimary: "var(--primary)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--chart-1)",
    colorWarning: "oklch(0.8721 0.0864 68.5474)",
    colorNeutral: "var(--muted)",
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  },
  elements: {
    formButtonPrimary: {
      backgroundColor: "var(--primary)",
      "&:hover": {
        backgroundColor: "var(--primary)",
        opacity: 0.9,
      },
    },
    formButtonSecondary: {
      backgroundColor: "var(--input)",
      borderColor: "var(--border)",
      "&:hover": {
        backgroundColor: "var(--muted)",
      },
    },
    
    formFieldInput: {
      backgroundColor: "var(--input)",
      borderColor: "var(--border)",
      "&:focus": {
        borderColor: "var(--primary)",
      },
    },
    
    formFieldAction: {
      color: "var(--primary)",
      "&:hover": {
        color: "var(--primary)",
        opacity: 0.8,
      },
    },
    
    socialButtonsBlockButton: {
      backgroundColor: "var(--input)",
      borderColor: "var(--border)",
      "&:hover": {
        backgroundColor: "var(--muted)",
      },
    },
    footerActionLink: {
      color: "var(--primary)",
      "&:hover": {
        color: "var(--primary)",
        opacity: 0.8,
      },
    },
    identityPreviewEditButton: {
      color: "var(--primary)",
      "&:hover": {
        color: "var(--primary)",
        opacity: 0.8,
      },
    },

    pricingTable: {
      backgroundColor: "var(--background)",
    },
    pricingTableRow: {
      borderColor: "var(--border)",
    },
    pricingTableHeader: {
      color: "var(--foreground)",
    },
    pricingTableCell: {
      color: "var(--foreground)",
      borderColor: "var(--border)",
    },
    pricingTableCard: {
      borderColor: "var(--border)",
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: "0.75rem",
    },
    pricingTablePlan: {
      borderColor: "var(--border)",
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: "0.75rem",
    },
    pricingTableCard: {
      borderColor: "var(--border)",
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: "0.75rem",
    },
    pricingTableCheckmark: {
      color: "var(--primary)",
    },
    pricingTableIcon: {
      color: "var(--primary)",
    },
    pricingTableButton: {
      backgroundColor: "var(--primary)",
      "&:hover": {
        backgroundColor: "var(--primary)",
        opacity: 0.9,
      },
    },
    userProfile: {
      backgroundColor: "var(--background)",
    },
    userProfileCard: {
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
    },
    userProfileButton: {
      backgroundColor: "var(--primary)",
      "&:hover": {
        backgroundColor: "var(--primary)",
        opacity: 0.9,
      },
    },
    userButtonPopoverCard: {
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
    },
    userButtonPopoverActionButton: {
      color: "var(--foreground)",
      "&:hover": {
        backgroundColor: "var(--muted)",
        color: "var(--foreground)",
      },
    },
    userButtonPopoverActionButtonText: {
      color: "var(--foreground)",
    },
    userButtonPopoverActionButtonIcon: {
      color: "var(--foreground)",
    },
  },
} satisfies Appearance;

