---
layout: post
title: "Flutter의 팝업 구현하기: showDialog vs Overlay"
lang: ko
ref: flutter-popup
categories: [Flutter, Mobile, Web]
image: assets/images/category_flutter.webp
---

Flutter로 앱을 개발하다 보면 사용자에게 추가 정보를 보여주거나 상호작용이 필요한 UI를 표시해야 할 때가 많습니다.
이때 가장 많이 사용되는 두 가지 방법이 바로 showDialog와 Overlay입니다.

저같은 경우에는 웹앱으로 서비스를 제공하다보니, 앱으로 Flutter로 개발할때보다 showDialog와 Overlay를 사용하는 빈도가 매우 높은 것 같습니다.

오늘은 이 두 가지 방법의 특징과 적절한 사용 시나리오, 그리고 실제 구현 방법까지 정리해보겠습니다.

## showDialog vs Overlay

### showDialog

showDialog는 Flutter에서 제공하는 가장 기본적인 대화상자 표시 방법입니다.
보통 우리가 팝업이라고 생각하는 것에 가장 가깝다? 라고 생각하면 되지 않을까 싶습니다.
전체 화면을 어둡게 처리하고 중앙에 컨텐츠를 표시하는 방식으로, 사용자의 주의를 특정 내용에 집중시키고자 할 때 효과적입니다.

```dart
void showBasicDialog(BuildContext context) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text('알림'),
        content: Text('기본적인 다이얼로그 예제입니다.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('확인'),
          ),
        ],
      );
    },
  );
}
```

### Overlay

Overlay는 더 유연한 팝업 UI를 구현할 수 있게 해주는 위젯입니다. 화면의 특정 위치에 컨텐츠를 띄울 수 있고, 배경 처리나 애니메이션도 자유롭게 구현할 수 있습니다.

저 같은 경우에는 검색창에 결과를 밑에 띄우거나 혹은 카테고리에서 메뉴를 클릭했을 때에 그 하위메뉴를 보여주는 용도나 아니면 유저의 status창을 보여주는 용도로 overlay를 많이 사용하고 있습니다.

```dart
void showBasicOverlay(BuildContext context) {
  OverlayState? overlayState = Overlay.of(context);
  late OverlayEntry overlayEntry;

  overlayEntry = OverlayEntry(
    builder: (context) => Positioned(
      top: 100,
      left: 20,
      child: Material(
        elevation: 4.0,
        child: Container(
          padding: EdgeInsets.all(16),
          child: Text('오버레이 예제입니다.'),
        ),
      ),
    ),
  );

  overlayState.insert(overlayEntry);
}
```

### 언제 무엇을 사용해야 할까?

보통 아래와 같은 경우에 showDialog와 Overlay를 많이 사용하고 있는 것 같습니다.

## showDialog 사용이 적합한 경우

- 사용자의 확인이나 선택이 필요한 경우
- 중요한 알림이나 경고를 표시할 때
- 간단한 폼을 입력받아야 할 때
- 전체 화면의 작업을 일시 중단해야 할 때

## Overlay 사용이 적합한 경우

- 툴팁이나 힌트를 표시할 때
- 드롭다운 메뉴를 구현할 때
- 특정 위젯 근처에 추가 정보를 표시할 때
- 사용자 인터랙션을 방해하지 않는 알림을 표시할 때

### 위치 기반 Overlay 구현하기

showDialog는 보통 화면 중앙(물론 위치를 조절할 수 있지만)에 위치하기 때문에 크게 위치를 신경쓰지는 않는 편입니다.
그러나 Overlay는 보통 어떤 버튼의 하위에 띄우는 경우가 많기 때문에 특정 버튼이나 위젯 근처에 Overlay를 표시하는 것은 매우 유용한 UI 패턴입니다.

아래는 보통 버튼 밑에 띄우는 대표적인 방법입니다.

