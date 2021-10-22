---
title: Debugging Flaky Tests
description: Strategies for maintaining reliability of automated test suites
summary: |
  When engineers encounter intermittent test failures the common response is to
  just rerun the failed steps and move on.  Over time this strategy erodes confidence in the
  automation and makes delivery pipelines slower.

  We can reverse this trend by applying production error handling patterns to our test tooling:

  1. Send test failures to an error reporting tool like Sentry.

  2. Use distributed tracing techniques to correlate test failures with application logs.

  Treating automated test failures like production errors enables engineers to
  easily dig into error traces and record results from investigations of flaky
  tests.

permalink: posts/debugging-flaky-tests/index.html
date: 2021-10-26
author: nathan
img:
  url: https://live.staticflickr.com/5448/9984565853_d24bd6657a_3k.jpg
  license: CC BY 2.0
  credit:
    name: Siaron James
    url: https://www.flickr.com/photos/59489479@N08/
tags: [ "Testing", "Continuous Delivery" ]
layout: post
---

Flaky tests are unreliable tests which fail intermittently when run repeatedly
even when no code changes are made. They are hard to reproduce and thus
difficult to debug. They have a tendency to degrade the effectiveness of our
test automation over time. This post describes some strategies for dealing with
flaky tests.

This article is written from the context of using Cucumber JS to perform
functional testing of HTTP APIs.  The patterns are also applicable to other
languages and other functional testing tools such as Cypress, Cucumber JVM or
Specflow. The patterns here are generally not applicable to unit testing,
however.


### What makes flaky tests so bad?

Flaky tests tend to accumulate in our tests suites because we often don't
notice them until long after they were written. When this happens, valuable
context about what might have caused them has been lost.  When we encounter
flaky tests we are often engaged in other unrelated work.  The intermittent
unexpected failing test becomes a nuisance which results in us often just
rerunning the test suite and moving on without solving the underlying issue.

The presence of flaky tests causes us to distrust our test automation and slow
our delivery pipelines as we learn to rerun failing pipeline steps and
wait for the next green build.


### What can we do about flaky tests?

There are a few simple things we can do to help keep flaky tests under control:

1. Understand common causes for unreliable tests.
2. Track failing tests over many runs with an error reporting tool.
3. Use distributed tracing to correlate tests with application logs.

Each of these are discussed below.


## Common Causes for Flakiness

There are many causes for test flakiness. Some of the common ones are described
below along with hints on how to avoid them.


### Missing retry

When testing side effects from asynchronous processes there is often some
non-deterministic amount of time before the expected state change can be
observed.  Tests should retry the necessary interaction until the desired
assertion passes. The [Retry Assert][] library helps to simplify this type of
retry logic.


### Random test data

Functional tests often need to generate test data that avoids collisions.
Sometimes we get unlucky and generate random values that collide. It might help
to increase the address space or use a sequence instead of (or in addition to)
the random value.

### Missing await

This issue is not uncommon when testing with JavaScript; a step performs an
asynchronous operation such as calling an API but does not wait for the promise
to resolve.  Using `await` within `Array.forEach()` can also trigger this
issue. A `for` loop or `Promise.all()` should be preferred.  Turning on the
[Require Await][] linting rule can sometimes help to spot this issue earlier.


### Conflicting stubbing

Functional test suites should define mocks of remote dependencies using a tool
like [Wiremock][] to make tests fast and deterministic. If mocks are defined
too broadly then they can inadvertently match on unrelated requests. In such
cases the flakiness might depend on the scenario execution order and might not
be noticed until scenario execution order changes at a much later date.

Mocks should be defined so they match only for the interactions triggered by
the related scenario. For example, instead of just matching on "POST
/some/resource", the stub should also try to match on some header or body
attribute that is unique to the scenario. The [Mock Commander][] library helps
to make targeted stubbing like this easier.

As a last resort, if the stubbed endpoint does not receive enough information
to discriminate between invocation from two different scenarios, then a unique
scenario trace id can be forwarded to the remote endpoint and matched by the
stub.


### Inaccurate date comparison

When a test asserts on a date value that comes back from the application under
test (like a creation or expiry date) it needs to tolerate some
non-deterministic amount of delay. Some naive solutions to this problem may
introduce flakiness around edge cases such as when the test runs close to the
start of a new minute, hour, or day etc.  For this reason we have created
[Jest Date Matchers][] to make it easy to assert on ISO-8601 date strings with a
configurable threshold.


### Production bugs

Finally, there might actually be a real bug that is being intermittently
triggered by the test suite. The intermittent nature of the failure might be
due to race conditions when testing multiple API calls, over reliance on random
test data or some other non-deterministic variable such as the server time or a
missing `await` in production code.  If possible, the test suite should be
changed to reliably reproduce the failure before fixing the underlying bug.


## Tracking failing tests across runs

