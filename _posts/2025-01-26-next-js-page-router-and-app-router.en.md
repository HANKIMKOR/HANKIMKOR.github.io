---
layout: post
title: "Page Router and App Router in Next.js"
lang: en
ref: next-js-page-router-and-app-router
categories: [Next.js, Web, dev]
image: assets/images/category_next-js.webp
---

# My Journey with Next.js: From Page Router to App Router

Today, I'd like to share my experience using both Page Router and App Router in Next.js.

I still vividly remember when I first started with Next.js. The Pages Router was incredibly intuitive at first. The way routing worked automatically just by creating files in the `/pages` directory was very appealing.

For example, when building a blog system, it looked something like this:

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

It was really simple and easy to understand. Server-side rendering could be implemented easily with `getServerSideProps` as well.

## However, There Were Drawbacks

As the project grew larger, several inconveniences began to emerge. Layout implementation, in particular, became quite troublesome.

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

While it was easy to apply the same layout to all pages, it became quite cumbersome when trying to apply different layouts to specific pages.

## Transitioning to App Router

When Next.js 13 was announced, I discovered the App Router. The same blog system transformed into this when implemented with App Router:

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

The layout implementation also became much more intuitive:

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

## Real-World Usage Comparison

### 1. Data Loading Patterns

**Pages Router:**

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

With App Router, the user experience improved as we could load recommended products in parallel using Suspense.

### 2. Error Handling

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

### 3. Loading State Handling

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

## Real Project Differences

1. **Dashboard Development:**

   - Pages Router: Initial loading was slow as all widget data had to be loaded at once.
   - App Router: Enabled progressive loading of widgets using Suspense and streaming.

2. **Authentication Handling:**

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

## Practical Drawbacks of App Router

While App Router offers many advantages, I've discovered several points to consider during actual project development.

### 1. Steep Learning Curve

- Time needed to understand Server and Client Components
- Initial confusion about when to use the 'use client' directive
- Significant refactoring needed when migrating from Pages Router

### 2. State Management Complexity

```tsx
// app/components/StateExample.tsx
"use client";

import { useState } from "react";

export default function StateExample() {
  const [state, setState] = useState<string>("");

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

### 3. Caching Mechanism Complexity

```tsx
// app/api/data/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const data = await fetch("https://api.example.com/data", {
    next: {
      revalidate: 3600, // 1 hour
    },
  });

  return NextResponse.json(await data.json());
}
```

### 4. Debugging Challenges

- Difficulty debugging Server Component errors on the client
- Opaque Server Components in React DevTools
- Frequent need to restart the development server

### 5. Initial Bundle Size

- Larger initial bundle size compared to Pages Router
- Additional configuration needed for optimization

### 6. API Instability

```tsx
// Example of potentially changing APIs
// app/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

## Choose Wisely

App Router is undoubtedly the future of Next.js and offers many benefits. However, the choice should be made carefully considering your project's characteristics and team situation.

**App Router is Great For:**

- Starting new projects
- Projects requiring extensive server-side rendering
- Complex layout structures
- Progressive loading requirements

**Pages Router Might Be Better For:**

- Rapid development needs
- Teams familiar with Pages Router
- Simple websites or dashboards
- Projects requiring stable APIs

In the end, there's no "better" approach—only what's "more suitable" for your project. Make the best choice for your specific situation.