```dart
class PositionedOverlayExample extends StatelessWidget {
  void showDropdownOverlay(BuildContext context, RenderBox button) {
    final overlay = Overlay.of(context);
    final position = button.localToGlobal(Offset.zero);

    OverlayEntry? entry;
    entry = OverlayEntry(
      builder: (context) => Positioned(
        top: position.dy + button.size.height,  // 버튼 바로 아래
        left: position.dx,
        width: button.size.width,  // 버튼과 같은 너비
        child: Material(
          elevation: 8,
          borderRadius: BorderRadius.circular(8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: Text('옵션 1'),
                onTap: () {
                  entry?.remove();
                },
              ),
              ListTile(
                title: Text('옵션 2'),
                onTap: () {
                  entry?.remove();
                },
              ),
            ],
          ),
        ),
      ),
    );

    overlay.insert(entry);
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        final button = context.findRenderObject() as RenderBox;
        showDropdownOverlay(context, button);
      },
      child: Text('드롭다운 메뉴 열기'),
    );
  }
}
```

## 알아두면 좋은 Tip

1. 화면 터치 감지로 Overlay 닫기
   Overlay를 사용할 때 주의할 점은 자동으로 닫히지 않는다는 것입니다. 화면의 다른 부분을 터치했을 때 Overlay를 닫으려면 다음과 같이 구현할 수 있습니다.

```dart

OverlayEntry overlayEntry = OverlayEntry(
  builder: (context) => Stack(
    children: [
      // 배경 터치 감지를 위한 GestureDetector
      Positioned.fill(
        child: GestureDetector(
          onTap: () => overlayEntry.remove(),
          child: Container(
            color: Colors.transparent,
          ),
        ),
      ),
      // 실제 오버레이 컨텐츠
      Positioned(
        top: position.dy,
        left: position.dx,
        child: YourOverlayContent(),
      ),
    ],
  ),
);
```

2. 애니메이션 적용하기
   Overlay에 애니메이션을 적용하면 더 자연스러운 사용자 경험을 제공할 수 있습니다.

```dart
class AnimatedOverlayContent extends StatefulWidget {
  @override
  _AnimatedOverlayContentState createState() => _AnimatedOverlayContentState();
}

class _AnimatedOverlayContentState extends State<AnimatedOverlayContent>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 200),
      vsync: this,
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    );
    _controller.forward();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animation,
      child: ScaleTransition(
        scale: _animation,
        child: YourOverlayContent(),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

### 성능과 메모리 관리

Overlay를 사용할 때는 몇 가지 주의해야 할 점이 있습니다.

## Overlay 제거 확인

Overlay는 수동으로 제거해야 합니다
페이지 이동 시 반드시 제거해야 메모리 누수를 방지할 수 있습니다

## 컨텍스트 관리

BuildContext가 유효한지 확인해야 합니다
위젯이 dispose된 후에는 Overlay를 조작하지 않도록 주의해야 합니다

### 어떤 것을 쓰던지 자유다. 다만 잘 알아두자.

showDialog와 Overlay는 각각의 장단점이 있습니다. showDialog는 간단하고 직관적이지만 커스터마이징에 제한이 있고, Overlay는 더 많은 자유도를 제공하지만 구현이 복잡할 수 있습니다.

실제 프로젝트에서는 두 가지 방식을 적절히 조합하여 사용하는 것이 좋습니다. 중요한 알림이나 사용자 입력이 필요한 경우에는 showDialog를, 툴팁이나 컨텍스트 메뉴 같은 보조적인 UI에는 Overlay를 사용하는 것이 효과적인 것 같습니다.

물론 Overlay같은 경우에는 dispose를 제대로 해주지 않으면 오류가 많이 발생하기도 합니다. 반면에, showDialog는 다른 팝업이 있어도 무한대로 띄울 수 있기 때문에 그 부분이 또 주의를 요하는 부분입니다. 기회가 된다면 이 부분에 대해서도 정리해서 다뤄보도록 하겠습니다.
