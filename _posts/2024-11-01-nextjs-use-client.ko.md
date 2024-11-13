---
layout: post
title: "Next.js의 'use client'와 서버/클라이언트 컴포넌트에 대하여"
lang: ko
ref: nextjs-use-client
categories: [Next.js, React, Dev]
image: assets/images/category_dev.webp
---

## 소개

Next.js를 사용하다 보면 'use client'라는 지시어를 자주 마주치게 된다. 이게 정확히 뭘까? 언제 써야 하고, 언제 쓰지 말아야 할까? React의 서버 컴포넌트는 Next.js 13 이후로 도입되었다. 이 글에서는 실제 예시와 함께 서버/클라이언트 컴포넌트의 개념과 사용법을 상세히 알아보도록 하자.

## Server Components vs Client Components의 이해

### 서버 컴포넌트 (기본값)

Next.js 13 이후 버전에서는 모든 컴포넌트가 기본적으로 서버 컴포넌트이다. 'use client'를 명시하지 않으면 자동으로 서버 컴포넌트가 된다. 서버 컴포넌트의 가장 큰 장점은 서버에서 실행되므로 클라이언트로 전송되는 JavaScript 번들 크기를 줄일 수 있다는 점이다.

```tsx
// ServerComponent.tsx
// 'use client' 없음 = 서버 컴포넌트
async function ServerComponent() {
  // 데이터베이스에서 직접 데이터를 가져올 수 있습니다
  const data = await db.query("SELECT * FROM users");

  // 서버에서만 접근 가능한 환경 변수도 안전하게 사용할 수 있습니다
  const apiKey = process.env.API_SECRET_KEY;

  return (
    <div>
      {data.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 클라이언트 컴포넌트

반면 'use client'를 선언하면 해당 컴포넌트는 클라이언트 컴포넌트가 된다. 클라이언트 컴포넌트는 브라우저에서 실행되므로 사용자 상호작용이나 브라우저 API를 자유롭게 사용할 수 있다.

```tsx
"use client";

