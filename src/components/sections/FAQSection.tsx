import { FAQItem } from "@/components/ui/faq-item";
import { MarkerSlanted } from "@/components/ui/marker-slanted";
import Link from "next/link";

const faqs = [
  {
    question: "What does Xtractor cost?",
    answer:
      "Xtractor offers professional PDF tools with transparent pricing. All tools are available with no file limits and no watermarks. We believe everyone deserves access to simple, powerful PDF tools.",
  },
  {
    question: "Are my files secure? Where are they processed?",
    answer:
      "Your files are as secure as possible because they never leave your computer. All processing happens directly in your web browser (client-side). We never upload your files to a server, so you maintain complete privacy and control over your documents.",
  },
  {
    question: "Does it work on Mac, Windows, and Mobile?",
    answer:
      "Yes! Since Xtractor runs entirely in your browser, it works on any operating system with a modern web browser, including Windows, macOS, Linux, iOS, and Android.",
  },
  {
    question: "Is Xtractor GDPR compliant?",
    answer:
      "Yes. Xtractor is fully GDPR compliant. Since all file processing happens locally in your browser and we never collect or transmit your files to any server, we have no access to your data. This ensures you are always in control of your documents.",
  },
  {
    question: "Do you store or track any of my files?",
    answer:
      "No. We never store, track, or log your files. Everything you do on Xtractor happens in your browser memory and disappears once you close the page. There are no uploads, no history logs, and no servers involved.",
  },
  {
    question: "What makes Xtractor different from other PDF tools?",
    answer:
      "Most PDF tools upload your files to a server for processing. Xtractor never does that. We use secure, modern web technology to process your files directly in your browser. This means faster performance, stronger privacy, and complete peace of mind.",
  },
  {
    question: "How does browser-based processing keep me safe?",
    answer:
      "By running entirely inside your browser, Xtractor ensures that your files never leave your device. This eliminates the risks of server hacks, data breaches, or unauthorized access. Your files remain yours—always.",
  },
  {
    question: "Do you use cookies or analytics to track me?",
    answer: (
      <>
        We care about your privacy. Xtractor does not track personal information.
        We use{" "}
        <Link
          href="https://simpleanalytics.com"
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Simple Analytics
        </Link>{" "}
        solely to see anonymous visit counts. This means we can know how many
        users visit our site, but <strong>we never know who you are</strong>.
        Simple Analytics is fully GDPR-compliant and respects your privacy.
      </>
    ),
  },
];

export function FAQSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 mt-8">
        Frequently Asked <MarkerSlanted>Questions</MarkerSlanted>
      </h2>
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </section>
  );
}

