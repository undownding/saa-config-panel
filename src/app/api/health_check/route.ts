import { NextResponse } from 'next/server';
import { HeadBucketCommand } from '@aws-sdk/client-s3';
import { StorageClientFactory, S3StorageClient } from '@/lib/storage-provider';
import { StorageHealthCheckResponse, ApiErrorResponse, isStorageConfig } from '@/types/s3';

export async function GET(): Promise<NextResponse<StorageHealthCheckResponse | ApiErrorResponse>> {
  try {
    // 获取存储客户端
    const storageClient = StorageClientFactory.getClient();
    const provider = storageClient.getProvider();
    const config = storageClient.getConfig();

    console.log('Health check for provider:', provider, config);

    // 根据存储提供商进行不同的健康检查
    if (provider === 'aws') {
      // AWS S3 健康检查
      const s3StorageClient = storageClient as S3StorageClient;
      const s3Client = s3StorageClient.getS3Client();
      const command = new HeadBucketCommand({
        Bucket: config.bucketName,
      });
      await s3Client.send(command);
    } else if (provider === 'r2') {
      // Cloudflare R2 健康检查 - 尝试获取一个测试对象
      try {
        await storageClient.getObject('health-check-test');
      } catch (error) {
        // R2 中如果文件不存在会抛出错误，这是正常的
        // 只要不是连接错误就认为健康
        if (error instanceof Error && !error.message.includes('not found')) {
          throw error;
        }
      }
    }

    // 如果成功，返回健康状态
    const response: StorageHealthCheckResponse = {
      status: 'ok',
      message: `${provider.toUpperCase()} storage connection is healthy`,
      timestamp: new Date().toISOString(),
      provider,
      connection: {
        region: isStorageConfig(config) ? config.region : 'auto',
        bucket: config.bucketName,
        endpoint: isStorageConfig(config) ? config.endpoint : undefined,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Storage health check failed:', error);

    // 处理不同类型的错误
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // 如果是配置错误，返回 400
      if (error.message.includes('Missing required') || error.message.includes('environment variables')) {
        statusCode = 400;
      }
      // 如果是存储相关错误，返回 503
      else if (error.name === 'NoSuchBucket' || error.name === 'AccessDenied' ||
               error.message.includes('not found') || error.message.includes('binding')) {
        statusCode = 503;
      }
    }

    const errorResponse: ApiErrorResponse = {
      error: 'STORAGE_HEALTH_CHECK_FAILED',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
