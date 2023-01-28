---
author: Peter Mwangi
datetime: 2023-01-06T05:39:10Z
title: Running Firebase emulator in Docker
slug: firebase-emulator-in-docker
featured: false
draft: false
tags:
  - docker
  - firebase
ogImage: ""
description: How to run Firebase emulator in Docker
---

## Requirements

- Ensure you have a recent version of docker installed on your machine. Run the command `docker --version` in your terminal to check the installed version. Stuck? Check out the docker engine [installation instructions](https://docs.docker.com/engine/install/).
- A Firebase project with one or more Firebase services set up with a `firebase.json` file in the root of the project directory.

## Setup

Create a `Dockerfile.emulator` file at the root of your Firebase project.

```docker
# use node base image, same node version as your app
FROM node:14

# install java runtime
RUN apt-get update && \
    apt-get install -y openjdk-11-jre-headless && \
    apt-get clean;

# install firebase
RUN npm install -g firebase-tools

# run emulator
CMD [ "firebase", "emulators:start", "--only=auth,firestore,functions" ]
```

## Run

Supposing your Firebase project uses the Authentication, Firestore database and Functions for Firebase services. To create and run a container running the Firebase emulator for these services, create a `compose.yml` at the root of your Firebase project.

```yaml
services:
  firebase-emulator:
    container_name: firebase-emulator
    build:
      context: .
      dockerfile: Dockerfile.emulator
    volumes:
      - ./firebase.json:/firebase.json
      - ./.firebaserc:/.firebaserc
      - ./firestore.rules:/firestore.rules
      - ./functions:/functions
      - emulatorCache:/.cache/firebase/emulators/
    ports:
      - "127.0.0.1:5001:5001"
      - "127.0.0.1:8080:8080"
      - "127.0.0.1:4000:4000"
      - "127.0.0.1:9099:9099"

volumes:
  emulatorCache:
```

<aside>
💡 The `emulatorCache` named bind volume is used to speed up subsequent emulator container starts by caching emulator binary files on the host machine.

</aside>

Then run `docker compose up --build`. The `--build` flag tells docker to rebuild in case some changes have been made to the docker files. Observe the output logs then access the emulator through the respective ports once ready.

<aside>
ℹ️ The initial `docker compose up --build` may take a significant amount of time as it downloads images from Docker Hub. Of course this depends on your internet speed. Subsequent `up` commands will reuse image caches for faster restarts.

</aside>

The running containers can then be accessed through `localhost:EMULATOR_PORT`🍾🍾🍾

To stop the running container, run `docker compose stop`.

Run `docker compose start` to resume the container.

## Clean up

Run `docker compose down` to tear down all the docker resources including the containers and network created when `docker compose up` was ran.
