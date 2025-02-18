---
layout: post
title: "Tailwind CSS 와 styled-components"
lang: ko
ref: tailwind-css-and-styled-components
categories: [Tailwind CSS, styled-components, Web]
image: assets/images/category_tailwind-css.webp
---

최근에, 우연히? 혹은 의도적으로? 인지는 모르겠지만,
회사 홈페이지 개발을 위해서는 styled-components를 활용하고, 제 개인 프로젝트를 위해서 Tailwind css를 활용하며 두 가지의 장단에 대해서 조금 정리했던 기회가 있었습니다.

흔히, 웹 개발에서 CSS-in-JS와 유틸리티 우선 CSS는 각각 다른 철학과 접근 방식을 가지고 있다고 합니다.
그래서 부족하지만 이 글에서는 두 가지 인기 있는 스타일링 솔루션인 Tailwind CSS와 styled-components를 심층적으로 비교해보려고 합니다.

## 기본 개념 비교

### Tailwind CSS

Tailwind CSS는 유틸리티 우선(utility-first) 접근 방식을 채택한 CSS 프레임워크입니다. 미리 정의된 클래스들을 조합하여 스타일을 구성하는 방식으로 작동합니다.

```jsx
// Tailwind CSS 예시
function Button({ children }) {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
      {children}
    </button>
  );
}
```

### styled-components

styled-components는 CSS-in-JS 라이브러리로, JavaScript 코드 안에서 CSS를 작성할 수 있게 해줍니다.

```jsx
// styled-components 예시
const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;
```

## 개발 생산성 비교

제가 개인 프로젝트에 Tailwind CSS를 활용했었던 가장 큰 이유는, 빠른 생산성입니다. 그리고, 개인 프로젝트이기 때문에 복잡한 스타일링이나 그런 것들이 필요하지 않았고 그저 빠르게만 개발되면 되기 때문에 그 점이 더더욱 Tailwind CSS를 선택했었던 이유가 되었습니다.

반면에, 회사 홈페이지에 styled-components 를 활용했었던 이유는, 재사용이나 유지관리에 좀 더 방점을 두었기 때문입니다.

### Tailwind CSS의 장점

1. **빠른 프로토타이핑**

   - 클래스 이름을 고민할 필요 없이 즉시 스타일 적용 가능
   - 에디터 자동완성과 결합하여 빠른 개발 가능
   - 설정된 디자인 시스템 내에서 일관된 스타일링 가능

2. **낮은 학습 곡선**

   - CSS 문법을 알면 쉽게 적용 가능
   - 직관적인 클래스 네이밍
   - 문서화가 잘 되어있어 레퍼런스 찾기 쉬움

3. **번들 사이즈 최적화**
   - 사용하지 않는 스타일은 자동으로 제거
   - 중복되는 스타일 선언 최소화

### styled-components의 장점

1. **동적 스타일링의 용이성**

   ```jsx
   const Button = styled.button`
     background-color: ${(props) => (props.primary ? "#3b82f6" : "#grey")};
     color: ${(props) => (props.primary ? "white" : "black")};
   `;
   ```

2. **컴포넌트 중심 개발**

   - 스타일과 로직이 함께 캡슐화
   - 재사용성이 높은 컴포넌트 생성 가능
   - CSS 충돌 걱정 없음

3. **TypeScript와의 통합**
   - 타입 안정성 제공
   - props를 통한 스타일 변경 시 타입 체크

## 실제 개발 시나리오 비교

### 시나리오 1: 반응형 카드 컴포넌트 개발

#### Tailwind CSS 버전

```jsx
function Card({ title, description, imageUrl }) {
  return (
    <div className="max-w-sm rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <img src={imageUrl} className="w-full h-48 object-cover" alt={title} />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
}
```

#### styled-components 버전

```jsx
const CardContainer = styled.div`
  max-width: 24rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 12rem;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  color: #374151;
`;

function Card({ title, description, imageUrl }) {
  return (
    <CardContainer>
      <CardImage src={imageUrl} alt={title} />
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </CardContainer>
  );
}
```

### 개발 시간 비교

1. **초기 설정**

   - Tailwind CSS: 설정 파일 생성과 플러그인 설치 필요 (약 15-30분)
   - styled-components: npm 설치만으로 바로 사용 가능 (약 5분)

2. **컴포넌트 개발**

   - Tailwind CSS: 클래스 조합으로 빠른 개발 가능 (약 10-15분)
   - styled-components: 컴포넌트 분리와 스타일 정의 필요 (약 20-25분)

