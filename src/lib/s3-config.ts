import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, getS3Config } from './s3-client';
import { GameConfig, ValidationResult } from '@/types/config';
import { validateConfigWithClassValidator } from './validation';

const CONFIG_KEY = 'config.json';

/**
 * 从 S3 获取配置文件
 */
export async function getConfigFromS3(): Promise<GameConfig> {
  const s3Client = getS3Client();
  const s3Config = getS3Config();

  try {
    const command = new GetObjectCommand({
      Bucket: s3Config.bucketName,
      Key: CONFIG_KEY,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('Empty response body from S3');
    }

    // 读取响应体内容
    const bodyString = await response.Body.transformToString();
    
    // 解析 JSON
    const config = JSON.parse(bodyString) as GameConfig;
    
    // 验证配置格式
    const validation = await validateConfig(config);
    if (!validation.isValid) {
      throw new Error(`Invalid config format: ${validation.errors.join(', ')}`);
    }

    return config;
  } catch (error) {
    console.error('Error reading config from S3:', error);
    
    if (error instanceof Error) {
      if (error.name === 'NoSuchKey') {
        throw new Error('Config file not found in S3');
      }
      throw error;
    }
    
    throw new Error('Unknown error occurred while reading config from S3');
  }
}

/**
 * 将配置保存到 S3
 */
export async function saveConfigToS3(config: GameConfig): Promise<GameConfig> {
  const s3Client = getS3Client();
  const s3Config = getS3Config();

  // 验证配置格式
  const validation = await validateConfig(config);
  if (!validation.isValid) {
    throw new Error(`Invalid config format: ${validation.errors.join(', ')}`);
  }

  try {
    const configJson = JSON.stringify(config, null, 2);

    const command = new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: CONFIG_KEY,
      Body: configJson,
      ContentType: 'application/json',
    });

    await s3Client.send(command);
    
    return config;
  } catch (error) {
    console.error('Error saving config to S3:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Unknown error occurred while saving config to S3');
  }
}

/**
 * 使用 class-validator 验证配置格式
 */
export async function validateConfig(config: unknown): Promise<ValidationResult> {
  return await validateConfigWithClassValidator(config);
}

/**
 * 旧的验证函数（已弃用，保留用于兼容性）
 * @deprecated 使用 validateConfig 代替
 */
/**
 * 旧的验证函数（已弃用，保留用于兼容性）
 * @deprecated 使用 validateConfig 代替
 */
export function validateConfigLegacy(config: unknown): ValidationResult {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('Config must be an object');
    return { isValid: false, errors };
  }

  // 类型断言用于兼容性
  const configData = config as Record<string, unknown>;

  // 验证 gameVersion
  if (!configData.gameVersion || typeof configData.gameVersion !== 'string') {
    errors.push('gameVersion must be a string');
  }

  // 验证 updateData
  if (!configData.updateData || typeof configData.updateData !== 'object') {
    errors.push('updateData must be an object');
  } else {
    const updateData = configData.updateData as Record<string, unknown>;
    
    if (typeof updateData.onlineWidth !== 'number') {
      errors.push('updateData.onlineWidth must be a number');
    }
    
    if (typeof updateData.onlineHeight !== 'number') {
      errors.push('updateData.onlineHeight must be a number');
    }
    
    if (typeof updateData.linkId !== 'number') {
      errors.push('updateData.linkId must be a number');
    }
    
    if (typeof updateData.linkCatId !== 'number') {
      errors.push('updateData.linkCatId must be a number');
    }
    
    // 验证 stuff 和 chasm 位置
    ['stuff', 'chasm'].forEach(positionName => {
      const position = updateData[positionName];
      if (!position || typeof position !== 'object') {
        errors.push(`updateData.${positionName} must be an object`);
      } else {
        const positionData = position as Record<string, unknown>;
        ['x1', 'y1', 'x2', 'y2'].forEach(coord => {
          if (typeof positionData[coord] !== 'number') {
            errors.push(`updateData.${positionName}.${coord} must be a number`);
          }
        });
      }
    });
  }

  // 验证 redeemCodes
  if (!Array.isArray(configData.redeemCodes)) {
    errors.push('redeemCodes must be an array');
  } else {
    configData.redeemCodes.forEach((code: unknown, index: number) => {
      if (!code || typeof code !== 'object') {
        errors.push(`redeemCodes[${index}] must be an object`);
      } else {
        const codeData = code as Record<string, unknown>;
        if (!codeData.code || typeof codeData.code !== 'string') {
          errors.push(`redeemCodes[${index}].code must be a string`);
        }
        
        if (!codeData.expiredAt || typeof codeData.expiredAt !== 'string') {
          errors.push(`redeemCodes[${index}].expiredAt must be a string`);
        } else {
          // 验证日期格式
          const date = new Date(codeData.expiredAt as string);
          if (isNaN(date.getTime())) {
            errors.push(`redeemCodes[${index}].expiredAt must be a valid ISO date string`);
          }
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 过滤过期的兑换码
 */
export function filterExpiredRedeemCodes(config: GameConfig): GameConfig {
  const now = new Date();
  
  const validCodes = config.redeemCodes.filter(code => {
    const expiredAt = new Date(code.expiredAt);
    return expiredAt > now;
  });

  return {
    ...config,
    redeemCodes: validCodes,
  };
}
