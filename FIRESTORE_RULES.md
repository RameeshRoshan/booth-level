// FIRESTORE SECURITY RULES - Copy and paste this into Firebase Console
// Firebase Console → Firestore Database → Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - authenticated users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Households collection - authenticated users can add entries
    // Everyone can read (later restricted to admin dashboard only)
    match /households/{document=**} {
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      
      allow read: if request.auth != null;
      
      allow update, delete: if request.auth != null && 
                               request.resource.data.userId == request.auth.uid;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

// How to update Firestore Rules:
// 1. Go to Firebase Console (console.firebase.google.com)
// 2. Select your project "booth-level"
// 3. Go to Firestore Database → Rules tab
// 4. Replace all content with the rules above
// 5. Click "Publish"
