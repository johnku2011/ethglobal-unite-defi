# 🎛️ Crypto Price Ticker 速度控制指南

## 📍 控制位置

輪播速度可以通過 `scrollSpeed` 參數控制，單位為**秒**。

### 當前設置位置
- **文件**：`apps/frontend/src/components/DashboardLayout.tsx`
- **行數**：第 288 行
- **當前值**：40 秒（已從默認 60 秒調整為更快的速度）

## ⚡ 速度設置參考

### 推薦速度設置

| 速度級別 | 秒數 | 效果描述 |
|---------|------|----------|
| 極快 | 20s | 非常快的滾動，適合展示很多幣種 |
| 快速 | 30s | 快速滾動，保持良好可讀性 |
| **當前** | 40s | 平衡的速度，既流暢又可讀 |
| 標準 | 60s | 默認速度，穩定的專業感 |
| 慢速 | 90s | 較慢滾動，用戶有更多時間閱讀 |
| 極慢 | 120s | 很慢的滾動，強調細節觀察 |

### 💡 如何調整

在 `DashboardLayout.tsx` 中修改 `scrollSpeed` 值：

```typescript
<CryptoPriceTicker
  scrollSpeed={30} // 修改這個數字
  // 其他屬性...
/>
```

### 🎯 不同場景的推薦設置

#### 展示場景
```typescript
scrollSpeed={25} // 快速展示，吸引注意力
```

#### 閱讀場景  
```typescript
scrollSpeed={80} // 給用戶充足時間閱讀價格
```

#### 專業金融場景
```typescript
scrollSpeed={45} // 平衡的專業速度
```

#### 移動設備
```typescript
scrollSpeed={50} // 稍慢一些，適應觸摸交互
```

## 🔧 進階控制選項

### 動態速度控制

如果需要根據內容數量動態調整速度：

```typescript
const calculateSpeed = (itemCount: number) => {
  // 基礎速度：每個項目 4 秒
  return Math.max(20, itemCount * 4);
};

<CryptoPriceTicker
  scrollSpeed={calculateSpeed(symbols.length)}
  symbols={symbols}
/>
```

### 響應式速度

根據屏幕大小調整速度：

```typescript
const getResponsiveSpeed = () => {
  if (window.innerWidth < 768) return 60; // 移動設備較慢
  if (window.innerWidth < 1024) return 45; // 平板
  return 35; // 桌面較快
};
```

## 🎨 視覺效果對比

- **20-30秒**：快速流動，像新聞快報
- **40-50秒**：穩定專業，像Bloomberg終端
- **60-80秒**：穩重展示，像Yahoo Finance
- **90秒以上**：強調細節，適合學習模式

## 🔄 即時調整

修改 `scrollSpeed` 值後，保存文件即可立即看到效果變化，無需重啟服務器。

## 💡 最佳實踐建議

1. **首次訪問**：使用 40-50 秒建立專業印象
2. **返回用戶**：可以提供設置選項讓用戶自定義
3. **不同頁面**：可以根據頁面功能調整不同速度
4. **A/B測試**：測試不同速度對用戶參與度的影響

---

**當前設置**：40 秒 - 已優化為平衡的專業速度 ⚡