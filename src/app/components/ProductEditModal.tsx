"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

// Typ bazujący na Twoim backendowym ProductResponse
type Product = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  status: string;
  imageUrl?: string;
  masterProductId: number;
  location: string;
};

interface ProductEditModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  // NOWE: Funkcja przekazywana z rodzica, która zajmie się powiadomieniem i odświeżeniem
  onSuccess: (message: string) => void; 
}

export default function ProductEditModal({ product, isOpen, onClose, onSuccess }: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    quantity: product.quantity,
    unit: product.unit,
    location: product.location || "FRIDGE",
    expirationDate: product.expirationDate,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const getAuthToken = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData.session?.access_token;
  };

  // 1. Zapisywanie zmian (PUT)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      const payload = {
        masterProductId: product.masterProductId,
        quantity: formData.quantity,
        unit: formData.unit.toUpperCase(),
        expirationDate: formData.expirationDate,
        location: formData.location
      };

      const res = await fetch(`http://localhost:8080/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Zamiast zamykać i robić toasta tutaj, delegujemy to do rodzica
        onSuccess('Product updated!');
      }
    } catch (error) {
      console.error("Error updating product", error);
      alert('Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Oznaczanie jako zjedzone / wyrzucone (PATCH)
  const handleLifecycle = async (status: 'CONSUMED' | 'WASTED') => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`http://localhost:8080/api/products/${product.id}/lifecycle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lifecycleStatus: status,
          wasteReason: status === 'WASTED' ? 'Spoiled' : null
        })
      });

      if (res.ok) {
        onSuccess(status === 'CONSUMED' ? 'Marked as consumed!' : 'Marked as wasted ');
      }
    } catch (error) {
      console.error("Error updating product lifecycle", error);
      alert('Failed to update product lifecycle');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Całkowite usunięcie (DELETE)
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`http://localhost:8080/api/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        onSuccess('Product deleted');
      }
    } catch (error) {
      console.error("Error deleting product", error);
      alert('Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-lg">Edit {product.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
             ✕ 
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-6 max-[300px]:grid-cols-1">
            <button 
              type="button"
              onClick={() => handleLifecycle('CONSUMED')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
               Consumed
            </button>
            <button 
              type="button"
              onClick={() => handleLifecycle('WASTED')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
               Wasted
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-slate-400">or edit details</span></div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 max-[300px]:grid-cols-1">
              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Quantity</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Unit</label>
                <select 
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="PCS">PCS</option>
                  <option value="KG">KG</option>
                  <option value="G">G</option>
                  <option value="L">L</option>
                  <option value="ML">ML</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-[300px]:grid-cols-1">
              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Location</label>
                <select 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="FRIDGE">Fridge</option>
                  <option value="FREEZER">Freezer</option>
                  <option value="PANTRY">Pantry</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Expiration</label>
                <input 
                  type="date"
                  required
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex min-[300px]:items-center justify-between max-[300px]:flex-col-reverse gap-3 " >
              <button 
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-sm font-medium text-slate-400 hover:text-red-600 transition-colors "
              >
                Delete permanently
              </button>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-green-800 hover:bg-green-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-70"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}