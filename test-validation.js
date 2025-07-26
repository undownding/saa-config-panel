import 'reflect-metadata';
import { validateConfig } from '../src/lib/s3-config';

// 测试数据
const validConfig = {
  gameVersion: "1.0.0",
  updateData: {
    onlineWidth: 1920,
    onlineHeight: 1080,
    stuff: {
      x1: 100,
      y1: 200,
      x2: 300,
      y2: 400
    },
    chasm: {
      x1: 500,
      y1: 600,
      x2: 700,
      y2: 800
    },
    linkId: 123,
    linkCatId: 456
  },
  redeemCodes: [
    {
      code: "TEST123",
      expiredAt: "2024-12-31T23:59:59.999Z"
    }
  ]
};

const invalidConfig = {
  gameVersion: 123, // 应该是字符串
  updateData: {
    onlineWidth: "1920", // 应该是数字
    onlineHeight: 1080,
    stuff: {
      x1: 100,
      y1: 200,
      x2: 300,
      y2: 400
    },
    chasm: {
      x1: 500,
      y1: 600,
      x2: 700,
      y2: 800
    },
    linkId: 123,
    linkCatId: 456
  },
  redeemCodes: [
    {
      code: "TEST123",
      expiredAt: "invalid-date" // 应该是有效的日期字符串
    }
  ]
};

async function runTests() {
  console.log('Testing class-validator implementation...\n');

  // 测试有效配置
  console.log('Testing valid config:');
  try {
    const result = await validateConfig(validConfig);
    console.log('Valid config result:', result);
  } catch (error) {
    console.error('Error validating valid config:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试无效配置
  console.log('Testing invalid config:');
  try {
    const result = await validateConfig(invalidConfig);
    console.log('Invalid config result:', result);
  } catch (error) {
    console.error('Error validating invalid config:', error);
  }
}

runTests();
