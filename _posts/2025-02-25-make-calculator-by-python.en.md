---
layout: post
title: "Python Calculator Project"
lang: en
ref: make-calculator-by-python
categories: [Python, Programming, Beginner]
image: assets/images/category_python.webp
---

# Simple Calculator Project with Python

Hello! Today, we'll explore how to create a simple calculator using Python. This article will walk you through the coding process and explain the role of each part in detail.

## Console-based Calculator

Let's start by creating the most basic console-based calculator.

```python
def simple_calculator():
    # Get first number from user
    num1 = float(input("Enter first number: "))

    # Get operator from user
    operator = input("Enter operator (+, -, *, /): ")

    # Get second number from user
    num2 = float(input("Enter second number: "))

    # Perform calculation
    if operator == "+":
        result = num1 + num2
    elif operator == "-":
        result = num1 - num2
    elif operator == "*":
        result = num1 * num2
    elif operator == "/":
        # Handle division by zero
        if num2 == 0:
            return "Cannot divide by zero."
        result = num1 / num2
    else:
        return "Invalid operator."

    # Return result
    return f"{num1} {operator} {num2} = {result}"

# Run calculator
print(simple_calculator())
```

### Code Explanation

1. **Why use `float(input())`**

   User input is received as a string by default, so we use float() to convert it to a number. We chose float() instead of int() to naturally handle calculations with decimal points.

2. **Conditional structure**

   Python uses if-elif-else structure for conditional branching, which is different from switch-case used in Java or C++.

3. **Division by zero handling**

   Since division by zero is mathematically undefined, we implemented special handling. While Java uses exception handling for this situation, this code uses a simpler conditional approach.

4. **f-string usage**
   For result formatting, we used f-strings introduced in Python 3.6. This feature is similar to JavaScript's template literals (${}) or Java's String.format() method.

## Adding Continuous Calculation Feature

Now let's add the ability to keep calculating until the user wants to quit.

```python
def advanced_calculator():
    while True:
        # Get first number from user
        try:
            num1 = float(input("\nEnter first number (or 'q' to quit): "))
        except ValueError:
            # Check if user entered 'q'
            if input().lower() == 'q':
                print("Exiting calculator.")
                break
            print("Please enter a valid number.")
            continue

        # Get operator from user
        operator = input("Enter operator (+, -, *, /): ")
        if operator not in ['+', '-', '*', '/']:
            print("Please enter a valid operator.")
            continue

        # Get second number from user
        try:
            num2 = float(input("Enter second number: "))
        except ValueError:
            print("Please enter a valid number.")
            continue

        # Perform calculation and show result
        if operator == "/" and num2 == 0:
            print("Cannot divide by zero.")
        else:
            # Using dictionary for operator mapping
            operations = {
                '+': lambda x, y: x + y,
                '-': lambda x, y: x - y,
                '*': lambda x, y: x * y,
                '/': lambda x, y: x / y
            }

            result = operations[operator](num1, num2)
            print(f"Result: {num1} {operator} {num2} = {result}")

# Run calculator
advanced_calculator()
```

### Code Explanation

1. **Infinite loop usage**

   We used while True to implement an infinite loop, allowing continuous calculations until the user explicitly quits. This is similar to while(true) in JavaScript.

2. **Exception handling**

   We used try-except for exception handling. While similar to Java's try-catch, Python's syntax is more concise.

3. **Lambda and dictionary usage**

   For code conciseness, we used a dictionary with lambda functions instead of if-elif conditions. This technique is similar to mapping functions to objects in JavaScript.

4. **Input validation**
   We used Python's list membership test (in operator) for operator validation, which is more intuitive than Java's approach.

## GUI-based Calculator

Now let's create a calculator with a graphical interface using tkinter.

