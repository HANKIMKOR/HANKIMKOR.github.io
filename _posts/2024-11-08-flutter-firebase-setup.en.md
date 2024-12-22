---
layout: post
title: "Setting up Firebase in Flutter: Complete Guide from Installation to Initial Setup"
lang: en
ref: flutter-firebase-setup
categories: [Flutter, Firebase, Mobile]
image: assets/images/category_flutter.webp
---

## What is Firebase?

Firebase is a mobile and web application development platform provided by Google. It provides various tools and services that help developers build high-quality apps quickly.

### Key Features of Firebase

1. **Authentication**

   - Email/password and social login (Google, Facebook, etc.) support
   - Phone number verification
   - Anonymous login

2. **Database**

   - Cloud Firestore: NoSQL cloud database
   - Realtime Database: Real-time data synchronization

3. **Storage**

   - Store files like images and videos
   - Handle large file uploads

4. **Push Notifications**

   - Firebase Cloud Messaging (FCM)
   - Targeted push notification delivery

5. **Analytics**
   - User behavior analysis
   - App performance monitoring

## Setting up Firebase in Flutter Project

### 1. Prerequisites

- Flutter SDK installed
- Firebase account created
- Firebase CLI installed

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### 2. Install FlutterFire CLI

FlutterFire CLI is a tool that automates Firebase setup.

```bash
dart pub global activate flutterfire_cli
```

### 3. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click 'Add Project'
3. Enter project name
4. Configure Google Analytics (optional)
5. Click 'Create Project'

### 4. Add Firebase to Flutter Project

```bash
# Run in project directory
flutterfire configure
```

This command will:

1. Select Firebase project
2. Choose platforms (Android/iOS)
3. Auto-generate necessary config files

### 5. Add Firebase Packages

Add required packages to `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3 # For authentication
  cloud_firestore: ^4.13.6 # For Firestore database
  firebase_storage: ^11.5.6 # For storage
```

Install packages:

```bash
flutter pub get
```

### 6. Initialize Firebase

Initialize Firebase in `lib/main.dart`:

```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(MyApp());
}
```

## Platform-Specific Setup

### Android Setup

Set minimum SDK version in `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        minSdkVersion 21
        // ...
    }
}
```

### iOS Setup

Add required permissions to `ios/Runner/Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Existing settings -->
    <key>NSCameraUsageDescription</key>
    <string>Camera access is required.</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Photo library access is required.</string>
</dict>
</plist>
```

## Firebase Usage Examples

### 1. Using Authentication

```dart
import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Sign up with email/password
  Future<UserCredential?> signUp(String email, String password) async {
    try {
      return await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      print('Sign up error: $e');
      return null;
    }
  }

  // Sign in
  Future<UserCredential?> signIn(String email, String password) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      print('Sign in error: $e');
      return null;
    }
  }
}
```

### 2. Using Firestore Database

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

class DatabaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Add data
  Future<void> addUser(String userId, Map<String, dynamic> userData) async {
    await _db.collection('users').doc(userId).set(userData);
  }

  // Read data
  Future<DocumentSnapshot> getUser(String userId) async {
    return await _db.collection('users').doc(userId).get();
  }
}
```

## Important Considerations and Tips

### 1. Security Rules Setup

- Security rules must be set for Firestore and Storage
- Default test mode allows unrestricted access
- Example security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can access
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public read, authenticated write
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2. Cost Management

Free Quotas (Spark Plan):

1. **Firestore**

   - Storage: 1GB
   - Document reads: 50,000/day
   - Document writes: 20,000/day
   - Document deletes: 20,000/day

2. **Storage**

   - Storage: 5GB
   - Downloads: 1GB/day
   - Uploads: 1GB/day

3. **Authentication**

   - Unlimited authentications

4. **Hosting**
   - Storage: 10GB
   - Transfer: 360MB/month

Excess Costs (Blaze Plan):

- Firestore document reads: $0.036/100,000
- Firestore document writes: $0.108/100,000
- Storage: $0.026/GB
- Prices may vary by region

Cost Management Tips:

- Set budget alerts in Firebase Console
- Optimize queries to minimize reads
- Consider alternative storage for large files

### 3. Offline Support

Firestore Offline Caching:

1. **Basic Configuration**

```dart
// Configure offline persistence
FirebaseFirestore.instance.settings = Settings(
  persistenceEnabled: true, // Default is true
  cacheSizeBytes: 100000000, // 100MB
);
```

2. **Handling Offline Data**

```dart
// Prioritize cached data
final userDoc = await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .get(GetOptions(source: Source.cache));

// Sync with server
final serverDoc = await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .get(GetOptions(source: Source.server));
```

3. **Key Features**

   - App remains functional without internet
   - Automatic data synchronization
   - Changes queued while offline
   - Auto-sync when back online

4. **Cache Management**

```dart
// Clear all cache
await FirebaseFirestore.instance.clearPersistence();

// Clear specific document cache
await FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .clearPersistence();
```

5. **Important Notes**
   - Set cache size limits
   - Consider encryption for sensitive data
   - Implement periodic cache cleanup

## Summary

Firebase is a powerful tool that enables rapid app development without building backend infrastructure. Its seamless integration with Flutter makes it particularly useful for mobile app development.

Key considerations before starting:

1. Assess project scale and requirements
2. Review Firebase free quotas
3. Implement proper security measures
4. Design appropriate data structures

With proper preparation, Firebase can significantly enhance your Flutter app development efficiency!
