import { StorageClientFactory } from './storage-provider';
import { GameConfig, ValidationResult } from '@/types/config';
import { validateConfigWithClassValidator } from './validation';
import { TimeUtils } from './time-utils';

const CONFIG_KEY = 'config.json';

/**
 * 从存储获取配置文件
 */
export async function getConfigFromS3(): Promise<GameConfig> {
  const storageClient = StorageClientFactory.getClient();

  try {
    // 读取配置文件内容
    const bodyString = await storageClient.getObject(CONFIG_KEY);

    // 解析 JSON
    let config: GameConfig;
    try {
      config = JSON.parse(bodyString);
    } catch (error) {
      throw new Error('Invalid config format: Unable to parse JSON');
    }

    // 验证配置格式
    const validationResult: ValidationResult = await validateConfigWithClassValidator(config);

    if (!validationResult.isValid) {
      const errorMessages = validationResult.errors.join(', ');
      throw new Error(`Invalid config format: ${errorMessages}`);
    }

    return config;
  } catch (error) {
    if (error instanceof Error) {
      // 如果是我们抛出的格式错误，直接重新抛出
      if (error.message.includes('Invalid config format')) {
        throw error;
      }

      // 检查是否为文件不存在错误
      if (error.message.includes('not found') || error.message.includes('NoSuchKey')) {
        throw new Error('Config file not found');
      }
    }

    console.error('Error getting config from storage:', error);
    throw new Error(`Failed to get config: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 保存配置文件到存储
 */
export async function saveConfigToS3(config: GameConfig): Promise<GameConfig> {
  const storageClient = StorageClientFactory.getClient();

  try {
    // 验证配置格式
    const validationResult: ValidationResult = await validateConfigWithClassValidator(config);

    if (!validationResult.isValid) {
      const errorMessages = validationResult.errors.join(', ');
      throw new Error(`Invalid config format: ${errorMessages}`);
    }

    // 转换为 JSON 字符串
    const configJson = JSON.stringify(config, null, 2);

    // 保存到存储
    await storageClient.putObject(CONFIG_KEY, configJson);

    return config;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid config format')) {
      throw error;
    }

    console.error('Error saving config to storage:', error);
    throw new Error(`Failed to save config: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // 验证 version
  if (!configData.version || typeof configData.version !== 'string') {
    errors.push('version must be a string');
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
  const validCodes = config.redeemCodes.filter(code => {
    return !TimeUtils.isExpired(code.expiredAt);
  });

  return {
    ...config,
    redeemCodes: validCodes,
  };
}
