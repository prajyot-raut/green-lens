# Installation Guide

### Environment variable

Create a `.env.local` file in the root directory and add your Firebase and Cloudinary credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

_(Note: Ensure `CLOUDINARY_API_SECRET` is kept secret and not exposed client-side. It's used in the API route [`src/app/api/image/upload/route.ts`](src/app/api/image/upload/route.ts).)_~

### Firebase Policy

```json
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

  // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if the requesting user is the owner of the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Helper function to check if the requesting user is an admin
    // Assumes you have an 'isAdmin' boolean field in the user's document
    function isAdmin() {
      // Read the requesting user's document from the 'users' collection
      // Ensure the 'users' collection rules allow this read access for authenticated users
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /images/{imageId} {
      allow read: if isAuthenticated();
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if isAuthenticated() && (isOwner(resource.data.userId) || isAdmin());
    }

    // Rules for the 'routes' collection
    match /routes/{routeId} {
      // Only admins can read, create, update, or delete routes
      allow read, write: if isAdmin(); // 'write' covers create, update, delete

      // Optional: Add validation for route creation/update if needed
      // allow create: if isAdmin() && request.resource.data.name is string && ... ;
      // allow update: if isAdmin() && ... ;
    }
  }
}
```
