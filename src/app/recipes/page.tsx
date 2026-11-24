import SuggestedRecipes from '../components/SuggestedRecipes';
import Link from 'next/link';
import { ChevronLeft, Sparkles } from 'lucide-react';

export default function RecipesPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col min-h-screen">
      
      {/* Nagłówek powrotny */}
       {/* Mobilny nagłówek */}
      <header className="mb-6 md:hidden">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          • Less waste, more good
        </p>
        <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">
          Good food. Second chances.
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
         A little inspiration, made from what you already have.
        </p>
      </header>

      {/* Desktopowy nagłówek (na pełną szerokość) */}
      <div className="hidden md:block mb-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          • Less waste, more good
        </p>
        <h1 className="text-4xl font-heading font-bold text-slate-800 mb-2">
           Good food. Second chances.
        </h1>
        <p className="text-slate-500">
          A little inspiration, made from what you already have.
        </p>
      </div>
      
      {/* Nowy Komponent z przyciskiem do regeneracji i listą kafelków */}
      <div className="flex-1">
        <SuggestedRecipes />
      </div>

    </div>
  );
}