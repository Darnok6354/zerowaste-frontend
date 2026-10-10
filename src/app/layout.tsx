import type { Metadata } from "next";
import { Inter, Fahkwang } from "next/font/google";
import "./globals.css";
import BottomNav from "@/app/components/BottomNav";
import TopBar from "@/app/components/TopBar";
import { Toaster } from 'react-hot-toast';
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
      <body className={`${inter.variable} ${fahkwang.variable} font-sans bg-slate-50 text-slate-900 antialiased  `}>
        <TopBar />
        {/* Kontener na główną treść aplikacji, odsunięty od dołu na telefonach żeby pasek niczego nie zasłaniał */}
        <main className="pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
        
        {/* Nasz nowy mobilny pasek nawigacyjny */}
        <BottomNav />
        
        <ToastProvider/>
      </body>
    </html>
  );
}