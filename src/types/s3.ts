export type StorageProvider = 'aws' | 'r2';

export interface StorageConfig {
  provider: StorageProvider;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  endpoint?: string;
}

export interface CloudflareR2Config {
  bucketName: string;
  // R2 绑定名称，用于 Cloudflare Workers 环境
  bindingName?: string;
}

// 联合类型用于类型安全的配置获取
export type AnyStorageConfig = StorageConfig | CloudflareR2Config;

// 类型守卫函数
export function isStorageConfig(config: AnyStorageConfig): config is StorageConfig {
  return 'region' in config && 'accessKeyId' in config;
}

export function isR2Config(config: AnyStorageConfig): config is CloudflareR2Config {
  return !('region' in config) && 'bucketName' in config;
}

export interface StorageHealthCheckResponse {
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
  provider: StorageProvider;
  connection?: {
    region: string;
    bucket: string;
    endpoint?: string;
  };
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}