Investigation of flaky tests can take many attempts over a long period of time
before the root cause is finally discovered. It is invaluable to have a shared
record that includes details about occurrences of failures as well as any
learnings that have been made along the way.

The flaky test record could start out as a document that is updated manually
when flaky tests are encountered but, to get a reliable record, the failure
details should be automatically sent to an external tool.  Which tool to use is
a subjective choice that will depend on the preferences of the team. For
example, it may be a documentation tool, a test case management tool, a bug
tracker or an error reporting tool.


### Capturing Cucumber scenario failures

In Cucumber we can use an [After hook][] to capture details about each failed
scenario.

```javascript
// features/support/index.js
cucumber.After(function(scenario) {
  if (scenario.result.status == 'failed') {
    captureFailedScenario(scenario);
  }
});
```

### Sending scenario failures to Sentry

[Sentry][] is an error reporting tool that helps engineering teams to monitor and
diagnose issues with deployed software. The nature of flaky tests - being
intermittent and long lived - makes them well-suited to being tracked by
Sentry.

To send a failed Cucumber scenario to Sentry we basically just need to pass
`scenario.result.exception` to `Sentry.captureException()`. There's a few other
things we should do to enhance the Sentry event though:

1. Provide plenty of additional information to help identify the context for the
   failure such as the source file, git commit, git branch and build number.
2. Use the scenario name as the "fingerprint" so that all failures for the same
   scenario are treated as the same issue (and similar errors for different
   scenarios are treated as distinct issues).
3. Set the error name with a sensible static prefix to make them searchable and
   easy to identify.

The following function demonstrates sending a failed Cucumber scenario to Sentry:

```javascript
function captureFailedScenario(scenario) {
  const scenarioName = scenario.pickle.name;
  const error = scenario.result.exception;
  Sentry.withScope(function(scope) {
    scope.setContext('cucumber', { scenarioName, src: scenario.sourceLocation.uri });
    scope.setContext('source', { gitBranch, gitCommit, buildNumber });
    scope.setTag('branch', gitBranch);
    scope.setFingerprint([ scenarioName ]);
    Sentry.captureException(VError({
      name: `Cucumber / Failed Scenario / ${scenarioName}`,
      cause: error,
    }));
  });
}
```

## Correlating tests with application logs

When a test scenario fails, our testing tool should give us some
context about the unexpected result. Hopefully we get enough information to
immediately identify the cause of the failure but often this is not the case,
especially when dealing with flaky tests.

If the test runner log does not contain enough information to diagnose the
failure then the next port of call is the application logs. Unfortunately, when
dealing with intermittent test failures, the relevant log entries will
probably be lost in a sea of similar and unrelated log entries.

To make the application logs searchable we need to apply distributed tracing
techniques when running our test suite. One way to achieve this is to include
the test name in an HTTP tracing header and make sure it is logged by the
application server.


### Sending a scenario trace header

The test suite can use a custom HTTP client abstraction to ensure a trace
header is included for every request to the application under test.  In the
example below, the "AppClient" instance, and its traceId, will be scoped to the
test scenario. The AppClient will ensure the `traceId` attribute is included
in an HTTP header (eg `X-Trace-Id`) for every request.

```javascript
// features/support/index.js
cucumber.Before(function(scenario){
  this.appClient = new AppClient({
    traceId: scenario.pickle.name,
  });
});
```

If the application's web server is configured to log this header for all
requests then it will now be possible to identify which logs relate to a
specific test.


### Accessing ephemeral test logs

Sometimes the intermittent failure has occurred during a CI pipeline step. In
these cases we need to be able to get access to the application logs from the
CI environment.

If Docker Compose is used to stand up an ephemeral instance of an application
within the CI environment then we may also need to run `docker compose logs` to
export the application logs. The following bash script runs a test suite with
Docker Compose and captures all logs:

```bash
#!/bin/bash
set -euo pipefail
docker compose run cucumber | tee cucumber.log || failed=yes
docker compose logs --no-color > docker-compose.log
[[ -z "${failed:-}" ]] || exit 1
```

If our pipeline runner captures these log files as artifacts then we will be
able to investigate test failures even when we cannot reproduce them locally.


## Summary

Flaky tests are inevitable. When too many flaky tests creep into a test suite
they undermine the value of the automation.

Keeping flaky tests under control requires conscious effort from the software
delivery team.  Linking application logs to test scenarios and tracking
recurring failures are two simple enhancements to test tooling that aids this
effort.


[After hook]: https://cucumber.io/docs/cucumber/api/#hooks
[Require Await]: https://eslint.org/docs/rules/require-await
[Wiremock]: http://wiremock.org/
[Mock Commander]: https://www.npmjs.com/package/mock-cmdr
[Retry Assert]: https://www.npmjs.com/package/retry-assert
[Jest Date Matchers]: https://www.npmjs.com/package/@centrapay/jest-date-matchers
[Sentry]: https://www.sentry.io/
