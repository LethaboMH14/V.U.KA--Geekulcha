# VUKA Ledger: product audit and information architecture (26 Sep)

This is a product-manager and product-design pass over the live ledger, which is currently one long page.

## Who comes here, and why (jobs to be done)

| Visitor | Arrives from | Job | Must get in under a minute |
|---|---|---|---|
| **Bank or insurer investigator** (primary) | A record a member sent them, plus our link | "Is this record genuine, and what do I file?" | Verify → a clear verdict → the fingerprint to keep |
| **Member** | VIGIL → Settings → My record → Share | "Show that my record is anchored" | The same verify flow, or a single link to send on |
| **Judge, partner or journalist** | The pitch, a QR code or the README | "What is this, and why should I trust it?" | A plain explanation, live proof that it runs, and the method |
| **Team operator** | Bookmark | "Is anchoring healthy right now?" | The status of Azure, the feed and the mirror, the latest root, and live activity |

## What was wrong

1. **There was no front door.** The first screen was an operator's status panel, with errors in red when a source was down. An investigator or a judge landed in the middle of the machine.
2. **Everything sat on one scrolling page.** Ledger, Verify, Method and Settings were stacked, and the tabs were only scroll anchors. A person on Verify scrolled past raw status and tables.
3. **The primary job wasn't primary.** Verify was the second section, and Settings (an advanced, rarely used control) had equal weight in the menu.
4. **The copy spoke the system's language** ("0x02 manifest", "/ws/panel") before saying anything a person recognises.

## The structure now

```
/V.U.KA--Geekulcha/                      → redirects to the home page
/V.U.KA--Geekulcha/dashboard/            HOME (landing page, marketing-light, in the same design system)
/V.U.KA--Geekulcha/dashboard/ledger/     THE APP (keeps this URL: VIGIL's share dialog links to …/ledger/#verify)
```

### Home: `dashboard/index.html`

- **Top bar:** the wordmark, then "How it works", "For banks and insurers", "Security", then the primary button **Open the ledger** (→ `ledger/#overview`).
- **Hero:**
  - One plain claim: *"Check a safety record without trusting us."*
  - One sentence on what VUKA does: VIGIL records check-ins on the member's phone, the records are signed and chained, and a fingerprint goes onto Hedera every minute.
  - Primary CTA **Verify a record** (→ `ledger/#verify`); secondary **See the live ledger** (→ `ledger/#overview`).
  - Beside it: a **live proof strip**, read from the mirror in the browser: topic `0.0.10687280`, latest root sequence and age, and whether the key manifest is pinned. Each item shows real data or states plainly that it's unavailable, never a mock.
- **How it works:** three steps, in a real order:
  1. Recorded on the phone.
  2. Fingerprinted on Hedera.
  3. Checked by anyone.

  Each step is one sentence, with the small diagram from the Method view.
- **For banks and insurers:**
  - What they receive: a record the member chooses to share.
  - What they do: open Verify, then drop the file.
  - What they file: the fingerprint (root, head, topic, sequence and consensus time).
  - What it proves and what it doesn't, in the Method view's own words.
- **Privacy and duress:** three sentences. Duress stays inside a signed commitment, the public ledger shows only one root per minute, and nothing personal goes on-chain.
- **Security:** links to the security scorecard (`security.html`), the source on GitHub and the Method view.
- **Footer:** testnet disclosure, "sim_ subjects are SIMULATED", GitHub source, and the licence for the fonts.
- No stock photos, no invented numbers or testimonials, no "trusted by" logos.

### App: `dashboard/ledger/index.html`

- **A hash router:** one view is shown at a time, with the others `hidden`. The URL hash names the view, so Back and Forward work and deep links keep working (`#verify` is load-bearing). Unknown hashes go to `#overview`. The existing `#ledger` maps to `#overview`, and `#how` and `#method` both map to Method.
- **Menu** (in job order):
  - **Overview**: source status, latest root, pinned manifest, topic facts, and a compact "Recent anchors" list (5 rows) with "View all".
  - **Verify**: the primary job, marked as the main action in the menu.
  - **Anchors**: the full topic-messages table.
  - **Activity**: the live `/ws/panel` feed and the events-per-minute chart.
  - **Method**: the diagram, formulas, proves / doesn't prove, and duress.
  - **Settings**: moves out of the main menu to a gear icon button at the right of the top bar. It is advanced and rarely used.
- **Top bar:**
  - The wordmark links to Home. A small "← Home" is shown on phones.
  - The menu becomes a horizontal scroll strip on phones.
  - The paste field stays, and Enter goes to Verify.
  - The network status chip stays.
- **Behaviour:**
  - Each view sets `document.title` ("Verify: VUKA Ledger").
  - Focus moves to the view's heading on route change, for keyboard and screen-reader users.
  - The scroll position resets to the top.
  - Live connections run once for the whole app, not per view.
- **Empty and error states:**
  - Overview shows one summary notice when sources fail, with Details for the raw errors.
  - Other views never repeat that notice. Each shows its own empty state instead ("No anchors yet on this topic", "No live events yet").

## Success looks like

- An investigator reaches a verdict in three actions or fewer: open the link, drop the file, read the verdict.
- A judge understands what VUKA does from the hero alone, and can click once to see live proof.
- No view shows anything that isn't live or plainly labelled.
