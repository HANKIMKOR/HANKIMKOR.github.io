---
layout: post
title: "Flutter에서 상태 관리 코드 분산 문제 해결하기"
lang: ko
ref: flutter-state-management
categories: [Flutter, Clean Code]
image: assets/images/category_flutter.webp
---

Flutter로 개발을 하다 보면 위젯 내에 상태 관리 코드가 난잡하게 흩어져 있는 경우를 종종 보 수 있다. 오늘은 이런 문제를 어떻게 해결할 수 있는지 다양한 방법을 알아보자.

## 문제가 되는 코드 예시

다음은 흔히 볼 수 있는 문제가 있는 코드다:

```dart
class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  bool _isLoading = false;
  String _error = '';
  List<Product> _products = [];
  bool _isFavoriteOnly = false;

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    setState(() => _isLoading = true);
    try {
      final response = await api.getProducts();
      setState(() {
        _products = response;
        _error = '';
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _toggleFavorite(String productId) async {
    try {
      await api.toggleFavorite(productId);
      _fetchProducts(); // 전체 목록을 다시 불러옴
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  void _toggleFavoriteFilter() {
    setState(() {
      _isFavoriteOnly = !_isFavoriteOnly;
      _fetchProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('상품 목록'),
        actions: [
          IconButton(
            icon: Icon(_isFavoriteOnly ? Icons.favorite : Icons.favorite_border),
            onPressed: _toggleFavoriteFilter,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
              ? Center(child: Text(_error))
              : ListView.builder(
                  itemCount: _products.length,
                  itemBuilder: (context, index) {
                    final product = _products[index];
                    return ListTile(
                      title: Text(product.name),
                      trailing: IconButton(
                        icon: Icon(product.isFavorite ? Icons.favorite : Icons.favorite_border),
                        onPressed: () => _toggleFavorite(product.id),
                      ),
                    );
                  },
                ),
    );
  }
}
```

이 코드의 문제점:

- 상태 관리 로직이 UI 코드와 섞여 있음
- 재사용이 어려움
- 테스트하기 어려움
- 코드가 길어지면 유지보수가 어려움

## 해결 방법 1: 별도의 Controller 클래스로 분리

상태 관리 로직을 별도의 컨트롤러 클래스로 분리해보자:

```dart
// product_list_controller.dart
class ProductListController {
  bool isLoading = false;
  String error = '';
  List<Product> products = [];
  bool isFavoriteOnly = false;

  final void Function(void Function()) setState;

  ProductListController(this.setState);

  Future<void> fetchProducts() async {
    setState(() => isLoading = true);
    try {
      final response = await api.getProducts();
      setState(() {
        products = response;
        error = '';
      });
    } catch (e) {
      setState(() => error = e.toString());
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> toggleFavorite(String productId) async {
    try {
      await api.toggleFavorite(productId);
      fetchProducts();
    } catch (e) {
      setState(() => error = e.toString());
    }
  }

  void toggleFavoriteFilter() {
    setState(() {
      isFavoriteOnly = !isFavoriteOnly;
      fetchProducts();
    });
  }
}

// product_list_screen.dart
class _ProductListScreenState extends State<ProductListScreen> {
  late final _controller = ProductListController(setState);

  @override
  void initState() {
    super.initState();
    _controller.fetchProducts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('상품 목록'),
        actions: [
          IconButton(
            icon: Icon(_controller.isFavoriteOnly ? Icons.favorite : Icons.favorite_border),
            onPressed: _controller.toggleFavoriteFilter,
          ),
        ],
      ),
      body: _controller.isLoading
          ? const Center(child: CircularProgressIndicator())
          : _controller.error.isNotEmpty
              ? Center(child: Text(_controller.error))
              : ListView.builder(
                  itemCount: _controller.products.length,
                  itemBuilder: (context, index) {
                    final product = _controller.products[index];
                    return ListTile(
                      title: Text(product.name),
                      trailing: IconButton(
                        icon: Icon(product.isFavorite ? Icons.favorite : Icons.favorite_border),
                        onPressed: () => _controller.toggleFavorite(product.id),
                      ),
                    );
                  },
                ),
    );
  }
}
```

## 해결 방법 2: ChangeNotifier 활용

Flutter의 ChangeNotifier를 활용하면 더 깔끔한 상태 관리가 가능하다:

