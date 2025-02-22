---
layout: post
title: "Managing Flutter Overlays: Multiple Overlay State Management and Memory Leak Prevention"
lang: en
ref: flutter-overlay-management
categories: [Flutter, Mobile, Web, Overlay]
image: assets/images/category_flutter.webp
---

In the previous post, we covered the basic usage of showDialog and Overlay. Today, we'll discuss the challenges that arise when using multiple Overlays in real projects and how to effectively manage them. We'll focus particularly on common problems encountered in production environments and their solutions.

## Challenges in Managing Overlays

When using Overlays in real projects, you typically encounter two main challenges:

1. Managing Multiple Overlay States: When multiple Overlays exist simultaneously, tracking and managing their individual states becomes complex. This becomes particularly challenging when Overlays interact with each other (for example, when opening one menu should close another).

2. Preventing Memory Leaks: Overlays can persist in memory even after being removed from the screen. This can lead to serious memory leaks, especially when dynamically creating and removing Overlays.

These issues become even more pronounced when dealing with multiple Overlays simultaneously, such as in menubars or dropdowns. Special attention is needed when users quickly navigate between different menus or during screen transitions.

## Managing Overlay States with Provider

I'm using Riverpod to manage Overlay states. I chose Riverpod because it offers predictable state management, easy debugging, and is particularly well-suited for managing multiple Overlay states simultaneously. Here's how I implemented it:

```dart
// Provider for managing Overlay state
final menuOverlayProvider = StateNotifierProvider<MenuOverlayNotifier, MenuOverlayState>((ref) {
  return MenuOverlayNotifier();
});

class MenuOverlayNotifier extends StateNotifier<MenuOverlayState> {
  MenuOverlayNotifier() : super(MenuOverlayState());

  // Set new Overlay
  // Removes existing Overlay if present and displays the new one
  void setOverlay(OverlayEntry entry, int index) {
    state.overlayEntry?.remove();
    state = MenuOverlayState(overlayEntry: entry, activeIndex: index);
  }

  // Remove single Overlay
  // Safely removes the currently displayed Overlay
  Future<void> removeOverlay() async {
    if (state.overlayEntry?.mounted == true) {
      state.overlayEntry?.remove();
    }
    state.overlayEntry?.dispose();
    state = MenuOverlayState();
  }

  // Remove all Overlays
  // Finds and removes all Overlays displayed on the screen
  Future<void> removeAllOverlays(BuildContext context) async {
    final overlay = Overlay.of(context);
    try {
      final entries = overlay.runtimeType.toString() == '_OverlayState'
          ? (overlay as dynamic)._entries as List<OverlayEntry>
          : <OverlayEntry>[];

      for (final entry in entries) {
        if (entry.mounted) {
          entry.remove();
        }
      }
    } catch (e) {
      debugPrint('Error removing overlays: $e');
    }
    state = MenuOverlayState();
  }
}
```

## Managing Hover States and Timing Control

Managing hover states in menu items directly impacts the user experience. This is particularly important with submenus, where improper control of hover states and timers can cause menus to disappear too quickly or linger too long. We implemented delayed processing using timers to solve this:

```dart
class _CustomMenuItemState extends ConsumerState<CustomMenuItem> {
  Timer? _hideTimer;
  bool _isHovered = false;

  void _handleMenuExit() {
    _isHovered = false;
    _hideTimer?.cancel();

    // Wait 100ms after leaving the menu before processing
    // This accounts for cases where users accidentally leave the menu and return
    _hideTimer = Timer(const Duration(milliseconds: 100), () {
      if (mounted && !_isHovered) {
        final currentActiveIndex = ref.read(menuStateProvider).activeIndex;
        if (currentActiveIndex == widget.index) {
          ref.read(menuStateProvider.notifier).state = MenuState(activeIndex: null);
          ref.read(menuOverlayProvider.notifier).removeOverlay();
        }
      }
    });
  }
}
```

## Overlay Positioning and Connection Area Management

Managing the connection area between menus and submenus can significantly enhance the user experience. Using LayerLink to connect menu items with their Overlays and creating a transparent connection area can prevent users from accidentally leaving the menu:

```dart
CompositedTransformFollower(
  link: _layerLink,
  offset: Offset(0, size.height),
  child: Material(
    color: Colors.transparent,
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Transparent connection area
        // This area bridges the gap between menu and submenu
        MouseRegion(
          onEnter: (_) {
            _isHovered = true;
            _hideTimer?.cancel();
          },
          child: Container(
            height: 8,  // 8-pixel high transparent connection area
            width: finalWidth,
            color: Colors.transparent,
          ),
        ),
        // Actual submenu container
        // ... submenu content
      ],
    ),
  ),
)
```

## Important Considerations

### Dispose Management

Widget lifecycle management in Flutter is crucial. When using Overlays, you must follow these guidelines:

- Always cancel Timers and remove Overlays when the Widget is disposed. Failure to do so can lead to memory leaks.
- Dispose of OverlayEntry when necessary. This is especially important for dynamically created Overlays.
- The order of disposal matters. Cancel Timers first, then remove Overlays for safe cleanup.

### Mounted Checks

Checking Widget state is essential for stability:

- Always verify the mounted state before manipulating Overlays. Attempting to manipulate an Overlay when mounted is false can cause exceptions.
- Be especially careful with checks after asynchronous operations. Always verify mounted state after Timer callbacks or Future completions.
- Mounted checks are also necessary before calling setState.

### State Synchronization

State management in complex UIs is crucial:

- Maintain synchronization through state management when dealing with multiple Overlays. Ensure Overlay states don't conflict with each other.
- Use state values like activeIndex to track currently active Overlays. This makes it easy to identify which menus are open.
- Always make state changes through Provider to maintain consistency.

## Practical Implementation Example

Here's how you can implement a menubar. This is a basic implementation template used in real projects:

```dart
class CustomMenuBar extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Manage menu data through Provider
    final menus = ref.watch(mainMenusProvider);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: menus.map((menu) => CustomMenuItem(menu: menu)).toList(),
        ),
      ],
    );
  }
}
```

## Conclusion

While Overlay is a powerful feature in Flutter, it requires proper management. Using state management tools like Provider or Riverpod allows for systematic management of complex Overlay scenarios.

Paying special attention to dispose management and hover state control is crucial for preventing memory leaks and improving user experience. By carefully considering these aspects in your implementation, you can create stable and user-friendly UIs.

Additionally, it's important to conduct thorough testing in debug mode and regularly check for memory leaks. Using Flutter DevTools' Memory tab allows you to monitor memory usage and detect potential issues early on.
