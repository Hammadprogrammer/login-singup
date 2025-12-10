'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface HomeSliderResponse {
  id: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

const AUTO_SLIDE_DURATION = 3000;

const FullScreenImageSlider: React.FC = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "https://login-singup-six.vercel.app/api/dashboard/homeslider";

  const goToNext = useCallback(() => {
    if (imageUrls.length === 0) return;
    setCurrentIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  }, [imageUrls.length]);

  const goToPrev = () => {
    if (imageUrls.length === 0) return;
    setCurrentIndex(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const fetchSlides = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data: HomeSliderResponse[] = await res.json();

      if (data && data.length > 0) {
        const merged = data.flatMap(slider => slider.images);
        setImageUrls(merged);
      } else {
        setImageUrls([]);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load images");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const interval = setInterval(goToNext, AUTO_SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [imageUrls.length, goToNext]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-xl">
        Error: {error}
      </div>
    );
  }

  if (imageUrls.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        No images found.
      </div>
    );
  }

  return (
    // The main container defining the size.
    <div className="w-full h-[80vh] relative overflow-hidden select-none mt-[180px] bg-white">

      {/* RESPONSIVE IMAGE */}
      <img
        src={imageUrls[currentIndex]}
        alt="Slider Image"
        className="
          absolute inset-0 
          w-full h-full 
          **object-contain** transition-opacity duration-700 ease-in-out
        "
        key={currentIndex}
      />

      {/* PREVIOUS BUTTON */}
      <button
        onClick={goToPrev}
        className="absolute left-5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full z-20 text-2xl"
      >
        ❮
      </button>

      {/* NEXT BUTTON */}
      <button
        onClick={goToNext}
        className="absolute right-5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full z-20 text-2xl"
      >
        ❯
      </button>

      {/* DOTS */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {imageUrls.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 
              ${index === currentIndex ? 'bg-white scale-110' : 'bg-gray-400'}
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default FullScreenImageSlider;