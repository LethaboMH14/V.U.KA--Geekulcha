# VUKA — User Journey Story

**One incident. One clock. Three pairs of hands.**

> Criterion 4 asks whether the solution *shows easy flow of use* and *satisfies the needs of the end-user*. The mistake most platforms make here is presenting three personas and no single path. This document presents **one continuous thread**, then three shorter journeys that reuse the same machinery.

---

# JOURNEY 1 · The primary thread — Nomsa

**19:41, Tuesday. The N1 north of Johannesburg. Nomsa is driving home from a late shift.**

| Time | What happens | What she does | What the system does | Layer |
|---|---|---|---|---|
| **19:41:02** | Her phone loses its Bluetooth pairing with the car while the car is still moving | **Nothing. She touches nothing.** | Vehicle-link channel flips to `lost`. Motion channel reports vehicle-class movement continuing. Acoustic channel picks up raised voices | VIGIL |
| **19:41:03** | Three physically independent channels are fused | — | `posterior = σ(prior + Σ wᵢ·logit(pᵢ))`. Context prior lifts it: dark, load-shedding stage 4, a road with history. **Conflict coefficient K stays low — the channels agree** | VIGIL |
| **19:41:04** | Threshold crossed | — | State moves to **L2**. If K had been high, this would have been suppressed and routed to verification instead | VIGIL |
| **19:42:10** | Her Guardian's phone lights up | She sees a countdown on her own screen. **She can still stop this** | Signed duress event queued. Nothing has been sent to police | VIGIL |
| **19:42:40** | Countdown expires uncancelled | — | Event relayed. **Measured p95: 318 ms from detection to render** | VIGIL → UMOJA |
| **19:43:15** | An operator opens the queue | — | Entity marked **`watch_candidate`** — and the state column is **visibly locked there.** No code path can take it further | UMOJA |
| **19:44:02** | The operator reviews and dismisses | — | She drove into a parking garage; the pairing dropped on the ramp. **False positive, caught by a human.** `action: verify_dismiss, actor: op_A41` written to the chain | UMOJA |
| **20:00:00** | Hourly batch | — | Merkle root over the batch → published. **32 bytes** | ANCHOR |
| **Any time after** | Nomsa asks what happened | Opens *My Record* | Full history returned with the anchor proof. She can verify the dismissal occurred at 19:44 and has not been altered — **and so can a regulator** | ANCHOR |

### Why this is the story we lead with

**The climax is step seven: the system decided *not* to accuse someone.** And step eight made that decision permanent.

For a panel co-hosted by a government innovation body and wary of surveillance technology, a machine that visibly declines to act — and then publishes the record of declining, where it cannot reach it — is more persuasive than any detection accuracy figure.

**Twenty minutes. One person. Every distinctive component of the system, in sequence.**

---

# JOURNEY 2 · The founding case — coercion

**22:40. A man is followed home and stopped at his own gate. This is why the product exists.**

| Time | What happens | What he does | What the system does |
|---|---|---|---|
| 22:40 | Two men at the gate. One has a weapon. "Unlock your phone." | He complies. **There is no other option** | — |
| 22:41 | He types the **duress PIN** | It unlocks. Same animation, same latency, same home screen. **He shows them the phone** | Duress event signed and queued. **No banner, no vibration, no visible network activity.** Nothing an attacker could inspect |
| 22:41 | — | — | Guardians alerted. Property appliance receives the duress broadcast and begins recording. Neighbouring cameras on the street note the vehicle |
| 22:43 | They walk him toward the house, telling him to open the banking app | He opens it | — |
| 22:44 | A transfer leaves the account | — | The transaction succeeds. **The bank's records show a correctly authenticated, correctly authorised instruction** |
| 23:00 | Hourly batch | — | The duress event from **22:41** is published in the root |
| Three days later | He disputes the transfer | Submits his record | **The anchored duress signal predates the transfer by three minutes, and was published before anyone knew there would be a dispute** |

### The point

Today his only evidence is his own word, against an institution holding an authenticated log. **Precedence is what changes that** — not immutability, which any database can approximate internally, but proof that the record existed *before there was a reason to construct it*.

> This is the journey that makes the blockchain load-bearing rather than decorative. Remove the anchor and he is back to his word against theirs.

---

# JOURNEY 3 · The property — a child home alone

