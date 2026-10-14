"use client";

import { useState, useEffect } from "react";
import { Sparkles, Heart, Clock, Check, Leaf, ArrowRight, X, Users, ExternalLink, ShoppingCart } from "lucide-react";
import { supabase } from "../lib/supabase";


const CACHE_KEY = "fridge_suggested_recipes";
const CACHE_EXPIRY_MS = 3 * 60 * 60 * 1000; // 3 godziny w milisekundach

export default function RecipeInspirationSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);

  // Stany dla modala z detalami przepisu
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [recipeDetails, setRecipeDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

 // 1. EFEKT STARTOWY (Przywracanie po odświeżeniu strony)
  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
          setRecipes(data);
          setIsVisible(true); // Sekcja od razu staje się widoczna po wejściu na stronę!
        } else {
          localStorage.removeItem(CACHE_KEY); // Zbyt stare - usuwamy
        }
      } catch (e) {
        console.error("Error reading recipe cache:", e);
      }
    }
  }, []);

  // 2. OBSŁUGA PRZYCISKU (Kliknięcie "Generate Recipes")
  useEffect(() => {
    const handleShowRecipes = async () => {
      setIsVisible(true);
      
      // Jeśli przepisy zostały już załadowane z cache przez efekt startowy, nic nie robimy
      if (recipes.length > 0) return;

      setIsLoadingList(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        const res = await fetch("http://localhost:8080/api/recipes/suggested", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const fetchedRecipes = await res.json();
          setRecipes(fetchedRecipes);
          
          // Zapisujemy nowe wyniki do pamięci przeglądarki
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: fetchedRecipes
          }));
        }
      } catch (error) {
        console.error("Error fetching recipes :", error);
      } finally {
        setIsLoadingList(false);
      }
    };

    window.addEventListener("show-recipes", handleShowRecipes);
    return () => window.removeEventListener("show-recipes", handleShowRecipes);
  }, [recipes.length]);

  const handleRecipeClick = async (id: number) => {
    setSelectedRecipeId(id);
    setIsLoadingDetails(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`http://localhost:8080/api/recipes/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setRecipeDetails(await res.json());
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedRecipeId(null);
    setRecipeDetails(null);
  };

  if (!isVisible) return null;

  // Pobieramy bazowy przepis z listy, żeby mieć dostęp do podziału składników w modalu
  const selectedBaseRecipe = recipes.find(r => r.id === selectedRecipeId);

  return (
    <div id="recipe-inspiration-section" className="pt-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1.5">
          <Sparkles size={20} className="text-[#2d5a45]" />
          A little fridge-to-table inspiration
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
          Simple recipes. Ingredients you already have. Nothing wasted.
        </p>
      </div>

      {isLoadingList ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Sparkles className="animate-pulse mb-3 text-emerald-600/50" size={32} />
          <p className="text-sm font-medium">Cooking up ideas...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {recipes.map((recipe) => (
            <div 
              key={recipe.id} 
              onClick={() => handleRecipeClick(recipe.id)}
              className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all group"
            >
              <div className="relative h-48 w-full bg-slate-50">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                  <Leaf size={12} className="text-[#2d5a45]" /> Fridge-friendly
                </div>
                
                <button 
                  onClick={(e) => e.stopPropagation()} 
                  className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur rounded-full text-slate-400 hover:text-rose-500 shadow-sm transition-colors"
                >
                  <Heart size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-[17px] text-slate-800 leading-tight pr-4 group-hover:text-[#2d5a45] transition-colors">
                    {recipe.title}
                  </h3>
                  <ArrowRight size={18} className="text-slate-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>
                
                <p className="text-xs text-slate-500 mb-4">
                  A perfect match for your fridge. A lot of goodness.
                </p>
                
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} /> 15 min
                  </div>
                  <div className="w-px h-3 bg-slate-200"></div>
                  
                  <div className="flex items-center gap-1.5 truncate">
                    <Check size={14} className="text-emerald-500 flex-shrink-0" />
                    <span className="truncate">
                      Uses {recipe.usedIngredients.map((i: any) => i.name).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL Z DETALAMI PRZEPISU */}
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
                  <h2 className="absolute bottom-6 left-6 right-6 text-2xl md:text-3xl font-bold text-white leading-tight">
                    {recipeDetails.title}
                  </h2>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                  
                  {/* Pigułki z czasem i porcjami */}
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                      <Clock size={16} className="text-[#a3794b]" /> {recipeDetails.readyInMinutes} min
                    </div>
                    <div className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                      <Users size={16} className="text-[#a3794b]" /> {recipeDetails.servings} servings
                    </div>
                  </div>

                  {/* NOWA SEKCJA: LISTA SKŁADNIKÓW */}
                  {selectedBaseRecipe && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      
                      {/* Co masz w lodówce */}
                      <div>
                        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <Check size={18} className="text-emerald-500" />
                          Ingredients you have
                        </h3>
                        <ul className="space-y-2">
                          {selectedBaseRecipe.usedIngredients.map((ing: any) => (
                            <li key={ing.id} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                              <span className="leading-tight">{ing.original}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Czego Ci brakuje */}
                      {selectedBaseRecipe.missedIngredients?.length > 0 && (
                        <div>
                          <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <ShoppingCart size={18} className="text-orange-500" />
                            Missing ingredients
                          </h3>
                          <ul className="space-y-2">
                            {selectedBaseRecipe.missedIngredients.map((ing: any) => (
                              <li key={ing.id} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></span>
                                <span className="leading-tight">{ing.original}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Instrukcje Krok po Kroku */}
                  {recipeDetails.instructions && (
                    <div className="space-y-3 pt-6 border-t border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800">Instructions</h3>
                      <div 
                        className="text-slate-600 text-sm md:text-base leading-relaxed prose prose-emerald prose-p:mb-4 prose-a:text-emerald-600 prose-strong:text-slate-800" 
                        dangerouslySetInnerHTML={{ __html: recipeDetails.instructions }} 
                      />
                    </div>
                  )}

                  {/* Link zewnętrzny do źródła */}
                  {recipeDetails.sourceUrl && (
                    <div className="pt-4 border-t border-slate-100">
                      <a 
                        href={recipeDetails.sourceUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#f8f9fa] hover:bg-[#f1f3f5] text-slate-700 font-semibold py-4 rounded-2xl transition-colors"
                      >
                        Read full recipe on source <ExternalLink size={18} />
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