```python
import tkinter as tk

class CalculatorApp:
    def __init__(self, master):
        self.master = master
        master.title("Python Calculator")

        # Entry widget to display calculations
        self.display = tk.Entry(master, width=25, borderwidth=5)
        self.display.grid(row=0, column=0, columnspan=4, padx=10, pady=10)

        # Variable to store current calculation
        self.current = ""

        # Create and place buttons
        self.create_buttons()

    def create_buttons(self):
        # Button text and grid positions
        button_layout = [
            ('7', 1, 0), ('8', 1, 1), ('9', 1, 2), ('/', 1, 3),
            ('4', 2, 0), ('5', 2, 1), ('6', 2, 2), ('*', 2, 3),
            ('1', 3, 0), ('2', 3, 1), ('3', 3, 2), ('-', 3, 3),
            ('0', 4, 0), ('.', 4, 1), ('=', 4, 2), ('+', 4, 3),
            ('C', 5, 0, 4)  # C button spans 4 columns
        ]

        # Create each button
        for button_info in button_layout:
            text = button_info[0]
            row = button_info[1]
            col = button_info[2]

            # Handle multi-column buttons
            colspan = 1
            if len(button_info) > 3:
                colspan = button_info[3]

            # Create button and bind click event
            button = tk.Button(self.master, text=text, padx=20, pady=10,
                              command=lambda t=text: self.button_click(t))
            button.grid(row=row, column=col, columnspan=colspan, sticky="nsew")

    def button_click(self, text):
        if text == "=":
            # Perform calculation
            try:
                # Use eval() to calculate string expression
                result = str(eval(self.current))
                self.display.delete(0, tk.END)
                self.display.insert(0, result)
                self.current = result
            except:
                self.display.delete(0, tk.END)
                self.display.insert(0, "Error")
                self.current = ""

        elif text == "C":
            # Clear input
            self.display.delete(0, tk.END)
            self.current = ""

        else:
            # Add number or operator
            self.current += text
            self.display.delete(0, tk.END)
            self.display.insert(0, self.current)

# Run GUI calculator
def run_gui_calculator():
    root = tk.Tk()
    app = CalculatorApp(root)
    root.mainloop()

if __name__ == "__main__":
    run_gui_calculator()
```

### GUI Code Explanation

1. **Class-based design**
   This GUI calculator is designed using object-oriented principles. Similar to Java, we define a class and implement instance methods within it.
2. **tkinter widget usage**

   We used various tkinter widgets to build the user interface. The Entry widget displays the calculation and result, while Button widgets handle user input. The grid layout manager helps organize widgets systematically.

3. **Lambda functions for event handling**

   Each button's click event is handled using lambda functions. This approach is conceptually similar to anonymous functions in JavaScript or lambda expressions in Java, allowing efficient connection of different actions to each button.

4. **eval() function usage**

   We used eval() to calculate string expressions. While convenient, eval() poses security risks and should be used cautiously in real applications. JavaScript has a similar eval() function, but Java requires implementing a custom expression parser.

## Comparison with Other Languages

### Python vs JavaScript

Here's how the same console calculator would look in
JavaScript:

```javascript
function simpleCalculator() {
  // prompt() is used for user input in browser environment
  const num1 = parseFloat(prompt("Enter first number:"));
  const operator = prompt("Enter operator (+, -, *, /):");
  const num2 = parseFloat(prompt("Enter second number:"));

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
        return "Cannot divide by zero.";
      }
      result = num1 / num2;
      break;
    default:
      return "Invalid operator.";
  }

  return `${num1} ${operator} ${num2} = ${result}`;
}

console.log(simpleCalculator());
```

**Differences**:

JavaScript uses `switch-case` while Python uses `if-elif-else`. JavaScript uses `const` and `let` for variable declaration. Input handling differs between browser's `prompt()` and Python's `input()`.

### Python vs Java

Here's the Java version of the console calculator:

```java
import java.util.Scanner;

public class Calculator {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter first number: ");
        double num1 = scanner.nextDouble();

        System.out.print("Enter operator (+, -, *, /): ");
        String operator = scanner.next();

        System.out.print("Enter second number: ");
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
                    System.out.println("Cannot divide by zero.");
                    validOperation = false;
                }
                break;
            default:
                System.out.println("Invalid operator.");
                validOperation = false;
        }

        if (validOperation) {
            System.out.println(num1 + " " + operator + " " + num2 + " = " + result);
        }

        scanner.close();
    }
}
```

**Differences**:

Java is statically typed, requiring explicit variable type declarations. Java uses the `Scanner` class for input. Python's code is more concise, while Java's type declarations and syntax elements make it more verbose. Java requires explicit resource management with `scanner.close()`.

## Code Improvement Suggestions

1. **Modularization**:

   - Separate functionality into functions or classes for better code reuse.
   - Example: Separate calculation logic from user interface.

2. **Enhanced error handling**:

   - Handle more exception cases to improve program stability.
   - Implement a custom expression parser instead of using eval() for security.

3. **Feature expansion**:
   - Add scientific calculator functions (sin, cos, log, etc.)
   - Implement calculation history storage and recall
   - Add unit conversion capabilities

In this article, we've implemented a simple calculator in Python using three different approaches (basic console, advanced console, GUI). We've explained each implementation in detail and compared Python with Java and JavaScript.

Python's concise and intuitive syntax makes it excellent for rapid prototyping. Its readability is particularly helpful for beginners learning programming concepts.

However, developers familiar with Java or JavaScript might initially find Python's indentation-based syntax unusual. (I know I did!)
