import type { Metadata } from "next";
import { Inter, Fahkwang } from "next/font/google";
import "./globals.css";
import BottomNav from "@/app/components/BottomNav";
import TopBar from "@/app/components/TopBar";
import DesktopSidebar from "@/app/components/DesktopSidebar"; // Dodany import
import ToastProvider from "@/app/components/ToastProvider";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });
const fahkwang = Fahkwang({ 
  weight: ['400', '500', '700'], 
  subsets: ["latin", "latin-ext"],
  variable: "--font-fahkwang" 
});

export const metadata: Metadata = {
  title: "Zero Waste App",
  description: "Manage your fridge and reduce food waste.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${inter.variable} ${fahkwang.variable} font-sans bg-slate-50 text-slate-900 antialiased`}>
        
        {/* Główny kontener ekranu. Na desktopach ustawiony jako Flexbox (lewa i prawa strona) */}
        <div className="flex min-h-screen">
          
          {/* Pasek Boczny - Znika na telefonach (hidden), pojawia się od szerokości "md" (md:flex) */}
          <DesktopSidebar />

          {/* Prawa strona (Główna zawartość) */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* TopBar może wymagać ukrycia na komputerach, jeśli funkcje logowania masz też w Sidebarze. 
                Jeśli zostaje, klasa md:px-8 doda mu oddechu na szerokim ekranie. */}
            <TopBar />
            
            {/* Główna sekcja z paddingiem na dole dla telefonów (żeby BottomNav nie zasłaniał treści) 
                oraz z większymi marginesami bocznymi na komputerach (md:p-8) */}
            <main className="flex-1 pb-20 md:pb-12 md:p-8 w-full max-w-7xl mx-auto">
              {children}
            </main>
          
          </div>
        </div>
        
        {/* Pasek Dolny - Ukryty na komputerach dzięki klasie "md:hidden" (o ile masz ją wewnątrz pliku BottomNav) */}
        <BottomNav />
        
        <ToastProvider/>
      </body>
    </html>
  );
}