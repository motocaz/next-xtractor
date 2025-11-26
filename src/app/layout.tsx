import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { JetBrains_Mono } from "next/font/google"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Xtractor - The Privacy First PDF Toolkit",
  description: "Fast, Secure and Professional PDF tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${jetbrainsMono.className} antialiased`}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
