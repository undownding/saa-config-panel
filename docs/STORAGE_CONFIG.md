# 存储配置指南

本项目现在支持两种存储后端：AWS S3 和 Cloudflare R2。

## 配置环境变量

### 使用 AWS S3

```bash
# 设置存储提供商为 AWS S3
STORAGE_PROVIDER=aws

# AWS S3 配置
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# 可选：自定义端点（用于 MinIO 等 S3 兼容服务）
AWS_S3_ENDPOINT_URL=https://your-custom-endpoint.com
```

### 使用 Cloudflare R2

```bash
# 设置存储提供商为 Cloudflare R2
STORAGE_PROVIDER=r2

# Cloudflare R2 配置
R2_BUCKET_NAME=your-r2-bucket-name
R2_BINDING_NAME=R2_BUCKET
```

## Cloudflare R2 部署配置

### 1. 更新 wrangler.toml

确保你的 `wrangler.toml` 文件包含 R2 绑定配置：

```toml
# R2 存储绑定配置
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "your-actual-r2-bucket-name"
preview_bucket_name = "your-r2-bucket-name-preview"

# 环境变量配置
[vars]
STORAGE_PROVIDER = "r2"
R2_BUCKET_NAME = "your-actual-r2-bucket-name"
R2_BINDING_NAME = "R2_BUCKET"
```

### 2. 创建 R2 存储桶

在 Cloudflare Dashboard 中创建 R2 存储桶，或使用 wrangler CLI：

```bash
# 创建 R2 存储桶
wrangler r2 bucket create your-r2-bucket-name

# 列出现有存储桶
wrangler r2 bucket list
```

## 部署说明

### 本地开发

1. 复制 `.env.example` 到 `.env.local`
2. 根据你选择的存储后端配置环境变量
3. 运行开发服务器：

```bash
npm run dev
```

### Cloudflare Workers 部署

1. 确保 `wrangler.toml` 配置正确
2. 部署到 Cloudflare Workers：

```bash
npm run deploy
```

## API 端点

- `GET /api/health_check` - 检查存储连接状态
- `GET /api/config` - 获取配置文件
- `PATCH /api/config` - 更新配置文件（需要身份验证）

## 存储后端切换

项目会根据 `STORAGE_PROVIDER` 环境变量自动选择存储后端：

- `aws` - 使用 AWS S3 或兼容服务
- `r2` - 使用 Cloudflare R2

无需修改代码，只需更改环境变量即可切换存储后端。
