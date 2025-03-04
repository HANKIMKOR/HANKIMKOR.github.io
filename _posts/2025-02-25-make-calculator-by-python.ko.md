---
layout: post
title: "파이썬으로 만드는 계산기 프로젝트"
lang: ko
ref: make-calculator-by-python
categories: [Flutter, Mobile, Web, Overlay]
image: assets/images/category_python.webp
---

# 파이썬으로 만드는 간단한 계산기 프로젝트

안녕하세요! 오늘은 파이썬을 사용하여 간단한 계산기를 만드는 방법에 대해 알아보겠습니다. 이 글에서는 코드 작성 과정과 각 부분이 어떤 역할을 하는지 자세히 설명하겠습니다.

## 콘솔 기반 계산기

먼저 가장 기본적인 콘솔 기반 계산기부터 만들어 보겠습니다.

```python
def simple_calculator():
    # 사용자로부터 첫 번째 숫자 입력받기
    num1 = float(input("첫 번째 숫자를 입력하세요: "))

    # 연산자 입력받기
    operator = input("연산자를 입력하세요 (+, -, *, /): ")

    # 두 번째 숫자 입력받기
    num2 = float(input("두 번째 숫자를 입력하세요: "))

    # 연산 수행
    if operator == "+":
        result = num1 + num2
    elif operator == "-":
        result = num1 - num2
    elif operator == "*":
        result = num1 * num2
    elif operator == "/":
        # 0으로 나누는 경우 예외 처리
        if num2 == 0:
            return "0으로 나눌 수 없습니다."
        result = num1 / num2
    else:
        return "잘못된 연산자입니다."

    # 결과 반환
    return f"{num1} {operator} {num2} = {result}"

# 계산기 실행
print(simple_calculator())
```

### 코드 설명

1. **`float(input())`를 사용한 이유**

   사용자 입력은 기본적으로 문자열로 받아지기 때문에 float() 함수를 사용해 숫자로 변환했습니다. 특히 int() 대신 float()를 선택한 이유는 소수점이 포함된 계산도 자연스럽게 처리하기 위함입니다.

2. **조건문 구조**

   파이썬에서는 조건 분기를 처리할 때 if-elif-else 구조를 사용합니다. 이는 자바나 C++에서 사용하는 switch-case와는 다른 파이썬만의 방식입니다.

3. **나눗셈 예외 처리**

   수학적으로 0으로 나누는 경우는 정의되지 않기 때문에 별도의 예외 처리를 구현했습니다. 자바에서는 이런 상황에서 예외 처리 방식을 사용하지만, 이 코드에서는 더 간단한 조건문으로 해당 문제를 해결했습니다.

4. **f-string 사용**
   결과 출력시 Python 3.6부터 도입된 f-string을 활용해 포맷팅을 구현했습니다. 이 기능은 자바스크립트의 템플릿 리터럴(${})이나 자바의 String.format() 메서드와 유사한 역할을 합니다.

## 반복 계산 기능 추가하기

이제 한 번의 계산으로 끝나지 않고 사용자가 원할 때까지 계속 계산할 수 있는 기능을 추가해 보겠습니다.

```python
def advanced_calculator():
    while True:
        # 사용자로부터 첫 번째 숫자 입력받기
        try:
            num1 = float(input("\n첫 번째 숫자를 입력하세요 (종료하려면 'q' 입력): "))
        except ValueError:
            # 사용자가 'q'를 입력한 경우 확인
            if input().lower() == 'q':
                print("계산기를 종료합니다.")
                break
            print("유효한 숫자를 입력해주세요.")
            continue

        # 연산자 입력받기
        operator = input("연산자를 입력하세요 (+, -, *, /): ")
        if operator not in ['+', '-', '*', '/']:
            print("유효한 연산자를 입력해주세요.")
            continue

        # 두 번째 숫자 입력받기
        try:
            num2 = float(input("두 번째 숫자를 입력하세요: "))
        except ValueError:
            print("유효한 숫자를 입력해주세요.")
            continue

        # 연산 수행 및 결과 출력
        if operator == "/" and num2 == 0:
            print("0으로 나눌 수 없습니다.")
        else:
            # 딕셔너리를 사용한 연산자 매핑
            operations = {
                '+': lambda x, y: x + y,
                '-': lambda x, y: x - y,
                '*': lambda x, y: x * y,
                '/': lambda x, y: x / y
            }

            result = operations[operator](num1, num2)
            print(f"결과: {num1} {operator} {num2} = {result}")

# 계산기 실행
advanced_calculator()
```

### 코드 설명

1. **무한 루프 사용**

   이 코드에서는 while True를 사용해 무한 루프를 구현했습니다. 이렇게 하면 사용자가 명시적으로 종료할 때까지 계산 작업을 반복할 수 있습니다. 이는 자바스크립트에서 while(true)를 사용하는 방식과 동일한 접근법입니다.

