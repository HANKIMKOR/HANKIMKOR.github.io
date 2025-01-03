---
layout: post
title: "Flutter에서 콜백 지옥(Callback Hell) 탈출하기"
lang: ko
ref: flutter-callback-hell
categories: [Flutter, Clean Code]
image: assets/images/category_flutter.webp
---

Flutter 개발을 하다 보면 콜백 함수가 중첩되면서 코드가 깊어지는 현상을 자주 마주치게 된다. 이른바 '콜백 지옥(Callback Hell)'이라 불리는 이 현상에 대해 알아보고, 이를 개선하는 방법을 살펴보자.

## 문제가 되는 코드 예시

다음은 실제 프로젝트에서 흔히 볼 수 있는 콜백 지옥의 예시다:

```dart
void handleUserAction() {
  showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: const Text('사용자 정보 입력'),
        content: TextField(
          onChanged: (value) {
            setState(() {
              if (value.isNotEmpty) {
                api.validateInput(value, (isValid) {
                  if (isValid) {
                    api.processData(value, (result) {
                      if (result.success) {
                        api.saveData(result.data, (success) {
                          if (success) {
                            showDialog(
                              context: context,
                              builder: (context) {
                                return AlertDialog(
                                  content: Text('저장 완료!'),
                                );
                              },
                            );
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          },
        ),
      );
    },
  );
}
```

이 코드의 문제점:

- 가독성이 매우 떨어짐
- 에러 처리가 어려움
- 코드 유지보수가 힘듦
- 디버깅이 복잡함
- 비동기 처리 흐름 파악이 어려움

## 해결 방법 1: async/await 활용

가장 간단한 해결 방법은 async/await를 활용하는 것이다:

```dart
Future<void> handleUserAction() async {
  final value = await _showInputDialog();
  if (value == null || value.isEmpty) return;

  final isValid = await api.validateInput(value);
  if (!isValid) {
    _showErrorDialog('유효하지 않은 입력입니다.');
    return;
  }

  final result = await api.processData(value);
  if (!result.success) {
    _showErrorDialog('처리 중 오류가 발생했습니다.');
    return;
  }

  final success = await api.saveData(result.data);
  if (success) {
    _showSuccessDialog('저장이 완료되었습니다!');
  }
}

Future<String?> _showInputDialog() async {
  return showDialog<String>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('사용자 정보 입력'),
      content: TextField(
        controller: _textController,
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('취소'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, _textController.text),
          child: const Text('확인'),
        ),
      ],
    ),
  );
}
```

## 해결 방법 2: 함수 분리

복잡한 로직을 작은 함수들로 분리하여 관리할 수 있다:

```dart
class UserDataManager {
  Future<bool> processUserInput(String value) async {
    if (!await _validateInput(value)) {
      return false;
    }

    final processedData = await _processData(value);
    if (processedData == null) {
      return false;
    }

    return await _saveData(processedData);
  }

  Future<bool> _validateInput(String value) async {
    try {
      return await api.validateInput(value);
    } catch (e) {
      _handleError('유효성 검사 실패', e);
      return false;
    }
  }

  Future<ProcessedData?> _processData(String value) async {
    try {
      final result = await api.processData(value);
      if (!result.success) {
        _handleError('데이터 처리 실패', null);
        return null;
      }
      return result.data;
    } catch (e) {
      _handleError('데이터 처리 중 오류', e);
      return null;
    }
  }

  Future<bool> _saveData(ProcessedData data) async {
    try {
      return await api.saveData(data);
    } catch (e) {
      _handleError('저장 실패', e);
      return false;
    }
  }
}
```

## 해결 방법 3: Stream 활용

연속된 데이터 처리가 필요한 경우 Stream을 활용할 수 있다:

```dart
Stream<ProcessingState> processUserData(String input) async* {
  yield ProcessingState.validating;

  final isValid = await api.validateInput(input);
  if (!isValid) {
    yield ProcessingState.invalidInput;
    return;
  }

  yield ProcessingState.processing;
  final result = await api.processData(input);
  if (!result.success) {
    yield ProcessingState.processingError;
    return;
  }

  yield ProcessingState.saving;
  final success = await api.saveData(result.data);

  yield success
    ? ProcessingState.completed
    : ProcessingState.savingError;
}

// 사용 예시
StreamBuilder<ProcessingState>(
  stream: processUserData(inputValue),
  builder: (context, snapshot) {
    final state = snapshot.data;
    switch (state) {
      case ProcessingState.validating:
        return const Text('유효성 검사 중...');
      case ProcessingState.processing:
        return const Text('처리 중...');
      case ProcessingState.saving:
        return const Text('저장 중...');
      case ProcessingState.completed:
        return const Text('완료!');
      case ProcessingState.invalidInput:
        return const Text('유효하지 않은 입력입니다.');
      case ProcessingState.processingError:
        return const Text('처리 중 오류가 발생했습니다.');
      case ProcessingState.savingError:
        return const Text('저장 중 오류가 발생했습니다.');
      default:
        return const SizedBox.shrink();
    }
  },
)
```

## 정리

콜백 지옥을 피하는 핵심 원칙:

1. async/await 적극 활용
2. 함수를 작은 단위로 분리
3. 적절한 에러 처리 추가
4. 가능한 경우 Stream 활용
5. 명확한 상태 관리

이러한 방법들을 활용하면 코드의 가독성과 유지보수성을 크게 향상시킬 수 있다.

## 참고 자료

- [Dart 언어 투어 - 비동기 지원](https://dart.dev/guides/language/language-tour#asynchrony-support)
- [Flutter - Stream](https://api.flutter.dev/flutter/dart-async/Stream-class.html)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
