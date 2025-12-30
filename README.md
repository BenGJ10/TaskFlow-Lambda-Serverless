# Serverless Task Manager

This project is a Serverless Task Manager application built using AWS Lambda, API Gateway, and DynamoDB. It allows users to create, read, update, and delete tasks through a RESTful API.

## Architecture Diagram

```vb
Next.js (TypeScript)
      ↓
Cognito User Pool (Auth)
      ↓
API Gateway HTTP API  ──→ Lambda (Python) ──→ DynamoDB
      ↓
CloudFront + S3 (hosting)
      ↓
SES/SNS (reminders – optional)
```

---

## Features

- User authentication with **AWS Cognito**

- **RESTful API** for task management

- Serverless architecture using **AWS Lambda** and **API Gateway**

- Data storage with **DynamoDB**

- Optional email/SMS reminders using **AWS SNS**

---

## Under Development

This project is currently under development. Features and architecture may change as the project evolves.

---