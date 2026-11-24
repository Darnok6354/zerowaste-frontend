"use client";

import { useState, useEffect } from "react";
import { Sparkles, Heart, Clock, X, Users, ExternalLink, ChefHat } from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export default function FavoriteRecipesList() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Stany modala z detalami
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [recipeDetails, setRecipeDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setIsLoadingList(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("http://localhost:8080/api/saved-recipes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setRecipes(await res.json());
      }
    } catch (error) {
      console.error("Błąd pobierania ulubionych przepisów:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

const removeFavorite = async (e: React.MouseEvent, spoonacularId: number) => {
    e.stopPropagation();
    
    // Optimistic UI - od razu chowamy kartę z listy
    setRecipes(prev => prev.filter(r => r.spoonacularRecipeId !== spoonacularId));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(`http://localhost:8080/api/saved-recipes/${spoonacularId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to delete favorite");

      // Sukces - wyświetlamy toasta
      toast.success("Recipe removed");
    } catch (error) {
      console.error("Błąd podczas usuwania przepisu:", error);
      
      // Błąd - informujemy użytkownika i odświeżamy listę, by przywrócić kartę
      toast.error("Failed to remove recipe.");
      fetchFavorites();
    }
  };

  const handleRecipeClick = async (spoonacularId: number) => {
    setSelectedRecipeId(spoonacularId);
    setIsLoadingDetails(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`http://localhost:8080/api/recipes/${spoonacularId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setRecipeDetails(await res.json());
      }
    } catch (error) {
      console.error("Błąd pobierania detali przepisu:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedRecipeId(null);
    setRecipeDetails(null);
  };

  const handleCookRecipe = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Sprawdzamy czy mamy załadowane detale i składniki
    if (!recipeDetails || !recipeDetails.extendedIngredients) {
      toast.error("Could not load recipe ingredients.");
      return;
    }

    const ingredientsToConsume = recipeDetails.extendedIngredients.map((ing: any) => ({
      name: ing.name,
      amount: ing.amount || 1.0 
    }));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const res = await fetch("http://localhost:8080/api/products/cook-suggested", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ingredients: ingredientsToConsume })
      });

      if (!res.ok) throw new Error("Błąd podczas gotowania");
      
      toast.success("Used ingredients have been removed from your fridge. ", { duration: 4000 });
      closeModal(); 
    } catch (error) {
      toast.error("Failed to update your fridge inventory.");
    }
  };

  return (
    <div className="pb-12 animate-in fade-in duration-500">
      {isLoadingList ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Heart className="animate-pulse mb-3 text-rose-400/50" size={32} />
          <p className="text-sm font-medium">Loading your favorites...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center px-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Heart className="text-slate-300" size={28} />
          </div>
          <h3 className="text-slate-700 font-bold mb-1">No favorites yet</h3>
          <p className="text-sm">Recipes you save will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-5">
          {recipes.map((recipe) => (
            <div 
              key={recipe.id} 
              onClick={() => handleRecipeClick(recipe.spoonacularRecipeId)}
              className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all group"
            >
              <div className="relative h-48 w-full bg-slate-50">
                <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                   Saved Recipe
                </div>
                
                <button 
                  onClick={(e) => removeFavorite(e, recipe.spoonacularRecipeId)} 
                  className="absolute top-3 right-3 p-2 z-10 bg-white/95 backdrop-blur rounded-full shadow-sm transition-all"
                >
                  <Heart size={18} strokeWidth={0} className="fill-rose-500 text-rose-500" />
                </button>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-[17px] text-slate-800 leading-tight group-hover:text-[#2d5a45] transition-colors">
                  {recipe.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL Z DETALAMI PRZEPISU (Skopiowany ze stylu Dashboardu) */}
      {selectedRecipeId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur rounded-full text-slate-500 hover:text-slate-800 hover:bg-white shadow-sm transition-all"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            {isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                <Sparkles className="animate-pulse mb-3 text-emerald-600/50" size={32} />
                <p className="font-medium text-sm">Getting recipe details...</p>
              </div>
            ) : recipeDetails ? (
              <div className="overflow-y-auto flex-1 hide-scrollbar">
                <div className="h-64 w-full relative bg-slate-50">
                  <img src={recipeDetails.image} alt={recipeDetails.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                  <h2 className=" text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                    {recipeDetails.title}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                      <Clock size={16} className="text-[#a3794b]" /> {recipeDetails.readyInMinutes} min
                    </div>
                    <div className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                      <Users size={16} className="text-[#a3794b]" /> {recipeDetails.servings} servings
                    </div>
                  </div>

                  {recipeDetails.instructions && (
                    <div className="space-y-3 pt-4">
                      <h3 className="text-lg font-bold text-slate-800">Instructions</h3>
                      <div 
                        className="text-slate-600 text-sm md:text-base leading-relaxed prose prose-rose prose-p:mb-4 prose-a:text-rose-600 prose-strong:text-slate-800" 
                        dangerouslySetInnerHTML={{ __html: recipeDetails.instructions }} 
                      />
                      <div className="pt-6 mt-4 border-t border-slate-100">
                    <button 
                      onClick={handleCookRecipe}
                      className="w-full bg-[#2d5a45] hover:bg-[#234735] text-white font-bold py-4 rounded-[1.5rem] flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      I cooked this! 
                    </button>
                    
                  </div>
                    </div>
                  )}

                  {recipeDetails.sourceUrl && (
                    <div className="pt-4 border-t border-slate-100">
                      <a 
                        href={recipeDetails.sourceUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#f8f9fa] hover:bg-[#f1f3f5] text-slate-700 font-semibold py-4 rounded-2xl transition-colors"
                      >
                        Read full recipe on source 
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-red-500">Failed to load details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}