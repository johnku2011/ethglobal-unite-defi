'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WalletDisconnectExample from '@/components/examples/WalletDisconnectExample';

export default function WalletDemo() {
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Wallet Management Demo
          </h1>
          <p className='text-gray-600'>
            Test all the wallet disconnect functionality here
          </p>
        </div>

        <WalletDisconnectExample />
      </div>
    </DashboardLayout>
  );
}
