---
layout: post
title: "Flutter Web의 새로운 변화: WASM 렌더러 도입과 웹 통합"
lang: ko
ref: flutter-wasm
categories: [Flutter, Web]
image: assets/images/category_flutter.webp
---

Flutter로 웹 애플리케이션을 개발할 때 렌더링 엔진의 선택은 매우 중요합니다. 3.10 이전에는 CanvasKit과 HTML 랜더러 중에서 하나를 선택하여 개발하고 했습니다.
그러나, Flutter 3.10 버전부터 도입된 WASM(WebAssembly) 렌더러는 기존 CanvasKit과 HTML 렌더러의 한계를 극복하고 웹 표준을 위해 등장했다고 해도 과언이 아닌데, 과연 그럴만한지 조금 더 알아봅시다.

(특히 웹 플랫폼과의 통합 측면에서 큰 변화가 있어 이를 자세히 살펴보겠습니다.)

## Flutter Web 렌더러의 변천사

Flutter Web은 처음 출시될 때부터 두 가지 렌더링 방식을 제공했습니다.

1. HTML 렌더러

   - 장점: 초기 로딩 크기가 작음, 기존 웹 요소와 통합이 쉬움
   - 단점: 성능이 좋지 않고 플랫폼 간 일관성이 떨어짐

2. CanvasKit 렌더러
   - 장점: 뛰어난 성능과 플랫폼 간 일관된 렌더링
   - 단점: 큰 초기 다운로드 크기 (~4.4MB), 웹 요소 통합이 제한적

저는 둘 다 다 써봤는데, 처음에는 CanvasKit을 사용했지만 초기 로딩 속도에서 main.dart.js 가 차지하는 파일의 크기가 크다 보니까 결국에는 HTML 렌더러로 빌드를 하게 되었습니다.

## WASM 렌더러의 등장과 특징

Flutter 3.10부터 도입된 WASM 렌더러는 완전히 새로운 접근 방식을 제공합니다.

### 1. 성능과 번들 크기

```dart
// WASM 렌더러 활성화 방법
flutter build web --web-renderer=wasm
```

- CanvasKit 대비 20-30% 더 빠른 초기 로딩
- 번들 크기 ~2MB로 감소
- 점진적 로딩 지원

### 2. 웹 플랫폼 통합

기존 HTML 렌더러에서 사용하던 웹 통합 기능들이 WASM에서는 다음과 같이 변경되었습니다:

#### HTML 요소 통합

```dart
// HTML 렌더러에서의 방식
HtmlElementView(
  viewType: 'iframe-view',
  key: UniqueKey(),
)

// WASM 렌더러에서의 방식
PlatformViewLink(
  viewType: 'iframe-view',
  surfaceFactory: (context, controller) {
    return HTMLSurface(
      controller: controller,
      onPlatformViewCreated: (id) {
        // 웹뷰 생성 완료 처리
      },
    );
  },
)
```

#### JavaScript 통신

```dart
// HTML 렌더러에서의 방식
@JS('console.log')
external void consoleLog(String message);

// WASM 렌더러에서의 방식
import 'package:flutter_web_plugins/flutter_web_plugins.dart';

class WebAPI {
  static void callJavaScript() async {
    final result = await promiseToFuture(
      js.context.callMethod('eval', ['console.log("Hello from WASM!")'])
    );
  }
}
```

### 3. 웹 API 접근성

WASM 렌더러에서는 웹 API 접근 방식이 표준화되었습니다:

```dart
// 웹 스토리지 접근
class WebStorageService {
  static Future<void> saveData(String key, String value) async {
    if (kIsWeb) {
      final storage = html.window.localStorage;
      storage[key] = value;
    }
  }
}

// 웹 소켓 연결
class WebSocketService {
  static WebSocket? _socket;

  static void connect(String url) {
    if (kIsWeb) {
      _socket = html.WebSocket(url);
      _socket!.onMessage.listen((event) {
        // 메시지 처리
      });
    }
  }
}
```

## 마이그레이션 가이드

기존 HTML 또는 CanvasKit 렌더러에서 WASM으로 전환 시 고려사항:

