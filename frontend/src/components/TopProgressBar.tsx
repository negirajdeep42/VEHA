import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../app/store';

export const TopProgressBar: React.FC = () => {
  // Combine all active loading states from Redux slices
  const isAuthLoading = useAppSelector(state => state.auth.loading);
  const isCartLoading = useAppSelector(state => state.cart.loading);
  const isWishlistLoading = useAppSelector(state => state.wishlist?.loading || false);
  const isProductsLoading = useAppSelector(state => 
    state.products.loading || 
    state.products.detailsLoading || 
    state.products.categoriesLoading
  );
  const isOrdersLoading = useAppSelector(state => 
    state.orders.loading || 
    state.orders.placementLoading
  );

  const isLoading = isAuthLoading || isCartLoading || isWishlistLoading || isProductsLoading || isOrdersLoading;

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: number;
    let fadeTimer: number;

    if (isLoading) {
      // Show progress bar
      setVisible(true);
      setProgress(15);

      // Increment progress bar over time
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 60) return prev + 12;
          if (prev < 85) return prev + 4;
          if (prev < 96) return prev + 1;
          return prev;
        });
      }, 250);

      return () => {
        clearInterval(interval);
      };
    } else {
      // Complete progress bar when loading stops
      setProgress(100);

      // Fade out and reset progress bar
      fadeTimer = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }

    return () => {
      clearTimeout(fadeTimer);
    };
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div 
      className="top-loading-bar" 
      style={{ 
        width: `${progress}%`, 
        opacity: progress === 100 ? 0 : 1,
        transition: progress === 100 
          ? 'width 0.2s ease-out, opacity 0.35s ease-in-out' 
          : 'width 0.3s ease-out'
      }} 
    />
  );
};

export default TopProgressBar;
