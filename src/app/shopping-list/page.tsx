import ShoppingList from '@/app/components/ShoppingList'; 
import Link from 'next/link';
import { ChevronLeft, ShoppingCart } from 'lucide-react';

export default function ShoppingListPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col min-h-screen">
      
        {/* Nagłówek powrotny */}
       {/* Mobilny nagłówek */}
      <header className="mb-6 md:hidden">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          • Less waste, more good
        </p>
        <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">
          Shop smart. Waste less.
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
       Plan what you need, skip what you already have.
        </p>
      </header>

      {/* Desktopowy nagłówek (na pełną szerokość) */}
      <div className="hidden md:block mb-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          • Less waste, more good
        </p>
        <h1 className="text-4xl font-heading font-bold text-slate-800 mb-2">
           Shop smart. Waste less.
        </h1>
        <p className="text-slate-500">
     Plan what you need, skip what you already have.
        </p>
      </div>

      <div className="flex-1">
        <ShoppingList />
      </div>

    </div>
  );
}