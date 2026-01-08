import { TestimonialCard } from "@/components/ui/testimonial-card";
import { MarkerSlanted } from "@/components/ui/marker-slanted";

interface Testimonial {
  name: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah L.",
    rating: 5,
    text: "This is the tool I've been searching for! It's fast, reliable, and I love that my confidential documents never get uploaded to some random server. A lifesaver for my freelance work.",
  },
  {
    name: "Mark Chen",
    rating: 5,
    text: "Finally, a PDF editor that just works. No ads, no nonsense. The merge tool is surprisingly powerful. I've already bookmarked it on all my devices.",
  },
  {
    name: "Anonymous User A-35Z",
    rating: 1,
    text: "Terrible. It won't let me upload my files to the cloud. How is my Big Data Tech Overlord supposed to know I signed a permission slip for my kid's field trip? Useless for my data profile.",
  },
  {
    name: "Dr. Brickson",
    rating: 5,
    text: "As a researcher, data privacy is paramount. Xtractor's client-side processing model is exactly what my institution recommends. It's robust, reliable, and secure. A fantastic resource.",
  },
  {
    name: "AdTracker Pro",
    rating: 1,
    text: "This website is broken. My ad blocker says it hasn't blocked a single tracker. How am I supposed to know if a product is good if it's not following me around the internet for a week? 1 star.",
  },
  {
    name: "Raj P.",
    rating: 5,
    text: "Simple, elegant, and powerful. I needed to merge 50 reports, and it handled it instantly without crashing my browser. This is what a web tool should be. Highly recommended.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="text-yellow-400 flex items-center text-sm">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
        What Our <MarkerSlanted>Users</MarkerSlanted> Say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index}>
            <div className="flex items-center mb-4">
              <div>
                <p className="font-bold text-foreground">{testimonial.name}</p>
                <StarRating rating={testimonial.rating} />
              </div>
            </div>
            <p className="text-muted-foreground">{testimonial.text}</p>
          </TestimonialCard>
        ))}
      </div>
    </section>
  );
}
