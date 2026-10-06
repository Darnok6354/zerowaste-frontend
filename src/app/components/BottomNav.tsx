import Link from "next/link";
import { Home, Refrigerator, Heart, User } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        <Link 
          href="/" 
          className="flex flex-col items-center justify-center w-full text-emerald-800"
        >
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        
        <Link 
          href="/fridge" 
          className="flex flex-col items-center justify-center w-full text-slate-400 hover:text-emerald-800 transition-colors"
        >
          <Refrigerator size={24} />
          <span className="text-[10px] mt-1 font-medium">Fridge</span>
        </Link>
        
        <Link 
          href="/recipes" 
          className="flex flex-col items-center justify-center w-full text-slate-400 hover:text-emerald-800 transition-colors"
        >
          <Heart size={24} />
          <span className="text-[10px] mt-1 font-medium">Favorites</span>
        </Link>
        
        <Link 
          href="/profile" 
          className="flex flex-col items-center justify-center w-full text-slate-400 hover:text-emerald-800 transition-colors"
        >
          <User size={24} />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}