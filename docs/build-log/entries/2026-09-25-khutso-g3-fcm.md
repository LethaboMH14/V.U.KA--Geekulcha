# G3 guardian delivery — FCM adapter (assistant execution for Khutso)

## Research

Inspected the proposed server outbox and guardian notifier on the stacked
Slice-3 branch. The existing adapter was simulated-only; no FCM transport,
token store, or SMS provider contract existed.

## Real data/references

- `server/outbox.py`: stable outbox idempotency key and at-least-once retry.
- `server/guardian_worker.py`: shared `GuardianNotifier` protocol and delivery
  evidence gate.
- Firebase HTTP v1 message shape: Android `priority=HIGH` and `collapse_key`.

## Business reasoning

The minimal useful path is a visible, privacy-preserving push alert. A retry
must not produce an uncontrolled notification storm, so the collapse key is a
stable digest of the outbox idempotency key. SMS remains explicitly push-only
until a South African provider trial and business verification are complete.

## Changed

- Added `server/src/notify/fcm.py` with secret-safe HTTP v1 sender and message
  builder.
- Added `server/src/notify/sms.py` as an HTTPS-only, provider-neutral fallback
  boundary; no provider is represented as live.
- Added PostgreSQL-backed FCM token/receipt tables and `FcmGuardianNotifier`.
- Added deterministic contract tests.

## Evidence and four-gate critique

- FACT: the message contains a visible notification payload and both Android
  high-priority settings; tests assert this.
- FACT: the outbox key is carried in the data payload and deterministically
  derives the collapse key; tests assert this.
- ASSUMPTION: App Service will provide a short-lived `FCM_ACCESS_TOKEN`; no
  credential is committed or claimed to exist.
- PROPOSED: an enrollment/admin path must populate `guardian_fcm_tokens`.
- NOT YET PROVEN: a deployed device received an FCM message, SMS delivery, or
  the Friday acceptance screenshot.

Fraud/safety: no bearer or device token enters request payloads or logs; the
neutral body avoids exposing duress. Build-for-use: high-priority visible push
is explicit. Economic: FCM is the minimal path; SMS is not enabled by default.
Privacy: only an opaque registration token is stored and the notification body
contains no sensitive incident detail.

## Blockers and handoff

Create the Firebase project, configure a short-lived access-token mechanism and
one guardian-min registration token in App Service, then capture a redacted
delivery receipt/screenshot. Open the SA SMS trial separately; if verification
does not clear, report **push only** to Lethabo and Babatunde. Sibusiso must
review the notifier contract first, followed by Lethabo’s end-to-end review.