3. **유지보수**
   - Tailwind CSS: 클래스가 길어질 수 있어 가독성 관리 필요
   - styled-components: 명확한 컴포넌트 구조로 유지보수 용이
     여기 각 스타일링 솔루션의 특징과 선택 기준을 자세히 설명해드리겠습니다.

## 성능과 개발 경험의 차이

Tailwind CSS는 JIT(Just-In-Time) 컴파일 시스템을 통해 실제 사용되는 스타일만을 생성합니다. 이는 불필요한 CSS 코드를 제거하여 최종 번들 크기를 최적화합니다. 또한 런타임에 추가적인 JavaScript 실행이 필요 없어 브라우저에서의 성능이 우수합니다. 특히 브라우저의 캐시 메커니즘을 효과적으로 활용할 수 있어 반복 방문 시 더 빠른 로딩이 가능합니다. 다만, HTML 파일에 다수의 클래스명이 포함되어야 하므로 문서 크기가 다소 커질 수 있으며, 빌드 프로세스에 추가적인 시간이 소요될 수 있습니다.

반면 styled-components는 동적 스타일링에 특화되어 있습니다. props나 상태에 따라 스타일을 쉽게 변경할 수 있으며, 컴포넌트별로 CSS 코드가 자동으로 분할되어 관리됩니다. 하지만 이러한 유연성은 약간의 성능 비용을 수반합니다. 런타임에 JavaScript를 사용하여 스타일을 생성하기 때문에 초기 렌더링 시 지연이 발생할 수 있으며, 브라우저가 추가적인 작업을 수행해야 합니다.

## 프로젝트 특성에 따른 선택 기준

각 기술의 선택은 프로젝트의 특성과 요구사항에 크게 좌우됩니다. Tailwind CSS는 빠른 개발이 필요하거나 프로토타입을 제작할 때 특히 유용합니다. 미리 정의된 유틸리티 클래스를 활용하면 디자인 시스템을 일관되게 구현할 수 있으며, 팀 전체가 동일한 스타일 가이드를 따르기 쉽습니다. 또한 대규모 트래픽이 예상되는 프로젝트에서는 Tailwind CSS의 우수한 성능이 큰 장점이 될 수 있습니다.

styled-components는 복잡한 동적 스타일링이 필요한 프로젝트에 적합합니다. 사용자 인터랙션이나 상태에 따라 스타일이 자주 변경되는 경우, props를 통한 스타일 제어가 매우 편리합니다. 또한 TypeScript와의 통합이 중요한 프로젝트에서는 styled-components의 타입 안정성이 큰 이점을 제공합니다. 재사용 가능한 컴포넌트를 많이 만들어야 하는 경우에도 styled-components의 컴포넌트 중심 접근 방식이 유리할 수 있습니다.

## 하이브리드 접근도 가능?

두 기술의 장점을 모두 활용하고자 한다면 하이브리드 접근 방식을 고려할 수 있습니다. Tailwind CSS의 유틸리티 클래스와 styled-components의 동적 스타일링을 함께 사용하면, 각 기술의 강점을 상황에 맞게 활용할 수 있습니다. 예를 들어 기본적인 레이아웃과 반응형 디자인은 Tailwind CSS로 구현하고, 복잡한 인터랙션이 필요한 컴포넌트는 styled-components로 제작하는 방식입니다. 사실, 아직 저도 제대로 시도해보지는 않았고 아 이렇게도 가능하겠다 정도만 이해한 정도입니다.

```jsx
const StyledCard = styled.div.attrs({
  className: "rounded-lg shadow-lg",
})`
  ${(props) => props.customStyle}
`;

function Card({ customStyle }) {
  return (
    <StyledCard customStyle={customStyle}>
      <div className="p-4">
        <h2 className="text-xl font-bold">제목</h2>
      </div>
    </StyledCard>
  );
}
```

## 결론

두 기술 모두 각자의 장단점이 있으며, 프로젝트의 요구사항과 팀의 선호도에 따라 선택하면 됩니다. Tailwind CSS는 빠른 개발과 일관된 디자인 시스템 구축에 강점이 있고, styled-components는 동적 스타일링과 컴포넌트 재사용성에서 강점을 보입니다.

최근 트렌드를 보면 Tailwind CSS의 인기가 급상승하고 있으며, 특히 Next.js와의 통합이 매우 쉽고 성능도 우수하다는 점이 주목받고 있습니다. 하지만 이는 절대적인 기준이 될 수 없으며, 프로젝트의 특성과 팀의 역량을 고려하여 선택하는 것이 중요합니다.
