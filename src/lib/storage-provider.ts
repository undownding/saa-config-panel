import { S3Client, GetObjectCommand, PutObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import { StorageProvider, StorageConfig, CloudflareR2Config, AnyStorageConfig } from '@/types/s3';
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Cloudflare R2 类型定义
export interface R2Object {
  key: string;
  size: number;
  etag: string;
  uploaded: Date;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
}

export interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: {
    httpMetadata?: {
      contentType?: string;
    };
  }): Promise<R2Object>;
  delete(key: string): Promise<void>;
  head(key: string): Promise<R2Object | null>;
}


/**
 * 存储接口抽象
 */
export interface IStorageClient {
  getObject(key: string): Promise<string>;
  putObject(key: string, content: string): Promise<void>;
  getProvider(): StorageProvider;
  getConfig(): AnyStorageConfig;
}

/**
 * AWS S3 存储实现
 */
export class S3StorageClient implements IStorageClient {
  private s3Client: S3Client;
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;

    const clientConfig: S3ClientConfig = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    };

    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      if (!config.endpoint.includes('amazonaws.com')) {
        clientConfig.forcePathStyle = true;
      }
    }

    this.s3Client = new S3Client(clientConfig);
  }

  // 添加公共方法以访问 s3Client（用于健康检查）
  public getS3Client(): S3Client {
    return this.s3Client;
  }

  async getObject(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);

    if (!response.Body) {
      throw new Error('Empty response body from S3');
    }

    return await response.Body.transformToString();
  }

  async putObject(key: string, content: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      Body: content,
      ContentType: 'application/json',
    });

    await this.s3Client.send(command);
  }

  getProvider(): StorageProvider {
    return 'aws';
  }

  getConfig(): StorageConfig {
    return this.config;
  }
}

/**
 * Cloudflare R2 存储实现
 */
export class R2StorageClient implements IStorageClient {
  private r2Bucket: R2Bucket;
  private config: CloudflareR2Config;

  constructor(config: CloudflareR2Config, r2Bucket: R2Bucket) {
    this.config = config;
    this.r2Bucket = r2Bucket;
  }

  async getObject(key: string): Promise<string> {
    const object = await this.r2Bucket.get(key);

    if (!object) {
      throw new Error(`Object with key ${key} not found in R2 bucket`);
    }

    return await object.text();
  }

  async putObject(key: string, content: string): Promise<void> {
    await this.r2Bucket.put(key, content, {
      httpMetadata: {
        contentType: 'application/json',
      },
    });
  }

  getProvider(): StorageProvider {
    return 'r2';
  }

  getConfig(): CloudflareR2Config {
    return this.config;
  }
}

/**
 * 存储客户端工厂
 */
export class StorageClientFactory {
  private static instance: IStorageClient | null = null;

  /**
   * 获取存储客户端实例
   */
  static getClient(): IStorageClient {
    if (!this.instance) {
      this.instance = this.createClient();
    }
    return this.instance;
  }

  /**
   * 重置客户端实例（用于测试或配置更改）
   */
  static resetClient(): void {
    this.instance = null;
  }

  /**
   * 创建存储客户端
   */
  private static createClient(): IStorageClient {
    const provider = (process.env.STORAGE_PROVIDER as StorageProvider) || 'aws';

    switch (provider) {
      case 'aws':
        return this.createS3Client();
      case 'r2':
        return this.createR2Client();
      default:
        throw new Error(`Unsupported storage provider: ${provider}`);
    }
  }

  /**
   * 创建 S3 客户端
   */
  private static createS3Client(): S3StorageClient {
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    const region = process.env.S3_REGION;
    const bucketName = process.env.S3_BUCKET_NAME;
    const endpoint = process.env.S3_ENDPOINT_URL;

    if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
      throw new Error(
        'Missing required S3 environment variables. Please check S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION, and S3_BUCKET_NAME.'
      );
    }

    const config: StorageConfig = {
      provider: 'aws',
      accessKeyId,
      secretAccessKey,
      region,
      bucketName,
      endpoint,
    };

    return new S3StorageClient(config);
  }

  /**
   * 创建 R2 客户端
   */
  private static createR2Client(): R2StorageClient {
    const bucketName = process.env.R2_BUCKET_NAME;
    const bindingName = process.env.R2_BINDING_NAME || 'R2_BUCKET';

    if (!bucketName) {
      throw new Error('Missing required R2 environment variable: R2_BUCKET_NAME');
    }

    // 在 Cloudflare Workers 环境中，R2 bucket 通过全局变量访问
    // @ts-expect-error - Cloudflare Workers 环境变量在运行时可用
    const r2Bucket = getCloudflareContext().env[bindingName] as R2Bucket;

    if (!r2Bucket) {
      throw new Error(`R2 bucket binding '${bindingName}' not found. Make sure it's configured in wrangler.toml`);
    }

    const config: CloudflareR2Config = {
      bucketName,
      bindingName,
    };

    return new R2StorageClient(config, r2Bucket);
  }
}
