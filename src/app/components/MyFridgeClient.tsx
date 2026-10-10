"use client";

import { useState, useMemo } from "react";
import { Refrigerator, Search, Plus, X } from "lucide-react";
import { getDaysUntilExpiration, formatDaysLeft } from "../utils/dateutils";
import { useRouter } from "next/navigation";
import ProductEditModal from "./ProductEditModal";
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  expirationDate?: string | null;
  imageUrl?: string | null;
  lifecycleStatus?: string; // Dodane do sprawdzania czy zjedzone
  masterProductId: number;  // Dodane
  location: string;
}



export default function MyFridgeClient({
  initialProducts,
  token,
}: {
  initialProducts: Product[];
  token: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "EXPIRING_SOON">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Stany modala i formularza
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    masterProductId: null as number | null, // <-- NOWE (zastępuje wysyłanie 'name')
    name: "", // Zostawiamy tylko do wyświetlania w polu tekstowym
    category: "Fruits & Vegetables",
    quantity: 1,
    unit: "PCS", // Zmiana na wielkie litery, by pasowało do Enuma w Javie
    expiresInDays: 7,
    location: "FRIDGE", // <-- NOWE
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Funkcja odpytująca Spring Boota o podpowiedzi ze słownika
  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(true);

    try {
      // Użycie nowego endpointu MasterProductController i wstrzyknięcie tokenu
      const res = await fetch(
        `http://localhost:8080/api/master-products?query=${value}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Błąd pobierania słownika:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Funkcja po kliknięciu w podpowiedź – automatycznie ustawia jednostkę i kategorię!
  const selectSuggestion = (suggestion: any) => {
    setFormData({
      ...formData,
      masterProductId: suggestion.id, // <-- ZAPISUJEMY ID
      name: suggestion.name,
      category: suggestion.defaultCategory || formData.category,
      unit: suggestion.defaultUnit || formData.unit,
      expiresInDays: suggestion.defaultDays || formData.expiresInDays,
    });
    setShowSuggestions(false);
  };

 const productsWithDynamicStatus = useMemo(() => {
    return initialProducts.map(product => {
      let displayStatus = product.status;
      const daysLeft = getDaysUntilExpiration(product.expirationDate);

      // Aktualizacja statusu tylko dla aktywnych produktów posiadających datę
      if (product.lifecycleStatus !== 'CONSUMED' && product.lifecycleStatus !== 'WASTED' && daysLeft !== null) {
        if (daysLeft < 0) {
          displayStatus = 'EXPIRED';
        } else if (daysLeft <= 2) {
          displayStatus = 'EXPIRING_SOON';
        } else {
          displayStatus = 'FRESH';
        }
      }

      // Zwracamy produkt wzbogacony o nowe, wyliczone "w locie" dane
      return { 
        ...product, 
        displayStatus, 
        daysLeft 
      };
    });
  }, [initialProducts]);

  // 2. Licznik zakładek oparty na zaktualizowanych danych
  const expiringSoonCount = productsWithDynamicStatus.filter(
    (p) => p.displayStatus === "EXPIRING_SOON"
  ).length;

  // 3. Filtrowanie korzystające z nowej tablicy
  const filteredProducts = useMemo(() => {
    return productsWithDynamicStatus.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        activeTab === "ALL" ? true : product.displayStatus === "EXPIRING_SOON";

      return matchesSearch && matchesTab;
    });
  }, [productsWithDynamicStatus, searchQuery, activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FRESH":
        return (
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Fresh
          </span>
        );
      case "EXPIRING_SOON":
        return (
          <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Use
            soon
          </span>
        );
      case "EXPIRED":
        return (
          <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Expired
          </span>
        );
      default:
        return null;
    }
  };

  // Obsługa zapisu do bazy
  const handleAddProduct = async () => {
    if (!formData.masterProductId) {
      alert("Please select a product from the suggestions");
      return;
    }

    setIsSubmitting(true);

    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + formData.expiresInDays);
      const formattedDate = expirationDate.toISOString().split("T")[0];

      // NOWY PAYLOAD IDEALNIE PASUJĄCY DO ProductRequest
      const payload = {
        masterProductId: formData.masterProductId,
        quantity: formData.quantity,
        unit: formData.unit.toUpperCase(), // Enumy w Springu zazwyczaj wymagają wielkich liter
        expirationDate: formattedDate,
        location: formData.location,
      };

      const response = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsModalOpen(false);
        // Reset do domyślnych
        setFormData({
          masterProductId: null,
          name: "",
          category: "Fruits & Vegetables",
          quantity: 1,
          unit: "PCS",
          expiresInDays: 7,
          location: "FRIDGE",
        });
        router.refresh();
        
      toast.success('Product added successfully!');
} else {
  toast.error('Failed to add product');
}
    } catch (error) {
      console.error("Błąd sieci:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-5  items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-heading font-bold text-lg text-slate-800">
                My fridge
              </h2>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {initialProducts.length} items
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              A little organization. A lot less waste.
            </p>

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "ALL"
                    ? "bg-[#f3f6f0] text-emerald-800"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                All items
              </button>
              <button
                onClick={() => setActiveTab("EXPIRING_SOON")}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "EXPIRING_SOON"
                    ? "bg-[#f3f6f0] text-emerald-800"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Expiring soon
                {expiringSoonCount > 0 && (
                  <span className="bg-orange-50 text-orange-600 text-[11px] px-1.5 py-0.5 rounded font-bold">
                    {expiringSoonCount}
                  </span>
                )}
              </button>
            </div>

            <div className="relative w-full ">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-50 border-t border-slate-50 flex-1">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
              <Refrigerator size={32} className="opacity-20" />
              <p>
                {initialProducts.length === 0
                  ? "Fridge is empty (or no access)."
                  : "No matching products found."}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const daysLeft = getDaysUntilExpiration(product.expirationDate);
              const daysLeftText = formatDaysLeft(daysLeft);

              return (
                <div
                  key={product.id}
                  onClick={() => setEditingProduct(product)}
                  className="p-5 grid grid-cols-1 min-[450px]:grid-cols-[1.5fr_1fr_1fr_1fr] min-[300px]:grid-cols-2 max-[450px]:gap-2 items-center justify-items-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center  gap-4 w-full max-[450px]:justify-start max-[300px]:justify-center">
                    {product.imageUrl ? (
                      <div
                        className="w-10 h-10 rounded-xl border border-slate-100 bg-contain bg-no-repeat bg-center bg-white flex-shrink-0"
                        style={{ backgroundImage: `url(${product.imageUrl})` }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl border border-slate-100 flex-shrink-0">
                        📦
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {product.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 flex items-center order-2 justify-center w-full max-[450px]:justify-start max-[450px]:order-3 max-[300px]:order-2 max-[300px]:justify-center">
                    {product.quantity} {product.unit.toLowerCase()}
                  </div>

                  <div className="flex items-center justify-center order-3 w-full max-[450px]:justify-end max-[450px]:order-2 max-[300px]:order-3 max-[300px]:justify-center">
  {/* ZMIANA: Zamiast product.status podajemy product.displayStatus */}
  {getStatusBadge(product.displayStatus)}
</div>

                  <div className="text-sm font-medium text-slate-500 flex items-center order-4 justify-center w-full max-[450px]:justify-end max-[450px]:px-2 max-[300px]:justify-center">
                    {daysLeftText}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dolny pasek dodawania przedmiotu */}
        <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
            Fresh food, fresh possibilities.
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-green-800 hover:text-green-900 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> Add an item
          </button>
        </div>
      </div>

      {/* Modal / Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Nagłówek modala */}
            <div className="p-6 pb-4 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-[22px] font-bold text-slate-800 mb-1 leading-tight tracking-tight w-9/10">
                Something fresh for your fridge
              </h2>
              <p className="text-sm text-slate-500">
                Add an ingredient. We'll help you make the most of it.
              </p>
            </div>

            {/* Formularz modala */}
            <div className="p-6 pt-0 space-y-4">
              {/* Sekcja Nazwy z Autouzupełnianiem */}
              <div className="relative">
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
                  Food name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Milk, Cherry tomatoes"
                  value={formData.name}
                  onChange={handleNameChange}
                  onFocus={() =>
                    formData.name.length >= 2 && setShowSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  } // Timeout, żeby zdążyć kliknąć w wynik
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />

                {/* Lista podpowiedzi */}
                {showSuggestions && (suggestions.length > 0 || isSearching) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-3 text-sm text-slate-400 text-center">
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectSuggestion(item)}
                          className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <span className="text-sm font-medium text-slate-700">
                            {item.name}
                          </span>
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {item.defaultCategory}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                >
                  <option value="FRIDGE">Fridge</option>
                  <option value="FREEZER">Freezer</option>
                  <option value="PANTRY">Pantry</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
                  Expires in (days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.expiresInDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expiresInDays: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Stopka modala */}
            <div className="p-6 pt-4 flex justify-between  gap-3 border-t border-slate-50 mt-2 max-[350px]:flex-col-reverse">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={isSubmitting}
                className={`px-4 py-2 text-white rounded-lg  text-sm font-medium flex items-center gap-1.5 transition-colors max-[350px]:w-full max-[350px]:justify-center ${
                  isSubmitting
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-[#2d5f43] hover:bg-[#244c35]"
                }`}
              >
                <Plus size={16} />
                {isSubmitting ? "Adding..." : "Add to my fridge"}
              </button>
            </div>
          </div>
        </div>
      )}
      {editingProduct && (
  <ProductEditModal 
    product={editingProduct} 
    isOpen={!!editingProduct} 
    onClose={() => setEditingProduct(null)} 
    onSuccess={(message) => {
      setEditingProduct(null); // Zamykamy modal
      toast.success(message);  // Wywołujemy toasta z prawidłowego miejsca
      router.refresh();        // Odświeżamy dane
    }}
  />
)}
    </>
  );
}
