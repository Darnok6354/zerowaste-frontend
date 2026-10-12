import { Refrigerator, Clock, Leaf } from "lucide-react";
import { createClient } from "../lib/server";
// Importujemy funkcję do obliczania dni, którą stworzyliśmy wcześniej
import { getDaysUntilExpiration } from "@/app/utils/dateutils"; 

export default async function DashboardStats() {
  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  let totalItems = 0;
  let expiringSoonCount = 0;
  let consumedThisMonth = 0;

  if (token) {
    try {
      // --- 1. POBIERANIE PRODUKTÓW (kolumna 1 i 2) ---
      // Ustawiamy duży size, żeby pobrać całą lodówkę
      const productsRes = await fetch('http://localhost:8080/api/products?size=1000', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store' // Zawsze świeże dane
      });
      
      if (productsRes.ok) {
        const data = await productsRes.json();
        // Twój Spring Boot (Page<ProductResponse>) zwraca listę wewnątrz pola 'content'
        const products = data.content || data; 
        
        // Bierzemy pod uwagę tylko produkty, które nadal są w lodówce (ACTIVE)
        const activeProducts = products.filter((p: any) => 
          p.lifecycleStatus !== 'CONSUMED' && p.lifecycleStatus !== 'WASTED' && p.status === 'FRESH' || p.status === 'EXPIRING_SOON'
        );
        
        totalItems = activeProducts.length;

        expiringSoonCount = activeProducts.filter((p: any) => {
          const daysLeft = getDaysUntilExpiration(p.expirationDate);
          return daysLeft !== null && daysLeft >= 0 && daysLeft <= 2;
        }).length;
      }

      // --- 2. POBIERANIE STATYSTYK MIESIĘCZNYCH (kolumna 3) ---
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // JavaScript liczy miesiące od 0, więc dodajemy 1

      // Upewnij się, że Twój @RequestMapping to "/api/statistics" (lub zmień na "statistic" jeśli masz bez 's' na końcu)
      const statsRes = await fetch(`http://localhost:8080/api/statistics/monthly`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });

      if (statsRes.ok) {
        const stats = await statsRes.json();
        consumedThisMonth = stats.totalConsumedItems || 0;
      }
    } catch (error) {
      console.error("Błąd pobierania statystyk dla dashboardu:", error);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      
      {/* Karta 1: Items in your fridge */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
        <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl w-fit mb-4">
          <Refrigerator size={20} strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Items in your fridge</p>
          <p className="text-3xl font-bold text-slate-800 font-heading mb-1">{totalItems}</p>
          <p className="text-[10px] text-slate-400">fresh possibilities</p>
        </div>
      </div>

      {/* Karta 2: Need a little love */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
        <div className="bg-orange-50 text-orange-600 p-2 rounded-xl w-fit mb-4">
          <Clock size={20} strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Need a little love</p>
          <p className="text-3xl font-bold text-slate-800 font-heading mb-1">{expiringSoonCount}</p>
          <p className="text-[10px] text-slate-400">expiring soon</p>
        </div>
      </div>

      {/* Karta 3: Food saved this month */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl w-fit">
            <Leaf size={20} strokeWidth={2} />
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Food saved this month</p>
          {/* Wyświetlamy dynamiczną zmienną */}
          <p className="text-3xl font-bold text-slate-800 font-heading mb-1">{consumedThisMonth}</p>
          {/* Zmieniłem tekst z "kg of goodness" na ilość sztuk */}
          <p className="text-[10px] text-slate-400">items consumed</p>
        </div>
      </div>

    </div>
  );
}