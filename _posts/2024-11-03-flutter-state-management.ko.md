---
layout: post
title: "Flutter의 StatelessWidget과 StatefulWidget 그리고 상태관리"
lang: ko
ref: flutter-state-management
categories: [Flutter, Dart, Mobile]
image: assets/images/category_flutter.webp
---

## 들어가며

모바일 앱을 개발하다 보면 '상태'라는 개념을 자주 마주치게 된다. 예를 들어, 사용자가 좋아요 버튼을 눌렀을 때 버튼의 색상이 변하거나, 장바구니에 상품을 담았을 때 개수가 업데이트되는 것처럼 말이다. Flutter에서는 이러한 상태 관리를 위해 두 가지 위젯을 제공한다. 바로 StatelessWidget과 StatefulWidget이다.

이 두 위젯의 차이를 이해하는 건 마치 요리사가 칼과 도마의 사용법을 익히는 것과 같다. 기본적이지만 매우 중요한 도구지. 이 글에서는 실제 개발 현장에서 마주치는 다양한 상황들을 예로 들어가며, 이 두 위젯의 특성과 활용법을 한번 같이 정리해보자.

## StatelessWidget vs StatefulWidget: 기본 개념

### StatelessWidget: 변화를 모르는 위젯

StatelessWidget은 한번 화면에 그려지면, 내부적으로 어떤 변화도 일으킬 수 없다. 마치 벽에 걸린 그림처럼, 한번 그려진 후에는 그 모습 그대로를 유지한다. 하지만 이게 완전히 정적이라는 뜻은 아니다. 외부에서 전달받은 데이터가 변경되면 위젯 자체가 다시 그려질 수는 있다.

예를 들어보자. 인스타그램의 피드 게시물을 생각해보자. 게시물의 내용(이미지, 텍스트)은 한번 로드되면 변경되지 않는다. 이런 경우에 StatelessWidget을 사용하면 좋다.

실제에서 StatelessWidget을 사용하면 좋은 경우를 좀 더 구체적으로 살펴보자.

- **프로필 카드**: 사용자의 기본 정보를 표시하는 경우

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

- **상품 상세 정보**: 상품의 이미지나 설명과 같이 고정된 정보를 보여주는 경우
- **앱바(AppBar)**: 화면 상단의 타이틀이나 메뉴가 고정적인 경우
- **소개 페이지**: 앱의 사용 방법이나 회사 정보를 보여주는 경우

```dart
class WelcomeBanner extends StatelessWidget {
  final String userName;

  const WelcomeBanner({
    Key? key,
    required this.userName,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.0),
      child: Text('환영합니다, $userName님!'),
    );
  }
}
```

### StatefulWidget: 살아있는 위젯

StatefulWidget은 시계 같은 것을 떠올리면 이해하기 쉽다. 시간에 따라 표시되는 내용이 계속 변한다. 사용자의 터치, 시간의 경과, 네트워크로부터 받은 데이터 등에 반응하여 화면을 다시 그릴 수 있다.

여기서 주의할 점! StatefulWidget은 실제로 두 개의 클래스로 구성된다:

1. 위젯 자체를 정의하는 클래스 (StatefulWidget)
2. 위젯의 상태를 관리하는 클래스 (State)

이렇게 나누는 이유가 뭘까? 위젯은 불변(immutable)이어야 하지만, 상태는 변할 수 있어야 하기 때문이다. 마치 통장(위젯)과 통장 잔고(상태)의 관계와 비슷하다고 할까?

실제에서 StatefulWidget이 필요한 구체적인 상황들을 한번 살펴보자.

실제에서 StatefulWidget이 필요한 구체적인 상황들을 한번 살펴보자.

1. **채팅 화면**: 새로운 메시지가 도착할 때마다 화면이 업데이트되어야 한다

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

2. **좋아요 버튼**: 사용자의 탭에 따라 상태가 토글되는 위젯

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

3. **카운트**: 가장 기본적인 예시? flutter 첫 빌드 시에 이런거 보인다.

