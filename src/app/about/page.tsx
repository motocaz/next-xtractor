export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
        About Xtractor
      </h1>
      <div className="prose prose-invert max-w-4xl">
        <p className="text-gray-400 text-lg mb-4">
          Xtractor is a privacy-first PDF toolkit designed to give you complete
          control over your documents.
        </p>
        <p className="text-gray-400 mb-4">
          All processing happens locally in your browser - your files never leave
          your device. We believe in transparency, security, and giving you the
          tools you need without compromise.
        </p>
      </div>
    </div>
  );
}


