# AWS deployment checklist

These notes describe the supplied project configuration. Confirm account-specific settings in AWS before redeploying.

## Amazon S3 frontend
1. Upload the contents of `frontend/` to the website bucket.
2. Enable Static website hosting and set `index.html` as the index document.
3. Configure bucket access according to the chosen website-hosting setup.
4. Verify the S3 website endpoint.

Current endpoint: http://expenseflow-website-2026-farmaan.s3-website.eu-north-1.amazonaws.com

Note: S3 website endpoints use HTTP. Use an HTTPS-enabled distribution such as CloudFront if HTTPS is needed.

## Amazon DynamoDB
Create table `Expenses` with partition key `expenseID` (String), no sort key, and On-demand capacity in `eu-north-1`.

## AWS Lambda
1. Create a Python 3.14 Lambda function.
2. Deploy `backend/lambda_function.py`.
3. Give its execution role least-privilege access to the `Expenses` table for `PutItem`, `Scan`, `UpdateItem`, and `DeleteItem`.

## Amazon API Gateway
1. Create or use an API Gateway HTTP API.
2. Configure `GET`, `POST`, `PUT`, and `DELETE` routes to integrate with the Lambda function.
3. Deploy the API stage.
4. Configure CORS for the S3 website origin, these methods, and the `Content-Type` header.

API name: `expenseflowapi`; API ID: `qkuy0vdnh5`; region: `eu-north-1`.

Current frontend API URL: `https://qkuy0vdnh5.execute-api.eu-north-1.amazonaws.com/prod/expenses`

## Verify
- Open the S3 website.
- Add an expense and confirm it appears.
- Refresh the page to verify persistence.
- Edit and delete an expense.
- Confirm dashboard totals and category summaries update.

## Security notes
- Never commit AWS credentials or secrets.
- The current frontend has no authentication; do not use it for sensitive financial records.
- The Lambda GET operation uses DynamoDB `Scan`, which may not scale efficiently for large datasets.
