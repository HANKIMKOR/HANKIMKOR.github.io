---
layout: post
title: "Flutter Web's New Changes: Introduction of WASM Renderer and Web Integration"
lang: en
ref: flutter-wasm
categories: [Flutter, Web]
image: assets/images/category_flutter.webp
---

When developing web applications with Flutter, choosing the rendering engine is crucial. Before version 3.10, developers had to choose between CanvasKit and HTML renderer.
However, the WASM (WebAssembly) renderer introduced from Flutter 3.10 has emerged to overcome the limitations of existing CanvasKit and HTML renderers and advance web standards. Let's explore if it lives up to these expectations.

(We'll particularly examine the significant changes in terms of web platform integration.)

## Evolution of Flutter Web Renderers

Since its initial release, Flutter Web has provided two rendering methods:

1. HTML Renderer

   - Advantages: Small initial loading size, easy integration with existing web elements
   - Disadvantages: Poor performance and inconsistency across platforms

2. CanvasKit Renderer
   - Advantages: Excellent performance and consistent rendering across platforms
   - Disadvantages: Large initial download size (~4.4MB), limited web element integration

I've used both, and while I initially used CanvasKit, I eventually switched to the HTML renderer for builds due to the large file size of main.dart.js affecting initial loading speed.

## Introduction and Features of WASM Renderer

The WASM renderer, introduced in Flutter 3.10, provides a completely new approach.

### 1. Performance and Bundle Size

```dart
// How to activate WASM renderer
flutter build web --web-renderer=wasm
```

- 20-30% faster initial loading compared to CanvasKit
- Reduced bundle size to ~2MB
- Support for progressive loading

### 2. Web Platform Integration

Web integration features previously used in the HTML renderer have been modified in WASM as follows:

#### HTML Element Integration

```dart
// Method in HTML renderer
HtmlElementView(
  viewType: 'iframe-view',
  key: UniqueKey(),
)

// Method in WASM renderer
PlatformViewLink(
  viewType: 'iframe-view',
  surfaceFactory: (context, controller) {
    return HTMLSurface(
      controller: controller,
      onPlatformViewCreated: (id) {
        // Handle webview creation completion
      },
    );
  },
)
```

#### JavaScript Communication

```dart
// Method in HTML renderer
@JS('console.log')
external void consoleLog(String message);

// Method in WASM renderer
import 'package:flutter_web_plugins/flutter_web_plugins.dart';

class WebAPI {
  static void callJavaScript() async {
    final result = await promiseToFuture(
      js.context.callMethod('eval', ['console.log("Hello from WASM!")'])
    );
  }
}
```

### 3. Web API Accessibility

Web API access has been standardized in the WASM renderer:

```dart
// Web storage access
class WebStorageService {
  static Future<void> saveData(String key, String value) async {
    if (kIsWeb) {
      final storage = html.window.localStorage;
      storage[key] = value;
    }
  }
}

// Web socket connection
class WebSocketService {
  static WebSocket? _socket;

  static void connect(String url) {
    if (kIsWeb) {
      _socket = html.WebSocket(url);
      _socket!.onMessage.listen((event) {
        // Handle messages
      });
    }
  }
}
```

## Migration Guide

Considerations when transitioning from existing HTML or CanvasKit renderer to WASM:

### 1. Modifying Platform Check Code

```dart
// Existing code
if (kIsWeb && WebRenderer.current == WebRenderer.html) {
  // HTML renderer specific code
}

// WASM-adapted code
if (kIsWeb) {
  if (WebRenderer.current == WebRenderer.wasm) {
    // WASM specific handling
  } else {
    // Existing renderer handling
  }
}
```

### 2. Plugin Compatibility

```yaml
# pubspec.yaml
dependencies:
  # Specify WASM compatible plugin versions
  webview_flutter: ^4.0.0 # WASM supported version
  url_launcher: ^6.1.0 # WASM supported version
```

### 3. Web Resource Loading Optimization

```dart
class AssetLoader {
  static Future<void> preloadAssets() async {
    if (kIsWeb && WebRenderer.current == WebRenderer.wasm) {
      // WASM-specific preloading logic
      await Future.wait([
        precacheImage(AssetImage('assets/heavy_image.png'), context),
        // Other resource preloading
      ]);
    }
  }
}
```

## Performance Comparison and Benchmarks

Performance metrics measured in actual production apps:

| Metric                      | HTML   | CanvasKit | WASM      |
| --------------------------- | ------ | --------- | --------- |
| Initial Loading Size        | ~500KB | ~4.4MB    | ~2MB      |
| First Paint                 | 6.5s   | 12.9s     | 8.0s      |
| Complex Animation FPS       | 30-40  | 55-60     | 58-60     |
| Memory Usage                | High   | Medium    | Low       |
| DOM Interaction Performance | Good   | Limited   | Very Good |

## Browser Support and Limitations

### Supported Browsers

- Chrome 90+
- Firefox 90+
- Safari 16.4+
- Edge 90+

### Known Limitations

1. Some legacy JavaScript API call methods need to be changed
2. Limited support for certain HTML5 Canvas features
3. WebGL 2.0 required

In my case particularly, the Flutter WebApp we use at work utilizes services from other companies, and since their SDKs are provided in JavaScript, it makes it somewhat challenging to switch to Wasm.

## Real-World Use Cases

### 1. Complex Data Visualization App

```dart
class DataVisualization extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: ChartPainter(),
      child: GestureDetector(
        onPanUpdate: (details) {
          // Smoother interaction in WASM
        },
      ),
    );
  }
}
```

### 2. Web-Based Image Editor

```dart
class ImageEditor extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Image editing canvas
        CustomPaint(
          painter: ImagePainter(),
        ),
        // Filter controls
        if (kIsWeb && WebRenderer.current == WebRenderer.wasm)
          WasmOptimizedFilters(),
        // ...
      ],
    );
  }
}
```

## Conclusion

The WASM renderer has opened a new chapter for Flutter Web. It has overcome many existing limitations, particularly in terms of web platform integration, and has made significant progress in both performance and development experience.
However, as it's still classified as an experimental feature, careful consideration is needed for production environments.

Still, seeing how rapidly Flutter is evolving,
I hope WASM will establish itself firmly within Flutter.

## References

- [Flutter Web Official Documentation](https://docs.flutter.dev/development/platform-integration/web)
- [Flutter WASM Renderer RFC](https://github.com/flutter/flutter/wiki/Flutter-WASM-Renderer)
- [Flutter Web Performance Benchmarks](https://flutter.dev/docs/perf/rendering/web)
- [Flutter Web Platform Integration Guide](https://flutter.dev/docs/development/platform-integration/web/web-plugins)
