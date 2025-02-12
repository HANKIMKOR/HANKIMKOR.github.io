---
layout: post
title: "Flutter 웹앱에서 키보드 단축키 구현하기"
lang: ko
ref: flutter-keyboard-shortcuts
categories: [Flutter, Web]
image: assets/images/category_flutter.webp
---

Flutter로 웹 애플리케이션을 개발할 때 키보드 단축키를 구현하면 사용자 경험을 크게 향상시킬 수 있습니다. 오늘은 Flutter에서 키보드 단축키를 구현하는 두 가지 방법에 대해 알아보겠습니다.

## 키보드 단축키 구현 방법

Flutter에서 키보드 단축키를 구현하는 방법은 크게 두 가지가 있습니다.

1. Shortcuts와 Actions 위젯을 사용하는 방법
2. RawKeyboardListener 또는 Focus 위젯의 onKey 콜백을 사용하는 방법

각각의 방법은 장단점이 있으며, 상황에 따라 적절한 방법을 선택할 수 있습니다.

### 1. Shortcuts와 Actions 사용하기

이 방법은 Flutter의 위젯 시스템을 활용하는 선언적인 방식입니다. 또한 상태관리, 혹은 main.dart 에서 적절히 사용하면 전체 위젯을 글로벌하게 관리하게 할 수도 있습니다.
보통 저같은 경우에는 riverpod과 go_router를 활용하여 router_provider를 만든 다음에,
그 경로를 추적하는 방식으로 route마다 같은 단축키라도 다른 이벤트가 실행될 수 있게 구현하려고 했습니다.

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
        // F1-F8 키 매핑
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

장점:

- 선언적이고 구조화된 코드
- 단축키와 액션의 분리로 재사용성 높음
- 테스트하기 쉬움

단점:

- 복잡한 단축키 조합 구현이 다소 번거로움
- 동적인 단축키 변경이 어려울 수 있음

### 2. Focus 위젯과 onKey 콜백 사용하기

이 방법은 더 직접적인 이벤트를 처리한다고 보시면 될 것 같습니다. 오히려 단순한 구조라면 이 방식이 더 나을 수도 있습니다.
저도 처음에는 앱 전체를 글로벌하게 적용하기 위해서 1번으로 적용을 했지만,
오히려 특정 페이지에서만 작동을 하다보니 글로벌하게 할 필요가 없어서 2번으로 리팩토링해서 사용하고 있습니다.

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
          // Ctrl + S 처리
          if (event.isControlPressed &&
              event.logicalKey == LogicalKeyboardKey.keyS) {
            handleSave();
            return KeyEventResult.handled;
          }

          // F1-F8 키 처리
          if (event.logicalKey == LogicalKeyboardKey.f1) {
            handleSymptomSelect(0);
            return KeyEventResult.handled;
          }
          // ... 다른 F키들도 처리
        }
        return KeyEventResult.ignored;
      },
      child: widget.child,
    );
  }
}
```

장점:

- 더 세밀한 키보드 이벤트 제어 가능
- 동적인 단축키 처리가 용이
- 복잡한 키 조합 처리가 쉬움

단점:

- 코드가 절차적이고 복잡해질 수 있음
- 테스트가 상대적으로 어려움
- 재사용성이 떨어질 수 있음

## 구현 시 고려사항

1. 포커스 관리

```dart
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    _focusNode.requestFocus(); // 위젯이 빌드된 후 포커스 요청
  });
}
```

2. 단축키 충돌 방지

```dart
// 현재 라우트에 따른 단축키 활성화 여부 확인
if (currentLocation != targetRoute) return KeyEventResult.ignored;
```

3. 사용자 피드백

```dart
void showShortcutFeedback(String message) {
  showCustomToastMessage(message);
}
```

4. 에러 처리

```dart
if (symptomViewList.length <= index) {
  showCustomToastMessage('해당 단축키에 매핑된 기능이 없습니다');
  return;
}
```

## 정리

- Shortcuts/Actions 방식은 구조화된 코드와 테스트 용이성이 장점
- Focus/onKey 방식은 세밀한 제어와 유연성이 장점
- 앱의 요구사항과 복잡도에 따라 적절한 방식 선택
- 사용자 피드백과 에러 처리는 필수

## 참고 자료

- [Flutter Keyboard Events](https://api.flutter.dev/flutter/services/RawKeyboard-class.html)
- [Flutter Actions and Shortcuts](https://api.flutter.dev/flutter/widgets/Actions-class.html)
- [Flutter Focus System](https://api.flutter.dev/flutter/widgets/Focus-class.html)