```dart
// product_list_provider.dart
class ProductListProvider extends ChangeNotifier {
  bool _isLoading = false;
  String _error = '';
  List<Product> _products = [];
  bool _isFavoriteOnly = false;

  bool get isLoading => _isLoading;
  String get error => _error;
  List<Product> get products => _products;
  bool get isFavoriteOnly => _isFavoriteOnly;

  Future<void> fetchProducts() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await api.getProducts();
      _products = response;
      _error = '';
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleFavorite(String productId) async {
    try {
      await api.toggleFavorite(productId);
      fetchProducts();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void toggleFavoriteFilter() {
    _isFavoriteOnly = !_isFavoriteOnly;
    fetchProducts();
  }
}

// product_list_screen.dart
class ProductListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ProductListProvider()..fetchProducts(),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('상품 목록'),
          actions: [
            Consumer<ProductListProvider>(
              builder: (_, provider, __) => IconButton(
                icon: Icon(provider.isFavoriteOnly ? Icons.favorite : Icons.favorite_border),
                onPressed: provider.toggleFavoriteFilter,
              ),
            ),
          ],
        ),
        body: Consumer<ProductListProvider>(
          builder: (_, provider, __) {
            if (provider.isLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (provider.error.isNotEmpty) {
              return Center(child: Text(provider.error));
            }

            return ListView.builder(
              itemCount: provider.products.length,
              itemBuilder: (context, index) {
                final product = provider.products[index];
                return ListTile(
                  title: Text(product.name),
                  trailing: IconButton(
                    icon: Icon(product.isFavorite ? Icons.favorite : Icons.favorite_border),
                    onPressed: () => provider.toggleFavorite(product.id),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
```

## 해결 방법 3: Riverpod 활용

Riverpod을 사용하면 더 강력하고 유연한 상태 관리가 가능하다:

```dart
// product_list_provider.dart
final productListProvider = StateNotifierProvider<ProductListNotifier, ProductListState>((ref) {
  return ProductListNotifier();
});

class ProductListState {
  final bool isLoading;
  final String error;
  final List<Product> products;
  final bool isFavoriteOnly;

  const ProductListState({
    this.isLoading = false,
    this.error = '',
    this.products = const [],
    this.isFavoriteOnly = false,
  });

  ProductListState copyWith({
    bool? isLoading,
    String? error,
    List<Product>? products,
    bool? isFavoriteOnly,
  }) {
    return ProductListState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      products: products ?? this.products,
      isFavoriteOnly: isFavoriteOnly ?? this.isFavoriteOnly,
    );
  }
}

class ProductListNotifier extends StateNotifier<ProductListState> {
  ProductListNotifier() : super(const ProductListState());

  Future<void> fetchProducts() async {
    state = state.copyWith(isLoading: true);

    try {
      final response = await api.getProducts();
      state = state.copyWith(
        products: response,
        error: '',
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
    }
  }

  Future<void> toggleFavorite(String productId) async {
    try {
      await api.toggleFavorite(productId);
      fetchProducts();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  void toggleFavoriteFilter() {
    state = state.copyWith(
      isFavoriteOnly: !state.isFavoriteOnly,
    );
    fetchProducts();
  }
}

// product_list_screen.dart
class ProductListScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(productListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('상품 목록'),
        actions: [
          IconButton(
            icon: Icon(state.isFavoriteOnly ? Icons.favorite : Icons.favorite_border),
            onPressed: () => ref.read(productListProvider.notifier).toggleFavoriteFilter(),
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error.isNotEmpty
              ? Center(child: Text(state.error))
              : ListView.builder(
                  itemCount: state.products.length,
                  itemBuilder: (context, index) {
                    final product = state.products[index];
                    return ListTile(
                      title: Text(product.name),
                      trailing: IconButton(
                        icon: Icon(product.isFavorite ? Icons.favorite : Icons.favorite_border),
                        onPressed: () => ref
                            .read(productListProvider.notifier)
                            .toggleFavorite(product.id),
                      ),
                    );
                  },
                ),
    );
  }
}
```

## 각 방법의 장단점

### 컨트롤러 패턴

장점:

- 구현이 간단함
- 기존 StatefulWidget에서 쉽게 전환 가능
- 별도의 패키지 의존성이 없음

단점:

- 상태 변화 구독이 불편함
- 전역 상태 관리가 어려움
- setState 호출이 필요함

### ChangeNotifier

장점:

- Flutter 기본 제공 기능
- 상태 변화 구독이 쉬움
- Provider 패키지와 잘 통합됨

단점:

- 상태 변화 시 불필요한 리빌드가 발생할 수 있음
- 복잡한 상태 관리에는 적합하지 않을 수 있음

### Riverpod

장점:

- 컴파일 타임 안정성
- 세밀한 상태 관리 가능
- 테스트가 용이함
- 코드 자동완성이 잘 됨

단점:

- 학습 곡선이 있음
- 보일러플레이트 코드가 많아질 수 있음
- 추가 패키지 의존성

## 결론

상태 관리 코드를 분리하는 것은 코드의 유지보수성과 재사용성을 크게 향상시킨다. 프로젝트의 규모와 요구사항에 따라 적절한 방법을 선택하면 되는데:

- 작은 프로젝트: 컨트롤러 패턴
- 중간 규모: ChangeNotifier
- 대규모 프로젝트: Riverpod

어떤 방법을 선택하든, 상태 관리 로직을 UI 코드에서 분리하는 것이 중요하다.

## 참고 자료

- [Flutter 공식 문서 - 상태 관리](https://flutter.dev/docs/development/data-and-backend/state-mgmt/intro)
- [Riverpod 공식 문서](https://riverpod.dev/)
- [Provider 패키지](https://pub.dev/packages/provider)
