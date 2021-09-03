---
title: Testing in Production
description: Why and how to focus testing efforts on your production environment
date: 2021-09-04
author: nathan
tags: [ "Testing", "Continuous Delivery" ]
layout: post
---


Ref charity majors: [https://increment.com/testing/i-test-in-production/]()

There are cowboys, there are the mainstream, and there are the enlightened.

* Feature Toggles
* Design for Testability
* Automated Testing (Pre + Post Deploy)


## Feature toggles

* forked logic, old vs new [http://sevangelatos.com/john-carmack-on-parallel-implementations/]()

* Frontend (80% of toggles):
  * local storage
  * config dashboard

* Backend (20% of toggles):
  - often not required due to backwards compatibility of APIs
  - opt-in via api param
  - hard-coded list of trusted beta members (user ids, resource ids)
  - eg: new permissionnew caching, new read index, new email templates,

* beta user groups management

## Automated Testing (Pre + Post Deploy)

## Design for testability
