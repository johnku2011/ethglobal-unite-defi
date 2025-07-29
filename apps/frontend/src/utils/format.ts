/**
 * Format a wallet address to show first and last few characters
 * @param address - The full wallet address
 * @param chars - Number of characters to show at start and end (default: 4)
 * @returns Formatted address like "0x1234...5678"
 */
export const formatAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Format a number as currency with proper decimals
 * @param value - The numeric value
 * @param currency - Currency symbol (default: '$')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  currency: string = '$',
  decimals: number = 2
): string => {
  return `${currency}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

/**
 * Format a token amount with proper decimals
 * @param amount - Raw token amount
 * @param decimals - Token decimals
 * @param displayDecimals - Number of decimals to display (default: 6)
 * @returns Formatted token amount
 */
export const formatTokenAmount = (
  amount: string | number,
  decimals: number,
  displayDecimals: number = 6
): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const divisor = Math.pow(10, decimals);
  const formattedValue = value / divisor;

  return formattedValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
};

/**
 * Calculate percentage change
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Validate Ethereum address format
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate Sui address format
 * @param address - Address to validate
 * @returns True if valid Sui address
 */
export const isValidSuiAddress = (address: string): boolean => {
  // Sui addresses are 32-byte hex strings with 0x prefix
  return /^0x[a-fA-F0-9]{64}$/.test(address);
};

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

/**
 * Generate a random ID
 * @param length - Length of the ID (default: 8)
 * @returns Random ID string
 */
export const generateId = (length: number = 8): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
