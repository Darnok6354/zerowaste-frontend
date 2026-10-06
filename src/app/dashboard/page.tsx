// Usunęliśmy 'use client', router i supabase. Strona znów jest Server Componentem.
import MyFridgeList from '../components/MyFridgeList';
// import ExpiringSoonCard from '../components/ExpiringSoonCard'; // Odkomentuj gdy dodasz
import DashboardStats from '../components/DashboardStats';
import LogoutButton from '../components/LogoutButton';

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto md:max-w-7xl md:grid md:grid-cols-12 md:gap-8">
      
      {/* Mobilny nagłówek */}
      <header className="mb-6 md:hidden">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          • Less waste, more good
        </p>
        <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">
          Good morning, Konrad ☀️
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Here&apos;s what&apos;s fresh in your kitchen. Let&apos;s make the most of it.
        </p>
      </header>

      {/* Lewa kolumna (Główna zawartość) */}
      <div className="md:col-span-8 flex flex-col">
        <div className="hidden md:block mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            • Less waste, more good
          </p>
          <h1 className="text-4xl font-heading font-bold text-slate-800 mb-2">
            Good morning, Konrad ☀️
          </h1>
          <p className="text-slate-500">
            Here&apos;s what&apos;s fresh in your kitchen. Let&apos;s make the most of it.
          </p>
        </div>
        
        <DashboardStats />

        {/* Tabela "My fridge" wyląduje tutaj na dużych ekranach */}
        <div className=" md:block mt-2">
            <MyFridgeList />
        </div>
      </div>
      
      {/* Kliencki przycisk wylogowania wyizolowany w swoim własnym komponencie */}
      <div className="md:col-span-12">
        <LogoutButton />
      </div>

    </div>
  );
}