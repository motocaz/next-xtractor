export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
        Privacy Policy
      </h1>
      <div className="prose prose-invert max-w-4xl">
        <p className="text-muted-foreground text-lg mb-4">
          Your privacy is important to us. This policy explains how we handle
          your data.
        </p>
        <p className="text-muted-foreground mb-4">
          Since all processing happens locally in your browser, we never collect,
          store, or transmit your files. Your documents remain completely private.
        </p>
      </div>
    </div>
  );
}


