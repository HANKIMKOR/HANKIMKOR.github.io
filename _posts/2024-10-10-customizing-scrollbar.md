---
layout: post
title: "Customizing Scrollbar in Flutter<br>(Flutter에서 스크롤바 커스터마이즈하기)"
categories: [Flutter, Dev]
image: assets/images/category_dev.webp
---

## Customizing Scrollbar in Flutter

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

---

## Flutter에서 스크롤바 커스터마이즈하기

Flutter에서는 기본 스크롤바를 쉽게 커스터마이즈할 수 있습니다. `ScrollbarTheme` 위젯을 사용하여 스크롤바의 색상, 두께 및 가시성을 조정할 수 있습니다. 아래는 스크롤바를 커스터마이즈하는 방법에 대한 예시입니다.

### 코드 예시

```dart
ScrollbarTheme(
  data: ScrollbarThemeData(
    thumbColor: MaterialStateProperty.all(Colors.grey[400]), // 스크롤바의 색상
    trackColor: MaterialStateProperty.all(Colors.white), // 트랙의 색상
    trackBorderColor: MaterialStateProperty.all(Colors.grey[300]), // 트랙의 경계 색상
    thickness: MaterialStateProperty.all(8.0), // 스크롤바의 두께
    thumbVisibility: MaterialStateProperty.all(true), // 스크롤바의 가시성
    trackVisibility: MaterialStateProperty.all(true), // 트랙의 가시성
  ),
  child: ListView.builder(
    itemCount: records.length, // 리스트 아이템의 개수
    itemBuilder: (context, index) => _buildListItem(
        records[index], index, tableWidth, records.length - 1 == index),
  ),
);
```

### 설명

위의 코드는 Flutter에서 스크롤바를 커스터마이즈하는 방법을 보여줍니다. `ScrollbarTheme` 위젯을 사용하여 스크롤바의 다양한 속성을 설정할 수 있습니다. `thumbColor`는 스크롤바의 색상을, `trackColor`는 스크롤 트랙의 색상을 설정합니다. `thickness`는 스크롤바의 두께를 조정하며, `thumbVisibility`와 `trackVisibility`를 통해 각각 스크롤바와 트랙의 가시성을 조정할 수 있습니다.

---
