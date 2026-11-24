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
  ExternalLink,
} from "lucide-react";
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

  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // Pobieranie polubionych przepisów po wejściu w sekcję
  // Pobieranie polubionych przepisów po wejściu w sekcję
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;

        const res = await fetch("http://localhost:8080/api/saved-recipes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const savedRecipes = await res.json();
          const ids = savedRecipes.map((r: any) => r.spoonacularRecipeId);
          setFavoriteIds(new Set(ids));
        } else {
          // Świadome przechwycenie błędów z backendu
          const errorText = await res.text();
          console.error(
            "Backend odmówił wydania ulubionych. Status:",
            res.status,
            errorText,
          );
        }
      } catch (error) {
        console.error(
          "Błąd sieci podczas pobierania ulubionych przepisów:",
          error,
        );
      }
    };

    if (isVisible) {
      fetchFavorites();
    }
  }, [isVisible]);

  const toggleFavorite = async (e: React.MouseEvent, recipe: any) => {
    e.preventDefault(); // Zapobiega domyślnym akcjom przeglądarki
    e.stopPropagation(); // Blokuje kliknięcie w kartę (modal)

    console.log("Kliknięto przepis ID:", recipe.id); // <-- TEST
    console.log("Czy był już w ulubionych?", favoriteIds.has(recipe.id));

    const isCurrentlyFav = favoriteIds.has(recipe.id);

    // Optimistic UI Update - błyskawiczna zmiana koloru serduszka
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyFav) newSet.delete(recipe.id);
      else newSet.add(recipe.id);
      return newSet;
    });

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      let response;

      if (isCurrentlyFav) {
        response = await fetch(
          `http://localhost:8080/api/saved-recipes/${recipe.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        response = await fetch("http://localhost:8080/api/saved-recipes", {
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
      }

      // Wymuszamy wejście do bloku catch, jeśli Spring Boot zwrócił błąd 4xx lub 5xx
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Błąd na backendzie:", response.status, errorText);
        throw new Error(`Odrzucono żądanie: ${response.status}`);
      }
    } catch (error) {
      console.error(
        "Cofanie wizualnej zmiany serduszka z powodu błędu:",
        error,
      );
      // W przypadku błędu przywracamy poprzedni stan serduszka w UI
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyFav) newSet.add(recipe.id);
        else newSet.delete(recipe.id);
        return newSet;
      });
    }
  };

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
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              data: fetchedRecipes,
            }),
          );
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

      const res = await fetch(
        `http://localhost:8080/api/recipes/${id}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
  const selectedBaseRecipe = recipes.find((r) => r.id === selectedRecipeId);

  return (
    <div
      id="recipe-inspiration-section"
      className="pt-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-500"
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1.5">
          <Sparkles size={20} className="text-[#2d5a45]" />A little
          fridge-to-table inspiration
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
          Simple recipes. Ingredients you already have. Nothing wasted.
        </p>
      </div>

      {isLoadingList ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Sparkles
            className="animate-pulse mb-3 text-emerald-600/50"
            size={32}
          />
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
                    <Check
                      size={14}
                      className="text-emerald-500 flex-shrink-0"
                    />
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
                  <h2 className="absolute bottom-6 left-6 right-6 text-2xl md:text-3xl font-bold text-white leading-tight">
                    {recipeDetails.title}
                  </h2>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Pigułki z czasem i porcjami */}
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

                  {/* Instrukcje Krok po Kroku */}
                  {recipeDetails.instructions && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        Instructions
                      </h3>
                      <div
                        className="text-slate-600 text-sm md:text-base leading-relaxed prose prose-emerald prose-p:mb-4 prose-a:text-emerald-600 prose-strong:text-slate-800"
                        dangerouslySetInnerHTML={{
                          __html: recipeDetails.instructions,
                        }}
                      />
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