// ClientComponent.tsx
import { useState, useEffect } from "react";

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // 브라우저 API 사용 가능
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>클릭 횟수: {count}</button>
      <p>창 너비: {windowWidth}px</p>
    </div>
  );
}
```

## 서버 컴포넌트의 장점과 활용

서버 컴포넌트는 다음과 같은 상황에서 유용하다.

1. **Data Fetching의 최적화**

- 서버에서 직접 데이터를 가져오므로 클라이언트-서버 왕복이 줄어든다.
- 워터폴 현상을 방지할 수 있다.

```tsx
// ProductList.tsx
async function ProductList() {
  // 병렬로 여러 데이터를 동시에 가져올 수 있습니다
  const [products, categories, reviews] = await Promise.all([
    fetch("https://api.example.com/products").then((res) => res.json()),
    fetch("https://api.example.com/categories").then((res) => res.json()),
    fetch("https://api.example.com/reviews").then((res) => res.json()),
  ]);

  return (
    <div>
      <Categories data={categories} />
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            reviews={reviews.filter((r) => r.productId === product.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

2. **보안 강화**

```tsx
// UserProfile.tsx
import { db } from "@/lib/db";
import { hash } from "bcrypt";

async function UserProfile({ userId }: { userId: string }) {
  const user = await db.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      // 민감한 정보는 서버에서 제외하고 전송
      password: false,
      creditCard: false,
    },
  });

  const hashedData = await hash(user.email, 10);
  // 민감한 로직은 서버에서 처리

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

3. **대규모 종속성 처리**

```tsx
// ImageProcessor.tsx
import sharp from "sharp"; // 큰 사이즈의 이미지 처리 라이브러리
import { readFile } from "fs/promises";

async function ImageProcessor({ imagePath }: { imagePath: string }) {
  const imageBuffer = await readFile(imagePath);
  const processedImage = await sharp(imageBuffer)
    .resize(800, 600)
    .webp()
    .toBuffer();

  // 무거운 이미지 처리 작업을 서버에서 수행
  return (
    <img src={`data:image/webp;base64,${processedImage.toString("base64")}`} />
  );
}
```

## 클라이언트 컴포넌트의 고급 활용

다음과 같은 경우에는 'use client'를 사용해야 한다.

1. **유저와의 상호작용 처리**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";

export function AdvancedForm() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 무거운 UI 업데이트는 트랜지션으로 처리
    startTransition(() => {
      // 복잡한 유효성 검사나 UI 업데이트
    });
  };

  return (
    <form className="space-y-4">
      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="border rounded p-2"
        />
      </div>
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="border rounded p-2"
        />
      </div>
      {isPending && <div>처리 중...</div>}
    </form>
  );
}
```

2. **브라우저 API에서 Hook을 활용하는 경우**

```tsx
"use client";

import { useEffect, useRef } from "react";

export function AdvancedBrowserFeatures() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function setupMediaStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("미디어 접근 오류:", err);
      }
    }

    setupMediaStream();
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
}
```

## 하이브리드 렌더링 패턴

실제 개발을 하다보면, 섞어서 사용하는 경우가 많다. 즉, 잘 조합을 해야된다...

```tsx
// page.tsx (서버 컴포넌트)
async function ProductPage() {
  // 서버에서 초기 데이터 로드
  const initialProducts = await fetchProducts();

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">상품 목록</h1>

      {/* 검색 및 필터링 (클라이언트) */}
      <SearchFilter />

      {/* 상품 그리드 (서버) */}
      <ProductGrid initialProducts={initialProducts} />

      {/* 장바구니 상태 관리 (클라이언트) */}
      <ShoppingCartProvider>
        <CartSummary />
      </ShoppingCartProvider>
    </div>
  );
}

// 검색 필터 컴포넌트
"use client";
function SearchFilter() {
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    inStock: false
  });

  const debouncedSearch = useMemo(
    () => debounce((value) => {
      // 검색 로직
    }, 300),
    []
  );

  return (/* 필터 UI */);
}

// 서버에서 렌더링되는 상품 그리드
function ProductGrid({ initialProducts }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {initialProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          // 개별 카드의 상호작용은 클라이언트 컴포넌트로
          actions={<ProductActions productId={product.id} />}
        />
      ))}
    </div>
  );
}
```

## 나의 서비스를 최적화하기 위해선?

1. **컴포넌트를 적절히 분할하자!**

- 큰 페이지를 서버와 클라이언트 영역으로 적절히 분할
- 상호작용이 필요한 부분만 최소한으로 클라이언트 컴포넌트화

```tsx
// 좋은 예시
function Page() {
  return (
    <>
      <ServerHeader /> {/* 서버 */}
      <InteractiveWidget /> {/* 클라이언트 */}
      <ServerFooter /> {/* 서버 */}
    </>
  );
}

// 피해야 할 예시
"use client"
function EntirePage() { // 전체 페이지를 클라이언트 컴포넌트로 만들지 않기
  return (/* ... */);
}
```

2. **데이터 전달**

```tsx
// 서버 컴포넌트에서 데이터 준비
async function ProductContainer() {
  const products = await fetchProducts();

  return (
    <>
      <StaticProductList products={products} />
      <ClientProductInteractions
        // 클라이언트에 필요한 데이터만 전달
        productIds={products.map((p) => p.id)}
      />
    </>
  );
}
```

## 주의사항

1. **컴포넌트 중첩 규칙**
   - 클라이언트 컴포넌트는 서버 컴포넌트를 포함할 수 없다. 서버 컴포넌트는 서버에서만 실행되며, 클라이언트 컴포넌트는 브라우저에서 실행되기 때문에 이러한 규칙을 지켜야 한다. 잘못된 예시는 클라이언트 컴포넌트가 서버 컴포넌트를 포함하려고 하여 에러가 발생한다. 올바른 예시에서는 서버 컴포넌트가 클라이언트 컴포넌트를 포함할 수 있는 구조를 보여준다.

```tsx
// ❌ 잘못된 예시
"use client";
import { ServerComponent } from "./ServerComponent";

function ClientComponent() {
  return <ServerComponent />; // 에러 발생!
}

// ✅ 올바른 예시
// Layout.tsx (서버 컴포넌트)
function Layout({ children }) {
  return (
    <div>
      <ServerSideNav />
      {children} {/* 클라이언트 컴포넌트가 이곳에 마운트됨 */}
    </div>
  );
}

// ClientFeature.tsx
("use client");
function ClientFeature() {
  return <div>클라이언트 기능</div>;
}
```

2. **환경 변수 사용**
   - 환경 변수를 사용할 때는 주의가 필요하다. 서버 컴포넌트에서는 비공식 환경 변수(`API_SECRET`)를 안전하게 사용할 수 있지만, 클라이언트 컴포넌트에서는 `NEXT_PUBLIC_` 접두사가 붙은 환경 변수만 사용할 수 있다. 이는 클라이언트에서 접근 가능한 변수를 제한하여 보안을 강화하기 위한 조치인 것 같다. 잘못된 예시에서는 비공식 환경 변수를 사용하려고 하여 `undefined`가 발생한다.

```tsx
// ✅ 올바른 사용
// 서버 컴포넌트
async function ServerComponent() {
  const apiKey = process.env.API_SECRET; // 안전함
  // ...
}

// ❌ 주의 필요
("use client");
function ClientComponent() {
  // NEXT_PUBLIC_ 접두사가 없는 환경 변수는 사용 불가
  const apiKey = process.env.API_SECRET; // undefined

  // 퍼블릭 변수만 사용 가능
  const publicKey = process.env.NEXT_PUBLIC_API_KEY;
}
```

3. **성능 모니터링**
   - 클라이언트 컴포넌트에서 성능을 모니터링하는 것은 중요하다. `useEffect` 훅을 사용하여 웹 비탈스(Web Vitals)를 측정할 수 있다. 이 측정은 페이지의 성능을 분석하고 최적화하는 데 도움이 된다. `getFCP`와 `getLCP`는 각각 첫 번째 콘텐츠 페인트(First Contentful Paint)와 최대 콘텐츠 페인트(Largest Contentful Paint)를 측정하는 함수이다.

```tsx
"use client";
function PerformanceCriticalComponent() {
  useEffect(() => {
    // Web Vitals 측정
    if (typeof window !== "undefined") {
      const { getFCP, getLCP } = require("web-vitals");

      getFCP(console.log);
      getLCP(console.log);
    }
  }, []);
}
```
