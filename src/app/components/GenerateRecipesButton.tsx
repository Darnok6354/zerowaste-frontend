"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GenerateRecipesButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.push('/recipes')}
      className="bg-[#2d5a45] hover:bg-[#234735] text-white w-full rounded-2xl py-4 flex items-center justify-between px-6 transition-colors font-medium mt-1 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span>Generate Recipes</span>
      </div>
      <span>→</span>
    </button>
  );
}