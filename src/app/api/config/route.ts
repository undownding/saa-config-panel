import { NextRequest, NextResponse } from 'next/server';
import { getConfigFromS3, saveConfigToS3, filterExpiredRedeemCodes } from '@/lib/s3-config';
import { verifyBearerToken, createUnauthorizedResponse } from '@/lib/auth';
import { GameConfig, ConfigResponse, ConfigErrorResponse } from '@/types/config';

/**
 * GET /api/config - 获取配置文件
 * 支持 allCodes 查询参数来控制是否返回过期的兑换码
 */
export async function GET(request: NextRequest): Promise<NextResponse<ConfigResponse | ConfigErrorResponse>> {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const allCodes = searchParams.get('allCodes') === 'true';

    // 从 S3 获取配置
    let config = await getConfigFromS3();

    // 如果不需要全部兑换码，则过滤过期的
    if (!allCodes) {
      config = filterExpiredRedeemCodes(config);
    }

    const response: ConfigResponse = {
      status: 'ok',
      data: config,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error getting config:', error);

    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // 如果是配置文件不存在，返回 404
      if (error.message.includes('Config file not found')) {
        statusCode = 404;
      }
      // 如果是配置格式错误，返回 422
      else if (error.message.includes('Invalid config format')) {
        statusCode = 422;
      }
    }

    const errorResponse: ConfigErrorResponse = {
      error: 'CONFIG_GET_FAILED',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * PATCH /api/config - 更新配置文件
 * 需要 Bearer Token 身份验证
 */
export async function PATCH(request: NextRequest): Promise<NextResponse<ConfigResponse | ConfigErrorResponse>> {
  try {
    // 验证身份
    if (!verifyBearerToken(request)) {
      const unauthorizedResponse = createUnauthorizedResponse();
      return NextResponse.json(unauthorizedResponse, { status: 401 });
    }

    // 解析请求体
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      const errorResponse: ConfigErrorResponse = {
        error: 'INVALID_JSON',
        message: 'Request body must be valid JSON',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 验证请求体是否为有效的配置格式
    const config = requestBody as GameConfig;

    // 保存配置到 S3
    const savedConfig = await saveConfigToS3(config);

    const response: ConfigResponse = {
      status: 'ok',
      data: savedConfig,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error updating config:', error);

    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // 如果是配置格式错误，返回 422
      if (error.message.includes('Invalid config format')) {
        statusCode = 422;
      }
      // 如果是身份验证配置错误，返回 500
      else if (error.message.includes('AUTH_BEARER_TOKEN')) {
        statusCode = 500;
        errorMessage = 'Server authentication configuration error';
      }
    }

    const errorResponse: ConfigErrorResponse = {
      error: 'CONFIG_UPDATE_FAILED',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
