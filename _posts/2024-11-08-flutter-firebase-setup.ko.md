---
layout: post
title: "Flutter에서 Firebase 설정하기: 설치부터 초기 설정까지 완벽 가이드"
lang: ko
ref: flutter-firebase-setup
categories: [Flutter, Firebase, Mobile]
image: assets/images/category_flutter.webp
---

## Firebase란 무엇인가?

Firebase는 Google이 제공하는 모바일 및 웹 애플리케이션 개발 플랫폼이다. 개발자가 앱을 빠르게 개발할 수 있도록 다양한 도구와 서비스를 제공하는 역할을 한다.

### Firebase의 주요 기능

Firebase는 아래와 같은 기능을 제공해주고 있다.. 나같은 경우에는 Analytics 용도로 현재 Firebase를 주로 사용하고 있다.

1. **인증 (Authentication)**

   - 이메일/비밀번호, 소셜 로그인 (Google, Facebook 등) 지원
   - 전화번호 인증
   - 익명 로그인

2. **데이터베이스**

   - Cloud Firestore: NoSQL 클라우드 데이터베이스
   - Realtime Database: 실시간 데이터 동기화

3. **스토리지**

   - 이미지, 비디오 등 파일 저장
   - 대용량 파일 처리

4. **푸시 알림**

   - Firebase Cloud Messaging (FCM)
   - 타겟팅된 푸시 알림 전송

5. **분석 (Analytics)**
   - 사용자 행동 분석
   - 앱 성능 모니터링

## Flutter 프로젝트에 Firebase 설정기

### 1. 사전 준비사항

- Flutter SDK 설치
- Firebase 계정 생성
- Firebase CLI 설치

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login
```

### 2. FlutterFire CLI 설치

FlutterFire CLI는 Firebase 설정을 자동화해주는 도구이다.

```bash
dart pub global activate flutterfire_cli
```

### 3. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. '프로젝트 추가' 클릭
3. 프로젝트 이름 입력
4. Google Analytics 설정 (선택사항)
5. '프로젝트 만들기' 클릭

### 4. Flutter 프로젝트에 Firebase 추가

```bash
# 프로젝트 디렉토리에서 실행
flutterfire configure
```

이 명령어를 실행하게 되면,

1. Firebase 프로젝트 선택
2. 플랫폼 선택 (Android/iOS)
3. 필요한 설정 파일 자동 생성

### 5. Firebase 패키지 추가

`pubspec.yaml` 파일에 필요한 패키지를 추가한다.

```yaml
dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3 # 인증 기능
  cloud_firestore: ^4.13.6 # Firestore 데이터베이스
  firebase_storage: ^11.5.6 # 스토리지
```

패키지 설치:

```bash
flutter pub get
```

### 6. Firebase 초기화

`lib/main.dart` 파일에 Firebase를 초기화를 해야 한다.

```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(MyApp());
}
```

## 플랫폼별 추가 설정

### Android 설정

`android/app/build.gradle`에서 최소 SDK 버전을 설정한다.

```gradle
android {
    defaultConfig {
        minSdkVersion 21
        // ...
    }
}
```

### iOS 설정

`ios/Runner/Info.plist`에 필요한 권한 추가한다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- 기존 설정 -->
    <key>NSCameraUsageDescription</key>
    <string>카메라 접근 권한이 필요합니다.</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>사진 라이브러리 접근 권한이 필요합니다.</string>
</dict>
</plist>
```

## Firebase 사용 예시

### 1. 인증 기능 사용하기

```dart
import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // 이메일/비밀번호로 회원가입
  Future<UserCredential?> signUp(String email, String password) async {
    try {
      return await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      print('회원가입 오류: $e');
      return null;
    }
  }

  // 로그인
  Future<UserCredential?> signIn(String email, String password) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      print('로그인 오류: $e');
      return null;
    }
  }
}
```

### 2. Firestore 데이터베이스 사용하기

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

class DatabaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // 데이터 추가
  Future<void> addUser(String userId, Map<String, dynamic> userData) async {
    await _db.collection('users').doc(userId).set(userData);
  }

  // 데이터 읽기
  Future<DocumentSnapshot> getUser(String userId) async {
    return await _db.collection('users').doc(userId).get();
  }
}
```

## 주의사항 및 팁

### 1. 보안 규칙 설정

- Firestore와 Storage의 보안 규칙을 반드시 설정해야 한다
- 기본값은 테스트 모드로 되어있어 누구나 읽기/쓰기가 가능하다
- 예시 보안 규칙:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 접근 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 읽기는 모두 가능, 쓰기는 인증된 사용자만
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2. 비용 관리

Firebase의 무료 할당량 (Spark 플랜):

1. **Firestore**

   - 저장 용량: 1GB
   - 문서 읽기: 하루 50,000회
   - 문서 쓰기: 하루 20,000회
   - 문서 삭제: 하루 20,000회

2. **Storage**

   - 저장 용량: 5GB
   - 다운로드: 하루 1GB
   - 업로드: 하루 1GB

3. **Authentication**

   - 무제한 인증

4. **Hosting**
   - 저장 용량: 10GB
   - 전송량: 월 360MB

초과 시 비용 (Blaze 플랜):

- Firestore 문서 읽기: $0.036/100,000회
- Firestore 문서 쓰기: $0.108/100,000회
- Storage: GB당 $0.026
- 상세 요금은 지역에 따라 다를 수 있음

비용 관리 팁:

- Firebase Console에서 예산 알림 설정
- 쿼리 최적화로 읽기 횟수 최소화
- 대용량 파일은 다른 스토리지 서비스 고려

### 3. 오프라인 지원

Firestore의 오프라인 캐싱 기능:

1. **기본 동작 방식**

```dart
// 오프라인 캐싱 설정
FirebaseFirestore.instance.settings = Settings(
  persistenceEnabled: true, // 기본값 true
  cacheSizeBytes: 100000000, // 100MB
);
```

2. **오프라인 데이터 처리**

```dart
// 캐시된 데이터 우선 사용
final userDoc = await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .get(GetOptions(source: Source.cache));

// 서버 데이터와 동기화
final serverDoc = await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .get(GetOptions(source: Source.server));
```

3. **주요 특징**

   - 인터넷 연결이 끊겨도 앱 사용 가능
   - 자동으로 데이터 동기화
   - 오프라인 상태에서 변경사항 큐에 저장
   - 온라인 복귀 시 자동 동기화

4. **캐시 관리**

```dart
// 캐시 전체 삭제
await FirebaseFirestore.instance.clearPersistence();

// 특정 문서 캐시 삭제
await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .clearPersistence();
```

5. **주의사항**
   - 캐시 크기 제한 설정 필요
   - 민감한 데이터는 암호화 고려
   - 주기적인 캐시 정리 구현

## 정리

Firebase는 백엔드 인프라를 직접 구축하지 않고도 다양한 기능을 빠르게 구현할 수 있게 해주는 강력한 도구다. Flutter와의 통합도 잘 되어있어 모바일 앱 개발 시 매우 유용하게 쓸 수 있다.

시작하기 전 고려할 점.

1. 프로젝트의 규모와 요구사항 파악
2. Firebase 무료 할당량 확인
3. 보안 설정 철저히 하기
4. 적절한 데이터 구조 설계

이러한 준비를 잘 마치고 시작한다면, Firebase는 여러분의 Flutter 앱 개발을 한층 더 효율적으로 만들어줄 것이다!..