```dart
class CounterWidget extends StatefulWidget {
  const CounterWidget({Key? key}) : super(key: key);

  @override
  _CounterWidgetState createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('현재 카운트: $_counter'),
        ElevatedButton(
          onPressed: _incrementCounter,
          child: Text('증가'),
        ),
      ],
    );
  }
}
```

### StatefulWidget의 생명주기

StatefulWidget은 생명주기를 가지는데, 이는 위젯이 생성되고, 업데이트되고, 소멸되는 전체 과정을 말한다. 각 단계별로 어떤 일이 일어나는지 살펴보자.

각 생명주기 메서드의 용도와 특징을 자세히 살펴보자:

#### 1. createState()

```dart
@override
_MyWidgetState createState() => _MyWidgetState();
```

- StatefulWidget이 생성될 때 가장 먼저 호출
- State 객체를 생성하고 반환
- 딱 한 번만 호출됨

#### 2. initState()

```dart
@override
void initState() {
  super.initState();
  // 여기서 초기화 작업을 한다
  _controller = TextEditingController();
  _scrollController = ScrollController();
  _fetchInitialData();
}
```

- State 객체가 생성된 직후 호출
- 변수 초기화, API 호출, 컨트롤러 설정 등 초기 작업
- build 메서드 전에 반드시 완료되어야 함
- 단 한 번만 호출

#### 3. didChangeDependencies()

```dart
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  // 의존성이 변경될 때마다 실행될 코드
  final theme = Theme.of(context);
  _updateWithNewTheme(theme);
}
```

- initState() 다음에 호출
- InheritedWidget이 변경될 때마다 호출
- Theme나 MediaQuery 같은 위젯 의존성 처리에 유용

#### 4. build()

```dart
@override
Widget build(BuildContext context) {
  return Container(
    child: Text('현재 카운트: $_counter'),
  );
}

```

- UI를 구성하는 메서드
- 상태가 변경될 때마다 호출
- 가장 자주 호출되는 메서드
- 순수 함수여야 함 (side effect 없어야 함)

### 5. didUpdateWidget()

```dart
@override
void didUpdateWidget(MyWidget oldWidget) {
  super.didUpdateWidget(oldWidget);
  if (widget.importantProperty != oldWidget.importantProperty) {
    // 속성이 변경되었을 때의 처리
    _handlePropertyChange();
  }
}
```

- 부모 위젯이 재빌드되어 이 위젯을 재구성할 때 호출
- 이전 위젯과 새 위젯을 비교할 수 있음
- 필요한 경우에만 상태 업데이트

#### 6. dispose()

```dart
@override
void dispose() {
  // 자원을 정리하는 코드
  _controller.dispose();
  _scrollController.dispose();
  _subscription.cancel();
  super.dispose();
}
```

- 위젯이 위젯 트리에서 제거될 때 호출
- 컨트롤러 해제, 구독 취소, 리스너 제거 등 정리 작업
- 메모리 누수 방지를 위해 중요

## 정리: 언제 무엇을 써야 할까?

StatelessWidget과 StatefulWidget, 이 둘을 언제 써야 할지 고민된다면 이렇게 생각해보자:

1. 화면에 표시되는 내용이 시간이 지나도 변할 일이 없다면? → StatelessWidget
2. 사용자 입력이나 데이터 변경으로 화면이 바뀌어야 한다면? → StatefulWidget

그리고 기억하자! StatefulWidget이 더 강력해 보이지만, 꼭 필요한 경우가 아니라면 StatelessWidget을 사용하는 게 당연히 메모리 사용량이나 성능 면에서는 더 낫다.

## 다음은?

StatelessWidget과 StatefulWidget의 기본을 이해했다면, 다음에는 좀 더 복잡한 상태 관리가 필요한 경우를 위한 Provider, Riverpod, Bloc 을 같이 어울려 써야된다. 나같은 경우에는 보통 riverpod을 쓰는데, ConsumerWidget, ConsumerStatefulWidget 으로 바꾸어 같이 어울려 쓰는일이 많다.
