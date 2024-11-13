---
layout: post
title: "Understanding 'use client' and Server/Client Components in Next.js"
lang: en
ref: nextjs-use-client
categories: [Next.js, React, Dev]
image: assets/images/category_next-js.webp
---

## Introduction

When working with Next.js, you'll frequently encounter the 'use client' directive. What exactly is it? When should you use it, and when should you avoid it? React Server Components were introduced after Next.js 13. In this article, we'll explore the concepts and usage of server/client components with practical examples.

## Understanding Server Components vs Client Components

### Server Components (Default)

In Next.js 13 and later versions, all components are server components by default. Without explicitly declaring 'use client', a component automatically becomes a server component. The main advantage of server components is that they execute on the server, reducing the JavaScript bundle size sent to the client.

```tsx
// ServerComponent.tsx
// No 'use client' = Server Component
async function ServerComponent() {
  // Can directly fetch data from database
  const data = await db.query("SELECT * FROM users");

  // Can safely use environment variables only accessible on server
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

### Client Components

Conversely, when you declare 'use client', the component becomes a client component. Client components run in the browser, allowing free use of user interactions and browser APIs.

```tsx
"use client";

// ClientComponent.tsx
import { useState, useEffect } from "react";

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Can use browser APIs
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Click count: {count}</button>
      <p>Window width: {windowWidth}px</p>
    </div>
  );
}
```

## Advantages and Applications of Server Components

Server components are particularly useful in the following situations:

1. **Data Fetching Optimization**

```tsx
// ProductList.tsx
async function ProductList() {
  // Can fetch multiple data in parallel
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

2. **Enhanced Security**

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
      // Exclude sensitive information on server
      password: false,
      creditCard: false,
    },
  });

  const hashedData = await hash(user.email, 10);
  // Handle sensitive logic on server

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

3. **Large Dependency Handling**

```tsx
// ImageProcessor.tsx
import sharp from "sharp"; // Large image processing library
import { readFile } from "fs/promises";

async function ImageProcessor({ imagePath }: { imagePath: string }) {
  const imageBuffer = await readFile(imagePath);
  const processedImage = await sharp(imageBuffer)
    .resize(800, 600)
    .webp()
    .toBuffer();

  // Perform heavy image processing on server
  return (
    <img src={`data:image/webp;base64,${processedImage.toString("base64")}`} />
  );
}
```

## Advanced Client Component Usage

You should use 'use client' in the following cases:

1. **Handling User Interactions**

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

    // Handle heavy UI updates with transitions
    startTransition(() => {
      // Complex validation or UI updates
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
      {isPending && <div>Processing...</div>}
    </form>
  );
}
```

2. **Using Browser APIs with Hooks**

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
        console.error("Media access error:", err);
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

## Hybrid Rendering Pattern

In real applications, you'll often need to combine server and client components effectively.

```tsx
// page.tsx (Server Component)
async function ProductPage() {
  // Load initial data on server
  const initialProducts = await fetchProducts();

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Product List</h1>

      {/* Search and filtering (Client) */}
      <SearchFilter />

      {/* Product grid (Server) */}
      <ProductGrid initialProducts={initialProducts} />

      {/* Shopping cart state management (Client) */}
      <ShoppingCartProvider>
        <CartSummary />
      </ShoppingCartProvider>
    </div>
  );
}

// Advanced search filter component
"use client";
function SearchFilter() {
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    inStock: false
  });

  const debouncedSearch = useMemo(
    () => debounce((value) => {
      // Search logic
    }, 300),
    []
  );

  return (/* Filter UI */);
}

// Server-rendered product grid
function ProductGrid({ initialProducts }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {initialProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          // Individual card interactions as client components
          actions={<ProductActions productId={product.id} />}
        />
      ))}
    </div>
  );
}
```

## Optimizing Your Service

1. **Proper Component Splitting**

```tsx
// Good example
function Page() {
  return (
    <>
      <ServerHeader /> {/* Server */}
      <InteractiveWidget /> {/* Client */}
      <ServerFooter /> {/* Server */}
    </>
  );
}

// Example to avoid
"use client"
function EntirePage() { // Don't make the entire page a client component
  return (/* ... */);
}
```

2. **Data Strategy**

```tsx
// Prepare data in server component
async function ProductContainer() {
  const products = await fetchProducts();

  return (
    <>
      <StaticProductList products={products} />
      <ClientProductInteractions
        // Pass only necessary data to client
        productIds={products.map((p) => p.id)}
      />
    </>
  );
}
```

## Important Considerations

1. **Component Nesting Rules**

```tsx
// ❌ Incorrect usage
"use client";
import { ServerComponent } from "./ServerComponent";

function ClientComponent() {
  return <ServerComponent />; // Error!
}

// ✅ Correct usage
// Layout.tsx (Server Component)
function Layout({ children }) {
  return (
    <div>
      <ServerSideNav />
      {children} {/* Client components mount here */}
    </div>
  );
}

// ClientFeature.tsx
("use client");
function ClientFeature() {
  return <div>Client Feature</div>;
}
```

2. **Environment Variable Usage**

```tsx
// ✅ Correct usage
// Server Component
async function ServerComponent() {
  const apiKey = process.env.API_SECRET; // Safe
  // ...
}

// ❌ Requires attention
("use client");
function ClientComponent() {
  // Environment variables without NEXT_PUBLIC_ prefix are unavailable
  const apiKey = process.env.API_SECRET; // undefined

  // Can only use public variables
  const publicKey = process.env.NEXT_PUBLIC_API_KEY;
}
```

3. **Performance Monitoring**

```tsx
"use client";
function PerformanceCriticalComponent() {
  useEffect(() => {
    // Web Vitals measurement
    if (typeof window !== "undefined") {
      const { getFCP, getLCP } = require("web-vitals");

      getFCP(console.log);
      getLCP(console.log);
    }
  }, []);
}
```
