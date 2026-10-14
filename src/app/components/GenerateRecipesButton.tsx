"use client";

import { Sparkles } from "lucide-react";

export default function GenerateRecipesButton() {
  const handleClick = () => {
    // 1. Wysyłamy sygnał do drugiego komponentu, żeby zaczął pobierać przepisy
    window.dispatchEvent(new Event("show-recipes"));
    
    // 2. Przewijamy stronę do sekcji przepisów (która za ułamek sekundy się pojawi)
    setTimeout(() => {
      document.getElementById("recipe-inspiration-section")?.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  };

  return (
    <button 
      onClick={handleClick}
      className="bg-[#2d5a45] hover:bg-[#234735] text-white w-full rounded-2xl py-4 flex items-center justify-between px-6 transition-colors font-medium mt-1"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-emerald-200" />
        <span>Generate Recipes</span>
      </div>
      <span>→</span>
    </button>
  );
}