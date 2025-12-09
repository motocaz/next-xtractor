export default function ContactPage() {
  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Get in Touch
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
          We&apos;d love to hear from you. Whether you have a question, feedback, or
          a feature request, please don&apos;t hesitate to reach out.
        </p>
      </section>

      {/* Contact Information Section */}
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-lg text-gray-400">
          You can reach us directly by email at:{" "}
          <a
            href="mailto:contact@xtractor.com"
            className="text-fuchsia-400 underline hover:text-fuchsia-300 transition-colors"
          >
            contact@xtractor.com
          </a>
        </p>
      </div>
    </div>
  );
}


