---
layout: post
title: "Flutter에서 삼항 연산자의 함정과 해결 방법"
lang: ko
ref: flutter-ternary
categories: [Flutter, Clean Code]
image: assets/images/category_flutter.webp
---

개발을 하다 보면 종종 마주치는 끔찍한 코드가 있다. 지금 내가 현재 그런 것을 수정하고 있는 상황인데... 바로 삼항 연산자를 과도하게 중첩해서 사용하는 경우인데요. 오늘은 이런 코드가 왜 문제가 되는지, 그리고 어떻게 개선할 수 있는지 알아보자.

## 문제가 되는 코드 예시

다음은 실제 프로젝트에서 마주칠 수 있는 끔찍한 코드의 예시이다.

```dart
Widget build(BuildContext context) {
  return isLoading
    ? const CircularProgressIndicator()
    : hasError
      ? const ErrorWidget()
      : data == null
        ? const EmptyStateWidget()
        : isSpecialCase
          ? CustomWidget(
              title: 'Special',
              content: data!.special,
            )
          : NormalWidget(
              title: 'Normal',
              content: data!.normal,
            );
}
```

이런 코드의 문제점:

- 가독성이 매우 떨어짐
- 코드의 의도를 파악하기 어려움
- 유지보수가 어려움
- 디버깅이 복잡해짐

## 개선 방법 1: 조기 반환 (Early Return) 사용

첫 번째 개선 방법은 조기 반환을 활용하는 것이다.

```dart
Widget build(BuildContext context) {
  if (isLoading) {
    return const CircularProgressIndicator();
  }

  if (hasError) {
    return const ErrorWidget();
  }

  if (data == null) {
    return const EmptyStateWidget();
  }

  if (isSpecialCase) {
    return CustomWidget(
      title: 'Special',
      content: data!.special,
    );
  }

  return NormalWidget(
    title: 'Normal',
    content: data!.normal,
  );
}
```

## 개선 방법 2: 별도의 메서드로 분리

복잡한 로직을 별도의 메서드로 분리하여 관리할 수 있다.

```dart
Widget build(BuildContext context) {
  return _buildContent();
}

Widget _buildContent() {
  if (isLoading) {
    return const CircularProgressIndicator();
  }

  if (hasError) {
    return const ErrorWidget();
  }

  return _buildDataWidget();
}

Widget _buildDataWidget() {
  if (data == null) {
    return const EmptyStateWidget();
  }

  return _buildContentBasedOnType();
}

Widget _buildContentBasedOnType() {
  if (isSpecialCase) {
    return CustomWidget(
      title: 'Special',
      content: data!.special,
    );
  }

  return NormalWidget(
    title: 'Normal',
    content: data!.normal,
  );
}
```

## 개선 방법 3: 상태 열거형 활용

상태를 명확하게 정의하여 관리할 수 있다.

```dart
enum ContentState {
  loading,
  error,
  empty,
  special,
  normal,
}

Widget build(BuildContext context) {
  final contentState = _getContentState();

  switch (contentState) {
    case ContentState.loading:
      return const CircularProgressIndicator();
    case ContentState.error:
      return const ErrorWidget();
    case ContentState.empty:
      return const EmptyStateWidget();
    case ContentState.special:
      return CustomWidget(
        title: 'Special',
        content: data!.special,
      );
    case ContentState.normal:
      return NormalWidget(
        title: 'Normal',
        content: data!.normal,
      );
  }
}

ContentState _getContentState() {
  if (isLoading) return ContentState.loading;
  if (hasError) return ContentState.error;
  if (data == null) return ContentState.empty;
  if (isSpecialCase) return ContentState.special;
  return ContentState.normal;
}
```

## 정리

삼항 연산자는 간단한 조건부 렌더링에는 유용하지만, 복잡한 분기 처리에는 적합하지 않다. 위와 같은 방법들을 활용하면,

1. 코드의 가독성이 향상된다
2. 유지보수가 쉬워진다
3. 디버깅이 용이해진다
4. 코드의 의도가 명확해진다

특히 Flutter 위젯 트리를 작성할 때는 복잡한 로직을 적절히 분리하고 구조화하는 것이 중요하다. 단순히 "동작하는 코드"를 넘어서 "유지보수 가능한 코드"를 작성하는 것을 목표로 하자.

## 그래서 삼항 연산자는 언제 써야 할까?

삼항 연산자는 다음과 같이 간단한 조건부 렌더링이나 값 할당에 사용하는 것이 좋다,

```dart
// 좋은 예시 1: 간단한 조건부 텍스트
Text(isEnabled ? '활성화' : '비활성화')

// 좋은 예시 2: 스타일 조건부 적용
Container(
  color: isSelected ? Colors.blue : Colors.grey,
  child: Text('항목'),
)

// 좋은 예시 3: 간단한 값 할당
final message = count > 0 ? '$count개의 메시지' : '메시지 없음';

// 나쁜 예시: 복잡한 위젯이나 중첩된 조건. 사실 이 정도도 그렇게 복잡해보이지 않는다면 쓰긴 해도...
return isLoading
  ? LoadingWidget()
  : hasError
    ? ErrorWidget()  // 이런 경우는 if-else나 다른 방법을 사용하자
    : ContentWidget();
```

핵심은 한 눈에 파악할 수 있는 단순한 조건일 때만 삼항 연산자를 사용하는 것이다. 조건이 복잡해지거나 중첩이 필요한 경우에는 앞서 설명한 다른 방법들을 사용하자.

## 참고 자료

- [Effective Dart: Style](https://dart.dev/guides/language/effective-dart/style)
- [Flutter 공식 문서](https://flutter.dev/docs/development/ui/widgets-intro)
