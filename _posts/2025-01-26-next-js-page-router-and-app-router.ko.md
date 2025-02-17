---
layout: post
title: "Next.js 에서 Page Router 와 App Router"
lang: ko
ref: next-js-page-router-and-app-router
categories: [Next.js, Web, dev]
image: assets/images/category_next-js.webp
---

오늘은 Next.js의 Page Router에서 App Router 모두를 사용하게 된 이야기에 대해서 다루려고 합니다.

처음 Next.js를 시작했을 때를 아직도 생생히 기억합니다. Pages Router는 처음에 정말 직관적이었습니다. `/pages` 디렉토리에 파일을 만들기만 하면 자동으로 라우팅이 되는 방식이 너무나 매력적이었습니다.

예를 들어, 블로그 시스템을 만들 때는 이런 식으로 구성했었죠:

```tsx
// pages/blog/[id].tsx
interface Post {
  id: string;
  title: string;
  content: string;
}

interface Props {
  post: Post;
}

export async function getServerSideProps({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const post = await fetchPost(id);

  return {
    props: { post },
  };
}

export default function BlogPost({ post }: Props) {
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}
```

정말 단순하고 이해하기 쉬웠습니다. SSR도 `getServerSideProps`로 간단히 구현할 수 있었고요.

## 그러나, 단점도 있다.

하지만 프로젝트가 커질수록 몇 가지 불편함이 생기기 시작했습니다. 특히 레이아웃 구현이 골치가 아파졌습니다.

```tsx
// pages/_app.tsx (Pages Router)
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Header />
      <Sidebar />
      <Component {...pageProps} />
      <Footer />
    </Layout>
  );
}
```

모든 페이지에 같은 레이아웃을 적용하는 건 쉬웠지만, 특정 페이지들에만 다른 레이아웃을 적용하고 싶을 때는 꽤 번거로웠습니다.

## App Router로의 적용

Next.js 13이 발표되었고 App Router를 알게 되었습니다. 같은 블로그 시스템을 App Router로 구현하니 이렇게 변하게 되었습니다.

```tsx
// app/blog/[id]/page.tsx
interface PageProps {
  params: {
    id: string;
  };
}

async function BlogPost({ params }: PageProps) {
  const post = await fetchPost(params.id); // automatically a server component

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

레이아웃도 훨씬 직관적으로 변했습니다.

```tsx
// app/blog/layout.tsx
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="blog-layout">
      <nav className="blog-nav">
        <BlogNavigation />
      </nav>
      {children}
    </div>
  );
}
```

## 실제 사용 예시 비교

### 1. 데이터 로딩 패턴

```tsx
// pages/products/[id].tsx
interface Product {
  id: string;
  name: string;
  price: number;
}

export async function getServerSideProps({
  params,
}: {
  params: { id: string };
}) {
  const product = await fetchProduct(params.id);
  const recommendations = await fetchRecommendations(params.id);

  return {
    props: {
      product,
      recommendations,
    },
  };
}

export default function ProductPage({
  product,
  recommendations,
}: {
  product: Product;
  recommendations: Product[];
}) {
  return (
    <div>
      <ProductDetails product={product} />
      <Recommendations items={recommendations} />
    </div>
  );
}
```

**App Router:**

```tsx
// app/products/[id]/page.tsx
import { Suspense } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: PageProps) {
  const product = await fetchProduct(params.id);

  return (
    <div>
      <ProductDetails product={product} />
      <Suspense fallback={<RecommendationsSkeleton />}>
        <AsyncRecommendations productId={params.id} />
      </Suspense>
    </div>
  );
}
```

App Router에서는 Suspense를 사용해 추천 상품을 병렬로 로딩할 수 있어서 사용자 경험이 더 좋아졌습니다.

### 2. 에러 처리

**Pages Router:**

```tsx
// pages/dashboard.tsx
export default function Dashboard() {
  if (error) {
    return <ErrorComponent error={error} />;
  }

  return <DashboardContent />;
}
```

**App Router:**

```tsx
// app/dashboard/error.tsx
"use client";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 3. 로딩 상태 처리

**Pages Router:**

```tsx
// pages/search.tsx
export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(true);

  return <div>{isLoading ? <LoadingSpinner /> : <SearchResults />}</div>;
}
```

