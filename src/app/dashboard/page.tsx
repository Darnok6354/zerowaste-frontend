import MyFridgeList from '../components/MyFridgeList';
// import ExpiringSoonCard from '../components/ExpiringSoonCard'; // Odkomentuj gdy dodasz
import DashboardStats from '../components/DashboardStats';
import LogoutButton from '../components/LogoutButton';
import { createClient } from '../lib/server'; 

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Zmiana z getSession() na getUser() - bezpieczniejsze i gwarantuje świeże dane z serwera
  const { data: { user }, error } = await supabase.auth.getUser();

  let firstName = "chef";
  
  // Wyciągamy metadane z wyciągniętego obiektu 'user'
  if (user?.user_metadata) {
    const meta = user.user_metadata;
    // Sprawdzamy 'first_name' (nasza rejestracja) oraz 'full_name'/'name' (Google)
    const rawName = meta.first_name || meta.full_name || meta.name;
    
    if (rawName) {
      firstName = rawName.split(' ')[0]; 
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto md:max-w-7xl md:grid md:grid-cols-12 md:gap-8">
      
      {/* Mobilny nagłówek */}
      <header className="mb-6 md:hidden">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          • Less waste, more good
        </p>
        <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">
          Good morning, {firstName} ☀️
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
            Good morning, {firstName} ☀️
          </h1>
          <p className="text-slate-500">
            Here&apos;s what&apos;s fresh in your kitchen. Let&apos;s make the most of it.
          </p>
        </div>
        
        <DashboardStats />

        <div className="md:block mt-2">
            <MyFridgeList />
        </div>
      </div>
      
      <div className="md:col-span-12">
        <LogoutButton />
      </div>

    </div>
  );
}