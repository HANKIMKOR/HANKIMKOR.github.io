---
layout: post
title: "Customizing Scrollbar in Flutter"
excerpt: "Learn how to customize scrollbars in Flutter applications."
lang: en
ref: custom-scrollbar
categories: [Flutter, Dev]
image: assets/images/category_dev.webp
---

In Flutter, you can easily customize the default scrollbar using the `ScrollbarTheme` widget. This allows you to adjust the color, thickness, and visibility of the scrollbar. Below is an example of how to customize the scrollbar.

### Code Example

```dart
ScrollbarTheme(
  data: ScrollbarThemeData(
    thumbColor: MaterialStateProperty.all(Colors.grey[400]), // Color of the scrollbar
    trackColor: MaterialStateProperty.all(Colors.white), // Color of the track
    trackBorderColor: MaterialStateProperty.all(Colors.grey[300]), // Color of the track border
    thickness: MaterialStateProperty.all(8.0), // Thickness of the scrollbar
    thumbVisibility: MaterialStateProperty.all(true), // Visibility of the scrollbar
    trackVisibility: MaterialStateProperty.all(true), // Visibility of the track
  ),
  child: ListView.builder(
    itemCount: records.length, // Number of list items
    itemBuilder: (context, index) => _buildListItem(
        records[index], index, tableWidth, records.length - 1 == index),
  ),
);
```

### Explanation

The code above demonstrates how to customize the scrollbar in Flutter. By using the `ScrollbarTheme` widget, you can set various properties of the scrollbar. The `thumbColor` sets the color of the scrollbar, while `trackColor` sets the color of the scrollbar track. The `thickness` adjusts the thickness of the scrollbar, and `thumbVisibility` and `trackVisibility` control the visibility of the scrollbar and track, respectively.
