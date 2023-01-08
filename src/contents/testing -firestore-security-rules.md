---
author: Peter Mwangi
datetime: 2023-01-08T15:49:34Z
title: Testing Firestore security rules
slug: testing-firestore-security-rules
featured: true
draft: false
tags:
  - firebase
  - testing
  - emulators
ogImage: ""
description: How to test Cloud Firestore security rules using Firebase emulators and the Jest testing library.
---

## Intro

Firebase apps for mobile and web clients rely on Firebase Authentication and Cloud Firestore Security Rules for serverless authentication, authorization and data validation. Each request to read or write data to Firestore is checked against security rules. A request is granted access if it satisfies the conditions of at least one matching allow statement from the security rules.

Here is an example of a Firestore security rules file. It denies read and write requests to all documents, i.e. the database is locked.

`./firestore.rules`

```
rules_version = '2'
service cloud.firestore {
	match /databases/{database}/documents {
		match /{document=**} {
			allow read, write: if false;
		}
	}
}
```

## Requirements

- Recent **Node** and **npm** version installation
- **Java** runtime
- Recent version of Firebase CLI tool. Run `npm install -g firebase-tools` to install/update the Firebase CLI via **npm.**

## Setup

1. Navigate to a new project directory and run `npm init -y`.
2. Run `firebase login` to login to Firebase using your Google account. Allow the required permissions to let the Firebase CLI to access the Firebase project resources.
3. Run `firebase projects:create YOUR_UNIQUE_PROJECT_ID`
4. Navigate to https://console.firebase.google.com/project/YOUR_UNIQUE_PROJECT_ID/firestore and create a database to start using the Firestore service. When prompted to choose security rules for the database, choose `Start in production mode`,this makes the data private so that mobile and web clients will not be able to read or write to the database. We will update this behavior in a moment. Choose a location for your database that is nearest to your users. Go to `Project settings > General` and set the Default GCP resource location to the same location you picked for the service and save.
5. Back in your terminal, run `firebase init`, select Firestore and Emulators features, associate the Firebase project it to the existing project created in the previous step. Leave Firestore rules and index files with default names. Select Authentication and Firestore emulators as the emulators to be set up and use the default ports for the same. You may also want to enable the Emulator UI and to download the emulators now rather than later when running them. Check-out the _firebase-related_ files created for the new Firebase app configuration.
6. Install `jest` and `@firebase-rules-unit-testing` library by running `npm install -D jest @firebase/rules-unit-testing`. We will be using these two to test. Any other testing library can be used.

## About the app

We will assume(but not implement) an app that stores user profiles in a `/users` Firestore collection. Each document in the collection, i.e `/users/{userId}` has a `userId` that is the same as an authenticated user’s unique `uid`.

## Let’s write the tests

`firestore.rules.test.js`

```jsx
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { getDoc, doc, setDoc } from "@firebase/firestore";

const PROJECT_ID = "YOUR_UNIQUE_PROJECT_ID";
const FIRESTORE_EMULATOR_HOST = "localhost";
const FIRESTORE_EMULATOR_PORT = 8080;

let env;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: FIRESTORE_EMULATOR_HOST, port: FIRESTORE_EMULATOR_PORT },
  });
});

afterEach(async () => {
  await env.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
});

test("user profile can be read by anyone, authenticated or not", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, "users/foo")));
});

test("user profile can only be updated by authenticated user updating own profile", async () => {
  const USER_ID = "user123";
  const db = env.authenticatedContext(USER_ID).firestore();
  await assertSucceeds(
    setDoc(doc(db, `users/${USER_ID}`), { name: "New Name" })
  );
  await assertFails(
    setDoc(doc(db, `users/anotherUserId`), { name: "Yet Another Name" })
  );
});
```

Update `package.json` to allow the use of ES6 import syntax and for Jest to watch all file changes while running the tests.

```json
{
  "name": "testing-firebase-security-rules",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js --watchAll"
  },
  "keywords": [],
  "author": "Peter Mwangi",
  "license": "ISC",
  "devDependencies": {
    "@firebase/rules-unit-testing": "^2.0.5",
    "jest": "^29.3.1"
  },
  "dependencies": {
    "firebase": "^9.15.0"
  }
}
```

## Start the emulators and run the tests

Run `firebase emulators:start`, wait for the emulators to start up and in a separate terminal run `npm test`.

The tests should fail, as the current rules in `firestore.rules` do not conform with the tests.

## Update the `firestore.rules`

Update `firestore.rules` to allow any user to read user profiles but to only allow writes by authenticated users updating their own user profiles.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

The tests should now pass ✅

## Refactor the `firestore.rules`

Conditions can get complicated really fast. Functions help refactor conditions making it easy to combine them with ease, to achieve tighter controls and for long-term maintainability. We can refactor `isSignedIn` and `isUsersOwnProfile` as functions like so:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null
    }

    function isUsersOwnProfile(userId) {
      return request.auth.uid == userId
    }

    match /users/{userId} {
      allow read: if true;
      allow write: if isSignedIn() && isUsersOwnProfile(userId);
    }
  }
}
```

## That's it!

`Ctrl-C` to stop the tests and do the same for the Firebase emulators.

👨‍💻️ Checkout the full code on [GitHub](https://github.com/engpetermwangi/testing-firestore-security-rules)!

## More on Firestore security rules

In the example above, we used the user’s authentication state to control access by looking at the `request.auth` object.

Other objects too, can be used inside security rules. These include:

1. The `resource` object - it is the document being read or written. It contains:

   - `__name__` - the document's full name as a path
   - `id` - the document's id
   - `data` - an object containing the document’s current content

2. The `request.resource` object, when writing data, contains the future state of the document if the write was to succeed. It is useful for implementing data validation, for example by checking for required but missing fields, allowing updates on certain properties only, data types of certain properties, comparing existing to incoming values e.t.c.

Inbuilt `get()` and `exists()` functions both accept full paths and can be used inside security rules to check if certain documents exists or to check the values of certain document's data before allowing access the incoming request.

### Granular operations

`write` = `create + update + delete`

`read` = `get + list`

### Logging

Use of the `debug()` function logs to firebase-debug.log the values of variables, objects, and statement results as the rules are being evaluated.

### Principle of least privilege

> a user or entity should only have access to the specific data, resources and applications needed to complete a required task

By default all reads and writes to Firestore are disabled. While developing your application, you should only allow enable access on an as-needed basis.
