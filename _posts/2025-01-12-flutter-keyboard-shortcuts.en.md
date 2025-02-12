---
layout: post
title: "Implementing Keyboard Shortcuts in Flutter Web Apps"
lang: en
ref: flutter-keyboard-shortcuts
categories: [Flutter, Web]
image: assets/images/category_flutter.webp
---

Implementing keyboard shortcuts in Flutter web applications can significantly enhance user experience. Let's explore two methods of implementing keyboard shortcuts in Flutter.

## Methods of Implementing Keyboard Shortcuts

There are two main approaches to implementing keyboard shortcuts in Flutter:

1. Using Shortcuts and Actions widgets
2. Using RawKeyboardListener or Focus widget's onKey callback

Each method has its advantages and disadvantages, and you can choose the appropriate one based on your needs.

### 1. Using Shortcuts and Actions

This method utilizes Flutter's widget system in a declarative way. You can also manage shortcuts globally by properly implementing them in state management or main.dart. In my case, I typically create a router_provider using riverpod and go_router, then track the route to implement different events for the same shortcut depending on the route.

```dart
class SaveIntent extends Intent {
  const SaveIntent();
}

class SymptomSelectIntent extends Intent {
  final int index;
  const SymptomSelectIntent({required this.index});
}

class KeyboardShortcutsWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Shortcuts(
      shortcuts: <ShortcutActivator, Intent>{
        LogicalKeySet(
          LogicalKeyboardKey.control,
          LogicalKeyboardKey.keyS,
        ): const SaveIntent(),
        // F1-F8 key mapping
        ...SymptomSelectShortcuts.createShortcuts(8, false),
      },
      child: Actions(
        actions: <Type, Action<Intent>>{
          SaveIntent: CallbackAction<SaveIntent>(
            onInvoke: (intent) => handleSave(),
          ),
          SymptomSelectIntent: CallbackAction<SymptomSelectIntent>(
            onInvoke: (intent) => handleSymptomSelect(intent),
          ),
        },
        child: child,
      ),
    );
  }
}
```

Advantages:

- Declarative and structured code
- High reusability through separation of shortcuts and actions
- Easy to test

Disadvantages:

- Complex shortcut combinations can be cumbersome to implement
- Dynamic shortcut changes might be challenging

### 2. Using Focus Widget with onKey Callback

This method provides more direct event handling. For simpler structures, this approach might actually be better. Initially, I used the first method for global application, but since the shortcuts only needed to work on specific pages, I refactored to this approach.

```dart
class KeyboardShortcutsWidget extends ConsumerStatefulWidget {
  @override
  ConsumerState<KeyboardShortcutsWidget> createState() => _KeyboardShortcutsWidgetState();
}

class _KeyboardShortcutsWidgetState extends ConsumerState<KeyboardShortcutsWidget> {
  final FocusNode _focusNode = FocusNode();

  @override
  Widget build(BuildContext context) {
    return Focus(
      focusNode: _focusNode,
      autofocus: true,
      onKey: (node, event) {
        if (event is RawKeyDownEvent) {
          // Handle Ctrl + S
          if (event.isControlPressed &&
              event.logicalKey == LogicalKeyboardKey.keyS) {
            handleSave();
            return KeyEventResult.handled;
          }

          // Handle F1-F8
          if (event.logicalKey == LogicalKeyboardKey.f1) {
            handleSymptomSelect(0);
            return KeyEventResult.handled;
          }
          // ... handle other F keys
        }
        return KeyEventResult.ignored;
      },
      child: widget.child,
    );
  }
}
```

Advantages:

- More granular control over keyboard events
- Easier handling of dynamic shortcuts
- Simpler handling of complex key combinations

Disadvantages:

- Code can become procedural and complex
- Relatively harder to test
- May have lower reusability

## Implementation Considerations

1. Focus Management

```dart
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    _focusNode.requestFocus(); // Request focus after widget build
  });
}
```

2. Preventing Shortcut Conflicts

```dart
// Check shortcut activation based on current route
if (currentLocation != targetRoute) return KeyEventResult.ignored;
```

3. User Feedback

```dart
void showShortcutFeedback(String message) {
  showCustomToastMessage(message);
}
```

4. Error Handling

```dart
if (symptomViewList.length <= index) {
  showCustomToastMessage('No function mapped to this shortcut');
  return;
}
```

## Summary

- Shortcuts/Actions approach offers structured code and easier testing
- Focus/onKey approach provides finer control and flexibility
- Choose the appropriate method based on your app's requirements and complexity
- User feedback and error handling are essential

## References

- [Flutter Keyboard Events](https://api.flutter.dev/flutter/services/RawKeyboard-class.html)
- [Flutter Actions and Shortcuts](https://api.flutter.dev/flutter/widgets/Actions-class.html)
- [Flutter Focus System](https://api.flutter.dev/flutter/widgets/Focus-class.html)
