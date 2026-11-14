import SuggestedRecipes from '../components/SuggestedRecipes';
import Link from 'next/link';
import { ChevronLeft, Sparkles } from 'lucide-react';

export default function RecipesPage() {
  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto flex flex-col min-h-screen">
      
      {/* Nagłówek powrotny */}
      <div className="flex items-center gap-4 mb-8 pt-2">
        <Link 
          href="/dashboard" 
          className="p-2.5 bg-white rounded-full shadow-sm border border-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Recipe Ideas  
          </h1>
          <p className="text-xs text-slate-500">Based on your fridge inventory</p>
        </div>
      </div>
      
      {/* Nowy Komponent z przyciskiem do regeneracji i listą kafelków */}
      <div className="flex-1">
        <SuggestedRecipes />
      </div>

    </div>
  );
}