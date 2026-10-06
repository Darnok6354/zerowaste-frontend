
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../app/lib/supabase'

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard'); // Zalogowany -> do spiżarni
      } else {
        router.push('/login'); // Niezalogowany -> do logowania
      }
    };

    checkAuth();
  }, [router]);

  // Zwracamy pusty ekran lub prosty napis na czas ułamka sekundy, gdy aplikacja sprawdza sesję
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500 font-medium">Ładowanie aplikacji...</p>
    </div>
  );
}