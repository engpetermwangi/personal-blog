---
author: Peter Mwangi
datetime: 2023-01-03T18:48:01Z
title: How to deploy a Remix app to Cloud Run using Docker
slug: remix-to-cloud-run
featured: false
draft: false
tags:
  - remix
  - cloud run
  - docker
ogImage: ""
description: How to deploy a Remix app to Cloud Run in Google Cloud using Docker
---

## 1. Create a Remix app

With a recent version of Node installed on your machine, run `npx create-remix@latest` to create a Remix app. Select **“Just the basics”** for app type and **"Remix App Server”** for where to deploy.

Once you have installed dependencies, ensure the development server runs as expected by running `npm dev` at the root of your application.

## 2. Containerize the app

At the root of your application, create a file named `Dockerfile` with the following content:

```docker
FROM node:18-alpine3.16 AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine3.16

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit dev

COPY --from=base app/build ./build
COPY --from=base app/public ./public

CMD ["npm", "start"]
```

The Dockerfile above makes use of [multi-stage builds](https://docs.docker.com/build/building/multi-stage/) to:

1. build the app with the same exact Node version as the one that will run it when deployed
2. leave out source code which is more secure and results in a lightweight image
3. leave out dev dependencies which also helps keep the image size tiny

## 3. Setup a Google Cloud project

[Create a new Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project). Doing so assigns you the `Owner` role which contains all the necessary permissions to deploy a Cloud Run service. Take note of the project ID for later use in the deploy step.

[Enable billing for the project](https://cloud.google.com/billing/docs/how-to/modify-project#enable_billing_for_a_project). Don’t worry about costs, you can safely delete the project when you have finished testing. Also, Cloud Run has a generous free tier, more than enough to experiment with it.

## 4. Deploy

Ensure you have gcloud CLI installed on your machine. If not, follow it's [installation instructions](https://cloud.google.com/sdk/docs/install).

Login to your Google account using the gcloud CLI on your terminal by running `gcloud auth login`.

Run the following as one command at the root of your application to deploy it:

```
gcloud run deploy YOUR_APP_NAME_GOES_HERE \
--project YOUR_PROJECT_ID_GOES_HERE \
--source . \
--set-env-vars NODE_ENV=production \
--port 3000 \
--allow-unauthenticated
```

When prompted to specify a region, pick one that is closest to your users and/or other resources like databases that your service accesses. Accept the follow up prompts to enable the necessary Google Cloud APIs and to create resources. It takes a few minutes.

Once finished, gcloud CLI prints out the service URL that you can visit to check out the live app!