2. **예외 처리**

   예외 처리를 위해 try-except 구문을 활용했습니다. 이 방식은 자바의 try-catch 구조와 유사한 기능을 하지만, 파이썬에서는 더 간결한 문법으로 구현할 수 있는 장점이 있습니다.

3. **람다 함수와 딕셔너리 활용**

   코드의 간결성을 높이기 위해 if-elif 조건문 대신 딕셔너리와 람다 함수를 활용했습니다. 이 테크닉은 자바스크립트에서 객체에 함수를 매핑하는 방식과 유사하며, 반복적인 조건문 없이 연산자에 따른 동작을 효율적으로 지정할 수 있습니다.

4. **입력 검증**:
   연산자 입력 검증에는 파이썬의 리스트 멤버십 테스트(in 연산자)를 활용했습니다. 자바에서는 이와 같은 기능을 구현하려면 반복문이나 Arrays.asList().contains() 같은 메서드를 사용해야 하는데, 파이썬에서는 더 직관적인 문법으로 간단하게 처리할 수 있습니다.

## GUI 기반 계산기

이제 tkinter를 사용하여 그래픽 인터페이스가 있는 계산기를 만들어 보겠습니다.

```python
import tkinter as tk

class CalculatorApp:
    def __init__(self, master):
        self.master = master
        master.title("파이썬 계산기")

        # 계산식을 표시할 엔트리 위젯
        self.display = tk.Entry(master, width=25, borderwidth=5)
        self.display.grid(row=0, column=0, columnspan=4, padx=10, pady=10)

        # 현재 계산식 저장 변수
        self.current = ""

        # 버튼 생성 및 배치
        self.create_buttons()

    def create_buttons(self):
        # 버튼에 표시될 텍스트와 그리드 위치
        button_layout = [
            ('7', 1, 0), ('8', 1, 1), ('9', 1, 2), ('/', 1, 3),
            ('4', 2, 0), ('5', 2, 1), ('6', 2, 2), ('*', 2, 3),
            ('1', 3, 0), ('2', 3, 1), ('3', 3, 2), ('-', 3, 3),
            ('0', 4, 0), ('.', 4, 1), ('=', 4, 2), ('+', 4, 3),
            ('C', 5, 0, 4)  # C 버튼은 4칸을 차지
        ]

        # 각 버튼 생성
        for button_info in button_layout:
            text = button_info[0]
            row = button_info[1]
            col = button_info[2]

            # C 버튼처럼 여러 칸을 차지하는 경우
            colspan = 1
            if len(button_info) > 3:
                colspan = button_info[3]

            # 버튼 생성 및 클릭 이벤트 바인딩
            button = tk.Button(self.master, text=text, padx=20, pady=10,
                              command=lambda t=text: self.button_click(t))
            button.grid(row=row, column=col, columnspan=colspan, sticky="nsew")

    def button_click(self, text):
        if text == "=":
            # 계산 실행
            try:
                # eval() 함수로 문자열 수식을 계산
                result = str(eval(self.current))
                self.display.delete(0, tk.END)
                self.display.insert(0, result)
                self.current = result
            except:
                self.display.delete(0, tk.END)
                self.display.insert(0, "오류")
                self.current = ""

        elif text == "C":
            # 입력 초기화
            self.display.delete(0, tk.END)
            self.current = ""

        else:
            # 숫자나 연산자 입력
            self.current += text
            self.display.delete(0, tk.END)
            self.display.insert(0, self.current)

# 메인 애플리케이션 실행
def run_gui_calculator():
    root = tk.Tk()
    app = CalculatorApp(root)
    root.mainloop()

if __name__ == "__main__":
    run_gui_calculator()
```

### GUI 코드 설명

1. **클래스 기반 설계**
   이 GUI 계산기는 객체지향 방식으로 설계되었습니다. 자바와 유사하게 클래스를 정의하고 그 안에 인스턴스 메서드를 구현하는 방식을 따랐습니다.

2. **tkinter 위젯 활용**

   사용자 인터페이스 구성을 위해 tkinter의 다양한 위젯을 활용했습니다. 계산식과 결과를 표시하기 위해 Entry 위젯을 사용했으며, 사용자의 입력을 받기 위해 Button 위젯을 배치했습니다. 화면 레이아웃 구성에는 grid 레이아웃 관리자를 활용해 위젯들을 체계적으로 배치했습니다.

3. **람다 함수로 이벤트 처리**

   각 버튼의 클릭 이벤트는 람다 함수를 통해 처리했습니다. 이 방식은 자바스크립트의 익명 함수나 자바의 람다식과 개념적으로 유사하며, 각 버튼마다 서로 다른 동작을 효율적으로 연결할 수 있게 해줍니다.

