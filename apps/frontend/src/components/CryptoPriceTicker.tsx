'use client';

import React, { useRef, useEffect, useState } from 'react';
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
}

/**
 * 加密貨幣價格消息欄組件
 * 水平滾動顯示多種加密貨幣的實時價格
 */
export default function CryptoPriceTicker({
  className = '',
  autoScroll = false,
  showControls = false,
  symbols = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA', 'XRP', 'DOGE'],
  onClose,
}: CryptoPriceTickerProps) {
  const {
    data: prices,
    isLoading,
    error,
    refetch,
    previousData,
  } = useCryptoPrices(
    symbols,
    30000 // 30秒刷新間隔
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // 自動滾動效果
  useEffect(() => {
    if (!autoScroll || !scrollRef.current || isLoading || isManualScroll)
      return;

    let animationId: number;

    const scroll = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;

        if (scrollWidth <= clientWidth) {
          // 如果內容寬度不超過容器寬度，不需要滾動
          return;
        }

        const maxScroll = scrollWidth - clientWidth;

        if (scrollPosition >= maxScroll) {
          setScrollPosition(0);
        } else {
          setScrollPosition((prev) => prev + 0.5);
        }

        scrollRef.current.scrollLeft = scrollPosition;
        animationId = requestAnimationFrame(scroll);
      }
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [autoScroll, isLoading, isManualScroll, scrollPosition]);

  // 處理手動滾動
  const handleScroll = () => {
    if (scrollRef.current) {
      setIsManualScroll(true);
      setScrollPosition(scrollRef.current.scrollLeft);

      // 2秒後恢復自動滾動
      setTimeout(() => {
        setIsManualScroll(false);
      }, 2000);
    }
  };

  // 手動控制滾動
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 200;
      setIsManualScroll(true);
      setTimeout(() => setIsManualScroll(false), 2000);
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 200;
      setIsManualScroll(true);
      setTimeout(() => setIsManualScroll(false), 2000);
    }
  };

  // 加載狀態
  if (isLoading && !prices) {
    return (
      <div
        className={`
          bg-gray-50 dark:bg-gray-800 py-2 overflow-hidden 
          border-b border-gray-200 dark:border-gray-700
          ${className}
        `}
      >
        <div className='animate-pulse flex space-x-6 px-4'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='flex items-center space-x-2'>
              <div className='rounded-full bg-gray-300 dark:bg-gray-700 h-5 w-5'></div>
              <div className='h-4 bg-gray-300 dark:bg-gray-700 rounded w-10'></div>
              <div className='h-4 bg-gray-300 dark:bg-gray-700 rounded w-16'></div>
              <div className='h-4 bg-gray-300 dark:bg-gray-700 rounded w-12'></div>
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
          bg-red-50 dark:bg-red-900/20 py-2 px-4 
          border-b border-red-200 dark:border-red-800
          ${className}
        `}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <span className='text-red-600 dark:text-red-400 text-sm'>
              Failed to load price data
            </span>
            <button
              onClick={() => refetch()}
              className='text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
            >
              <ArrowPathIcon className='w-4 h-4' />
            </button>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className='text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
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
        bg-gray-50 dark:bg-gray-800 py-2 overflow-hidden 
        border-b border-gray-200 dark:border-gray-700
        relative group
        ${className}
      `}
    >
      {/* 滾動控制按鈕 */}
      {showControls && (
        <>
          <button
            onClick={scrollLeft}
            className='
              absolute left-2 top-1/2 transform -translate-y-1/2 z-10
              bg-white dark:bg-gray-700 rounded-full p-1 shadow-md
              opacity-0 group-hover:opacity-100 transition-opacity
              hover:bg-gray-100 dark:hover:bg-gray-600
            '
          >
            <ChevronLeftIcon className='w-4 h-4 text-gray-600 dark:text-gray-300' />
          </button>
          <button
            onClick={scrollRight}
            className='
              absolute right-2 top-1/2 transform -translate-y-1/2 z-10
              bg-white dark:bg-gray-700 rounded-full p-1 shadow-md
              opacity-0 group-hover:opacity-100 transition-opacity
              hover:bg-gray-100 dark:hover:bg-gray-600
            '
          >
            <ChevronRightIcon className='w-4 h-4 text-gray-600 dark:text-gray-300' />
          </button>
        </>
      )}

      {/* 關閉按鈕 */}
      {onClose && (
        <button
          onClick={onClose}
          className='
            absolute right-2 top-2 z-10
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
            opacity-0 group-hover:opacity-100 transition-opacity
          '
        >
          <XMarkIcon className='w-4 h-4' />
        </button>
      )}

      {/* 價格滾動容器 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className='
          flex whitespace-nowrap overflow-x-auto scrollbar-hide
          px-4 space-x-2
          scroll-smooth
        '
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {prices?.map((price) => (
          <CryptoPriceItem
            key={price.token.symbol}
            data={price}
            previousPrice={
              previousData?.find((p) => p.token.symbol === price.token.symbol)
                ?.price
            }
            compact={false}
          />
        ))}
      </div>

      {/* 漸變遮罩效果 */}
      <div className='absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800 pointer-events-none' />
      <div className='absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-800 pointer-events-none' />
    </div>
  );
}
