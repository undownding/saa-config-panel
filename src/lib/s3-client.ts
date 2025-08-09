import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { StorageConfig } from '@/types/s3';

/**
 * 获取 S3 配置
 */
export function getS3Config(): StorageConfig {
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

  return {
    provider: 'aws',
    accessKeyId,
    secretAccessKey,
    region,
    bucketName,
    endpoint,
  };
}

/**
 * 创建 S3 客户端实例
 */
export function createS3Client(): S3Client {
  const config = getS3Config();

  const clientConfig: S3ClientConfig = {
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  };

  // 如果提供了自定义端点，则使用它
  if (config.endpoint) {
    clientConfig.endpoint = config.endpoint;
    // 对于非 AWS 端点（如 MinIO），可能需要强制路径样式
    if (!config.endpoint.includes('amazonaws.com')) {
      clientConfig.forcePathStyle = true;
    }
  }

  return new S3Client(clientConfig);
}

/**
 * 单例 S3 客户端
 */
let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = createS3Client();
  }
  return s3Client;
}
