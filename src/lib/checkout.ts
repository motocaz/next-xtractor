import { useAuth } from "@clerk/nextjs";

export interface CheckoutBody {
  paymentProcessor: string;
  allowDiscountCodes: boolean;
  requireBillingAddress: boolean;
  products: string[];
}

/**
 * Creates a checkout session for a product.
 * This function should be called from a client component that has access to Clerk's useAuth hook.
 * 
 * @param productId - The ID of the product to checkout
 * @param getToken - Function from useAuth() hook to get the auth token
 * @returns The checkout URL
 */
export async function createCheckoutSession(
  productId: string,
  getToken: () => Promise<string | null>
): Promise<string> {
  const token = await getToken();

  if (!token) {
    throw new Error("Authentication required. Please sign in.");
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  const checkoutBody: CheckoutBody = {
    paymentProcessor: "stripe",
    allowDiscountCodes: true,
    requireBillingAddress: false,
    products: [productId],
  };

  const response = await fetch(`${backendUrl}/create-checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(checkoutBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.url) {
    return data.url;
  } else {
    throw new Error("Checkout URL not found in response.");
  }
}

