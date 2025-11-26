"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { fetchProducts, type Product } from "@/lib/pricing";
import { createCheckoutSession } from "@/lib/checkout";
import { Spinner } from "@/components/ui/spinner";
import { MarkerSlanted } from "@/components/ui/marker-slanted";

export function PricingSection() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const clerk = useClerk();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingProductId, setProcessingProductId] = useState<string | null>(
    null
  );

  const hasActiveSubscription =
    isLoaded &&
    user &&
    (user.publicMetadata as { plan?: string; status?: string })?.plan ===
      "pro" &&
    (user.publicMetadata as { plan?: string; status?: string })?.status ===
      "active";

  useEffect(() => {
    if (hasActiveSubscription) {
      return;
    }

    const loadProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load pricing information. Please try again later.";
        setError(errorMessage);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [hasActiveSubscription]);

  const handleGetStarted = async (productId: string, productName: string) => {
    try {
      setProcessingProductId(productId);

      if (!user) {
        clerk.openSignIn();
        return;
      }

      const checkoutUrl = await createCheckoutSession(productId, getToken);
      window.location.href = checkoutUrl;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert(`Error during checkout: ${errorMessage}`);
      setProcessingProductId(null);
    }
  };

  if (hasActiveSubscription) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Choose Your <MarkerSlanted>Plan</MarkerSlanted>
        </h2>
        <div className="flex justify-center items-center py-16">
          <Spinner size="md" />
          <p className="text-gray-400 ml-4">Loading pricing plans...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Choose Your <MarkerSlanted>Plan</MarkerSlanted>
        </h2>
        <div className="bg-tool-card rounded-lg border border-gray-700 p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Unable to Load Pricing
          </h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Choose Your <MarkerSlanted>Plan</MarkerSlanted>
        </h2>
        <div className="bg-tool-card rounded-lg border border-gray-700 p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            No Pricing Plans Available
          </h3>
          <p className="text-gray-400">
            No pricing plans available at this time.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
        Choose Your <MarkerSlanted>Plan</MarkerSlanted>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {products.map((product) => {
          const isPopular = product.popular || false;
          const priceDisplay =
            typeof product.price === "number"
              ? `$${product.price.toFixed(2)}`
              : product.price;
          const currency = product.currency || "USD";
          const isProcessing = processingProductId === product.id;

          return (
            <div
              key={product.id}
              className={`bg-tool-card rounded-xl p-6 md:p-8 border border-gray-700 flex flex-col ${
                isPopular
                  ? "border-fuchsia-500 ring-2 ring-fuchsia-500/20 relative"
                  : ""
              } hover:border-fuchsia-500/50 transition-all duration-200`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-fuchsia-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="grow">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-gray-400 text-sm mb-4">
                    {product.description}
                  </p>
                )}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    {priceDisplay}
                  </span>
                  {currency !== "USD" && (
                    <span className="text-gray-400 ml-2">{currency}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleGetStarted(product.id, product.name)}
                disabled={isProcessing}
                className={`w-full mt-auto px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isPopular
                    ? "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                } focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-fuchsia-400 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Get Started"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