**14:20 on a school afternoon. A single mother is at work. Her daughter is home.**

| Time | Event | System behaviour |
|---|---|---|
| 14:20 | Away mode is armed. The dog is in the yard | KHAYA classifies the dog as **animal**. No alert. *A conventional PIR mounted high enough to ignore the dog is also high enough for a person to crawl under — and cannot tell them apart anyway* |
| 15:05 | Someone puts a hand on the wall and drops into the yard, staying low | Classified **person**. Height and posture are irrelevant to a classifier — crawling does not help |
| 15:05 | — | **Floodlight and siren fire as a deterrent.** Not to catch anyone — to make them leave. A recorded voice: *"You are being recorded"* — which is true regardless of what follows |
| 15:05 | Mother's phone alerts, with live feed | She sees her yard. She has a visible cancel control if this is the gardener |
| 15:06 | She confirms | Security company notified. **A human authorised the escalation.** Their dispatch acknowledgement is signed with *their* key |
| 15:23 | Response arrives, scans on site | Arrival attested with their own signature |
| 16:00 | Batch published | Detection 15:05, deterrent 15:05, dispatch 15:06, on-scene 15:23 — **all in the same root, hours before anybody could dispute the timings** |

**Both parties are protected.** If the response actually took seventeen minutes, that is now provable — and so is a six-minute response on the night a customer insists it was twenty. **That symmetry is why a security company wants to participate rather than being made to.**

---

# JOURNEY 4 · The one that wins the room — Musa

**A delivery driver, and the journey nobody else in this hackathon will show.**

| Day | Event | System behaviour |
|---|---|---|
| Days 1–11 | Musa drives a delivery route through a suburb with eight cameras. Seen four times, across two cameras | Recurrence factor F1 fires: ≥3 sightings, ≥2 cameras, ≤14 days, **not whitelisted** |
| Day 11, 16:04 | — | State → **`watch_candidate`**. This is the machine's ceiling. There is no path to `flagged` |
| Day 11, 16:22 | An operator reviews | Recognises a delivery pattern. **Dismisses, and adds to the street whitelist.** Because whitelisting makes an entity permanently invisible to the suspicion engine, this action **requires a second signature** |
| Day 11, 17:00 | Batch published | Both signatures and the dismissal anchored |
| Any time after | Musa asks | `GET /v1/subjects/{id}/record` → *proposed 16:04 (factor F1: 4 sightings / 2 cameras / 11 days) · **dismissed 16:22 by op_A41** · whitelisted (co-signed) · anchored 17:00, root 7f3a…c19* |

### What happens today, in every commercial camera network

Musa never learns any of it occurred. There is no record he can inspect, no proof he was cleared, and nothing preventing a different operator flagging him again next month from the identical pattern. **He is permanently one shift away from being a suspect, and he will never know why.**

### What happens with VUKA

He can hold his file. And if a future operator flags him from the same pattern, **the system's own published history testifies against them.**

Three things this single journey delivers:

1. **POPIA subject access, made real** — the obligation our own ADR-0006 records as undischarged
2. **The anti-surveillance claim as a mechanism, not a value.** Others can *say* they have oversight. We can hand a man his file
3. **An answer to "who watches the watchers": anyone. Including the person we almost accused**

---

# The four journeys share one machine

| Component | J1 Nomsa | J2 Coercion | J3 Property | J4 Musa |
|---|---|---|---|---|
| Multi-channel fusion | ✅ | ✅ | ✅ | — |
| Conflict gate | ✅ | — | ✅ | — |
| Duress credential | — | ✅ | — | — |
| Person-vs-animal classification | — | — | ✅ | ✅ |
| Whitelist-before-watchlist | — | — | ✅ | ✅ |
| **Human verification gate** | ✅ | ✅ | ✅ | ✅ |
| Cancel window | ✅ | ✅ | ✅ | — |
| Multi-party signed attestation | — | ✅ | ✅ | ✅ |
| Two-signature control | — | — | — | ✅ |
| Public anchor | ✅ | ✅ | ✅ | ✅ |
| Subject access | ✅ | ✅ | — | ✅ |

**No journey needs a feature the others don't.** One system, four uses — which is the actual test of whether an architecture is right.

---

# The line to end on

> Every one of these four journeys passes through a human being who can say no, and every one of them ends with a record we cannot go back and edit.
>
> **You are not alone. You don't have to ask.**
