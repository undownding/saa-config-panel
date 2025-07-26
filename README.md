This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## SAA Config Panel

A Next.js application that provides S3 API capabilities for system administration.

## Environment Setup

Before running the application, you need to configure the environment variables for S3 connection.

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and configure your S3 settings:
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-west-2
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_S3_ENDPOINT_URL=https://s3.amazonaws.com
```

For MinIO or other S3-compatible services, use your custom endpoint:
```env
AWS_S3_ENDPOINT_URL=http://localhost:9000
```

3. Configure authentication token:
```env
AUTH_BEARER_TOKEN=your_secret_bearer_token_here
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API Endpoints

### Health Check
- **GET** `/api/health_check` - Check S3 connection status

Example response (success):
```json
{
  "status": "ok",
  "message": "S3 connection is healthy",
  "timestamp": "2025-07-26T10:30:00.000Z",
  "s3Connection": {
    "region": "us-west-2",
    "bucket": "your-bucket-name",
    "endpoint": "https://s3.amazonaws.com"
  }
}
```

Example response (error):
```json
{
  "error": "S3_HEALTH_CHECK_FAILED",
  "message": "Missing required S3 environment variables. Please check AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET_NAME.",
  "timestamp": "2025-07-26T10:30:00.000Z"
}
```

### Configuration Management
- **GET** `/api/config` - Get configuration from S3
- **GET** `/api/config?allCodes=true` - Get configuration including expired redeem codes
- **PATCH** `/api/config` - Update configuration in S3 (requires Bearer token authentication)

#### GET /api/config

Get the current game configuration. By default, expired redeem codes are filtered out.

Query Parameters:
- `allCodes` (optional): Set to `true` to include expired redeem codes

Example response:
```json
{
  "status": "ok",
  "data": {
    "gameVersion": "1.0.0",
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
        "code": "ACTIVE_CODE_2025",
        "expiredAt": "2025-12-31T23:59:59Z"
      }
    ]
  },
  "timestamp": "2025-07-26T10:30:00.000Z"
}
```

#### PATCH /api/config

Update the game configuration. Requires Bearer token authentication.

Headers:
```
Authorization: Bearer your_token_here
Content-Type: application/json
```

Request body should be a complete GameConfig object:
```json
{
  "gameVersion": "1.0.1",
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
      "code": "NEW_CODE_2025",
      "expiredAt": "2025-12-31T23:59:59Z"
    }
  ]
}
```

Response returns the complete updated configuration.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
