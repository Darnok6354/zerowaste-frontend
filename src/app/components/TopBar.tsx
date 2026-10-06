import Link from "next/link";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 w-full">
      <div className="flex items-center justify-between px-4 h-14 md:px-8 max-w-7xl mx-auto">
        
        {/* Lewa strona: Logo[cite: 7] */}
        <Link href="/" className="flex items-center gap-2 text-emerald-800">
          <span className="font-heading font-bold text-lg tracking-tight">
            zero waste
          </span>
        </Link>

        
      </div>
    </header>
  );
}