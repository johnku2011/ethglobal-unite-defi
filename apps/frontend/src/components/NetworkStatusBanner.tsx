'use client';

import React from 'react';
import { useCurrentWalletChain, useChain } from '@/providers/ChainProvider';
import { ChainService } from '@/services/chainService';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

/**
 * 網絡狀態橫幅組件
 * 顯示當前網絡狀態和相關警告/信息
 */

export default function NetworkStatusBanner() {
  const { wallet, chain, canUse1inch, shouldShowTestnetWarning } =
    useCurrentWalletChain();
  const { switchToChain } = useChain();

  if (!wallet || !chain) {
    return null;
  }

  // Testnet 警告
  if (shouldShowTestnetWarning) {
    return (
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
        <div className='flex items-start'>
          <ExclamationTriangleIcon className='h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0' />
          <div className='flex-1'>
            <h3 className='text-sm font-medium text-yellow-800'>
              測試網絡模式
            </h3>
            <div className='mt-2 text-sm text-yellow-700'>
              <p>
                您當前連接到 <strong>{chain.shortName}</strong> 測試網絡。 1inch
                API 不支持測試網絡的投資組合和交易功能。
              </p>
              <div className='mt-3'>
                <p className='font-medium'>建議的開發策略：</p>
                <ul className='mt-1 list-disc list-inside space-y-1'>
                  <li>
                    使用 <strong>Polygon</strong> 或 <strong>BSC</strong>{' '}
                    進行低成本的主網測試
                  </li>
                  <li>在測試網上測試錢包連接和網絡切換功能</li>
                  <li>切換到主網查看完整的 DeFi 功能</li>
                </ul>
              </div>
            </div>

            {/* 快速切換到主網按鈕 */}
            <div className='mt-4 flex space-x-3'>
              <button
                onClick={() => switchToChain(1)}
                className='inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500'
              >
                切換到 Ethereum
                <ChevronRightIcon className='ml-1 h-3 w-3' />
              </button>
              <button
                onClick={() => switchToChain(137)}
                className='inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500'
              >
                切換到 Polygon
                <ChevronRightIcon className='ml-1 h-3 w-3' />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 不支持的網絡警告
  if (!canUse1inch && !shouldShowTestnetWarning) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
        <div className='flex items-start'>
          <ExclamationTriangleIcon className='h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0' />
          <div className='flex-1'>
            <h3 className='text-sm font-medium text-red-800'>不支持的網絡</h3>
            <div className='mt-2 text-sm text-red-700'>
              <p>
                <strong>{chain.shortName}</strong> 不支持 1inch API 功能。
                請切換到支持的網絡以使用完整的 DeFi 功能。
              </p>
            </div>

            {/* 支持的網絡列表 */}
            <div className='mt-4 flex flex-wrap gap-2'>
              {ChainService.getMainnetChains().map((supportedChain) => (
                <button
                  key={supportedChain.id}
                  onClick={() => switchToChain(supportedChain.id)}
                  className='inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500'
                >
                  切換到 {supportedChain.shortName}
                  <ChevronRightIcon className='ml-1 h-3 w-3' />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 正常主網連接 - 簡潔的狀態顯示
  return (
    <div className='bg-green-50 border border-green-200 rounded-lg p-3 mb-4'>
      <div className='flex items-center'>
        <InformationCircleIcon className='h-4 w-4 text-green-400 mr-2 flex-shrink-0' />
        <div className='text-sm text-green-700'>
          <span className='font-medium'>已連接到 {chain.shortName}</span>
          <span className='ml-2 text-green-600'>• 所有 DeFi 功能可用</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 簡化版的網絡狀態指示器 - 用於在其他組件中顯示
 */
export function NetworkStatusIndicator() {
  const { chain, canUse1inch, shouldShowTestnetWarning } =
    useCurrentWalletChain();

  if (!chain) {
    return (
      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
        未連接
      </span>
    );
  }

  if (shouldShowTestnetWarning) {
    return (
      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
        <ExclamationTriangleIcon className='h-3 w-3 mr-1' />
        測試網
      </span>
    );
  }

  if (!canUse1inch) {
    return (
      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
        <ExclamationTriangleIcon className='h-3 w-3 mr-1' />
        不支持
      </span>
    );
  }

  return (
    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
      <div className='h-2 w-2 bg-green-400 rounded-full mr-1'></div>
      {chain.shortName}
    </span>
  );
}
