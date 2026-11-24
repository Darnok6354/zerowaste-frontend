"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Heart,
  Clock,
  Check,
  Leaf,
  ArrowRight,
  X,
  Users,
  Plus,
  ChefHat,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import {API_URL} from '../lib/api'

const CACHE_KEY = "fridge_suggested_recipes";
const CACHE_EXPIRY_MS = 3 * 60 * 60 * 1000;

export default function SuggestedRecipes() {
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // Stany dla modala z detalami
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [recipeDetails, setRecipeDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // 1. Ładowanie startowe (cache lub API, plus ulubione)
  useEffect(() => {
    const init = async () => {
      // Pobierz ulubione
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          const resFav = await fetch(
            `${API_URL}/api/saved-recipes`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (resFav.ok) {
            const savedRecipes = await resFav.json();
            setFavoriteIds(
              new Set(savedRecipes.map((r: any) => r.spoonacularRecipeId)),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }

      // Pobierz przepisy z cache
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
          setRecipes(data);
          setIsLoadingList(false);
          return;
        }
      }

      // Jeśli nie ma cache, pobierz z API
      await fetchNewRecipes();
    };

    init();
  }, []);

  // 2. Funkcja wymuszająca pobranie nowych przepisów z API
  const fetchNewRecipes = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoadingList(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${API_URL}/api/recipes/suggested`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const fetchedRecipes = await res.json();
        setRecipes(fetchedRecipes);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            data: fetchedRecipes,
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching new recipes:", error);
    } finally {
      setIsLoadingList(false);
      setIsRefreshing(false);
    }
  };

  // 3. Obsługa ulubionych (identyczna jak robiliśmy wcześniej)
  const toggleFavorite = async (e: React.MouseEvent, recipe: any) => {
    e.stopPropagation();
    const isCurrentlyFav = favoriteIds.has(recipe.id);

    // Optimistic UI
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyFav) newSet.delete(recipe.id);
      else newSet.add(recipe.id);
      return newSet;
    });

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      let response = isCurrentlyFav
        ? await fetch(`${API_URL}/api/saved-recipes/${recipe.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        : await fetch(`${API_URL}/api/saved-recipes`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              spoonacularRecipeId: recipe.id,
              title: recipe.title,
              imageUrl: recipe.image,
            }),
          });

      if (!response.ok) throw new Error("Failed to update favorite");

      // Sukces - wyświetlamy toasta
      if (isCurrentlyFav) {
        toast.success("Recipe removed from favorites");
      } else {
        toast.success("Recipe saved to favorites! ");
      }
    } catch (error) {
      // Błąd - cofamy UI i wyświetlamy błąd
      toast.error("Oops, something went wrong.");
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyFav) newSet.add(recipe.id);
        else newSet.delete(recipe.id);
        return newSet;
      });
    }
  };
  // 4. Detale i Modal
  const handleRecipeClick = async (id: number) => {
    setSelectedRecipeId(id);
    setIsLoadingDetails(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch(
        `${API_URL}/api/recipes/${id}/details`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) setRecipeDetails(await res.json());
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

  const handleCookRecipe = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedBaseRecipe) return;

    // Przygotowujemy listę użytych składników z przepisu
    const ingredientsToConsume = selectedBaseRecipe.usedIngredients.map((ing: any) => ({
      name: ing.name,
      amount: ing.amount || 1.0 // Zabezpieczenie, gdyby Spoonacular nie podał ilości
    }));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const res = await fetch(`${API_URL}/api/products/cook-suggested`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ingredients: ingredientsToConsume })
      });

      if (!res.ok) throw new Error("Błąd podczas gotowania");
      
      toast.success("Used ingredients have been removed from your fridge", { duration: 4000 });
      closeModal(); // Zamykamy modal po sukcesie
      
      // Opcjonalnie możemy wymusić odświeżenie propozycji przepisów, bo zmienił się stan lodówki:
      // fetchNewRecipes(true); 

    } catch (error) {
      toast.error("Failed to update your fridge inventory.");
    }
  };

  const addToShoppingList = async (
    e: React.MouseEvent,
    ingredientName: string,
  ) => {
    e.stopPropagation();
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`${API_URL}/api/shopping-list`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: ingredientName }),
      });

      if (!res.ok) throw new Error("Błąd dodawania do listy");
      toast.success(`${ingredientName} added to shopping list! `);
    } catch (error) {
      toast.error("Failed to add item to shopping list.");
    }
  };

  const selectedBaseRecipe = recipes.find((r) => r.id === selectedRecipeId);

  return (
    <div className="pb-12 animate-in fade-in duration-500">
      {/* Przycisk wymuszający nowe generowanie */}
      <button
        onClick={() => fetchNewRecipes(true)}
        disabled={isLoadingList || isRefreshing}
        className="w-full mb-8 bg-[#2d5a45] hover:bg-[#234735] text-white rounded-2xl py-4 flex items-center justify-center gap-3 transition-colors font-bold shadow-sm disabled:opacity-50"
      >
        {isRefreshing ? "Cooking up new ideas..." : "Generate Recipes"}
      </button>

      {/* Lista */}
      {isLoadingList ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Sparkles
            className="animate-pulse mb-3 text-emerald-600/50"
            size={32}
          />
          <p className="text-sm font-medium">Reading your fridge...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>No ingredients to cook with right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-5">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => handleRecipeClick(recipe.id)}
              className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all group"
            >
              <div className="relative h-48 w-full bg-slate-50">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                  <Leaf size={12} className="text-[#2d5a45]" /> Fridge-friendly
                </div>
                <button
                  onClick={(e) => toggleFavorite(e, recipe)}
                  className="absolute top-3 right-3 p-2 z-10 bg-white/95 backdrop-blur rounded-full text-slate-400 hover:text-rose-500 shadow-sm transition-all"
                >
                  <Heart
                    size={18}
                    strokeWidth={favoriteIds.has(recipe.id) ? 0 : 2.5}
                    className={
                      favoriteIds.has(recipe.id)
                        ? "fill-rose-500 text-rose-500 drop-shadow-sm"
                        : ""
                    }
                  />
                </button>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-[17px] text-slate-800 leading-tight pr-4 group-hover:text-[#2d5a45] transition-colors">
                    {recipe.title}
                  </h3>
                  <ArrowRight
                    size={18}
                    className="text-slate-400 flex-shrink-0 group-hover:translate-x-1 transition-transform"
                  />
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
                    <span className="truncate">
                      Uses{" "}
                      {recipe.usedIngredients
                        .map((i: any) => i.name)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL Z DETALAMI (Identyczny jak wcześniej) */}
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
                <Sparkles
                  className="animate-pulse mb-3 text-emerald-600/50"
                  size={32}
                />
                <p className="font-medium text-sm">Getting recipe details...</p>
              </div>
            ) : recipeDetails ? (
              <div className="overflow-y-auto flex-1 hide-scrollbar">
                <div className="h-64 w-full relative bg-slate-50">
                  <img
                    src={recipeDetails.image}
                    alt={recipeDetails.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div className="p-6 md:p-8 space-y-8">
                  <h2 className=" text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                    {recipeDetails.title}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                      <Clock size={16} className="text-[#a3794b]" />{" "}
                      {recipeDetails.readyInMinutes} min
                    </div>
                    <div className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                      <Users size={16} className="text-[#a3794b]" />{" "}
                      {recipeDetails.servings} servings
                    </div>
                  </div>
                  {selectedBaseRecipe && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      <div>
                        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                          {" "}
                          Ingredients you have
                        </h3>
                        <ul className="space-y-2">
                          {selectedBaseRecipe.usedIngredients.map(
                            (ing: any) => (
                              <li
                                key={ing.id}
                                className="text-sm text-slate-600 flex items-start gap-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                                <span className="leading-tight">
                                  {ing.original}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                      {selectedBaseRecipe.missedIngredients?.length > 0 && (
                        <div>
                          <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                            Missing ingredients
                          </h3>
                          <ul className="space-y-2">
                            {selectedBaseRecipe.missedIngredients.map(
                              (ing: any) => (
                                <li
                                  key={ing.id}
                                  className="text-sm text-slate-600 flex items-center justify-between gap-2 group border-b border-slate-50 pb-2 last:border-0"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></span>
                                    <span className="leading-tight">
                                      {ing.original}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) =>
                                      addToShoppingList(e, ing.name)
                                    }
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex-shrink-0"
                                    title="Add to shopping list"
                                  >
                                    <Plus size={18} strokeWidth={2.5} />
                                  </button>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {recipeDetails.instructions && (
                    <div className="space-y-3 pt-6 border-t border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800">
                        Instructions
                      </h3>
                      <div
                        className="text-slate-600 text-sm md:text-base leading-relaxed prose prose-emerald prose-p:mb-4 prose-a:text-emerald-600 prose-strong:text-slate-800"
                        dangerouslySetInnerHTML={{
                          __html: recipeDetails.instructions,
                        }}
                      />
                      {/* NOWY PRZYCISK: Ugotowałem to! */}
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
                        Read full recipe on source{" "}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-red-500">
                Failed to load details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
