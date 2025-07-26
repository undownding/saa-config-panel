# PowerShell script to upload config.json to S3 using AWS CLI
# Make sure you have AWS CLI installed and configured

# Read environment variables from .env.local
$envFile = Get-Content .env.local
foreach ($line in $envFile) {
    if ($line -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Upload config-sample.json as config.json to S3
Write-Host "Uploading config.json to S3..."
Write-Host "Bucket: $env:AWS_S3_BUCKET_NAME"
Write-Host "Endpoint: $env:AWS_S3_ENDPOINT_URL"

# Use AWS CLI to upload the file
$env:AWS_ACCESS_KEY_ID = $env:AWS_ACCESS_KEY_ID
$env:AWS_SECRET_ACCESS_KEY = $env:AWS_SECRET_ACCESS_KEY
$env:AWS_DEFAULT_REGION = $env:AWS_REGION

if ($env:AWS_S3_ENDPOINT_URL) {
    aws s3 cp config-sample.json "s3://$env:AWS_S3_BUCKET_NAME/config.json" --endpoint-url $env:AWS_S3_ENDPOINT_URL
} else {
    aws s3 cp config-sample.json "s3://$env:AWS_S3_BUCKET_NAME/config.json"
}

Write-Host "Upload completed!"
