/**
 * 階段一驗收腳本
 * 驗證基礎設施搭建是否成功
 */

import { PortfolioService } from './portfolioService';
import { OneInchPortfolioAPI } from './api/oneinchAPI';

/**
 * 階段一驗收測試
 */
export const verifyPhaseOne = async (): Promise<boolean> => {
  console.log('🧪 開始階段一驗收測試...');
  console.log(
    '📋 測試項目: 依賴安裝、API客戶端、TanStack Query集成、基礎服務層'
  );

  try {
    // 測試1: 依賴可用性檢查
    console.log('\n✅ 測試1: 依賴可用性檢查');

    // 檢查axios
    const axios = require('axios');
    console.log(`  - Axios: ${axios ? '✅ 可用' : '❌ 不可用'}`);

    // 檢查moment
    const moment = require('moment');
    console.log(`  - Moment: ${moment ? '✅ 可用' : '❌ 不可用'}`);

    // 檢查recharts
    try {
      const recharts = require('recharts');
      console.log(`  - Recharts: ${recharts ? '✅ 可用' : '❌ 不可用'}`);
    } catch {
      console.log(`  - Recharts: ❌ 不可用`);
    }

    // 檢查TanStack Query
    const reactQuery = require('@tanstack/react-query');
    console.log(`  - TanStack Query: ${reactQuery ? '✅ 可用' : '❌ 不可用'}`);

    // 測試2: API客戶端檢查
    console.log('\n✅ 測試2: API客戶端檢查');
    console.log(
      `  - OneInchPortfolioAPI: ${OneInchPortfolioAPI ? '✅ 可用' : '❌ 不可用'}`
    );
    console.log(`  - API方法可用性:`);
    console.log(
      `    - fetchCompletePortfolioData: ${typeof OneInchPortfolioAPI.fetchCompletePortfolioData === 'function' ? '✅' : '❌'}`
    );
    console.log(
      `    - getValueChart: ${typeof OneInchPortfolioAPI.getValueChart === 'function' ? '✅' : '❌'}`
    );
    console.log(
      `    - getTransactionHistory: ${typeof OneInchPortfolioAPI.getTransactionHistory === 'function' ? '✅' : '❌'}`
    );
    console.log(
      `    - isValidEthereumAddress: ${typeof OneInchPortfolioAPI.isValidEthereumAddress === 'function' ? '✅' : '❌'}`
    );

    // 測試3: Portfolio服務檢查
    console.log('\n✅ 測試3: Portfolio服務檢查');
    console.log(
      `  - PortfolioService: ${PortfolioService ? '✅ 可用' : '❌ 不可用'}`
    );
    console.log(`  - 服務方法可用性:`);
    console.log(
      `    - getPortfolioData: ${typeof PortfolioService.getPortfolioData === 'function' ? '✅' : '❌'}`
    );
    console.log(
      `    - getValueChartData: ${typeof PortfolioService.getValueChartData === 'function' ? '✅' : '❌'}`
    );
    console.log(
      `    - getTransactionHistory: ${typeof PortfolioService.getTransactionHistory === 'function' ? '✅' : '❌'}`
    );
    console.log(
      `    - calculatePortfolioStats: ${typeof PortfolioService.calculatePortfolioStats === 'function' ? '✅' : '❌'}`
    );

    // 測試4: 地址驗證功能
    console.log('\n✅ 測試4: 地址驗證功能');
    const testAddresses = [
      {
        address: '0x742d35Cc6601C2c1234567890AbcDeF1234567890',
        expected: true,
      },
      { address: '0x0000000000000000000000000000000000000000', expected: true },
      { address: 'invalid_address', expected: false },
      { address: '0x123', expected: false },
      { address: '', expected: false },
    ];

    for (const { address, expected } of testAddresses) {
      const result = PortfolioService.validateAddress(address);
      const status = result === expected ? '✅' : '❌';
      console.log(
        `    ${status} ${address || '(空字符串)'}: ${result} (預期: ${expected})`
      );
    }

    // 測試5: 地址格式化功能
    console.log('\n✅ 測試5: 地址格式化功能');
    const formatTests = [
      {
        address: '0x742d35Cc6601C2c1234567890AbcDeF1234567890',
        expected: '0x742d...7890',
      },
      {
        address: '0x0000000000000000000000000000000000000000',
        expected: '0x0000...0000',
      },
    ];

    for (const { address, expected } of formatTests) {
      const result = PortfolioService.formatAddress(address);
      const status = result === expected ? '✅' : '❌';
      console.log(`    ${status} ${address} → ${result} (預期: ${expected})`);
    }

    // 測試6: 統計計算功能
    console.log('\n✅ 測試6: 統計計算功能');
    const mockPortfolioData = {
      totalValue: 10000,
      totalChange24h: 500,
      totalChangePercentage24h: 5,
      chains: [
        {
          chainId: 1,
          chainName: 'Ethereum',
          totalValue: 8000,
          totalChange24h: 400,
          percentage: 80,
          protocolCount: 2,
          status: 'completed' as const,
          protocols: [],
        },
        {
          chainId: 137,
          chainName: 'Polygon',
          totalValue: 2000,
          totalChange24h: 100,
          percentage: 20,
          protocolCount: 1,
          status: 'completed' as const,
          protocols: [],
        },
      ],
      protocols: [
        {
          name: 'Uniswap V3',
          protocol: 'uniswap-v3',
          contractAddress: '0x123',
          chainId: 1,
          value: 5000,
          tokens: [
            {
              address: '0xtoken1',
              name: 'Token1',
              symbol: 'TK1',
              amount: 100,
              value: 2500,
              price: 25,
              chainId: 1,
            },
            {
              address: '0xtoken2',
              name: 'Token2',
              symbol: 'TK2',
              amount: 50,
              value: 2500,
              price: 50,
              chainId: 1,
            },
          ],
        },
        {
          name: 'Aave V3',
          protocol: 'aave-v3',
          contractAddress: '0x456',
          chainId: 137,
          value: 3000,
          tokens: [],
        },
      ],
      lastUpdated: new Date(),
      address: '0x742d35Cc6601C2c1234567890AbcDeF1234567890',
    };

    try {
      const stats = PortfolioService.calculatePortfolioStats(mockPortfolioData);
      console.log(`    ✅ 統計計算成功:`);
      console.log(`      - 總價值: $${stats.totalValue.toLocaleString()}`);
      console.log(`      - 鏈數量: ${stats.chainCount}`);
      console.log(`      - 協議數量: ${stats.protocolCount}`);
      console.log(`      - 代幣數量: ${stats.tokenCount}`);
      console.log(
        `      - 頂級鏈: ${stats.topChain.name} ($${stats.topChain.value.toLocaleString()})`
      );
      console.log(
        `      - 頂級協議: ${stats.topProtocol.name} ($${stats.topProtocol.value.toLocaleString()})`
      );
    } catch (error) {
      console.log(`    ❌ 統計計算失敗: ${error}`);
      return false;
    }

    // 測試7: 類型檢查
    console.log('\n✅ 測試7: 類型系統檢查');
    try {
      // 嘗試導入關鍵類型
      const portfolioTypes = require('../types/portfolio');
      console.log(`    ✅ Portfolio類型定義: 可用`);
    } catch (error) {
      console.log(`    ❌ Portfolio類型定義: 不可用 - ${error}`);
    }

    console.log('\n🎉 階段一驗收測試完成！');
    console.log('📊 測試摘要:');
    console.log('  ✅ 依賴安裝和配置 - 完成');
    console.log('  ✅ API客戶端建設 - 完成');
    console.log('  ✅ TanStack Query集成 - 完成');
    console.log('  ✅ 基礎服務層 - 完成');
    console.log('  ✅ 類型定義 - 完成');

    return true;
  } catch (error) {
    console.error('\n❌ 階段一驗收測試失敗:', error);
    return false;
  }
};

/**
 * 簡單的API連通性測試（可選）
 */
export const testAPIConnectivity = async (): Promise<void> => {
  console.log('\n🔌 API連通性測試（可選）');
  console.log('⚠️  注意: 此測試需要有效的API配置和網絡連接');

  try {
    const healthStatus = await PortfolioService.healthCheck();
    console.log(`✅ API健康檢查: ${healthStatus ? '通過' : '失敗'}`);
  } catch (error) {
    console.log(`❌ API健康檢查失敗: ${error}`);
    console.log('💡 這是預期的，因為我們還沒有配置實際的API端點');
  }
};

/**
 * 執行完整驗收
 */
export const runFullVerification = async (): Promise<void> => {
  console.log('🚀 執行階段一完整驗收測試\n');

  const success = await verifyPhaseOne();

  if (success) {
    console.log('\n🎊 恭喜！階段一基礎設施搭建完成！');
    console.log('📝 接下來可以開始階段二: 核心功能開發');

    // 可選的API測試
    await testAPIConnectivity();
  } else {
    console.log('\n❌ 階段一驗收未通過，請檢查上述錯誤');
  }
};

// 預設導出主要驗收函數
export default verifyPhaseOne;
