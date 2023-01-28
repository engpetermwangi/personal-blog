---
author: Peter Mwangi
datetime: 2023-01-28T12:22:54Z
title: Ingress vs invocation settings in Cloud Run - what’s the difference?
slug: ingress-vs-invocation-cloud-run
featured: true
draft: false
tags:
  - cloud run
ogImage: ""
description: Differentiating between ingress and invocation settings in Google Cloud Run
---

Ingress rules specify the network from which incoming traffic can access the Cloud Run service via its `.run.app` or custom domain URL. The possible options are:

- **Internal** - comprises of other Google Cloud services like Cloud Tasks, Pub/Sub, internal load balancer and VPC that the service uses.
- **Internal and cloud load balancing** - comprises of all the above and an external HTTP(S) load balancer.
- **All** - all requests, including directly from any resource in the internet.

Invocation rules then determine if the request has the necessary permission to invoke or trigger the Cloud Run service for it to run. Invocation is managed by Cloud IAM rules. Any principal with the with the `roles/run.invoker` on the service can trigger the service to run.

While deploying applications that serve requests from the public internet, I have used the `—allow-unauthenticated` flag while deploying services using `gcloud` CLI, which assigns the `roles/run.invoker` role to the `allUsers` principal, and then have an authentication middle-ware layered in the application code.