### 1. 플랫폼 체크 코드 수정

```dart
// 기존 코드
if (kIsWeb && WebRenderer.current == WebRenderer.html) {
  // HTML 렌더러 특정 코드
}

// WASM 대응 코드
if (kIsWeb) {
  if (WebRenderer.current == WebRenderer.wasm) {
    // WASM 특정 처리
  } else {
    // 기존 렌더러 처리
  }
}
```

### 2. 플러그인 호환성

```yaml
# pubspec.yaml
dependencies:
  # WASM 호환 플러그인 버전 지정
  webview_flutter: ^4.0.0 # WASM 지원 버전
  url_launcher: ^6.1.0 # WASM 지원 버전
```

### 3. 웹 리소스 로딩 최적화

```dart
class AssetLoader {
  static Future<void> preloadAssets() async {
    if (kIsWeb && WebRenderer.current == WebRenderer.wasm) {
      // WASM 특화 프리로딩 로직
      await Future.wait([
        precacheImage(AssetImage('assets/heavy_image.png'), context),
        // 기타 리소스 프리로딩
      ]);
    }
  }
}
```

## 성능 비교 및 벤치마크

실제 프로덕션 앱에서 측정된 성능 지표입니다:

| 지표                  | HTML   | CanvasKit | WASM      |
| --------------------- | ------ | --------- | --------- |
| 초기 로딩 크기        | ~500KB | ~4.4MB    | ~2MB      |
| First Paint           | 6.5초  | 12.9초    | 8.0초     |
| 복잡한 애니메이션 FPS | 30-40  | 55-60     | 58-60     |
| 메모리 사용량         | 높음   | 중간      | 낮음      |
| DOM 인터랙션 성능     | 좋음   | 제한적    | 매우 좋음 |

## 브라우저 지원 및 제한사항

### 지원 브라우저

- Chrome 90+
- Firefox 90+
- Safari 16.4+
- Edge 90+

### 알려진 제한사항

1. 일부 레거시 JavaScript API 호출 방식 변경 필요
2. 특정 HTML5 Canvas 기능의 제한적 지원
3. WebGL 2.0 필수 요구

특히, 저같은 경우에는 회사에서 사용하는 Flutter WebApp에 다른 회사의 서비스를 이용중인데,
자바스크립트로 SDK가 제공되다보니 Wasm으로 바꾸기 좀 어려운(?) 점이 있습니다.

## 실제 사용 사례

### 1. 복잡한 데이터 시각화 앱

```dart
class DataVisualization extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: ChartPainter(),
      child: GestureDetector(
        onPanUpdate: (details) {
          // WASM에서 더 부드러운 인터랙션
        },
      ),
    );
  }
}
```

### 2. 웹 기반 이미지 편집기

```dart
class ImageEditor extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // 이미지 편집 캔버스
        CustomPaint(
          painter: ImagePainter(),
        ),
        // 필터 컨트롤
        if (kIsWeb && WebRenderer.current == WebRenderer.wasm)
          WasmOptimizedFilters(),
        // ...
      ],
    );
  }
}
```

## 결론

WASM 렌더러는 Flutter Web의 새로운 장을 열었습니다. 특히 웹 플랫폼과의 통합 측면에서 기존의 한계를 많이 극복했으며, 성능과 개발 경험 모두에서 큰 발전을 이루었습니다.
다만, 아직 실험적 기능으로 분류되어 있어 프로덕션 환경에서는 신중한 검토가 필요합니다.

그래도 빠르게 발전하고 있는 Flutter 라고 생각이 드니,
WASM이 Flutter 내에서 공고하게 자리잡길 기원합니다.

## 참고 자료

- [Flutter Web 공식 문서](https://docs.flutter.dev/development/platform-integration/web)
- [Flutter WASM 렌더러 RFC](https://github.com/flutter/flutter/wiki/Flutter-WASM-Renderer)
- [Flutter Web 성능 벤치마크](https://flutter.dev/docs/perf/rendering/web)
- [Flutter Web 플랫폼 통합 가이드](https://flutter.dev/docs/development/platform-integration/web/web-plugins)
