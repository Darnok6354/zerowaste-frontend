"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChefHat, Heart, User, ShoppingCart, Leaf } from "lucide-react";

export default function DesktopSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname?.startsWith(path);
  };

  const navItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "Recipes", path: "/recipes", icon: ChefHat },
    { name: "Shopping List", path: "/shopping-list", icon: ShoppingCart },
    { name: "Favorites", path: "/favorites", icon: Heart },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-100 sticky top-0 left-0 z-40 p-6">
      
      {/* Logo / Branding */}
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
          <Leaf size={24} strokeWidth={2.5} />
        </div>
        <Link href="/" >
          <span className="font-bold text-xl text-slate-800 tracking-tight">ZeroWaste</span>
        </Link>
      </div>

      {/* Menu Główne */}
      <nav className="flex-1 space-y-2">
        
        
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                active 
                  ? "bg-emerald-50 text-emerald-700 font-semibold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
              }`}
            >
              <Icon 
                size={22} 
                className={active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"} 
                strokeWidth={active ? 2.5 : 2} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      

    </aside>
  );
}