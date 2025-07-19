# Instruction for Clause

This is a fresh expo react native app. It will become an app that allows users to create an account (or log in with google), invite their partner, swipe left/right/down similar to Tinder app but for baby names. The result will be that each partner builds up a shortlist, a main shared shortlist will be created based on the two users shortlists.

## Tasks

### Firebase

An empty firebase has been created with a 'web' app within it:

```
Project name - NamedTogether
Project ID - namedtogether-b58d9
Project number  - 875389950049
Web API Key - AIzaSyBvPmvpg8yuAsTa9cuN5ZruFX-JINr_taE
```

the firebase config is

```// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvPmvpg8yuAsTa9cuN5ZruFX-JINr_taE",
  authDomain: "namedtogether-b58d9.firebaseapp.com",
  projectId: "namedtogether-b58d9",
  storageBucket: "namedtogether-b58d9.firebasestorage.app",
  messagingSenderId: "875389950049",
  appId: "1:875389950049:web:ec445dc5282ed67b30b220",
  measurementId: "G-XKF28M244J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

The firebase has Email/password and google login enabled

### We'll be using firestore database 

We have an empty firestore database, heres a rough outline of how we'll use it

#### 📁 Collections Overview

- `users` – stores user profiles
- `couples` – links two users together
- `names` – master list of all baby names
- `votes` – individual yes/no votes on names
- `shortlists` – shared list of names matched by both partners


#### Document Relationships
👤 `users/{userId}`
```
{
  "email": "alex@example.com",
  "displayName": "Alex",
  "photoURL": "...",
  "createdAt": Timestamp,
  "coupleId": "couple_abc123",   // reference to couples
  "invitePending": true
}
```
Each user may or may not belong to a couple.

On sign-up, a user document is created.

`couples/{coupleId}`
```
{
  "userIds": ["uid1", "uid2"],
  "createdAt": Timestamp
}
```

Formed when one user invites and links with their partner.

The couple is the basis for the shared shortlist.

`names/{nameId}`
```
{
  "name": "Aria",
  "gender": "neutral",
  "origin": "Hebrew"
}
```
Master name list.

Can be loaded client-side for voting or swiping.

`votes/{userId}_{nameId}`
```
{
  "userId": "uid1",
  "nameId": "name_001",
  "vote": "yes", // or "no"
  "timestamp": Timestamp
}
```

Records a single user's vote on a name.

You can query for matches between couple members.

`shortlists/{coupleId}`

```
{
  "coupleId": "couple_abc123",
  "matchedNames": [
    {
      "nameId": "name_001",
      "addedAt": Timestamp
    },
    ...
  ]
}
```
Automatically populated when both partners vote "yes" on the same name.

This is the shared shortlist.

In order to create couples we may need an `invites` flow

```
invites (collection)
│
├── {inviteId} (document)
    ├── inviterId: "userA_uid"
    ├── inviteeEmail: "partner@example.com"
    ├── status: "pending" | "accepted" | "expired"
    ├── createdAt: Timestamp
    ├── acceptedAt: Timestamp (optional)
    ├── coupleId: "couple_abc123" (set upon acceptance)
```

1. 🧑‍💻 User A sends an invite
- Creates a new document in invites/

- Sets inviteeEmail and inviterId

- User A's users/{uid} doc has invitePending: true

2. 📩 User B logs in with the invited email
- App checks for any invites matching inviteeEmail

- If found and status is "pending", show the invite UI

3. 🤝 User B accepts invite
- App creates a couples/{coupleId} document with both UIDs

- Updates both users/{uid} with the coupleId

- Marks the invite as "accepted" with acceptedAt

- Optionally deletes or archives the invite
    

#### Flow Summary
1. User signs up → creates a users/{uid} document

2. User invites partner → creates or joins a couples/{coupleId}

3. Each user votes on names → creates votes/{userId}_{nameId}

4. Backend/Client checks for matched votes → updates shortlists/{coupleId}

5. App displays shortlist for the individual and a shared shortlist with their partner


The app should heavily be inspired by existing apps such as https://play.google.com/store/apps/details?id=com.BabyName.start&hl=en_GB, but it'll be a lighter slightly more basic version just to handle shortlisting of names

### Theming

Use an existing free set of UI such as chakraUI or kittenUI