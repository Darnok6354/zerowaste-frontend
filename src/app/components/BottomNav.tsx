"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Refrigerator, Heart, User, ChefHat, ShoppingCart } from "lucide-react";

export default function BottomNav() {
  // Pobieramy aktualną ścieżkę (np. "/", "/recipes", "/favorites")
  const pathname = usePathname();

  // Funkcja pomocnicza, która sprawdza czy dany link jest aktywny.
  // Używamy dokładnego dopasowania (===) lub sprawdzamy czy ścieżka zaczyna się od danego prefiksu.
  const isActive = (path: string) => {
    if (path === "/") {
      // Jeśli Twoją stroną główną w aplikacji jest "/dashboard", możesz tu zmienić na path === "/dashboard"
      return pathname === path; 
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-full transition-colors ${
            isActive("/") ? "text-emerald-800" : "text-slate-400 hover:text-emerald-800"
          }`}
        >
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        
        <Link 
          href="/recipes" 
          className={`flex flex-col items-center justify-center w-full transition-colors ${
            isActive("/recipes") ? "text-emerald-800" : "text-slate-400 hover:text-emerald-800"
          }`}
        >
          <ChefHat size={24} />
          <span className="text-[10px] mt-1 font-medium">Recipes</span>
        </Link>
        
        <Link 
          href="/favorites" 
          className={`flex flex-col items-center justify-center w-full transition-colors ${
            isActive("/favorites") ? "text-emerald-800" : "text-slate-400 hover:text-emerald-800"
          }`}
        >
          {/* Opcjonalnie: serduszko może być wypełnione gdy jesteśmy na podstronie favorites */}
          <Heart size={24}  />
          <span className="text-[10px] mt-1 font-medium">Favorites</span>
        </Link>

        <Link 
          href="/shopping-list" 
          className={`flex flex-col items-center justify-center w-full transition-colors ${
            isActive("/shopping-list") ? "text-emerald-800" : "text-slate-400 hover:text-emerald-800"
          }`}
        >
          <ShoppingCart size={24} />
          <span className="text-[10px] mt-1 font-medium">List</span>
        </Link>
        
        <Link 
          href="/profile" 
          className={`flex flex-col items-center justify-center w-full transition-colors ${
            isActive("/profile") ? "text-emerald-800" : "text-slate-400 hover:text-emerald-800"
          }`}
        >
          <User size={24} />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </Link>
        
      </div>
    </nav>
  );
}