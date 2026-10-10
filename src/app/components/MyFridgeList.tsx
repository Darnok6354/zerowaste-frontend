import { createClient } from "../lib/server";
import MyFridgeClient from "./MyFridgeClient"; // Zaimportuj nowo stworzony komponent

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  expirationDate?: string | null;
  imageUrl?: string | null;
  lifecycleStatus?: string; // Dodane do sprawdzania czy zjedzone
  masterProductId: number;  // Dodane
  location: string;
}

async function getFridgeProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const params = new URLSearchParams();
  params.append('statuses', 'FRESH');
  params.append('statuses', 'EXPIRING_SOON');
  
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    console.warn("No active session.");
    return [];
  }

  try {
    const res = await fetch(`http://localhost:8080/api/products?${params.toString()}`, { 
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      console.error("Error fetching products from Spring Boot:", res.statusText);
      return [];
    }
    
    const data = await res.json();
    return Array.isArray(data) ? data : (data.content || []); 
  } catch (error) {
    console.error("Error connecting to backend:", error);
    return [];
  }
}

export default async function MyFridgeList() {
  // Pobieramy dane raz na serwerze
  const products = await getFridgeProducts();

  // Pobieramy sesję z serwera, aby zdobyć token dla wyszukiwarki
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || "";

  // Przekazujemy token do komponentu klienckiego
  return <MyFridgeClient initialProducts={products} token={token} />;
  // Przekazujemy gotową tablicę do komponentu, który zajmie się resztą interfejsu i filtrowaniem
} 