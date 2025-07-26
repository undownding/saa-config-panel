export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  endpoint?: string;
}

export interface S3HealthCheckResponse {
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
  s3Connection?: {
    region: string;
    bucket: string;
    endpoint?: string;
  };
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}
