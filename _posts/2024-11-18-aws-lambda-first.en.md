---
layout: post
title: "AWS Lambda: Summarizing What I've Learned"
lang: en
ref: aws-lambda
categories: [AWS, Serverless, Cloud Computing]
image: assets/images/category_aws.webp
---

Although I work as a frontend developer, I recently observed our backend team building APIs using AWS Lambda. As I started developing and utilizing some APIs myself, I had the opportunity to deeply study Lambda functions and apply them to actual projects. In this post, I'll summarize what I've learned while studying and using Lambda.

## What is a Lambda Function?

AWS Lambda is a serverless computing service that allows you to run code without managing servers. It automatically executes code in response to events and charges only for the compute time used.

### Basic Lambda Function Structure

```python
def lambda_handler(event, context):
    """
    event: Event data that triggered the Lambda function
    context: Object containing runtime information
    """
    try:
        # Process business logic
        result = process_business_logic(event)
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

## API Gateway and Lambda Integration

### 1. Basic API Endpoint Setup

```python
import json

def lambda_handler(event, context):
    # Check HTTP method
    http_method = event['httpMethod']

    # Handle path parameters
    path_parameters = event.get('pathParameters', {})

    # Handle query parameters
    query_parameters = event.get('queryStringParameters', {})

    # Handle request body
    body = json.loads(event.get('body', '{}'))

    response = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'  # CORS setting
        },
        'body': json.dumps({
            'message': 'Success',
            'data': {
                'method': http_method,
                'path_params': path_parameters,
                'query_params': query_parameters,
                'body': body
            }
        })
    }

    return response
```

### 2. CORS Handling

```python
def handle_cors():
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
        },
        'body': json.dumps({'message': 'CORS enabled'})
    }

def lambda_handler(event, context):
    # Handle OPTIONS request for CORS
    if event['httpMethod'] == 'OPTIONS':
        return handle_cors()

    # Actual API logic
    # ...
```

## Environment Variables and Security

### 1. Using Environment Variables

```python
import os
import boto3
from botocore.exceptions import ClientError

# Access environment variables
DATABASE_URL = os.environ['DATABASE_URL']
API_KEY = os.environ['API_KEY']

def get_secret():
    """Retrieve secret value from AWS Secrets Manager"""
    secret_name = os.environ['SECRET_NAME']
    region_name = os.environ['AWS_REGION']

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        response = client.get_secret_value(SecretId=secret_name)
        return json.loads(response['SecretString'])
    except ClientError as e:
        raise e
```

### 2. Database Connection Example

```python
import pymysql
import os

def get_db_connection():
    """Set up database connection"""
    try:
        connection = pymysql.connect(
            host=os.environ['DB_HOST'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            db=os.environ['DB_NAME'],
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except Exception as e:
        print(f"Database connection failed: {str(e)}")
        raise e
```

## Performance Optimization

### 1. Minimizing Cold Starts

```python
# Declare DB connection object as global variable
db_connection = None

def get_db_connection():
    global db_connection
    if db_connection is None or not db_connection.open:
        db_connection = create_db_connection()
    return db_connection

def lambda_handler(event, context):
    # Reuse existing connection
    conn = get_db_connection()
    # ...
```

### 2. Parallel Processing

```python
import asyncio
import aiohttp

async def fetch_data(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def process_multiple_requests(urls):
    tasks = [fetch_data(url) for url in urls]
    return await asyncio.gather(*tasks)

def lambda_handler(event, context):
    urls = event.get('urls', [])
    loop = asyncio.get_event_loop()
    results = loop.run_until_complete(process_multiple_requests(urls))
    return {
        'statusCode': 200,
        'body': json.dumps(results)
    }
```

## Logging and Monitoring

### Structured Logging

```python
import logging
import json
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def log_event(event_type, message, extra=None):
    log_data = {
        'timestamp': time.time(),
        'type': event_type,
        'message': message,
        'extra': extra or {}
    }
    logger.info(json.dumps(log_data))
```

## Real-World Example

### Image Processing

```python
import boto3
from PIL import Image
import io

def process_image(event, context):
    s3 = boto3.client('s3')
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']

    # Download original image
    image_data = s3.get_object(Bucket=bucket, Key=key)['Body'].read()
    image = Image.open(io.BytesIO(image_data))

    # Resize image
    resized = image.resize((800, 600))

    # Upload processed image
    buffer = io.BytesIO()
    resized.save(buffer, format=image.format)
    s3.put_object(
        Bucket=bucket,
        Key=f"resized/{key}",
        Body=buffer.getvalue()
    )
```

## Conclusion

Lambda functions are a key component of serverless architecture, and when used appropriately, they can significantly improve development productivity and cost efficiency. Even from a frontend developer's perspective, they are particularly useful for implementing simple backend functionality or performing tasks like image processing.

I plan to continue implementing various features using Lambda functions and will update this post as I learn new things.

## References

- [AWS Lambda Official Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS Lambda Python Programming Model](https://docs.aws.amazon.com/lambda/latest/dg/python-programming-model.html)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
