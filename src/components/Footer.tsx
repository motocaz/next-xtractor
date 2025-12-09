import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.5.0";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t-2 border-border py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Image
                src="/images/favicon.svg"
                alt="Xtractor PDF Logo"
                width={40}
                height={40}
                className="h-10 w-10 mr-3"
              />
              <span className="text-xl font-bold text-foreground">Xtractor</span>
            </div>
            <p className="text-muted-foreground text-sm">
              &copy; {currentYear} Xtractor. All rights reserved.
            </p>
            <p className="text-muted-foreground/80 text-xs mt-2">
              Version <span id="app-version">{APP_VERSION}</span>
            </p>
            <div className="flex items-center justify-center md:justify-start mt-4">
              <ThemeToggle />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
