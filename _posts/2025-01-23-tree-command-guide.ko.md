---
layout: post
title: "Tree 명령어 정리하기"
lang: ko
ref: tree-command-guide
categories: [tree, dev-tools, Web]
image: assets/images/category_dev-tools.webp
---

## 1. Tree란?

Tree는 디렉토리 구조를 시각적으로 표현해주는 매우 유용한 명령줄 도구입니다. 복잡한 프로젝트의 파일 구조를 파악하거나, 문서화 작업을 할 때 특히 유용합니다.

아래와 같이 출력되며, 내 프로젝트의 구조를 파악하거나 가끔 리팩토링을 위해 어떻게 구조를 짜야될지에 대해 큰 도움을 받고 있습니다...ㅎ

```
.
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   └── Footer.js
│   └── pages/
│       ├── Home.js
│       └── About.js
└── public/
    ├── images/
    └── styles/
```

## 2. 설치 방법

### macOS

Homebrew를 사용하여 설치

```bash
brew install tree
```

### Linux (Ubuntu/Debian)

apt 패키지 매니저를 사용하여 설치

```bash
sudo apt-get update
sudo apt-get install tree
```

### Linux (CentOS/RHEL)

yum을 사용하여 설치

```bash
sudo yum install tree
```

### Windows

1. [공식 사이트](http://gnuwin32.sourceforge.net/packages/tree.htm)에서 다운로드
2. 또는 Chocolatey 패키지 매니저 사용.

```bash
choco install tree
```

설치 확인:

```bash
tree --version
```

## 3. 기본 사용법

### 현재 디렉토리 구조 보기

```bash
tree
```

### 특정 디렉토리 구조 보기

```bash
tree /path/to/directory
```

### 기본 옵션

- `-a`: 숨김 파일 표시

```bash
tree -a
```

- `-d`: 디렉토리만 표시

```bash
tree -d
```

- `-L n`: n단계까지의 깊이만 표시

```bash
tree -L 2
```

## 4. 고급 사용법

### 파일 패턴 필터링

특정 패턴의 파일만 표시:

```bash
tree -P "*.js"  # .js 파일만 표시
```

특정 패턴의 파일 제외:

```bash
tree -I "node_modules|dist|build"  # node_modules, dist, build 디렉토리 제외
```

### 출력 형식 지정

파일 크기 표시:

```bash
tree -sh  # 사람이 읽기 쉬운 형태로 파일 크기 표시
```

파일/디렉토리 권한 표시:

```bash
tree -p  # 권한 정보 표시
```

마지막 수정 시간 표시:

```bash
tree -D  # 마지막 수정 날짜 표시
```

### JSON 형식으로 출력

```bash
tree -J  # JSON 형식으로 출력
```

### HTML 형식으로 출력

```bash
tree -H "http://localhost" > tree.html  # HTML 파일로 저장
```

## 5. 실용적인 예제

### 프로젝트 문서화

```bash
# 프로젝트 구조를 README.md에 추가
tree -L 3 --dirsfirst > project_structure.txt
```

### 대규모 프로젝트 탐색

```bash
# node_modules 제외, 2단계 깊이까지만 표시, 디렉토리만
tree -L 2 -d -I "node_modules"
```

### 파일 크기 분석

```bash
# 파일 크기를 포함하여 큰 파일 찾기
tree -sh --du
```

### Git 프로젝트 구조 분석

```bash
# .git 및 node_modules 제외, JavaScript 파일만 표시
tree -I "node_modules|.git" -P "*.js"
```

## 6. 자주 발생하는 문제와 해결 방법

### 문자 인코딩 문제

한글이나 특수문자가 깨질 경우:

```bash
tree --charset unicode
```

### 권한 문제

Permission denied 오류 발생 시:

```bash
sudo tree /path/to/directory
```

### 메모리 문제

너무 큰 디렉토리를 스캔할 때:

```bash
tree -L 2  # 깊이를 제한하여 실행
```

## 유용한 팁

1. alias 설정하기

```bash
# .bashrc 또는 .zshrc에 추가
alias t='tree -L 2'  # 2단계 깊이까지만 표시
alias td='tree -d'   # 디렉토리만 표시
```

2. 출력 결과 저장하기

```bash
tree > structure.txt  # 텍스트 파일로 저장
tree -H . > structure.html  # HTML 파일로 저장
```

3. 파이프라인과 함께 사용하기

```bash
tree | less  # 페이지 단위로 보기
tree | grep "\.js$"  # JavaScript 파일만 필터링
```
