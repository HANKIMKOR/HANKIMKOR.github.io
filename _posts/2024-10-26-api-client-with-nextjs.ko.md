---
layout: post
title: "Next.js에서 API 클라이언트 만들기"
lang: ko
ref: nextjs-api-client
categories: [Next.js, TypeScript, Dev]
image: assets/images/category_dev.webp
---

## 소개

웹 애플리케이션에서 API 통신은 필수적인데, 이 글에서는 Next.js에서 TypeScript와 Axios를 사용하여 내가 구현한 API 클라이언트 만드는 것을 복습해보겠다.

## 주요 기능

1. 토큰 기반 인증 처리
2. 토큰 만료 시 자동 갱신
3. 요청 쓰로틀링
4. 타입 안전성
5. 에러 처리

## 구현 상세

### 1. API 클라이언트 기본 구조

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

throttleKey는 같은 통신이 동시에 2번 이상 요청되는 것을 방지하기 위해서 넣었다.
body가 필요한 분은 body를 더 넣어도 된다. 내가 만드는 서비스에선 일단 처음에는 body를 넣을 일이 없어서 일단 넣지 않았다.

### 2. 쓰로틀링 구현하기

서버 부하를 줄이고 중복 요청을 방지하기 위한 쓰로틀링 구현 예시.

```typescript
class ThrottleManager {
  private requests = new Map();
  private readonly throttleTime = 1000; // 1초

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

### 3. 토큰 관리와 인터셉터

우리 어드민에서 사용하는 것이다. 로그인 시에 토큰을 받아오고 그걸 저장해뒀따가 요청 인터셉터에 항상 담아서 보낼꺼다.

```typescript
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 요청 인터셉터
  instance.interceptors.request.use((config) => {
    const token = auth.getAdminToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // 응답 인터셉터
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // 토큰 만료 처리
      if (error.response?.status === 401) {
        // ... 토큰 갱신 로직
      }
      // ... 에러 처리
    }
  );

  return instance;
};
```

### 4. HTTP 메서드 구현

GET, POST, PUT, DELETE, PATCH 요청을 이제 본격적으로 구현한다.

```typescript
export const api = {
  async get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const throttleKey =
      options.throttleKey ||
      `GET:${endpoint}:${JSON.stringify(options.params)}`;

    return throttleManager.throttle(throttleKey, async () => {
      // ...
    });
  },
  // POST, PUT, DELETE, PATCH 메서드도 유사하게 구현
};
```

### 사용예시

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

사실 이렇게 구현한건 flutter에서도 이미 비슷하게 구현을 했다.
flutter에서는 dio 라이브러리와 riverpod을 조합하여 사용하였다.
