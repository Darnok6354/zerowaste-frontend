import { Refrigerator } from "lucide-react";
import { createClient } from "../lib/server"; // Zmień na swoją ścieżkę
import { getDaysUntilExpiration, formatDaysLeft } from "../utils/dateutils";

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  expirationDate?: string | null;
  imageUrl?: string | null;
}

async function getFridgeProducts(): Promise<Product[]> {
  // Dodajemy await przy tworzeniu klienta
  const supabase = await createClient();

  const params = new URLSearchParams();
  params.append("statuses", "FRESH");
  params.append("statuses", "EXPIRING_SOON");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  console.log("MÓJ TOKEN JWT:", token);

  if (!token) {
    console.warn("No active sesion.");
    return [];
  }

  try {
    const res = await fetch(
      `http://localhost:8080/api/products?${params.toString()}`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      console.error(
        "Error fetching products from Spring Boot:",
        res.statusText,
      );
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.content || [];
  } catch (error) {
    console.error("Error connecting to backend:", error);
    return [];
  }
}

export default async function MyFridgeList() {
  const products = await getFridgeProducts();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FRESH":
        return (
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Fresh
          </span>
        );
      case "EXPIRING_SOON":
        return (
          <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Use
            soon
          </span>
        );
      case "EXPIRED":
        return (
          <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-heading font-bold text-lg text-slate-800">
              My fridge
            </h2>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {products.length} items
            </span>
          </div>
          <p className="text-xs text-slate-500">
            A little organization. A lot less waste.
          </p>
        </div>
        <button className="text-sm font-medium text-slate-400 hover:text-emerald-700 transition-colors">
          View all →
        </button>
      </div>

      
<div className="divide-y divide-slate-50">
  {products.length === 0 ? (
    <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
      <Refrigerator size={32} className="opacity-20" />
      <p>Fridge is empty (or no access).</p>
    </div>
  ) : (
    products.map((product) => {
      // Wyliczamy dni do wygaśnięcia
      const daysLeft = getDaysUntilExpiration(product.expirationDate);
      const daysLeftText = formatDaysLeft(daysLeft);

      return (
        <div
          key={product.id}
          className="
            p-4 sm:p-5
            grid
            grid-cols-1
            min-[450px]:grid-cols-4
            items-center
            justify-items-center
            gap-4
            hover:bg-slate-50/50
            transition-colors
          "
        >
          {/* Produkt */}
          <div className="flex items-center justify-center gap-4 w-full">
            {product.imageUrl ? (
              <div
                className="w-10 h-10 rounded-xl border border-slate-100 bg-contain bg-no-repeat bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${product.imageUrl})` }}
              />
            ) : (
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl border border-slate-100 flex-shrink-0">
                📦
              </div>
            )}

            <div>
              <p className="font-semibold text-slate-800 text-sm">
                {product.name}
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                {product.category}
              </p>
            </div>
          </div>

          {/* Ilość */}
          <div className="text-sm text-slate-600 flex items-center justify-center w-full">
            {product.quantity} {product.unit}
          </div>

          {/* Status */}
          <div className="flex items-center justify-center w-full">
            {getStatusBadge(product.status)}
          </div>

          {/* Termin ważności */}
          <div className="text-sm font-medium text-slate-500 flex items-center justify-center w-full">
            {daysLeftText}
          </div>
        </div>
      );
    })
  )}
</div>


    </div>
  );
}
