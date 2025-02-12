---
layout: post
title: "Solving State Management Code Dispersion in Flutter"
lang: en
ref: flutter-state-management
categories: [Flutter, Clean Code]
image: assets/images/category_flutter.webp
---

When developing with Flutter, we often encounter state management code scattered throughout widgets. Today, let's explore various ways to solve this problem.

## Problematic Code Example

Here's a typical example of problematic code:

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
      _fetchProducts(); // Reload entire list
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
        title: const Text('Product List'),
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

Problems with this code:

- State management logic mixed with UI code
- Difficult to reuse
- Hard to test
- Maintenance becomes challenging as code grows

## Solution 1: Separate Controller Class

Let's separate the state management logic into a dedicated controller class:

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
        title: const Text('Product List'),
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

## Solution 2: Using ChangeNotifier

Using Flutter's ChangeNotifier enables cleaner state management:

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
          title: const Text('Product List'),
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

## Solution 3: Using Riverpod

Riverpod provides more powerful and flexible state management:

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
        title: const Text('Product List'),
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

## Pros and Cons of Each Approach

### Controller Pattern

Pros:

- Simple implementation
- Easy transition from existing StatefulWidget
- No additional package dependencies

Cons:

- Inconvenient state subscription
- Difficult global state management
- Requires setState calls

### ChangeNotifier

Pros:

- Built-in Flutter feature
- Easy state subscription
- Well integrated with Provider package

Cons:

- May cause unnecessary rebuilds
- May not be suitable for complex state management

### Riverpod

Pros:

- Compile-time safety
- Fine-grained state management
- Easy to test
- Good code completion

Cons:

- Learning curve
- More boilerplate code
- Additional package dependency

## Conclusion

Separating state management code significantly improves code maintainability and reusability. Choose the appropriate method based on your project's scale and requirements:

- Small projects: Controller pattern
- Medium-scale: ChangeNotifier
- Large-scale projects: Riverpod

Regardless of the chosen method, the key is separating state management logic from UI code.

## References

- [Flutter Official Docs - State Management](https://flutter.dev/docs/development/data-and-backend/state-mgmt/intro)
- [Riverpod Documentation](https://riverpod.dev/)
- [Provider Package](https://pub.dev/packages/provider)
