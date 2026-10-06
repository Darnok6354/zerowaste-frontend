'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // Importuj kliencką instancję supabase

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); 
  };

  return (
    <button 
      onClick={handleLogout}
      className="mt-8 rounded-md bg-red-600 px-4 py-2 text-white text-sm font-medium hover:bg-red-700 transition-colors"
    >
      Wyloguj się
    </button>
  );
}