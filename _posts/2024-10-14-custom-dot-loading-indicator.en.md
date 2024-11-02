---
layout: post
title: "Creating Custom Dot Loading Indicator in Flutter"
lang: en
ref: custom-dot-loading
categories: [Flutter, Dev]
image: assets/images/category_dev.webp
---

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
