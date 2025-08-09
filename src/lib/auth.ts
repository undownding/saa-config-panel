import { NextRequest } from 'next/server';
import {getCloudflareContext} from "@opennextjs/cloudflare";

/**
 * 获取授权 Token
 */
export function getAuthToken(): string {
  const token = getCloudflareContext().env.secrets_store_secrets[0].secret_name
      || process.env.AUTH_BEARER_TOKEN;

  if (!token) {
    throw new Error('AUTH_BEARER_TOKEN environment variable is not configured');
  }

  return token;
}

/**
 * 从请求头中提取 Bearer Token
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return null;
  }

  const parts = authorization.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * 验证 Bearer Token
 */
export function verifyBearerToken(request: NextRequest): boolean {
  try {
    const providedToken = extractBearerToken(request);

    if (!providedToken) {
      return false;
    }

    const expectedToken = getAuthToken();

    return providedToken === expectedToken;
  } catch (error) {
    console.error('Error verifying bearer token:', error);
    return false;
  }
}

/**
 * 创建未授权错误响应
 */
export function createUnauthorizedResponse() {
  return {
    error: 'UNAUTHORIZED',
    message: 'Invalid or missing bearer token',
    timestamp: new Date().toISOString(),
  };
}
