/**
 * Bearer Token 本地存储管理工具
 */

const TOKEN_STORAGE_KEY = 'saa_bearer_token';

/**
 * 保存 Bearer Token 到 localStorage
 */
export function saveBearerToken(token: string): void {
  if (typeof window !== 'undefined' && token.trim()) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
  }
}

/**
 * 从 localStorage 获取保存的 Bearer Token
 */
export function getSavedBearerToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  }
  return '';
}

/**
 * 清除保存的 Bearer Token
 */
export function clearSavedBearerToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}
