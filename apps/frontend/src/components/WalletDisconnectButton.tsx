import React from 'react';
import { useWalletActions } from '@/hooks/useWalletActions';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface WalletDisconnectButtonProps {
  walletAddress?: string;
  variant?: 'button' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export default function WalletDisconnectButton({
  walletAddress,
  variant = 'button',
  size = 'md',
  className = '',
  children,
}: WalletDisconnectButtonProps) {
  const { disconnectWallet, disconnectAllWallets, getWalletInfo } = useWalletActions();

  const handleDisconnect = () => {
    if (walletAddress) {
      disconnectWallet(walletAddress);
    } else {
      disconnectAllWallets();
    }
  };

  const walletInfo = walletAddress ? getWalletInfo(walletAddress) : null;
  const buttonText = walletAddress 
    ? `Disconnect ${walletInfo?.provider || 'Wallet'}` 
    : 'Disconnect All';

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDisconnect}
        className={`
          inline-flex items-center justify-center rounded-full
          text-gray-500 hover:text-red-500 hover:bg-red-50
          transition-colors duration-200
          ${sizeClasses[size]}
          ${className}
        `}
        title={buttonText}
      >
        <ArrowRightOnRectangleIcon className={iconSizeClasses[size]} />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleDisconnect}
        className={`
          text-red-600 hover:text-red-800 underline
          transition-colors duration-200
          ${className}
        `}
      >
        {children || buttonText}
      </button>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleDisconnect}
      className={`
        inline-flex items-center gap-2 rounded-lg
        bg-red-500 text-white hover:bg-red-600
        transition-colors duration-200 font-medium
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <ArrowRightOnRectangleIcon className={iconSizeClasses[size]} />
      {children || buttonText}
    </button>
  );
} 