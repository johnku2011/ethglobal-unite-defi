'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCryptoPrices } from '@/hooks/api/useCryptoPricesQuery';
import CryptoPriceItem from './CryptoPriceItem';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface CryptoPriceTickerProps {
  className?: string;
  autoScroll?: boolean;
  showControls?: boolean;
  symbols?: string[];
  onClose?: () => void;
  scrollSpeed?: number; // Animation duration in seconds
}

/**
 * Financial-grade cryptocurrency price ticker with infinite carousel
 * Horizontal scrolling with seamless loop effect like financial websites
 */
export default function CryptoPriceTicker({
  className = '',
  autoScroll = true,
  showControls = false,
  symbols = [
    'BTC',
    'ETH',
    'USDT',
    'BNB',
    'SOL',
    'ADA',
    'XRP',
    'DOGE',
    'AVAX',
    'MATIC',
  ],
  onClose,
  scrollSpeed = 60, // 60 seconds for full cycle
}: CryptoPriceTickerProps) {
  const queryResult = useCryptoPrices(
    symbols,
    30000 // 30-second refresh interval
  );

  const { data: prices, isLoading, error, refetch } = queryResult;
  // @ts-expect-error - TanStack Query v4 previousData access
  const previousData = queryResult.previousData as typeof prices | undefined;

  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isManualControl, setIsManualControl] = useState(false);

  // Clone items for seamless infinite loop
  const createCarouselItems = useCallback(() => {
    const pricesArray = prices as any[];
    if (!pricesArray || pricesArray.length === 0) return [];

    // Create cloned items for seamless loop (clone first 3 items)
    const cloneCount = Math.min(3, pricesArray.length);
    const clonedItems = pricesArray.slice(0, cloneCount);

    return [...pricesArray, ...clonedItems];
  }, [prices]);

  const carouselItems = createCarouselItems();

  // Setup carousel animation
  useEffect(() => {
    if (
      !autoScroll ||
      !trackRef.current ||
      isLoading ||
      !carouselItems.length
    ) {
      return;
    }

    const track = trackRef.current;

    // Calculate animation duration based on item count and desired speed
    const animationDuration = scrollSpeed;

    // Apply CSS animation
    track.style.animationDuration = `${animationDuration}s`;
    track.classList.add('carousel-animating');

    // Handle pause/resume based on state
    if (isPaused || isManualControl) {
      track.classList.add('carousel-paused');
    } else {
      track.classList.remove('carousel-paused');
    }

    return () => {
      track.classList.remove('carousel-animating', 'carousel-paused');
    };
  }, [
    autoScroll,
    isLoading,
    isPaused,
    isManualControl,
    carouselItems.length,
    scrollSpeed,
  ]);

  // Hover handlers for pause/resume
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Manual control handlers
  const handleManualScrollLeft = useCallback(() => {
    if (trackRef.current) {
      setIsManualControl(true);

      // Temporarily pause and manually adjust position
      const track = trackRef.current;
      const currentTransform = getComputedStyle(track).transform;
      const matrix = new DOMMatrix(currentTransform);
      const currentX = matrix.m41;

      // Move left by 200px
      track.style.transform = `translate3d(${currentX - 200}px, 0, 0)`;
      track.style.animation = 'none';

      // Resume automatic scrolling after 3 seconds
      setTimeout(() => {
        track.style.animation = '';
        track.style.transform = '';
        setIsManualControl(false);
      }, 3000);
    }
  }, []);

  const handleManualScrollRight = useCallback(() => {
    if (trackRef.current) {
      setIsManualControl(true);

      // Temporarily pause and manually adjust position
      const track = trackRef.current;
      const currentTransform = getComputedStyle(track).transform;
      const matrix = new DOMMatrix(currentTransform);
      const currentX = matrix.m41;

      // Move right by 200px
      track.style.transform = `translate3d(${currentX + 200}px, 0, 0)`;
      track.style.animation = 'none';

      // Resume automatic scrolling after 3 seconds
      setTimeout(() => {
        track.style.animation = '';
        track.style.transform = '';
        setIsManualControl(false);
      }, 3000);
    }
  }, []);

  // 加載狀態
  if (isLoading && !prices) {
    return (
      <div
        className={`
          bg-gray-50 py-2 overflow-hidden 
          border-b border-gray-200
          ${className}
        `}
      >
        <div className='animate-pulse flex space-x-6 px-4'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='flex items-center space-x-2'>
              <div className='rounded-full bg-gray-300 h-5 w-5'></div>
              <div className='h-4 bg-gray-300 rounded w-10'></div>
              <div className='h-4 bg-gray-300 rounded w-16'></div>
              <div className='h-4 bg-gray-300 rounded w-12'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error && !prices) {
    return (
      <div
        className={`
          bg-red-50 py-2 px-4 
          border-b border-red-200
          ${className}
        `}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <span className='text-red-600 text-sm'>
              Failed to load price data
            </span>
            <button
              onClick={() => refetch()}
              className='text-red-600 hover:text-red-800'
            >
              <ArrowPathIcon className='w-4 h-4' />
            </button>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className='text-red-600 hover:text-red-800'
            >
              <XMarkIcon className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 正常顯示
  return (
    <div
      className={`
        bg-white py-2 overflow-hidden 
        border-b border-gray-200
        relative group crypto-ticker-container
        ${className}
      `}
    >
      {/* Carousel control buttons */}
      {showControls && (
        <>
          <button
            onClick={handleManualScrollLeft}
            className='
              absolute left-2 top-1/2 transform -translate-y-1/2 z-10
              bg-white rounded-full p-1 shadow-md
              opacity-0 group-hover:opacity-100 transition-opacity
              hover:bg-gray-100
            '
            title='Scroll Left'
          >
            <ChevronLeftIcon className='w-4 h-4 text-gray-600' />
          </button>
          <button
            onClick={handleManualScrollRight}
            className='
              absolute right-2 top-1/2 transform -translate-y-1/2 z-10
              bg-white rounded-full p-1 shadow-md
              opacity-0 group-hover:opacity-100 transition-opacity
              hover:bg-gray-100
            '
            title='Scroll Right'
          >
            <ChevronRightIcon className='w-4 h-4 text-gray-600' />
          </button>
        </>
      )}

      {/* 關閉按鈕 */}
      {onClose && (
        <button
          onClick={onClose}
          className='
            absolute right-2 top-2 z-10
            text-gray-400 hover:text-gray-600
            opacity-0 group-hover:opacity-100 transition-opacity
          '
        >
          <XMarkIcon className='w-4 h-4' />
        </button>
      )}

      {/* Infinite Carousel Container */}
      <div
        ref={carouselRef}
        className='overflow-hidden px-4'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Carousel Track */}
        <div ref={trackRef} className='carousel-track space-x-2'>
          {carouselItems.map((price: any, index: number) => {
            return (
              <CryptoPriceItem
                key={`${price.token.symbol}-${index}`}
                data={price}
                previousPrice={
                  (previousData as any)?.find(
                    (p: any) => p.token.symbol === price.token.symbol
                  )?.price
                }
                compact={false}
              />
            );
          })}
        </div>
      </div>

      {/* 漸變遮罩效果 */}
      <div className='absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none' />
      <div className='absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none' />
    </div>
  );
}
