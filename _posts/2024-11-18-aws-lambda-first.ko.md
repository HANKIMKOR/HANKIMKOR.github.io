---
layout: post
title: "AWS Lambda: 배운 것 정리하기"
lang: ko
ref: aws-lambda
categories: [AWS, Serverless, Cloud Computing]
image: assets/images/category_aws.webp
---

프론트엔드 개발자로 일하고 있지만, 최근 우리 팀의 백엔드에서 AWS Lambda를 사용하여 API를 구축하는 것을 보게 되었다. 일부 API는 내가 직접 개발하여 활용하게 되면서, Lambda 함수에 대해 깊이 있게 공부하고 실제 프로젝트에 적용하게 되었다. 이 글에서는 Lambda를 학습하고 사용하면서 알게 된 내용들을 정리하려고 한다.

## Lambda 함수란?

AWS Lambda는 서버리스 컴퓨팅 서비스로, 별도의 서버 관리 없이 코드를 실행할 수 있게 해준다. 이벤트에 응답하여 자동으로 코드를 실행하고, 사용한 컴퓨팅 시간에 대해서만 비용을 지불하는 방식이다.

### Lambda 함수의 기본 구조

```python
def lambda_handler(event, context):
    """
    event: Lambda 함수를 트리거한 이벤트 데이터
    context: 런타임 정보를 포함하는 객체
    """
    try:
        # 비즈니스 로직 처리
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

## API Gateway와 Lambda 연동

### 1. 기본 API 엔드포인트 설정

```python
import json

def lambda_handler(event, context):
    # HTTP 메서드 확인
    http_method = event['httpMethod']

    # 경로 파라미터 처리
    path_parameters = event.get('pathParameters', {})

    # 쿼리 파라미터 처리
    query_parameters = event.get('queryStringParameters', {})

    # 요청 바디 처리
    body = json.loads(event.get('body', '{}'))

    response = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'  # CORS 설정
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

### 2. CORS 처리

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
    # OPTIONS 요청에 대한 CORS 처리
    if event['httpMethod'] == 'OPTIONS':
        return handle_cors()

    # 실제 API 로직
    # ...
```

## 환경 변수 설정과 보안

### 1. 환경 변수 사용

```python
import os
import boto3
from botocore.exceptions import ClientError

# 환경 변수 접근
DATABASE_URL = os.environ['DATABASE_URL']
API_KEY = os.environ['API_KEY']

def get_secret():
    """AWS Secrets Manager에서 비밀 값 가져오기"""
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

### 2. 데이터베이스 연결 예시

```python
import pymysql
import os

def get_db_connection():
    """데이터베이스 연결 설정"""
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
        print(f"데이터베이스 연결 실패: {str(e)}")
        raise e

def lambda_handler(event, context):
    try:
        # DB 연결
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # SQL 쿼리 실행
            cursor.execute("SELECT * FROM users")
            result = cursor.fetchall()

        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if 'conn' in locals():
            conn.close()
```

## 성능 최적화

### 1. 콜드 스타트 최소화

```python
# 전역 변수로 DB 연결 객체 선언
db_connection = None

def get_db_connection():
    global db_connection
    if db_connection is None or not db_connection.open:
        db_connection = create_db_connection()
    return db_connection

def lambda_handler(event, context):
    # 기존 연결 재사용
    conn = get_db_connection()
    # ...
```

### 2. 병렬 처리

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

## 로깅과 모니터링

### 1. 구조화된 로깅

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

def lambda_handler(event, context):
    log_event('REQUEST', 'Lambda function invoked', {'event': event})

    try:
        # 비즈니스 로직
        result = process_data(event)
        log_event('SUCCESS', 'Processing completed', {'result': result})
        return result
    except Exception as e:
        log_event('ERROR', str(e), {'stack_trace': traceback.format_exc()})
        raise
```

## 실제 활용 예시

### 1. 이미지 처리

```python
import boto3
from PIL import Image
import io

def process_image(event, context):
    s3 = boto3.client('s3')
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']

    # 원본 이미지 다운로드
    image_data = s3.get_object(Bucket=bucket, Key=key)['Body'].read()
    image = Image.open(io.BytesIO(image_data))

    # 이미지 리사이징
    resized = image.resize((800, 600))

    # 처리된 이미지 업로드
    buffer = io.BytesIO()
    resized.save(buffer, format=image.format)
    s3.put_object(
        Bucket=bucket,
        Key=f"resized/{key}",
        Body=buffer.getvalue()
    )
```

## 마무리

Lambda 함수는 서버리스 아키텍처의 핵심 구성 요소로, 적절히 활용하면 개발 생산성과 비용 효율성을 크게 높일 수 있다. 특히 프론트엔드 개발자의 입장에서도 간단한 백엔드 기능을 구현하거나 이미지 처리 등의 작업을 수행하는 데 매우 유용한 도구라고 생각한다.

앞으로도 Lambda 함수를 활용하여 다양한 기능을 구현해볼 예정이며, 새로운 내용을 학습하게 되면 이 글을 계속 업데이트할 계획이다.

## 참고 자료

- [AWS Lambda 공식 문서](https://docs.aws.amazon.com/lambda/)
- [AWS Lambda Python 프로그래밍 모델](https://docs.aws.amazon.com/lambda/latest/dg/python-programming-model.html)
- [AWS Lambda 모범 사례](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
