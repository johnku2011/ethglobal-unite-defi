'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
}) => <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;

interface QuoteLoadingProps {
  isVisible: boolean;
}

export const QuoteLoading: React.FC<QuoteLoadingProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className='my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
      <div className='flex items-center justify-center space-x-3'>
        <div className='relative'>
          <div className='w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin'></div>
          <div className='absolute inset-0 w-6 h-6 border-2 border-transparent border-t-blue-400 rounded-full animate-ping'></div>
        </div>
        <div className='text-sm text-blue-700 font-medium'>
          Finding best route...
        </div>
      </div>
      <div className='mt-3 space-y-2'>
        <div className='flex justify-between text-xs text-blue-600'>
          <span>Checking DEXs</span>
          <span>✓</span>
        </div>
        <div className='flex justify-between text-xs text-blue-600'>
          <span>Calculating rates</span>
          <div className='w-4 h-4 border border-blue-300 border-t-blue-600 rounded-full animate-spin'></div>
        </div>
        <div className='flex justify-between text-xs text-gray-400'>
          <span>Estimating gas</span>
          <span>...</span>
        </div>
      </div>
    </div>
  );
};

interface SwapProgressProps {
  step: 'preparing' | 'approving' | 'swapping' | 'confirming';
  progress: number;
  message: string;
}

export const SwapProgress: React.FC<SwapProgressProps> = ({
  step,
  progress,
  message,
}) => {
  const steps = [
    { key: 'preparing', label: 'Preparing', icon: '📋' },
    { key: 'approving', label: 'Approving', icon: '✅' },
    { key: 'swapping', label: 'Swapping', icon: '💱' },
    { key: 'confirming', label: 'Confirming', icon: '🔍' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl'>
        <div className='text-center mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Processing Swap
          </h3>
          <p className='text-sm text-gray-600'>{message}</p>
        </div>

        {/* Progress Steps */}
        <div className='mb-6'>
          <div className='flex justify-between mb-4'>
            {steps.map((s, index) => (
              <div key={s.key} className='flex flex-col items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStepIndex ? '✓' : s.icon}
                </div>
                <span className='text-xs mt-1 text-gray-600'>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-500'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Loading Animation */}
        <div className='flex justify-center'>
          <div className='relative'>
            <div className='w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin'></div>
            <div className='absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-400 rounded-full animate-ping'></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TokenSelectorSkeletonProps {
  className?: string;
}

export const TokenSelectorSkeleton: React.FC<TokenSelectorSkeletonProps> = ({
  className = '',
}) => (
  <div
    className={`flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 ${className}`}
  >
    <LoadingSkeleton className='w-6 h-6 rounded' />
    <LoadingSkeleton className='w-16 h-4 rounded' />
    <LoadingSkeleton className='w-4 h-4 rounded' />
  </div>
);

interface SwapInterfaceSkeletonProps {}

export const SwapInterfaceSkeleton: React.FC<
  SwapInterfaceSkeletonProps
> = () => (
  <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6'>
    {/* Header */}
    <div className='flex items-center justify-between'>
      <LoadingSkeleton className='w-32 h-6 rounded' />
      <LoadingSkeleton className='w-8 h-8 rounded' />
    </div>

    {/* From Token */}
    <div className='space-y-2'>
      <div className='flex justify-between'>
        <LoadingSkeleton className='w-16 h-4 rounded' />
        <LoadingSkeleton className='w-24 h-4 rounded' />
      </div>
      <div className='relative'>
        <LoadingSkeleton className='w-full h-16 rounded-xl' />
        <div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
          <TokenSelectorSkeleton />
        </div>
      </div>
    </div>

    {/* Swap Button */}
    <div className='flex justify-center'>
      <LoadingSkeleton className='w-12 h-12 rounded-full' />
    </div>

    {/* To Token */}
    <div className='space-y-2'>
      <div className='flex justify-between'>
        <LoadingSkeleton className='w-16 h-4 rounded' />
        <LoadingSkeleton className='w-24 h-4 rounded' />
      </div>
      <div className='relative'>
        <LoadingSkeleton className='w-full h-16 rounded-xl' />
        <div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
          <TokenSelectorSkeleton />
        </div>
      </div>
    </div>

    {/* Action Button */}
    <LoadingSkeleton className='w-full h-12 rounded-xl' />
  </div>
);

export default {
  LoadingSkeleton,
  QuoteLoading,
  SwapProgress,
  TokenSelectorSkeleton,
  SwapInterfaceSkeleton,
};