4. **eval() 함수 사용**

   문자열로 표현된 수식을 계산하기 위해 eval() 함수를 활용했습니다. 이 함수는 편리한 기능을 제공하지만, 보안 측면에서 위험 요소가 있으므로 실제 애플리케이션에서는 주의해서 사용해야 합니다. 자바스크립트도 유사한 eval() 함수를 제공하지만, 자바에는 이에 해당하는 기능이 없어 수식 파서를 직접 구현해야 한다는 차이점이 있습니다.

## 다른 언어와의 비교

### 파이썬 vs 자바스크립트

자바스크립트로 동일한 콘솔 계산기를 구현한다면,

```javascript
function simpleCalculator() {
  // prompt()는 브라우저 환경에서 사용자 입력을 받는 함수
  const num1 = parseFloat(prompt("첫 번째 숫자를 입력하세요:"));
  const operator = prompt("연산자를 입력하세요 (+, -, *, /):");
  const num2 = parseFloat(prompt("두 번째 숫자를 입력하세요:"));

  let result;

  switch (operator) {
    case "+":
      result = num1 + num2;
      break;
    case "-":
      result = num1 - num2;
      break;
    case "*":
      result = num1 * num2;
      break;
    case "/":
      if (num2 === 0) {
        return "0으로 나눌 수 없습니다.";
      }
      result = num1 / num2;
      break;
    default:
      return "잘못된 연산자입니다.";
  }

  return `${num1} ${operator} ${num2} = ${result}`;
}

console.log(simpleCalculator());
```

**차이점**:

자바스크립트는 `switch-case`를 사용하는 반면, 파이썬은 `if-elif-else`를 사용합니다. 자바스크립트는 변수 선언 시 `const`, `let` 키워드를 사용합니다. 그리고 자바스크립트와 파이썬은 입력을 받는 방식이 다릅니다(브라우저의 `prompt()` vs 파이썬의 `input()`).

### 파이썬 vs 자바

자바로 동일한 콘솔 계산기를 구현한다면,

```java
import java.util.Scanner;

public class Calculator {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("첫 번째 숫자를 입력하세요: ");
        double num1 = scanner.nextDouble();

        System.out.print("연산자를 입력하세요 (+, -, *, /): ");
        String operator = scanner.next();

        System.out.print("두 번째 숫자를 입력하세요: ");
        double num2 = scanner.nextDouble();

        double result = 0;
        boolean validOperation = true;

        switch (operator) {
            case "+":
                result = num1 + num2;
                break;
            case "-":
                result = num1 - num2;
                break;
            case "*":
                result = num1 * num2;
                break;
            case "/":
                if (num2 != 0) {
                    result = num1 / num2;
                } else {
                    System.out.println("0으로 나눌 수 없습니다.");
                    validOperation = false;
                }
                break;
            default:
                System.out.println("잘못된 연산자입니다.");
                validOperation = false;
        }

        if (validOperation) {
            System.out.println(num1 + " " + operator + " " + num2 + " = " + result);
        }

        scanner.close();
    }
}
```

**차이점**:

자바는 정적 타입 언어로 변수 타입을 명시적으로 선언해야 합니다. 그리고, 자바는 `Scanner` 클래스를 사용해 입력을 받습니다.

반면, 파이썬은 코드가 더 간결하며, 자바는 타입 선언과 구문 요소로 인해 코드가 길어집니다. 자바는 리소스 관리를 위해 `scanner.close()`를 명시적으로 호출해야 합니다.

## 코드 개선 방법

1. **모듈화**:

   - 기능별로 함수나 클래스를 분리하여 코드 재사용성을 높일 수 있습니다.
   - 예: 계산 로직과 사용자 인터페이스 분리

2. **에러 처리 강화**:

   - 더 많은 예외 상황을 처리하여 프로그램의 안정성을 높일 수 있습니다.
   - 특히 `eval()` 함수는 보안 위험이 있으므로 별도의 수식 파서를 구현하는 것이 좋습니다.

3. **기능 확장**:
   - 과학용 계산기 기능(sin, cos, log 등) 추가
   - 계산 기록 저장 및 불러오기 기능
   - 다양한 단위 변환 기능

이 글에서는 파이썬을 사용하여 간단한 계산기를 세 가지 방식(기본 콘솔, 고급 콘솔, GUI)으로 구현해보았습니다. 각 방식의 코드와 그 작동 원리에 대해 자세히 설명했으며, 자바와 자바스크립트와의 차이점도 비교해보았습니다.

파이썬은 코드가 간결하고 직관적이어서 빠르게 프로토타입을 만들기에 적합합니다. 특히 입문자에게 파이썬의 이런 특성은 프로그래밍 개념을 이해하는 데 큰 도움이 되는 것 같습니다.

물론, 자바나, 자바스크립트에 익숙한 사람이라면 사실 파이썬에 들여쓰기가 익숙하지 않을수도 있습니다. (제가 그랬거든요.)
