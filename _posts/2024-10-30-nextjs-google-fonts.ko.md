---
layout: post
title: "Next.js에서 구글 폰트 적용하기"
lang: ko
ref: nextjs-google-fonts
categories: [Next.js, Web, Dev]
image: assets/images/category_dev.webp
---

## 소개

Next.js 에서는 구글 폰트나 다른 폰트를 적용하는 방법에 대해서 한번 남겨보겠다. 요새 Next.js로 우리 어드민을 개발하다보니 이것저것 다양한 것을 하게 되는 것 같다...ㅎ

## 구글 폰트 적용 방법

### 1. next/font/google 사용하기

Next.js는 `next/font/google` 을 import하여 구글 폰트를 적용할 수 있습니다.

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

### 2. 여러 폰트 동시에 사용하기

프로젝트에서 여러 폰트를 함께 사용해야 할 때는 다음과 같이 구성할 수 있다.

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

### 3. Tailwind CSS와 함께 사용하기

Tailwind CSS를 사용하는 프로젝트에서는 `tailwind.config.ts` 파일에 폰트를 설정할 수 있다고 한다.

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

이제 Tailwind 클래스로 폰트를 적용할 수 있다.

```jsx
<div className="font-sans">
  안녕하세요
</div>
<div className="font-roboto">
  Hello World
</div>
```

## 폰트 최적화

앞서서 우린 next/font/google을 임포트 해왔다. 찾아보니 Next.js가 구글 폰트에 대해 여러가지 최적화를 자동으로 제공해준다는데...

1. 자동 호스팅: 구글 폰트 파일을 프로젝트에 다운로드하여 직접 제공
2. 사이즈 최적화: 필요한 문자만 선택적으로 다운로드
3. 성능 최적화: 폰트 로딩 전략 자동 적용

이런 것들이라고 한다..

## 로컬 폰트 사용하기

구글 폰트 대신 로컬 폰트를 사용하고 싶다면 `next/font/local`을 사용할 수 있다.

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

## 주의사항

1. 폰트 파일은 `app` 디렉토리 내부에 위치해야 한다.
2. 폰트 선언은 서버 컴포넌트에서만 가능하다. 즉, 'use client' 하에서는 안된다!
3. 클라이언트 컴포넌트에서는 선언된 폰트의 className만 사용 가능하다.
