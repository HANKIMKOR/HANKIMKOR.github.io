---
layout: post
title: "The Pitfalls of Ternary Operators in Flutter and How to Avoid Them"
lang: en
ref: flutter-ternary
categories: [Flutter, Clean Code]
image: assets/images/category_flutter.webp
---

While developing, we often encounter some horrifying code. I'm currently in the process of refactoring such code... specifically, code that excessively nests ternary operators. Let's explore why this is problematic and how we can improve it.

## Problematic Code Example

Here's an example of terrible code you might encounter in real projects:

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

Problems with this code:

- Poor readability
- Difficult to understand the intent
- Hard to maintain
- Complex debugging

## Improvement 1: Using Early Returns

The first improvement method is to utilize early returns:

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

## Improvement 2: Separating into Methods

We can manage complex logic by separating it into dedicated methods:

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

## Improvement 3: Using State Enums

We can manage states more clearly by defining them using enums:

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

## Summary

While ternary operators are useful for simple conditional rendering, they're not suitable for complex branching logic. Using the methods above:

1. Improves code readability
2. Makes maintenance easier
3. Simplifies debugging
4. Makes code intent clearer

When writing Flutter widget trees, it's crucial to properly separate and structure complex logic. We should aim to write not just "working code" but "maintainable code."

## So When Should We Use Ternary Operators?

Ternary operators are best used for simple conditional rendering or value assignments like these:

```dart
// Good Example 1: Simple conditional text
Text(isEnabled ? 'Enabled' : 'Disabled')

// Good Example 2: Conditional styling
Container(
  color: isSelected ? Colors.blue : Colors.grey,
  child: Text('Item'),
)

// Good Example 3: Simple value assignment
final message = count > 0 ? '$count messages' : 'No messages';

// Bad Example: Complex widgets or nested conditions
return isLoading
  ? LoadingWidget()
  : hasError
    ? ErrorWidget()  // Use if-else or other methods for cases like this
    : ContentWidget();
```

The key is to use ternary operators only for conditions that can be understood at a glance. For complex conditions or when nesting is required, use the other methods discussed above.

## References

- [Effective Dart: Style](https://dart.dev/guides/language/effective-dart/style)
- [Flutter Official Documentation](https://flutter.dev/docs/development/ui/widgets-intro)
