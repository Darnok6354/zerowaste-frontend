import { Clock, Sparkles } from "lucide-react";

export default function ExpiringSoonCard() {
  return (
    <div className="bg-[#FFF8F0] border border-orange-100/50 rounded-3xl p-5 md:p-6 shadow-sm">
      {/* Nagłówek karty */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 text-orange-600 p-1.5 rounded-xl">
            <Clock size={20} strokeWidth={2.5} />
          </div>
          <h2 className="font-heading font-semibold text-lg text-slate-800">
            Expiring soon
          </h2>
        </div>
        <div className="bg-white text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-100 shadow-sm">
          2
        </div>
      </div>

      {/* Podtytuł */}
      <p className="text-sm text-slate-600 mb-5 leading-relaxed">
        A little love before it&apos;s too late. Let&apos;s put these ingredients to good use.
      </p>

      {/* Siatka produktów (2 kolumny) */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Produkt 1: Jajka */}
        <div className="bg-white rounded-2xl p-3 border border-orange-50 shadow-sm flex flex-col justify-between h-full">
          <div className="flex items-start gap-3 px-2">
            <div className="flex flex-col">
              <span className="font-medium text-sm text-slate-800">Eggs</span>
              <span className="text-[11px] text-slate-500">4 pcs left</span>
            </div>
          </div>
          <div className="bg-orange-50 text-orange-700 text-[11px] font-semibold px-2 py-1 rounded-md w-fit mt-3">
            In 2 days
          </div>
        </div>

        {/* Produkt 2: Mleko */}
        <div className="bg-white rounded-2xl p-3 border border-orange-50 shadow-sm flex flex-col justify-between h-full">
          <div className="flex items-start gap-3 px-2">
            <div className="flex flex-col">
              <span className="font-medium text-sm text-slate-800">Milk</span>
              <span className="text-[11px] text-slate-500">1 L left</span>
            </div>
          </div>
          <div className="bg-orange-50 text-orange-700 text-[11px] font-semibold px-2 py-1 rounded-md w-fit mt-3">
            In 3 days
          </div>
        </div>
      </div>

      {/* Główny przycisk akcji */}
      <button className="w-full bg-[#1A4D2E] hover:bg-[#133c23] text-white rounded-xl py-4 px-4 font-medium flex items-center justify-center gap-2 transition-colors shadow-md">
        <Sparkles size={20} />
        Generate Recipes
      </button>

      {/* Stopka karty */}
      <div className="text-center mt-4">
        <span className="text-[10px] text-slate-400 font-medium tracking-wide">
          Good food deserves a second chance.
        </span>
      </div>
    </div>
  );
}