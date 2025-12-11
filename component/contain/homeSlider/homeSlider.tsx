'use client';

import React, { useState, useEffect, useCallback } from 'react';
import style from './homeSLider.module.scss';

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || '/api/dashboard/homeslider';

  const goToNext = useCallback(() => {
    if (imageUrls.length === 0) return;
    setCurrentIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  }, [imageUrls.length]);



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
      setError(err.message || 'Failed to load images');
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const interval = setInterval(goToNext, AUTO_SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [imageUrls.length, goToNext]);

  if (loading) {
    return <div className={`${style.loading}`}>Loading...</div>;
  }

  if (error) {
    return <div className={`${style.error}`}>Error: {error}</div>;
  }

  if (imageUrls.length === 0) {
    return <div className={`${style.noImages}`}>No images found.</div>;
  }

  return (
    <div className={style.sliderWrapper}>
      <img
        src={imageUrls[currentIndex]}
        alt="Slider Image"
        className={style.sliderImage}
        key={currentIndex}
      />

 

      <div className={style.dotsWrapper}>
        {imageUrls.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`${style.dot} ${index === currentIndex ? style.activeDot : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FullScreenImageSlider;
