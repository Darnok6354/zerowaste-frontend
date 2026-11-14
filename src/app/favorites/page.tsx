import FavoriteRecipesList from '../components/FavoriteRecipesList'; // dostosuj ścieżkę do struktury folderów
import Link from 'next/link';
import { ChevronLeft, Heart } from 'lucide-react';

export default function FavoritesPage() {
  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto flex flex-col min-h-screen">
      
      {/* Nagłówek z przyciskiem wstecz */}
      <div className="flex items-center gap-4 mb-8 pt-2">
        <Link 
          href="/dashboard" 
          className="p-2.5 bg-white rounded-full shadow-sm border border-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            My Favorites 
          </h1>
          <p className="text-xs text-slate-500">Recipes you've saved for later</p>
        </div>
      </div>
      
      {/* Lista Ulubionych */}
      <div className="flex-1">
        <FavoriteRecipesList />
      </div>

    </div>
  );
}