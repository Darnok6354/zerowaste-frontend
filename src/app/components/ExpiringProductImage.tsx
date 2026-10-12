"use client";

import { useState, useRef, useEffect } from "react";
import { Refrigerator } from "lucide-react";

interface Props {
  imageUrl?: string | null;
  name: string;
}

export default function ExpiringProductImage({ imageUrl, name }: Props) {
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Sprawdzamy, czy obrazek zakończył ładowanie zanim React podpiął event
    if (imgRef.current && imgRef.current.complete) {
      // Jeśli skończył się ładować, ale jego naturalna szerokość to 0, oznacza to błąd (np. 404)
      if (imgRef.current.naturalWidth === 0) {
        setHasError(true);
      }
    }
  }, [imageUrl]);

  if (!imageUrl || hasError) {
    return (
      <div className="text-emerald-700 flex items-center justify-center w-10 h-10">
        <Refrigerator size={24} strokeWidth={2} />
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageUrl}
      alt={name}
      onError={() => setHasError(true)}
      // Dodajemy color-transparent, aby ukryć domyślną, brzydką ikonkę przeglądarki przed załadowaniem JS
      className="w-10 h-10 object-contain rounded-xl text-transparent" 
    />
  );
}