---
layout: post
title: "Proper Error Handling in Flutter"
lang: en
ref: flutter-error-handling
categories: [Flutter, Clean Code]
image: assets/images/category_flutter.webp
---

When developing Flutter applications, we often encounter improper error handling code. Today, let's explore common incorrect error handling patterns and how to improve them.

## Examples of Poor Error Handling

Here are some examples of inappropriate error handling commonly found in real projects:

```dart
class UserRepository {
  Future<User> getUser(String id) async {
    try {
      final response = await api.getUser(id);
      return User.fromJson(response);
    } catch (e) {
      print('Error: $e'); // Simply printing the error
      return User.empty(); // Hiding error by returning empty object
    }
  }

  Future<void> updateUser(User user) async {
    try {
      await api.updateUser(user);
    } catch (e) {
      // Completely ignoring the error
    }
  }

  Future<List<User>> getUsers() async {
    try {
      final response = await api.getUsers();
      return response.map((e) => User.fromJson(e)).toList();
    } catch (e) {
      print(e);
      return []; // Hiding error by returning empty list
    }
  }
}
```

Problems with this code:

- Users aren't notified when errors occur
- Difficult to debug
- Potential cascade failures due to invalid data
- Impossible to track errors
- No error recovery mechanism

## Improved Error Handling Approaches

### 1. Define Custom Exception Classes

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

### 2. Using Result Class for Error Handling

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

### 3. Proper Error Handling and User Feedback

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
    // Error logging
    logger.error(error.message, error.details);

    // Provide appropriate user feedback
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_getErrorMessage(error)),
        action: error is NetworkException
          ? SnackBarAction(
              label: 'Retry',
              onPressed: _loadUserProfile,
            )
          : null,
      ),
    );
  }

  String _getErrorMessage(AppException error) {
    if (error is NetworkException) {
      return 'Please check your network connection.';
    } else if (error is AuthException) {
      return 'Login required.';
    } else if (error is ValidationException) {
      return 'Invalid data.';
    }
    return 'An error occurred.';
  }
}
```

### 4. Global Error Handling

```dart
class ErrorBoundary extends StatelessWidget {
  final Widget child;

  const ErrorBoundary({required this.child});

  @override
  Widget build(BuildContext context) {
    return ErrorWidget.builder = (FlutterErrorDetails details) {
      logger.error('UI Rendering Error', details.exception);

      return Material(
        child: Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('An error occurred'),
              ElevatedButton(
                onPressed: () {
                  // App restart or recovery logic
                },
                child: const Text('Try Again'),
              ),
            ],
          ),
        ),
      );
    };
  }
}
```

## Error Handling Checklist

Key points for proper error handling:

1. Define clear exception hierarchy
2. Provide appropriate error messages
3. Implement error logging
4. Provide recovery mechanisms
5. User-friendly feedback
6. Include debugging information
7. Implement global error handling

## Summary

Good error handling:

- Improves app stability
- Enhances user experience
- Facilitates debugging
- Increases maintainability
- Improves resilience to unexpected situations

## References

- [Flutter Error Handling](https://flutter.dev/docs/testing/errors)
- [Dart Exceptions](https://dart.dev/guides/language/language-tour#exceptions)
- [Effective Error Handling](https://dart.dev/guides/language/effective-dart/usage#error-handling)
