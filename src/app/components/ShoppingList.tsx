"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Check,
  Trash2,
  Plus,
  Sparkles,
  Search,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import {API_URL} from '../lib/api'

type ShoppingItem = {
  id: number;
  name: string;
  imageUrl?: string | null;
  completed: boolean;
};

type MasterProductSuggestion = {
  id: number;
  name: string;
  imageUrl?: string | null;
};

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Stany dla podpowiedzi ze słownika
  const [masterProducts, setMasterProducts] = useState<
    MasterProductSuggestion[]
  >([]);
  const [suggestions, setSuggestions] = useState<MasterProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchItems();
    fetchMasterProducts();
  }, []);

  const fetchMasterProducts = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch(`${API_URL}/api/master-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.content || [];
        setMasterProducts(list);
      }
    } catch (error) {
      console.error("Błąd pobierania słownika:", error);
    }
  };

  // Zamykanie listy podpowiedzi po kliknięciu poza nią
  useEffect(() => {
    const query = newItemName.trim().toLowerCase();
    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = masterProducts
      .filter((p) => p.name.toLowerCase().includes(query))
      .slice(0, 6);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [newItemName, masterProducts]);

  function ShoppingItemImage({
    imageUrl,
    name,
    completed = false,
    size = "md",
  }: {
    imageUrl?: string | null;
    name: string;
    completed?: boolean;
    size?: "sm" | "md";
  }) {
    const [hasError, setHasError] = useState(false);
    const showImage = Boolean(imageUrl?.trim()) && !hasError;

    const boxSize =
      size === "sm" ? "w-8 h-8 rounded-lg" : "w-10 h-10 rounded-xl";

    return (
      <div
        className={`${boxSize} flex items-center justify-center flex-shrink-0 overflow-hidden transition-all ${
          showImage
            ? "bg-white border border-slate-100"
            : completed
              ? "bg-slate-100 text-slate-400"
              : "bg-white text-emerald-700"
        } ${completed && showImage ? "opacity-50 grayscale" : ""}`}
      >
        {showImage ? (
          <img
            src={imageUrl!}
            alt={name}
            onError={() => setHasError(true)}
            className="w-full h-full object-contain "
          />
        ) : (
          <ShoppingBag size={24} strokeWidth={2} />
        )}
      </div>
    );
  }

  const fetchItems = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch(`${API_URL}/api/shopping-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
    } catch (error) {
      console.error("Błąd pobierania listy zakupów:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItemToBackend = async (name: string, imageUrl?: string | null) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch(`${API_URL}/api/shopping-list`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), imageUrl: imageUrl || null }),
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems((prev) => [newItem, ...prev]);
        setNewItemName("");
        setSuggestions([]);
        setShowSuggestions(false);
        toast.success(`Product added to your list`);
      }
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const manuallyAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    await addItemToBackend(newItemName, null);
  };

  const handleSelectSuggestion = async (
    suggestion: MasterProductSuggestion,
  ) => {
    await addItemToBackend(suggestion.name, suggestion.imageUrl);
  };

  const toggleItem = async (id: number, currentStatus: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      await fetch(`${API_URL}/api/shopping-list/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      toast.error("Oops, something went wrong.");
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: currentStatus } : item,
        ),
      );
    }
  };

  const deleteItem = async (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      await fetch(`${API_URL}/api/shopping-list/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
      fetchItems();
    }
  };

  const clearCompleted = async () => {
    const completed = items.filter((i) => i.completed);
    if (completed.length === 0) return;

    setItems((prev) => prev.filter((i) => !i.completed));
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      await Promise.all(
        completed.map((item) =>
          fetch(`${API_URL}/api/shopping-list/${item.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );
      toast.success("Completed items cleared");
    } catch (error) {
      toast.error("Failed to clear completed items");
      fetchItems();
    }
  };

  const activeCount = items.filter((i) => !i.completed).length;
  const hasCompleted = items.some((i) => i.completed);

  const filteredItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => Number(a.completed) - Number(b.completed));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Sparkles
          className="animate-pulse mb-3 text-emerald-600/50"
          size={32}
        />
        <p className="text-sm font-medium">Loading your list...</p>
      </div>
    );
  }

  return (
    <div className=" pb-24">
      <div className="bg-white border border-slate-200/70 rounded-[1.5rem] shadow-sm">
        {/* Górna sekcja karty */}
        <div className="p-5 md:p-7 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-800">
                  Shopping list
                </h2>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {activeCount} to buy
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Everything you need for your next kitchen restock.
              </p>
            </div>

            {hasCompleted && (
              <button
                onClick={clearCompleted}
                className="text-xs md:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors pt-1 flex-shrink-0"
              >
                Clear completed
              </button>
            )}
          </div>

          {/* Wyszukiwarka + Dodawanie z podpowiedziami */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search your shopping list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full  border border-slate-200/80 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#2d5a45]/40 focus:ring-2 focus:ring-[#2d5a45]/10 transition-all"
              />
            </div>

            {/* Kontener z dropdownem podpowiedzi */}
            <div className="relative" ref={dropdownRef}>
              <form
                onSubmit={manuallyAddItem}
                className="flex rounded-xl overflow-hidden border border-slate-200/80  focus-within:bg-white focus-within:border-[#2d5a45]/40 focus-within:ring-2 focus-within:ring-[#2d5a45]/10 transition-all"
              >
                <input
                  type="text"
                  placeholder="Add an item..."
                  value={newItemName}
                  onFocus={() =>
                    suggestions.length > 0 && setShowSuggestions(true)
                  }
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none min-w-0"
                />
                <button
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="bg-[#2d5a45] hover:bg-[#234735] disabled:bg-[#9bb0a3] text-white px-5 py-3 text-sm font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  Add
                </button>
              </form>

              {/* Lista podpowiedzi ze słownika */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden divide-y divide-slate-50">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <ShoppingItemImage
                        imageUrl={suggestion.imageUrl}
                        name={suggestion.name}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {suggestion.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista produktów */}
        {items.length === 0 ? (
          <div className="text-center py-16 text-slate-400 flex flex-col items-center px-4">
            <div className="w-14 h-14 bg-[#f8f9f8] border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingCart className="text-[#4e6c50]/60" size={24} />
            </div>
            <h3 className="text-slate-700 font-bold mb-1">
              Your list is empty
            </h3>
            <p className="text-sm">
              Add items above or directly from a recipe.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No items match &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-5 md:px-7 py-4 hover:bg-slate-50/60 transition-colors group"
              >
                <div
                  onClick={() => toggleItem(item.id, item.completed)}
                  className="flex items-center gap-4 flex-1 cursor-pointer min-w-0"
                >
                  {/* Kwadratowy zaokrąglony checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                      item.completed
                        ? "bg-[#4e6c50] border-[#4e6c50] text-white"
                        : "bg-white border-slate-300 group-hover:border-[#4e6c50]"
                    }`}
                  >
                    {item.completed && <Check size={13} strokeWidth={3} />}
                  </div>

                  {/* Zdjęcie produktu ze słownika LUB domyślna ikonka */}
                  <ShoppingItemImage
                    imageUrl={item.imageUrl}
                    name={item.name}
                    completed={item.completed}
                  />

                  {/* Nazwa produktu */}
                  <span
                    className={`font-semibold text-[15px] truncate transition-colors ${
                      item.completed
                        ? "line-through text-slate-400"
                        : "text-slate-800"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>

                {/* Przycisk usuwania */}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all ml-2 flex-shrink-0"
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
