import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { Leaf } from "lucide-react";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 w-full">
      <div className="flex items-center justify-between px-4 h-14 md:px-8 max-w-7xl mx-auto">
        {/* Lewa strona: Logo[cite: 7] */}
        <div className="flex items-center gap-3 px-2 md:hidden ">
        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
          <Leaf size={24} strokeWidth={2.5} />
        </div>
        <Link href="/" >
          <span className="font-bold text-xl text-slate-800 tracking-tight">ZeroWaste</span>
        </Link>
      </div>

        
      </div>
    </header>
  );
}
