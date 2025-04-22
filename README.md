# Green Lens

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
