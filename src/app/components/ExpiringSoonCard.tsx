import { Clock, Sparkles, Utensils } from "lucide-react";
import { createClient } from "../lib/server";
import { getDaysUntilExpiration, formatDaysLeft } from "@/app/utils/dateutils"; // Importujemy funkcję do obliczania dni

export default async function ExpiringSoonCard() {
  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  let expiringProducts: any[] = [];

  if (token) {
    try {
      const res = await fetch('http://localhost:8080/api/products?size=1000', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data = await res.json();
        const products = data.content || data;
        
        // Filtrowanie i sortowanie (Pilne na początek)
        expiringProducts = products.filter((p: any) => {
          if (p.lifecycleStatus === 'CONSUMED' || p.lifecycleStatus === 'WASTED') return false;
          const daysLeft = getDaysUntilExpiration(p.expirationDate);
          return daysLeft !== null && daysLeft <= 2;
        }).sort((a: any, b: any) => {
          const daysA = getDaysUntilExpiration(a.expirationDate) ?? 999;
          const daysB = getDaysUntilExpiration(b.expirationDate) ?? 999;
          return daysA - daysB;
        });
      }
    } catch (error) {
      console.error("Błąd pobierania produktów do karty Expiring Soon:", error);
    }
  }

  // Jeśli nie ma nic psującego się, w ogóle nie renderujemy tej sekcji
  if (expiringProducts.length === 0) return null;

  return (
    <div className="bg-[#fff9eb] border border-[#f5e6c7] rounded-3xl p-6 shadow-sm mb-6 flex flex-col">
      
      {/* Nagłówek */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-[#a3794b]">
            <Clock size={24} strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold text-[#805828]">Expiring soon</h3>
        </div>
        <div className="bg-white border border-[#f5e6c7] text-[#a3794b] text-xs font-bold px-2.5 py-1 rounded-md">
          {expiringProducts.length}
        </div>
      </div>

      <p className="text-[#966b39] text-sm mb-5 pr-8">
        A little love before it&apos;s too late. Let&apos;s put these ingredients to good use.
      </p>

      {/* Pozioma lista produktów (scrollowana) */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-2 snap-x hide-scrollbar">
        {expiringProducts.map(product => {
          const daysLeft = getDaysUntilExpiration(product.expirationDate);
          const isExpired = daysLeft !== null && daysLeft < 0;

          return (
            <div key={product.id} className="bg-white border border-[#f5e6c7] rounded-2xl p-4 min-w-[160px] flex-shrink-0 flex gap-3 snap-start shadow-sm">
              <div className="w-10 h-10 bg-[#fff9eb] rounded-xl flex items-center justify-center flex-shrink-0">
                 {/* Placeholder dla zdjęcia lub ikona */}
                 {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain rounded-xl" />
                 ) : (
                  <div className="text-[#d4b48c]"><Utensils size={18} strokeWidth={2.5}/></div>
                 )}
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-sm text-slate-800 leading-tight mb-0.5 truncate max-w-[90px]">{product.name}</p>
                <p className="text-[11px] text-slate-500 mb-2">{product.quantity} {product.unit.toLowerCase()} left</p>
                
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-fit ${
                  isExpired ? 'bg-red-50 text-red-600' : 'bg-[#fff9eb] text-[#a3794b]'
                }`}>
                  {formatDaysLeft(daysLeft)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Przycisk Generate Recipes */}
      <button className="bg-[#2d5a45] hover:bg-[#234735] text-white w-full rounded-2xl py-4 flex items-center justify-between px-6 transition-colors font-medium mt-1">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-emerald-200" />
          <span>Generate Recipes</span>
        </div>
        <span>→</span>
      </button>
      
      <p className="text-center text-[10px] text-[#a3794b] mt-4 font-medium uppercase tracking-wider">
        Good food deserves a second chance.
      </p>

    </div>
  );
}