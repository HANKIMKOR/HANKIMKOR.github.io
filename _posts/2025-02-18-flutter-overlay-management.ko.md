---
layout: post
title: "Flutter Overlay 관리하기: 다중 Overlay 상태 관리와 메모리 누수 방지"
lang: ko
ref: flutter-overlay-management
categories: [Flutter, Mobile, Web, Overlay]
image: assets/images/category_flutter.webp
---

이전 글에서 showDialog와 Overlay의 기본적인 사용법에 대해 다뤘는데요. 오늘은 실제 프로젝트에서 Overlay를 여러 개 사용할 때 발생할 수 있는 문제점과 이를 효과적으로 관리하는 방법에 대해 이야기해보려 합니다. 특히 실무에서 자주 마주치는 문제들과 그 해결 방법을 중심으로 설명드리겠습니다.

## Overlay 관리의 어려움

Overlay를 실제 프로젝트에서 사용하다 보면 크게 두 가지 어려움을 겪게 됩니다.

1. 여러 Overlay의 상태 관리: 여러 개의 Overlay가 동시에 존재할 때 각각의 상태를 추적하고 관리하는 것이 복잡해집니다. 특히 각 Overlay가 서로 영향을 주고받는 경우(예: 한 메뉴를 열면 다른 메뉴가 닫히는 경우) 더욱 까다로워집니다.

2. 메모리 누수 방지: Overlay는 화면에서 제거되더라도 메모리에 계속 남아있을 수 있습니다. 이는 특히 동적으로 Overlay를 생성하고 제거하는 경우에 심각한 메모리 누수로 이어질 수 있습니다.

특히 메뉴바나 드롭다운과 같이 여러 Overlay를 동시에 다뤄야 하는 경우, 이러한 문제는 더욱 두드러집니다. 사용자가 빠르게 여러 메뉴를 오가는 경우나, 화면 전환이 발생하는 경우 등에서 특히 주의가 필요합니다.

## Provider를 활용한 Overlay 상태 관리

저는 Riverpod을 사용해서 Overlay의 상태를 관리하고 있는데요. Riverpod을 선택한 이유는 상태 관리가 예측 가능하고, 디버깅이 용이하며, 특히 여러 Overlay의 상태를 동시에 관리하기에 적합하기 때문입니다. 다음과 같은 방식으로 구현했습니다.

```dart
// Overlay 상태를 관리하는 Provider
final menuOverlayProvider = StateNotifierProvider<MenuOverlayNotifier, MenuOverlayState>((ref) {
  return MenuOverlayNotifier();
});

class MenuOverlayNotifier extends StateNotifier<MenuOverlayState> {
  MenuOverlayNotifier() : super(MenuOverlayState());

  // 새로운 Overlay 설정
  // 기존에 표시 중인 Overlay가 있다면 제거하고 새로운 Overlay를 표시합니다.
  void setOverlay(OverlayEntry entry, int index) {
    state.overlayEntry?.remove();
    state = MenuOverlayState(overlayEntry: entry, activeIndex: index);
  }

  // 단일 Overlay 제거
  // 현재 표시 중인 Overlay를 안전하게 제거합니다.
  Future<void> removeOverlay() async {
    if (state.overlayEntry?.mounted == true) {
      state.overlayEntry?.remove();
    }
    state.overlayEntry?.dispose();
    state = MenuOverlayState();
  }

  // 모든 Overlay 제거
  // 화면에 표시된 모든 Overlay를 찾아서 제거합니다.
  Future<void> removeAllOverlays(BuildContext context) async {
    final overlay = Overlay.of(context);
    try {
      final entries = overlay.runtimeType.toString() == '_OverlayState'
          ? (overlay as dynamic)._entries as List<OverlayEntry>
          : <OverlayEntry>[];

      for (final entry in entries) {
        if (entry.mounted) {
          entry.remove();
        }
      }
    } catch (e) {
      debugPrint('Error removing overlays: $e');
    }
    state = MenuOverlayState();
  }
}
```

## 호버 상태 관리와 타이밍 제어

메뉴 아이템에서 호버 상태를 관리하는 것은 사용자 경험에 직접적인 영향을 미치는 중요한 부분입니다. 특히 서브메뉴가 있는 경우, 호버 상태와 타이머를 적절히 제어하지 않으면 메뉴가 너무 빨리 사라지거나, 반대로 너무 오래 남아있는 문제가 발생할 수 있습니다. 이를 해결하기 위해 타이머를 활용한 지연 처리를 구현했습니다.

