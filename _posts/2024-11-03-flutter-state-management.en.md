---
layout: post
title: "Understanding StatelessWidget, StatefulWidget, and State Management in Flutter"
lang: en
ref: flutter-state-management
categories: [Flutter, Dart, Mobile]
image: assets/images/category_flutter.webp
---

## Introduction

When developing mobile apps, we often encounter the concept of 'state'. For example, when a user taps a like button and its color changes, or when the counter updates after adding items to a shopping cart. Flutter provides two types of widgets to manage these states: StatelessWidget and StatefulWidget.

Understanding the difference between these two widgets is like learning how to use a knife and cutting board for a chef. They're basic but essential tools. Let's explore their characteristics and use cases through real-world examples.

## StatelessWidget vs StatefulWidget: Basic Concepts

### StatelessWidget: The Immutable Widget

Once a StatelessWidget is drawn on the screen, it cannot trigger any internal changes. Like a painting on a wall, it maintains its appearance after being rendered. However, this doesn't mean it's completely static. The widget can be redrawn if the external data passed to it changes.

Let's take Instagram's feed post as an example. Once loaded, the post's content (images, text) doesn't change. This is a perfect use case for StatelessWidget.

Let's look at some concrete examples where StatelessWidget works well:

- **Profile Card**: Displaying user's basic information

```dart
class ProfileCard extends StatelessWidget {
  final String name;
  final String imageUrl;
  final String description;

  const ProfileCard({
    required this.name,
    required this.imageUrl,
    required this.description,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          CircleAvatar(backgroundImage: NetworkImage(imageUrl)),
          Text(name, style: Theme.of(context).textTheme.headline6),
          Text(description),
        ],
      ),
    );
  }
}
```

- **Product Details**: Displaying fixed information like product images and descriptions
- **AppBar**: Fixed titles and menus at the top of the screen
- **Introduction Pages**: Showing app usage instructions or company information

### StatefulWidget: The Living Widget

Think of a StatefulWidget as a clock. Its display constantly changes over time. It can redraw the screen in response to user touches, time changes, or data received from the network.

Important note! A StatefulWidget actually consists of two classes:

1. The widget class itself (StatefulWidget)
2. The state management class (State)

Why this separation? While widgets must be immutable, states need to be mutable. It's like the relationship between a bank account (widget) and its balance (state).

Let's look at some real-world scenarios where StatefulWidget is necessary:

1. **Chat Screen**: Updates when new messages arrive

```dart
class ChatRoom extends StatefulWidget {
  final String roomId;

  const ChatRoom({required this.roomId, Key? key}) : super(key: key);

  @override
  _ChatRoomState createState() => _ChatRoomState();
}

class _ChatRoomState extends State<ChatRoom> {
  List<Message> messages = [];

  void _handleNewMessage(Message message) {
    setState(() {
      messages.add(message);
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: messages.length,
      itemBuilder: (context, index) => MessageBubble(message: messages[index]),
    );
  }
}
```

2. **Like Button**: Toggles state based on user taps

```dart
class LikeButton extends StatefulWidget {
  @override
  _LikeButtonState createState() => _LikeButtonState();
}

class _LikeButtonState extends State<LikeButton> {
  bool isLiked = false;

  void _toggleLike() {
    setState(() {
      isLiked = !isLiked;
    });
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(
        isLiked ? Icons.favorite : Icons.favorite_border,
        color: isLiked ? Colors.red : Colors.grey,
      ),
      onPressed: _toggleLike,
    );
  }
}
```

### StatefulWidget Lifecycle

A StatefulWidget has a lifecycle that represents its entire process of creation, updates, and disposal. Let's examine each stage:

#### 1. createState()

```dart
@override
_MyWidgetState createState() => _MyWidgetState();
```

- Called first when StatefulWidget is created
- Creates and returns State object
- Called only once

#### 2. initState()

```dart
@override
void initState() {
  super.initState();
  // Initialize here
  _controller = TextEditingController();
  _scrollController = ScrollController();
  _fetchInitialData();
}
```

- Called right after State object creation
- Initialize variables, API calls, controller setup
- Must complete before build method
- Called only once

#### 3. didChangeDependencies()

```dart
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  // Code executed when dependencies change
  final theme = Theme.of(context);
  _updateWithNewTheme(theme);
}
```

- Called after initState()
- Called when InheritedWidget changes
- Useful for handling widget dependencies like Theme or MediaQuery

#### 4. build()

```dart
@override
Widget build(BuildContext context) {
  return Container(
    child: Text('Current count: $_counter'),
  );
}
```

- Constructs the UI
- Called whenever state changes
- Most frequently called method
- Must be a pure function (no side effects)

#### 5. didUpdateWidget()

```dart
@override
void didUpdateWidget(MyWidget oldWidget) {
  super.didUpdateWidget(oldWidget);
  if (widget.importantProperty != oldWidget.importantProperty) {
    _handlePropertyChange();
  }
}
```

- Called when parent widget rebuilds
- Can compare with previous widget
- Update state only when necessary

#### 6. dispose()

```dart
@override
void dispose() {
  _controller.dispose();
  _scrollController.dispose();
  _subscription.cancel();
  super.dispose();
}
```

- Called when widget is removed
- Clean up resources, cancel subscriptions
- Critical for preventing memory leaks

## Summary: When to Use What?

When deciding between StatelessWidget and StatefulWidget, consider:

1. Will the content remain unchanged over time? → StatelessWidget
2. Does the screen need to change based on user input or data changes? → StatefulWidget

Remember! While StatefulWidget might seem more powerful, use StatelessWidget when possible for better memory usage and performance.

## What's Next?

Once you understand the basics of StatelessWidget and StatefulWidget, you'll need to explore more complex state management solutions like Provider, Riverpod, and Bloc. Personally, I often use Riverpod, working with ConsumerWidget and ConsumerStatefulWidget to combine these approaches effectively.

[The end]
