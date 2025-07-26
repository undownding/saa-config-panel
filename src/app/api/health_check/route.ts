import { NextRequest, NextResponse } from 'next/server';
import { HeadBucketCommand } from '@aws-sdk/client-s3';
import { getS3Client, getS3Config } from '@/lib/s3-client';
import { S3HealthCheckResponse, ApiErrorResponse } from '@/types/s3';

export async function GET(request: NextRequest): Promise<NextResponse<S3HealthCheckResponse | ApiErrorResponse>> {
  try {
    // 获取 S3 配置
    const config = getS3Config();

    console.log(config)

    // 获取 S3 客户端
    const s3Client = getS3Client();

    // 尝试访问指定的存储桶来测试连接
    const command = new HeadBucketCommand({
      Bucket: config.bucketName,
    });

    await s3Client.send(command);

    // 如果成功，返回健康状态
    const response: S3HealthCheckResponse = {
      status: 'ok',
      message: 'S3 connection is healthy',
      timestamp: new Date().toISOString(),
      s3Connection: {
        region: config.region,
        bucket: config.bucketName,
        endpoint: config.endpoint,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('S3 health check failed:', error);

    // 处理不同类型的错误
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // 如果是配置错误，返回 400
      if (error.message.includes('Missing required S3 environment variables')) {
        statusCode = 400;
      }
      // 如果是 S3 相关错误，返回 503
      else if (error.name === 'NoSuchBucket' || error.name === 'AccessDenied') {
        statusCode = 503;
        errorMessage = `S3 Error: ${error.message}`;
      }
    }

    const errorResponse: ApiErrorResponse = {
      error: 'S3_HEALTH_CHECK_FAILED',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
