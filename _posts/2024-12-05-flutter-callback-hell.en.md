---
layout: post
title: "Escaping Callback Hell in Flutter"
lang: en
ref: flutter-callback-hell
categories: [Flutter, Clean Code]
image: assets/images/category_flutter.webp
---

When developing in Flutter, we often encounter situations where callback functions become deeply nested, creating what's known as 'Callback Hell'. Let's explore this problem and learn various ways to improve such code.

## Problematic Code Example

Here's a typical example of callback hell that you might encounter in real projects:

```dart
void handleUserAction() {
  showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: const Text('Enter User Information'),
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
                                  content: Text('Save Complete!'),
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

Problems with this code:

- Poor readability
- Difficult error handling
- Hard to maintain
- Complex debugging
- Difficult to understand async flow

## Solution 1: Using async/await

The simplest solution is to use async/await:

```dart
Future<void> handleUserAction() async {
  final value = await _showInputDialog();
  if (value == null || value.isEmpty) return;

  final isValid = await api.validateInput(value);
  if (!isValid) {
    _showErrorDialog('Invalid input');
    return;
  }

  final result = await api.processData(value);
  if (!result.success) {
    _showErrorDialog('Processing error occurred');
    return;
  }

  final success = await api.saveData(result.data);
  if (success) {
    _showSuccessDialog('Save completed!');
  }
}

Future<String?> _showInputDialog() async {
  return showDialog<String>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Enter User Information'),
      content: TextField(
        controller: _textController,
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, _textController.text),
          child: const Text('Confirm'),
        ),
      ],
    ),
  );
}
```

## Solution 2: Function Separation

We can manage complex logic by breaking it down into smaller functions:

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
      _handleError('Validation failed', e);
      return false;
    }
  }

  Future<ProcessedData?> _processData(String value) async {
    try {
      final result = await api.processData(value);
      if (!result.success) {
        _handleError('Data processing failed', null);
        return null;
      }
      return result.data;
    } catch (e) {
      _handleError('Error during data processing', e);
      return null;
    }
  }

  Future<bool> _saveData(ProcessedData data) async {
    try {
      return await api.saveData(data);
    } catch (e) {
      _handleError('Save failed', e);
      return false;
    }
  }
}
```

## Solution 3: Using Streams

For sequential data processing, we can utilize Streams:

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

// Usage example
StreamBuilder<ProcessingState>(
  stream: processUserData(inputValue),
  builder: (context, snapshot) {
    final state = snapshot.data;
    switch (state) {
      case ProcessingState.validating:
        return const Text('Validating...');
      case ProcessingState.processing:
        return const Text('Processing...');
      case ProcessingState.saving:
        return const Text('Saving...');
      case ProcessingState.completed:
        return const Text('Complete!');
      case ProcessingState.invalidInput:
        return const Text('Invalid input');
      case ProcessingState.processingError:
        return const Text('Processing error occurred');
      case ProcessingState.savingError:
        return const Text('Error while saving');
      default:
        return const SizedBox.shrink();
    }
  },
)
```

## Summary

Key principles to avoid callback hell:

1. Make extensive use of async/await
2. Break functions into smaller units
3. Add proper error handling
4. Use Streams when appropriate
5. Implement clear state management

Using these methods can significantly improve code readability and maintainability.

## References

- [Dart Language Tour - Asynchrony Support](https://dart.dev/guides/language/language-tour#asynchrony-support)
- [Flutter - Stream](https://api.flutter.dev/flutter/dart-async/Stream-class.html)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
