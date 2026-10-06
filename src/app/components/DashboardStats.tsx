import { Refrigerator, Clock, Leaf, TrendingUp } from "lucide-react";

export default function DashboardStats() {
  return (
    // Zmieniony kontener: domyślnie 1 kolumna, od ekranów 'sm' (małe tablety/duże telefony) - 3 kolumny
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      
      {/* Karta 1: Items in your fridge */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
        <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl w-fit mb-4">
          <Refrigerator size={20} strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Items in your fridge</p>
          <p className="text-3xl font-bold text-slate-800 font-heading mb-1">6</p>
          <p className="text-[10px] text-slate-400">fresh possibilities</p>
        </div>
      </div>

      {/* Karta 2: Need a little love */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
        <div className="bg-orange-50 text-orange-600 p-2 rounded-xl w-fit mb-4">
          <Clock size={20} strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Need a little love</p>
          <p className="text-3xl font-bold text-slate-800 font-heading mb-1">2</p>
          <p className="text-[10px] text-slate-400">expiring soon</p>
        </div>
      </div>

      {/* Karta 3: Food saved this month */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl w-fit">
            <Leaf size={20} strokeWidth={2} />
          </div>
          {/* Plakietka z trendem (12%) */}
         
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1">Food saved this month</p>
          <p className="text-3xl font-bold text-slate-800 font-heading mb-1">4.2</p>
          <p className="text-[10px] text-slate-400">kg of goodness</p>
        </div>
      </div>

    </div>
  );
}