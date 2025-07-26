import 'reflect-metadata';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GameConfig, ValidationResult } from '@/types/config';

/**
 * 使用 class-validator 验证配置格式
 */
export async function validateConfigWithClassValidator(config: unknown): Promise<ValidationResult> {
  try {
    // 将普通对象转换为类实例
    const configInstance = plainToClass(GameConfig, config);
    
    // 执行验证
    const errors: ValidationError[] = await validate(configInstance, {
      skipMissingProperties: false,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length === 0) {
      return {
        isValid: true,
        errors: [],
      };
    }

    // 递归收集所有错误信息
    const errorMessages = extractErrorMessages(errors);

    return {
      isValid: false,
      errors: errorMessages,
    };
  } catch (error) {
    console.error('Validation failed:', error);
    return {
      isValid: false,
      errors: ['Validation process failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
    };
  }
}

/**
 * 递归提取验证错误信息
 */
function extractErrorMessages(errors: ValidationError[], prefix = ''): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    const propertyPath = prefix ? `${prefix}.${error.property}` : error.property;

    // 添加当前属性的约束错误
    if (error.constraints) {
      for (const constraint of Object.values(error.constraints)) {
        messages.push(`${propertyPath}: ${constraint}`);
      }
    }

    // 递归处理嵌套错误
    if (error.children && error.children.length > 0) {
      const childMessages = extractErrorMessages(error.children, propertyPath);
      messages.push(...childMessages);
    }
  }

  return messages;
}
