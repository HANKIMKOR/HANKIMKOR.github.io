---
layout: post
title: "Riverpod Provider 완벽 가이드"
lang: ko
ref: riverpod-providers
categories: [Flutter, Dev]
image: assets/images/category_dev.webp
---

# Riverpod Provider 완벽 가이드

## 소개

Riverpod는 기존 Provider 패키지를 개선한 Flutter의 강력한 상태 관리 솔루션입니다. 그 핵심에는 Provider가 있으며, 이는 애플리케이션 전체에서 상태를 관리하고 접근하는 데 도움을 주는 기본 구성 요소입니다.

## 기본 Provider 유형

### 1. Provider

변경되지 않는 값을 보관하는 가장 단순한 형태의 provider입니다.

```dart
final helloWorldProvider = Provider<String>((ref) {
  return 'Hello world';
});
```

### 2. StateProvider

외부에서 수정 가능한 간단한 상태를 위해 사용됩니다.

```dart
final counterProvider = StateProvider<int>((ref) {
  return 0;
});

// 사용 예시
Consumer(
  builder: (context, ref, child) {
    final count = ref.watch(counterProvider);
    return Text('카운트: $count');
  },
);

// 상태 수정
ref.read(counterProvider.notifier).state++;
```

### 3. StateNotifierProvider

전용 클래스를 통해 더 제어된 변경이 필요한 복잡한 상태를 위해 사용됩니다.

```dart
class Counter extends StateNotifier<int> {
  Counter() : super(0);

  void increment() => state++;
  void decrement() => state--;
}

final counterProvider = StateNotifierProvider<Counter, int>((ref) {
  return Counter();
});

// 사용 예시
final counter = ref.watch(counterProvider);
final notifier = ref.read(counterProvider.notifier);
notifier.increment();
```

### 4. FutureProvider

비동기 작업과 API 호출에 적합합니다.

```dart
final userProvider = FutureProvider<User>((ref) async {
  final repository = ref.read(repositoryProvider);
  return repository.fetchUser();
});

// 사용 예시
Consumer(
  builder: (context, ref, child) {
    final userAsync = ref.watch(userProvider);
    return userAsync.when(
      data: (user) => Text(user.name),
      loading: () => CircularProgressIndicator(),
      error: (error, stack) => Text('에러: $error'),
    );
  },
);
```

### 5. StreamProvider

데이터 스트림을 처리하기 위해 사용됩니다.

```dart
final messagesProvider = StreamProvider<List<Message>>((ref) {
  final repository = ref.read(repositoryProvider);
  return repository.messagesStream();
});
```

## Provider 수정자

### 1. family

매개변수가 필요한 provider를 위한 수정자:

```dart
final userProvider = FutureProvider.family<User, String>((ref, userId) async {
  final repository = ref.read(repositoryProvider);
  return repository.fetchUser(userId);
});

// 사용 예시
ref.watch(userProvider('user-123'));
```

### 2. autoDispose

더 이상 필요하지 않을 때 자동으로 provider를 해제합니다:

```dart
final searchProvider = StateProvider.autoDispose<String>((ref) {
  return '';
});
```

## 모범 사례

1. **Provider 구성**

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

2. **에러 처리**

```dart
final apiProvider = FutureProvider<Data>((ref) async {
  try {
    final result = await api.fetchData();
    return result;
  } catch (e) {
    throw CustomException('데이터 가져오기 실패: $e');
  }
});
```

3. **Provider 결합**

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

## 결론

Riverpod provider는 Flutter 애플리케이션에서 상태를 관리하는 유연하고 타입 안전한 방법을 제공합니다. 이러한 다양한 provider 유형과 사용 사례를 이해함으로써 더 유지보수가 용이하고 확장 가능한 애플리케이션을 구축할 수 있습니다.

---
