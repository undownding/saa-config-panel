// 存储连接检查脚本
const checkStorage = async () => {
  const provider = process.env.STORAGE_PROVIDER || 'aws';

  console.log(`检查 ${provider.toUpperCase()} 存储连接...`);

  if (provider === 'aws') {
    const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET_NAME'];
    const missing = requiredVars.filter(env => !process.env[env]);

    if (missing.length > 0) {
      console.error(`❌ 缺少 AWS 环境变量: ${missing.join(', ')}`);
      process.exit(1);
    }

    console.log('✅ AWS S3 环境变量配置完整');
    console.log(`   Bucket: ${process.env.AWS_S3_BUCKET_NAME}`);
    console.log(`   Region: ${process.env.AWS_REGION}`);

  } else if (provider === 'r2') {
    const requiredVars = ['R2_BUCKET_NAME'];
    const missing = requiredVars.filter(env => !process.env[env]);

    if (missing.length > 0) {
      console.error(`❌ 缺少 R2 环境变量: ${missing.join(', ')}`);
      process.exit(1);
    }

    console.log('✅ Cloudflare R2 环境变量配置完整');
    console.log(`   Bucket: ${process.env.R2_BUCKET_NAME}`);

  } else {
    console.error(`❌ 不支持的存储提供商: ${provider}`);
    process.exit(1);
  }
};

checkStorage().catch(console.error);
