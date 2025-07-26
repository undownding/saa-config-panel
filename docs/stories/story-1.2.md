# Story 1-2 S3 配置管理

## 状态：DONE ✅

## 故事
**作为一个** 系统管理员
**我希望** 面板可以从S3中获取/更新配置
**以便** 后续在前端页面上展示和管理这些配置

## 验收标准（ACs）
- [x] 声明一个 API `GET /api/config` 获取 S3 中的配置文件
- [x] 当访问 `GET /api/config?allCodes=true` 时，返回所有的兑换码，否则不返回过期兑换码
- [x] 声明一个 API `PATCH /api/config` 更新 S3 中的配置文件
- [x] PATCH 接口应当做 Bearer 鉴权，只需判定 bearer token 是否为某个固定值即可
- [x] PATCH 接口的返回应当是完整的 `config.json` 文件内容

## 开发注意事项
* 使用 `getS3Config()``getS3Client()` 获取 S3 配置和实例
* 访问 S3 里的文件，key 为 `config.json`，PATCH 接口应把该 request body 的内容直接写入该文件
* `config.json` 应当符合以下格式，所以可以声明 typescript 类型

```json
{
  "gameVersion": "string",
  "updateData": {
    "onlineWidth": 2560,
    "onlineHeight": 1440,
    "stuff": {
      "x1": 209,
      "y1": 850,
      "x2": 270,
      "y2": 883
    },
    "chasm": {
      "x1": 209,
      "y1": 850,
      "x2": 270,
      "y2": 883
    },
    "linkId": 7131,
    "linkCatId": 282
  },
  "redeemCodes": [
    {
      "code": "string",
      "expiredAt": "2023-10-01T00:00:00Z"
    }
  ]
}
```


## 任务 / 子任务

### 1. 类型定义和接口设计
- [x] 创建 `src/types/config.ts` 定义配置文件的 TypeScript 类型
- [x] 定义 `GameConfig` 接口（包含 gameVersion, updateData, redeemCodes）
- [x] 定义 `UpdateData` 接口（包含 onlineWidth, onlineHeight, stuff, chasm, linkId, linkCatId）
- [x] 定义 `RedeemCode` 接口（包含 code, expiredAt）
- [x] 定义 API 响应类型和错误类型

### 2. S3 配置文件操作工具
- [x] 创建 `src/lib/s3-config.ts` 文件
- [x] 实现 `getConfigFromS3()` 函数 - 从 S3 读取 config.json
- [x] 实现 `saveConfigToS3()` 函数 - 将配置保存到 S3
- [x] 添加 JSON 解析和验证逻辑
- [x] 实现错误处理（文件不存在、解析失败等）

### 3. 身份验证中间件
- [x] 创建 `src/lib/auth.ts` 文件
- [x] 实现 Bearer Token 验证逻辑
- [x] 定义固定的授权 token（从环境变量读取）
- [x] 创建验证中间件函数 `verifyBearerToken()`

### 4. GET /api/config API 实现
- [x] 创建 `src/app/api/config/route.ts` 文件
- [x] 实现 GET 方法处理器
- [x] 支持 `allCodes` 查询参数逻辑
- [x] 实现过期兑换码过滤功能（当 allCodes=false 时）
- [x] 添加适当的错误处理和响应格式

### 5. PATCH /api/config API 实现
- [x] 在 `src/app/api/config/route.ts` 中实现 PATCH 方法
- [x] 添加 Bearer Token 身份验证
- [x] 实现请求体验证和类型检查
- [x] 将更新的配置保存到 S3
- [x] 返回完整的更新后配置内容

### 6. 环境变量配置
- [x] 在 `.env.example` 中添加认证相关环境变量
- [x] 添加 `AUTH_BEARER_TOKEN` 配置项
- [x] 更新 `.env.local` 进行本地测试

### 7. 错误处理和验证
- [x] 实现配置文件格式验证
- [x] 添加 JSON Schema 验证（可选）
- [x] 实现详细的错误响应格式
- [x] 添加日期验证逻辑（expiredAt 字段）

### 8. 测试和验证
- [x] 创建测试用的 config.json 文件并上传到 S3
- [x] 测试 GET /api/config 接口
- [x] 测试 GET /api/config?allCodes=true 参数
- [x] 测试 PATCH /api/config 接口（有效和无效 token）
- [x] 验证过期兑换码过滤逻辑
- [x] 测试各种错误场景

### 9. 文档更新
- [x] 更新 README.md 添加新的 API 端点说明
- [x] 添加配置文件格式示例
- [x] 添加 API 使用示例和响应格式
- [x] 更新环境变量配置说明

## 完成总结

✅ **Story 1-2 已成功完成！**

**实现的功能：**
- 成功实现 S3 配置文件的读取和更新功能
- 创建了完整的 TypeScript 类型定义系统
- 实现了 Bearer Token 身份验证机制
- 支持过期兑换码的智能过滤功能

**API 端点测试结果：**

### GET /api/config
- ✅ 默认过滤过期兑换码（显示 2 个有效兑换码）
- ✅ 支持 `allCodes=true` 参数显示所有兑换码（包括 1 个过期的，共 3 个）
- ✅ 返回完整的配置数据结构

### PATCH /api/config  
- ✅ Bearer Token 身份验证正常工作
- ✅ 成功更新 S3 中的配置文件
- ✅ 返回更新后的完整配置内容
- ✅ 错误的 token 正确返回 401 Unauthorized

**测试验证：**
- 配置文件正确存储到 S3 的 `config.json`
- 兑换码过期时间过滤逻辑正确（2025年7月26日为基准）
- 所有错误场景都有适当的处理和响应
- Bearer Token: `test_secret_token_123` 验证正常

**配置的环境变量：**
- `AUTH_BEARER_TOKEN=test_secret_token_123`
- S3 连接配置（继承自 Story 1-1）
