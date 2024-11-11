---
layout: post
title: "Building an API Client in Next.js"
lang: en
ref: nextjs-api-client
categories: [Next.js, TypeScript, Dev]
image: assets/images/category_dev.webp
---

## Introduction

While API communication is essential in web applications, in this post, I'll revisit how I implemented an API client using TypeScript and Axios in Next.js.

## Key Features

1. Token-based authentication
2. Automatic token renewal
3. Request throttling
4. Type safety
5. Error handling

## Implementation Details

### 1. API Client Base Structure

```typescript
interface ApiOptions {
  params?: Record<string, string | number | boolean>;
  throttleKey?: string;
}

export interface ApiResponse<T> {
  data: T;
  response?: string;
  message?: string;
  success?: boolean;
}
```

I added throttleKey to prevent the same communication from being requested more than twice simultaneously. You can add a body parameter if needed. In my service, I initially didn't need to include a body parameter, so I left it out.

### 2. Implementing Throttling

Here's an example of implementing throttling to reduce server load and prevent duplicate requests:

```typescript
class ThrottleManager {
  private requests = new Map();
  private readonly throttleTime = 1000; // 1second

  async throttle<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const existingRequest = this.requests.get(key);

    if (
      existingRequest &&
      now - existingRequest.timestamp < this.throttleTime
    ) {
      return existingRequest.promise as Promise<T>;
    }
  }
}
```

### 3. Token Management and Interceptors

This is used in our admin system. When logging in, we receive a token, store it, and then always include it in the request interceptor.

```typescript
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request Interceptor
  instance.interceptors.request.use((config) => {
    const token = auth.getAdminToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Token expiration handling
      if (error.response?.status === 401) {
        // ... token renewal logic
      }
      // ... error handling
    }
  );

  return instance;
};
```

### 4. HTTP Method Implementation

Now we'll implement GET, POST, PUT, DELETE, and PATCH requests in earnest.

```typescript
export const api = {
  async get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const throttleKey =
      options.throttleKey ||
      `GET:${endpoint}:${JSON.stringify(options.params)}`;

    return throttleManager.throttle(throttleKey, async () => {
      // ... implementation details
    });
  },
  // POST, PUT, DELETE, PATCH methods implemented similarly
};
```

### Usage Example

```typescript
interface User {
  id: number;
  name: string;
}

// GET 요청
const user = await api.get<User>("/users/1");

// POST 요청
const newUser = await api.post<User>("/users", { name: "John" });
```

I actually implemented something similar in Flutter as well.
In Flutter, I used a combination of the dio library and riverpod.
