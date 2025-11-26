export interface Product {
  id: string;
  name: string;
  price: number | string;
  currency?: string;
  features: string[];
  description?: string;
  popular?: boolean;
}

export async function fetchProducts(): Promise<Product[]> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  const response = await fetch(`${backendUrl}/api/products`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch products: ${response.status} ${errorText || response.statusText}`
    );
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  } else if (data.products && Array.isArray(data.products)) {
    return data.products;
  } else {
    throw new Error("Invalid response format from products API");
  }
}