**App Router:**

```tsx
// app/search/loading.tsx
export default function Loading() {
  return <LoadingSpinner />;
}

// app/search/page.tsx
export default async function SearchPage() {
  const results = await searchProducts();
  return <SearchResults data={results} />;
}
```

## 실제 프로젝트에서의 차이점

1. **대시보드 개발 시:**

   - Pages Router: 각 위젯의 데이터를 한 번에 로드해야 해서 초기 로딩이 느렸습니다.
   - App Router: Suspense와 스트리밍을 활용해 위젯별로 점진적 로딩이 가능해졌습니다.

2. **인증 처리:**

   ```tsx
   // Pages Router (_app.tsx)
   export default function App({ Component, pageProps }: AppProps) {
     const [user, loading] = useUser();
     if (loading) return <Loading />;
     if (!user) return <LoginPage />;
     return <Component {...pageProps} />;
   }
   ```

   ```tsx
   // App Router (app/layout.tsx)
   import { auth } from "@/auth";

   export default async function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     const session = await auth();
     return (
       <html>
         <body>
           <AuthProvider session={session}>{children}</AuthProvider>
         </body>
       </html>
     );
   }
   ```

3. **API 라우트:**
   - Pages Router: `/pages/api` 폴더에 모든 API 파일을 넣어야 했습니다.
   - App Router: 각 기능 폴더 안에 `route.js`를 만들어 관련 API를 함께 관리할 수 있게 되었습니다.

## App Router의 현실적인 단점들

App Router가 많은 장점을 가지고 있지만, 실제 프로젝트를 진행하면서 몇 가지 주의해야 할 점들도 발견했습니다.

### 1. 학습 곡선이 가파름

- Server Component와 Client Component의 개념을 이해하는 데 시간이 필요
- 'use client' 지시자를 언제 써야 할지 결정하는 것이 초기에는 혼란스러움
- 기존 Pages Router에서 마이그레이션 시 많은 리팩토링 작업 필요

### 2. 상태 관리의 복잡성

```tsx
// app/components/StateExample.tsx
"use client";

import { useState } from "react";

export default function StateExample() {
  // Client Component에서만 가능
  const [state, setState] = useState<string>("");

  // Server Component와 상태 공유가 필요할 때 복잡해짐
  return (
    <div>
      <input
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
      />
    </div>
  );
}
```

### 3. 캐싱 메커니즘의 복잡성

```tsx
// app/api/data/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // 캐싱 전략 결정이 복잡해질 수 있음
  const data = await fetch("https://api.example.com/data", {
    next: {
      revalidate: 3600, // 1시간
    },
  });

  return NextResponse.json(await data.json());
}
```

### 4. 디버깅의 어려움

- Server Component에서 발생하는 에러는 클라이언트에서 디버깅하기 어려움
- React DevTools에서 Server Component가 불투명하게 표시됨
- 개발 서버 재시작이 자주 필요한 경우가 있음

### 5. 초기 번들 크기 증가

- 기본적으로 포함되는 기능들이 많아 초기 번들 크기가 Pages Router보다 큼
- 최적화가 필요한 경우 추가적인 설정 작업 필요

### 6. 불안정한 API

```tsx
// 향후 변경될 수 있는 API 예시
// app/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 이러한 설정들이 버전 업데이트에 따라 변경될 수 있음
```

## 선택은 신중하게

App Router는 분명 Next.js의 미래이며, 많은 장점을 제공합니다. 하지만 프로젝트의 특성과 팀의 상황을 고려하여 신중하게 선택해야 합니다.

**App Router가 좋은 경우:**

- 새로운 프로젝트를 시작할 때
- 서버 사이드 렌더링이 중요한 경우
- 복잡한 레이아웃 구조가 필요한 경우
- 점진적 로딩이 필요한 경우

**Pages Router가 더 나은 경우:**

- 빠른 개발이 필요한 경우
- 팀이 기존 Pages Router에 익숙한 경우
- 간단한 웹사이트나 대시보드
- 안정적인 API가 중요한 경우

결국 "더 좋은" 방식은 없습니다. 단지 프로젝트에 "더 적합한" 방식이 있을 뿐입니다. 여러분의 상황에 맞는 최선의 선택을 하시기 바랍니다.
