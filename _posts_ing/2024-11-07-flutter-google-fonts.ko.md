---
layout: post
title: "Flutter에서 Google Fonts 적용하기: 앱 전체 테마 설정부터 개별 위젯까지"
lang: ko
ref: flutter-google-fonts
categories: [Flutter, Dart, Mobile]
image: assets/images/category_flutter.webp
---

## 들어가며

Flutter에서는 Google Fonts 패키지를 통해 800개 이상의 폰트를 쉽게 적용할 수 있다. 이번 글에서는 Google Fonts를 Flutter 앱에 적용하는 방법부터 전체 테마에 적용하는 방법까지 한번 알아보자.

## Google Fonts 패키지 설정하기

### 1. 의존성 추가

먼저 `pubspec.yaml` 파일에 google_fonts 패키지를 추가합니다:

```yaml
dependencies:
  flutter:
    sdk: flutter
  google_fonts: ^6.2.1
```

그리고 터미널에서 다음 명령을 실행.

```bash
flutter pub get
```

아니면, 터미널에서 바로 설치하자.

```bash
flutter pub add google_fonts
```

### 2. 기본 사용법

Google Fonts를 사용하는 가장 기본적인 방법을 살펴보자.

```dart
import 'package:google_fonts/google_fonts.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text(
      '안녕하세요, Flutter!',
      style: GoogleFonts.notoSans(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: Colors.blue,
      ),
    );
  }
}
```

## 앱 전체 테마에 Google Fonts 적용하기

### 1. ThemeData 설정

앱의 전체 테마에 Google Fonts를 적용하는 방법이다.

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Google Fonts Demo',
      theme: ThemeData(
        // 기본 텍스트 테마 설정
        textTheme: GoogleFonts.notoSansTextTheme(
          Theme.of(context).textTheme,
        ),
        // headling 스타일만 다른 폰트 사용
        primaryTextTheme: GoogleFonts.notoSerifTextTheme(
          Theme.of(context).primaryTextTheme,
        ),
      ),
      home: MyHomePage(),
    );
  }
}
```

### 2. 커스텀 테마 설정

더 세부적인 스타일링이 필요한 경우, 다음과 같이 설정할 수 있다.

```dart
ThemeData(
  textTheme: TextTheme(
    displayLarge: GoogleFonts.notoSans(
      fontSize: 32,
      fontWeight: FontWeight.bold,
      color: Colors.black87,
    ),
    bodyLarge: GoogleFonts.notoSans(
      fontSize: 16,
      color: Colors.black87,
    ),
    titleMedium: GoogleFonts.notoSerif(
      fontSize: 20,
      fontWeight: FontWeight.w500,
      color: Colors.black,
    ),
  ),
)
```

## 다르게 사용해보기

### 1. 블로그 스타일 위젯을 만들어볼까

```dart
class BlogPostWidget extends StatelessWidget {
  final String title;
  final String content;

  const BlogPostWidget({
    Key? key,
    required this.title,
    required this.content,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GoogleFonts.notoSerif(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            height: 1.5,
          ),
        ),
        SizedBox(height: 16),
        Text(
          content,
          style: GoogleFonts.notoSans(
            fontSize: 16,
            height: 1.8,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }
}
```

### 2. 폰트 스타일 재사용하기

자주 사용하는 스타일은 별도의 상수로 정의하여 재사용할 수 있다.

```dart
class AppStyles {
  static final headerStyle = GoogleFonts.notoSerif(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    height: 1.5,
  );

  static final bodyStyle = GoogleFonts.notoSans(
    fontSize: 16,
    height: 1.8,
    letterSpacing: 0.5,
  );

  static final captionStyle = GoogleFonts.notoSans(
    fontSize: 14,
    color: Colors.grey[600],
    height: 1.5,
  );
}

// 사용 예시
Text('제목', style: AppStyles.headerStyle);
```

## 성능 최적화 팁

### 1. 폰트 캐싱

Google Fonts는 기본적으로 폰트를 캐시하는 것 같다. 하지만 오프라인 사용을 위해 미리 다운로드할 수도 있다.

```dart
class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _fontsLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadFonts();
  }

  Future<void> _loadFonts() async {
    await GoogleFonts.pendingFonts([
      GoogleFonts.notoSans(),
      GoogleFonts.notoSerif(),
    ]);
    setState(() {
      _fontsLoaded = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_fontsLoaded) {
      return CircularProgressIndicator();
    }
    // 나머지 앱 빌드 로직...
  }
}
```

### 2. 메모리 사용량 최적화

폰트 스타일을 자주 변경하지 않는 경우, 스타일을 상수로 정의하여 메모리 사용을 최적화할 수 있다.

```dart
// 좋은 예
static final headerStyle = GoogleFonts.notoSerif();

// 피해야 할 예 (build 메서드 내에서)
Text('제목', style: GoogleFonts.notoSerif()); // 매번 새로운 TextStyle 객체 생성
```

## 정리

Flutter에서 Google Fonts를 사용하면 다양한 폰트를 쉽게 적용할 수 있다. 전체 테마에 적용하거나 개별 위젯에 적용하는 등 유연한 사용이 가능하며, 성능 최적화를 위한 다양한 방법도 제공된다.

몇 가지를 정리해보면,

1. 앱 전체 테마에 적용할 때는 `GoogleFonts.xxxTextTheme()`을 사용
2. 개별 스타일링은 `GoogleFonts.xxx()`로 적용
3. 자주 사용하는 스타일은 상수로 정의하여 재사용
4. 오프라인 사용을 위해 필요한 폰트는 미리 로드
