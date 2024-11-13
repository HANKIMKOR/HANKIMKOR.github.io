---
layout: post
title: "Understanding Riverpod Providers: A Comprehensive Guide"
lang: en
ref: riverpod-providers
categories: [Flutter, Dev]
image: assets/images/category_flutter.webp
---

# Understanding Riverpod Providers: A Comprehensive Guide

## Introduction

Riverpod is a powerful state management solution for Flutter that improves upon the original Provider package. At its core are Providers - the fundamental building blocks that help manage and access state throughout your application.

## Basic Provider Types

### 1. Provider

The simplest form of provider that holds a value that never changes.

```dart
final helloWorldProvider = Provider<String>((ref) {
  return 'Hello world';
});
```

### 2. StateProvider

Used for simple state that can be modified from outside.

```dart
final counterProvider = StateProvider<int>((ref) {
  return 0;
});

// Usage
Consumer(
  builder: (context, ref, child) {
    final count = ref.watch(counterProvider);
    return Text('Count: $count');
  },
);

// Modifying the state
ref.read(counterProvider.notifier).state++;
```

### 3. StateNotifierProvider

For complex state that requires more controlled mutations through a dedicated class.

```dart
class Counter extends StateNotifier<int> {
  Counter() : super(0);

  void increment() => state++;
  void decrement() => state--;
}

final counterProvider = StateNotifierProvider<Counter, int>((ref) {
  return Counter();
});

// Usage
final counter = ref.watch(counterProvider);
final notifier = ref.read(counterProvider.notifier);
notifier.increment();
```

### 4. FutureProvider

Perfect for async operations and API calls.

```dart
final userProvider = FutureProvider<User>((ref) async {
  final repository = ref.read(repositoryProvider);
  return repository.fetchUser();
});

// Usage
Consumer(
  builder: (context, ref, child) {
    final userAsync = ref.watch(userProvider);
    return userAsync.when(
      data: (user) => Text(user.name),
      loading: () => CircularProgressIndicator(),
      error: (error, stack) => Text('Error: $error'),
    );
  },
);
```

### 5. StreamProvider

For handling streams of data.

```dart
final messagesProvider = StreamProvider<List<Message>>((ref) {
  final repository = ref.read(repositoryProvider);
  return repository.messagesStream();
});
```

## Provider Modifiers

### 1. family

For providers that need parameters:

```dart
final userProvider = FutureProvider.family<User, String>((ref, userId) async {
  final repository = ref.read(repositoryProvider);
  return repository.fetchUser(userId);
});

// Usage
ref.watch(userProvider('user-123'));
```

### 2. autoDispose

Automatically disposes the provider when no longer needed:

```dart
final searchProvider = StateProvider.autoDispose<String>((ref) {
  return '';
});
```

## Best Practices

1. **Provider Organization**

```dart
// providers/user_providers.dart
final userRepositoryProvider = Provider<UserRepository>((ref) {
  return UserRepository();
});

final currentUserProvider = StateNotifierProvider<UserNotifier, User?>((ref) {
  final repository = ref.watch(userRepositoryProvider);
  return UserNotifier(repository);
});
```

2. **Error Handling**

```dart
final apiProvider = FutureProvider<Data>((ref) async {
  try {
    final result = await api.fetchData();
    return result;
  } catch (e) {
    throw CustomException('Failed to fetch data: $e');
  }
});
```

3. **Combining Providers**

```dart
final filteredTodosProvider = Provider<List<Todo>>((ref) {
  final todos = ref.watch(todosProvider);
  final filter = ref.watch(filterProvider);

  switch (filter) {
    case Filter.completed:
      return todos.where((todo) => todo.completed).toList();
    case Filter.active:
      return todos.where((todo) => !todo.completed).toList();
    case Filter.all:
    default:
      return todos;
  }
});
```

## Conclusion

Riverpod providers offer a flexible and type-safe way to manage state in Flutter applications. By understanding these different provider types and their use cases, you can build more maintainable and scalable applications.

---
