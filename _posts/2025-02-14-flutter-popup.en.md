---
layout: post
title: "Flutter Popup Implementation: showDialog vs Overlay"
lang: en
ref: flutter-popup
categories: [Flutter, Mobile, Web]
image: assets/images/category_flutter.webp
---

When developing Flutter applications, we often need to display additional information or UI elements that require user interaction. The two most commonly used methods for this are showDialog and Overlay.

As I provide services through web apps, I find myself using showDialog and Overlay much more frequently than when developing mobile apps with Flutter.

Today, I'll explore the characteristics of these two methods, their appropriate use cases, and practical implementation approaches.

## showDialog vs Overlay

### showDialog

showDialog is the most basic way to display a dialog box in Flutter. You might think of it as closest to what we typically consider a "popup." It darkens the entire screen and displays content in the center, making it effective when you want to focus the user's attention on specific content.

```dart
void showBasicDialog(BuildContext context) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text('Notice'),
        content: Text('This is a basic dialog example.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Confirm'),
          ),
        ],
      );
    },
  );
}
```

### Overlay

Overlay is a widget that allows for more flexible popup UI implementation. You can display content at specific screen positions and freely implement background handling and animations.

In my case, I frequently use overlays to display search results below the search bar, show submenus when clicking category menu items, or display user status windows.

```dart
void showBasicOverlay(BuildContext context) {
OverlayState? overlayState = Overlay.of(context);
late OverlayEntry overlayEntry;

  overlayEntry = OverlayEntry(
    builder: (context) => Positioned(
      top: 100,
      left: 20,
      child: Material(
        elevation: 4.0,
        child: Container(
          padding: EdgeInsets.all(16),
          child: Text('This is an overlay example.'),
        ),
      ),
    ),
  );

overlayState.insert(overlayEntry);
}
```

### When to Use Each One?

Here are the common use cases for showDialog and Overlay.

## Suitable Cases for showDialog

- When user confirmation or selection is needed
- When displaying important notifications or warnings
- When collecting input through a simple form
- When needing to pause screen interactions

## Suitable Cases for Overlay

- When displaying tooltips or hints
- When implementing dropdown menus
- When showing additional information near specific widgets
- When displaying notifications that don't interrupt user interaction

### Implementing Position-Based Overlays

While showDialog typically appears in the screen center (though position can be adjusted), Overlay is often used to display content below specific buttons. Positioning an Overlay near specific buttons or widgets is a very useful UI pattern.

Here's a typical example of displaying content below a button:

```dart
class PositionedOverlayExample extends StatelessWidget {
  void showDropdownOverlay(BuildContext context, RenderBox button) {
    final overlay = Overlay.of(context);
    final position = button.localToGlobal(Offset.zero);

    OverlayEntry? entry;
    entry = OverlayEntry(
      builder: (context) => Positioned(
        top: position.dy + button.size.height,  // Right below the button
        left: position.dx,
        width: button.size.width,  // Same width as button
        child: Material(
          elevation: 8,
          borderRadius: BorderRadius.circular(8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: Text('Option 1'),
                onTap: () {
                  entry?.remove();
                },
              ),
              ListTile(
                title: Text('Option 2'),
                onTap: () {
                  entry?.remove();
                },
              ),
            ],
          ),
        ),
      ),
    );

    overlay.insert(entry);

}

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        final button = context.findRenderObject() as RenderBox;
        showDropdownOverlay(context, button);
      },
      child: Text('Open Dropdown Menu'),
    );
  }
}
```

## Useful Tips

1. Closing Overlay on Screen Touch
   One important thing to note about Overlay is that it doesn't close automatically. Here's how you can implement closing the Overlay when touching other parts of the screen.

```dart

OverlayEntry overlayEntry = OverlayEntry(
  builder: (context) => Stack(
    children: [
      // GestureDetector for background touch detection
      Positioned.fill(
        child: GestureDetector(
          onTap: () => overlayEntry.remove(),
          child: Container(
            color: Colors.transparent,
          ),
        ),
      ),
      // Actual overlay content
      Positioned(
        top: position.dy,
        left: position.dx,
        child: YourOverlayContent(),
      ),
    ],
  ),
);
```

2. Adding Animations
   Adding animations to Overlay can provide a more natural user experience.

```dart
class AnimatedOverlayContent extends StatefulWidget {
  @override
  _AnimatedOverlayContentState createState() => _AnimatedOverlayContentState();
}

class _AnimatedOverlayContentState extends State<AnimatedOverlayContent>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 200),
      vsync: this,
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    );
    _controller.forward();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animation,
      child: ScaleTransition(
        scale: _animation,
        child: YourOverlayContent(),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

### Performance and Memory Management

There are several things to keep in mind when using Overlay.

### Overlay Removal Verification

Overlays must be removed manually
They must be removed during page navigation to prevent memory leaks

### Context Management

Verify that BuildContext is valid
Avoid manipulating Overlay after widget disposal

### Use What Works Best, But Know the Details

Both showDialog and Overlay have their advantages and disadvantages. showDialog is simple and intuitive but has customization limitations, while Overlay offers more freedom but can be more complex to implement.

In real projects, it's beneficial to use a combination of both approaches. showDialog works well for important notifications or user input requirements, while Overlay is effective for tooltips or context menus as supplementary UI elements.

Of course, Overlay can cause many errors if not properly disposed of. On the other hand, showDialog can be displayed infinitely even with other popups present, which requires careful attention. If the opportunity arises, I'll cover these aspects in more detail in a future post.