```dart
class _CustomMenuItemState extends ConsumerState<CustomMenuItem> {
  Timer? _hideTimer;
  bool _isHovered = false;

  void _handleMenuExit() {
    _isHovered = false;
    _hideTimer?.cancel();

    // 메뉴를 벗어난 후 100ms 동안 대기한 후에 처리
    // 이는 사용자가 실수로 메뉴를 벗어났다가 다시 들어오는 경우를 대비합니다
    _hideTimer = Timer(const Duration(milliseconds: 100), () {
      if (mounted && !_isHovered) {
        final currentActiveIndex = ref.read(menuStateProvider).activeIndex;
        if (currentActiveIndex == widget.index) {
          ref.read(menuStateProvider.notifier).state = MenuState(activeIndex: null);
          ref.read(menuOverlayProvider.notifier).removeOverlay();
        }
      }
    });
  }
}
```

## Overlay 위치 지정과 연결 영역 관리

메뉴와 서브메뉴 사이의 연결 영역 관리는 사용자 경험을 크게 향상시킬 수 있는 부분입니다. LayerLink를 사용하여 메뉴 아이템과 Overlay를 연결하고, 그 사이에 투명한 연결 영역을 만들어 사용자가 실수로 메뉴를 벗어나는 것을 방지할 수 있습니다.

```dart
CompositedTransformFollower(
  link: _layerLink,
  offset: Offset(0, size.height),
  child: Material(
    color: Colors.transparent,
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // 투명한 연결 영역
        // 이 영역은 메뉴와 서브메뉴 사이의 간격을 이어주는 역할을 합니다
        MouseRegion(
          onEnter: (_) {
            _isHovered = true;
            _hideTimer?.cancel();
          },
          child: Container(
            height: 8,  // 8픽셀 높이의 투명한 연결 영역
            width: finalWidth,
            color: Colors.transparent,
          ),
        ),
        // 실제 서브메뉴 컨테이너
        // ... 서브메뉴 내용
      ],
    ),
  ),
)
```

## 주의해야 할 점들

### dispose 관리

Flutter에서 위젯의 생명주기 관리는 매우 중요합니다. Overlay를 사용할 때는 특히 다음 사항들을 꼭 지켜야 합니다:

- Widget이 dispose될 때 반드시 Timer를 취소하고 Overlay를 제거해야 합니다. 그렇지 않으면 메모리 누수가 발생할 수 있습니다.
- OverlayEntry도 필요하다면 dispose 해주어야 합니다. 특히 동적으로 생성되는 Overlay의 경우 더욱 중요합니다.
- dispose 순서도 중요합니다. Timer를 먼저 취소하고, 그 다음 Overlay를 제거하는 것이 안전합니다.

### mounted 체크

Widget의 상태 확인은 안정성 확보를 위해 필수적입니다:

- Overlay 조작 전에 항상 mounted 상태를 확인해야 합니다. mounted가 false인 상태에서 Overlay를 조작하면 예외가 발생할 수 있습니다.
- 비동기 작업 후에는 특히 더 주의해서 체크해야 합니다. 예를 들어 Timer 콜백이나 Future 완료 후에는 반드시 mounted를 확인해야 합니다.
- mounted 체크는 setState 호출 전에도 필요합니다.

### 상태 동기화

복잡한 UI에서 상태 관리는 매우 중요합니다:

- 여러 Overlay가 있을 때는 상태 관리를 통해 동기화를 유지해야 합니다. 각 Overlay의 상태가 서로 충돌하지 않도록 주의해야 합니다.
- activeIndex와 같은 상태값을 활용하여 현재 활성화된 Overlay를 추적합니다. 이를 통해 어떤 메뉴가 열려있는지 쉽게 파악할 수 있습니다.
- 상태 변경은 항상 Provider를 통해 하여 일관성을 유지합니다.

## 실제 사용 예시

메뉴바 구현에서는 다음과 같은 방식으로 활용할 수 있습니다. 이는 실제 프로젝트에서 사용 중인 구현의 기본 형태입니다.

```dart
class CustomMenuBar extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Provider를 통해 메뉴 데이터를 관리합니다
    final menus = ref.watch(mainMenusProvider);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: menus.map((menu) => CustomMenuItem(menu: menu)).toList(),
        ),
      ],
    );
  }
}
```

## 마치며

Overlay는 Flutter에서 제공하는 강력한 기능이지만, 적절한 관리가 필요합니다. Provider나 Riverpod과 같은 상태 관리 도구를 활용하면 복잡한 Overlay 관리도 체계적으로 할 수 있습니다.

특히 메모리 누수 방지와 사용자 경험 개선을 위해서는 dispose 관리와 호버 상태 관리에 신경 써야 합니다. 이러한 부분들을 잘 고려하여 구현한다면, 안정적이고 사용자 친화적인 UI를 만들 수 있을 것입니다.

또한, 디버그 모드에서 충분한 테스트를 거치고, 특히 메모리 누수 여부를 주기적으로 확인하는 것이 중요합니다. Flutter DevTools의 Memory 탭을 활용하면 메모리 사용량을 모니터링하고 잠재적인 문제를 조기에 발견할 수 있습니다.
