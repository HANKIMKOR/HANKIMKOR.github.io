---
layout: post
title: "Creating Custom Dot Loading Indicator in Flutter<br>Flutter에서 커스텀 점 로딩 인디케이터 만들기"
categories: [Flutter, Dev]
image: assets/images/category_dev.webp
---

## Creating Custom Dot Loading Indicator in Flutter

In this post, I'll explain how to create a custom loading indicator that displays animated dots (...) in Flutter. This loading indicator shows three dots that fade in and out sequentially, creating a smooth loading animation effect.

### 1. Basic Structure

First, let's create a stateful widget that will handle our animation:

```dart
class DotLoadingIndicator extends StatefulWidget {
  final Color? color;
  final double size;
  final Duration duration;

  const DotLoadingIndicator({
    this.color,
    this.size = 4.0,
    this.duration = const Duration(milliseconds: 1000),
    super.key,
  });

  @override
  State<DotLoadingIndicator> createState() => _DotLoadingIndicatorState();
}
```

The widget accepts three parameters:

- `color`: The color of the dots (optional)
- `size`: The size of each dot (default: 4.0)
- `duration`: The duration of one complete animation cycle (default: 1000ms)

### 2. Animation Setup

In the state class, we need to set up our animations:

```dart
class _DotLoadingIndicatorState extends State<DotLoadingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration)
      ..repeat();

    _animations = List.generate(3, (index) {
      return Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
          parent: _controller,
          curve: Interval(
              index * 0.2, (index + 1) * 0.2,
              curve: Curves.easeInOut
          ),
        ),
      );
    });
  }
}
```

Here's what's happening:

1. We create an `AnimationController` that will control the overall animation
2. We generate three separate animations for each dot
3. Each animation uses an `Interval` to create a sequential effect
4. The `Curves.easeInOut` makes the animation smooth

### 3. Building the UI

The UI consists of three dots arranged horizontally:

```dart
@override
Widget build(BuildContext context) {
  return Row(
    mainAxisSize: MainAxisSize.min,
    children: List.generate(3, (index) {
      return AnimatedBuilder(
        animation: _animations[index],
        builder: (context, child) {
          return Opacity(
            opacity: _animations[index].value,
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: widget.size / 4),
              child: Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  color: widget.color ?? SmileBogunColor.grey3,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          );
        },
      );
    }),
  );
}
```

Each dot is:

1. Wrapped in an `AnimatedBuilder` to rebuild when the animation value changes
2. Uses `Opacity` to fade in and out based on the animation value
3. Styled as a circle using `BoxDecoration`
4. Spaced using `Padding`

### 4. Cleanup

Don't forget to dispose of the animation controller:

```dart
@override
void dispose() {
  _controller.dispose();
  super.dispose();
}
```

### Usage Example

```dart
DotLoadingIndicator(
  color: Colors.blue,
  size: 6.0,
  duration: Duration(milliseconds: 1500),
)
```

---

## Flutter에서 커스텀 점 로딩 인디케이터 만들기

이번 포스트에서는 Flutter에서 점(...)이 애니메이션되는 커스텀 로딩 인디케이터를 만드는 방법을 설명하겠습니다. 이 로딩 인디케이터는 세 개의 점이 순차적으로 페이드 인/아웃되면서 부드러운 로딩 애니메이션 효과를 만듭니다.

### 1. 기본 구조

먼저 애니메이션을 처리할 StatefulWidget을 생성합니다:

```dart
class DotLoadingIndicator extends StatefulWidget {
  final Color? color;
  final double size;
  final Duration duration;

  const DotLoadingIndicator({
    this.color,
    this.size = 4.0,
    this.duration = const Duration(milliseconds: 1000),
    super.key,
  });

  @override
  State<DotLoadingIndicator> createState() => _DotLoadingIndicatorState();
}
```

위젯은 세 가지 매개변수를 받습니다:

- `color`: 점의 색상 (선택사항)
- `size`: 각 점의 크기 (기본값: 4.0)
- `duration`: 전체 애니메이션 주기의 지속 시간 (기본값: 1000ms)

### 2. 애니메이션 설정

State 클래스에서 애니메이션을 설정합니다:

```dart
class _DotLoadingIndicatorState extends State<DotLoadingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration)
      ..repeat();

    _animations = List.generate(3, (index) {
      return Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
          parent: _controller,
          curve: Interval(
              index * 0.2, (index + 1) * 0.2,
              curve: Curves.easeInOut
          ),
        ),
      );
    });
  }
}
```

여기서 일어나는 일:

1. 전체 애니메이션을 제어할 `AnimationController` 생성
2. 각 점에 대한 세 개의 개별 애니메이션 생성
3. 각 애니메이션은 순차적 효과를 위해 `Interval` 사용
4. `Curves.easeInOut`으로 부드러운 애니메이션 효과 생성

### 3. UI 구축

UI는 가로로 배열된 세 개의 점으로 구성됩니다:

```dart
@override
Widget build(BuildContext context) {
  return Row(
    mainAxisSize: MainAxisSize.min,
    children: List.generate(3, (index) {
      return AnimatedBuilder(
        animation: _animations[index],
        builder: (context, child) {
          return Opacity(
            opacity: _animations[index].value,
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: widget.size / 4),
              child: Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  color: widget.color ?? SmileBogunColor.grey3,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          );
        },
      );
    }),
  );
}
```

각 점은:

1. 애니메이션 값이 변경될 때 다시 빌드하기 위해 `AnimatedBuilder`로 감싸짐
2. 애니메이션 값에 따라 페이드 인/아웃을 위해 `Opacity` 사용
3. `BoxDecoration`을 사용하여 원형으로 스타일링
4. `Padding`을 사용하여 간격 조정

### 4. 정리

애니메이션 컨트롤러를 반드시 dispose 해야 합니다:

```dart
@override
void dispose() {
  _controller.dispose();
  super.dispose();
}
```

### 사용 예시

```dart
DotLoadingIndicator(
  color: Colors.blue,
  size: 6.0,
  duration: Duration(milliseconds: 1500),
)
```

---
