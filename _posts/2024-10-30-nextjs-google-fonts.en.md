---
layout: post
title: "Applying Google Fonts in Next.js"
lang: en
ref: nextjs-google-fonts
categories: [Next.js, Web, Dev]
image: assets/images/category_dev.webp
---

## Introduction

Let me share how to apply Google Fonts and other fonts in Next.js. I've been working on our admin dashboard with Next.js lately, and it's amazing how many different things we can do with it!

## How to Apply Google Fonts

### 1. Using next/font/google

Next.js allows you to apply Google Fonts by importing from `next/font/google`.

```typescript
import { Noto_Sans_KR } from "next/font/google";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSansKr.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 2. Using Multiple Fonts Together

When you need to use multiple fonts in your project, you can set it up like this:

```typescript
import { Roboto, Noto_Sans_KR } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-kr",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${roboto.variable} ${notoSansKr.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Using with Tailwind CSS

If you're using Tailwind CSS in your project, you can configure fonts in your `tailwind.config.ts` file.

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-noto-sans-kr)"],
        roboto: ["var(--font-roboto)"],
      },
    },
  },
};

export default config;
```

Now you can apply fonts using Tailwind classes:

```jsx
<div className="font-sans">
  안녕하세요
</div>
<div className="font-roboto">
  Hello World
</div>
```

## Font Optimization

We imported `next/font/google` earlier. I did some research and found out that Next.js automatically provides several optimizations for Google Fonts...

1. Automatic hosting: Downloads and serves Google Font files directly from your project
2. Size optimization: Selectively downloads only the characters needed
3. Performance optimization: Automatically applies font loading strategies

Pretty cool stuff!

## Using Local Fonts

If you want to use local fonts instead of Google Fonts, you can use `next/font/local`:

```typescript
import localFont from "next/font/local";

const myFont = localFont({
  src: "./fonts/MyFont.woff2",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={myFont.className}>
      <body>{children}</body>
    </html>
  );
}
```

## Important Notes

1. Font files must be located inside the `app` directory.
2. Font declarations are only possible in server components. That means no declarations under 'use client'!
3. Client components can only use the className of fonts declared elsewhere.
