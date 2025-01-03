---
layout: post
title: "Flutter에서 올바른 에러 처리 방법"
lang: ko
ref: flutter-error-handling
categories: [Flutter, Clean Code]
image: assets/images/category_flutter.webp
---

Flutter 개발을 하다 보면 종종 부적절한 에러 처리 코드를 마주치게 된다. 오늘은 흔히 발생하는 잘못된 에러 처리 패턴과 이를 개선하는 방법에 대해 알아보자.

## 잘못된 에러 처리 예시

다음은 실제 프로젝트에서 자주 볼 수 있는 부적절한 에러 처리의 예시다:

```dart
class UserRepository {
  Future<User> getUser(String id) async {
    try {
      final response = await api.getUser(id);
      return User.fromJson(response);
    } catch (e) {
      print('Error: $e'); // 에러를 단순히 출력만 함
      return User.empty(); // 빈 객체를 반환하여 에러를 숨김
    }
  }

  Future<void> updateUser(User user) async {
    try {
      await api.updateUser(user);
    } catch (e) {
      // 에러를 완전히 무시
    }
  }

  Future<List<User>> getUsers() async {
    try {
      final response = await api.getUsers();
      return response.map((e) => User.fromJson(e)).toList();
    } catch (e) {
      print(e);
      return []; // 빈 리스트 반환으로 에러 상황을 숨김
    }
  }
}
```

이러한 코드의 문제점:

- 에러가 발생해도 사용자에게 알리지 않음
- 디버깅이 어려움
- 잘못된 데이터로 인한 연쇄 오류 발생 가능
- 에러 추적이 불가능
- 에러 복구 메커니즘 부재

## 개선된 에러 처리 방법

### 1. 커스텀 예외 클래스 정의

```dart
abstract class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  AppException(this.message, {this.code, this.details});
}

class NetworkException extends AppException {
  NetworkException(String message, {String? code, dynamic details})
    : super(message, code: code, details: details);
}

class ValidationException extends AppException {
  ValidationException(String message, {String? code, dynamic details})
    : super(message, code: code, details: details);
}

class AuthException extends AppException {
  AuthException(String message, {String? code, dynamic details})
    : super(message, code: code, details: details);
}
```

### 2. Result 클래스를 활용한 에러 처리

```dart
class Result<T> {
  final T? data;
  final AppException? error;

  Result.success(this.data) : error = null;
  Result.failure(this.error) : data = null;

  bool get isSuccess => error == null;
  bool get isFailure => error != null;
}

class UserRepository {
  Future<Result<User>> getUser(String id) async {
    try {
      final response = await api.getUser(id);
      return Result.success(User.fromJson(response));
    } on NetworkException catch (e) {
      return Result.failure(e);
    } on FormatException catch (e) {
      return Result.failure(
        ValidationException('Invalid user data format', details: e),
      );
    } catch (e) {
      return Result.failure(
        AppException('Unknown error occurred', details: e),
      );
    }
  }
}
```

### 3. 적절한 에러 처리와 사용자 피드백

```dart
class UserProfileScreen extends StatelessWidget {
  Future<void> _loadUserProfile() async {
    try {
      setState(() => _isLoading = true);

      final result = await userRepository.getUser(userId);
      if (result.isSuccess) {
        setState(() => _user = result.data);
      } else {
        _handleError(result.error!);
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _handleError(AppException error) {
    // 에러 로깅
    logger.error(error.message, error.details);

    // 사용자에게 적절한 피드백 제공
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_getErrorMessage(error)),
        action: error is NetworkException
          ? SnackBarAction(
              label: '재시도',
              onPressed: _loadUserProfile,
            )
          : null,
      ),
    );
  }

  String _getErrorMessage(AppException error) {
    if (error is NetworkException) {
      return '네트워크 연결을 확인해주세요.';
    } else if (error is AuthException) {
      return '로그인이 필요합니다.';
    } else if (error is ValidationException) {
      return '잘못된 데이터입니다.';
    }
    return '오류가 발생했습니다.';
  }
}
```

### 4. 전역 에러 처리

```dart
class ErrorBoundary extends StatelessWidget {
  final Widget child;

  const ErrorBoundary({required this.child});

  @override
  Widget build(BuildContext context) {
    return ErrorWidget.builder = (FlutterErrorDetails details) {
      logger.error('UI 렌더링 에러', details.exception);

      return Material(
        child: Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('오류가 발생했습니다'),
              ElevatedButton(
                onPressed: () {
                  // 앱 재시작 또는 복구 로직
                },
                child: const Text('다시 시도'),
              ),
            ],
          ),
        ),
      );
    };
  }
}
```

## 에러 처리 체크리스트

올바른 에러 처리를 위한 핵심 포인트:

1. 명확한 예외 계층 구조 정의
2. 적절한 에러 메시지 제공
3. 에러 로깅 구현
4. 복구 메커니즘 제공
5. 사용자 친화적인 피드백
6. 디버깅 정보 포함
7. 전역 에러 처리 구현

## 정리

좋은 에러 처리는:

- 앱의 안정성을 높임
- 사용자 경험을 개선
- 디버깅을 용이하게 함
- 유지보수성을 향상
- 예기치 않은 상황에 대한 대응력을 높임

## 참고 자료

- [Flutter 에러 처리](https://flutter.dev/docs/testing/errors)
- [Dart 예외 처리](https://dart.dev/guides/language/language-tour#exceptions)
- [Effective Error Handling](https://dart.dev/guides/language/effective-dart/usage#error-handling)
