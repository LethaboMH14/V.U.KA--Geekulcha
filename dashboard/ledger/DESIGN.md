# VUKA Ledger: design direction (redesign, 26 Sep)

**Audit verdict:** the first version reads as template output. It had a slogan hero, six identical shadowed cards, glowing blob gradients, a pill on every element, numbered step circles and a trendy display face. That is wrong for a tool a bank or insurer must trust.

**Direction:** an audit instrument in the family of HashScan, Etherscan and Stripe's dashboard. It is calm, dense, precise and flat. Data and actions come first; explanation comes after.

## Tokens (the only colours allowed; define in `ledger.css` `:root`, redefine for dark)
Light:
- `--bg`: `#F7F7F5`
- `--surface`: `#FFFFFF`
- `--sunken`: `#F1F1EE`
- `--rule`: `#E3E3DF`
- `--rule-strong`: `#CFCFCA`
- `--text`: `#16181D`
- `--muted`: `#5E636B`
- `--faint`: `#8A8F96`
- `--accent`: `#1D4ED8`. Links, primary button and focus only. `--accent-ink` is `#1E3A8A`.
- **Status (text plus a 6px dot, never a filled pill):**
  - `--ok` `#15803D`
  - `--warn` `#B45309`
  - `--fail` `#B91C1C`
  - `--idle` `#6B7280`

Dark:
- `--bg`: `#0B0D10`
- `--surface`: `#111418`
- `--sunken`: `#0E1114`
- `--rule`: `#23272E`
- `--rule-strong`: `#2F343C`
- `--text`: `#E8EAED`
- `--muted`: `#A1A7B0`
- `--faint`: `#6E7580`
- `--accent`: `#6EA0FF`; `--accent-ink` `#9DBCFF`.
- Status: `--ok` `#4ADE80`, `--warn` `#FBBF24`, `--fail` `#F87171`, `--idle` `#9CA3AF`.

The terminal keeps its own dark surface in both themes.

## Type
IBM Plex Sans (400, 500, 600) and IBM Plex Mono (400, 500) only, from Google Fonts with system fallbacks. Drop Bricolage Grotesque.

Scale:
- page title 28/34 600;
- section title 18/26 600;
- body 15/24;
- table 14/20;
- labels 12/16 500, sentence case (no letter-spaced uppercase eyebrows);
- mono 13/20 with tabular numerals.

## Shape and space
- 6px radius on inputs, buttons and the terminal only; tables and sections have none.
- No shadows. No gradients, blobs or glass.
- 1px hairline rules separate things. A surface panel with one rule is allowed for the verify input and the result.
- Spacing on a 4px grid: 8, 12, 16, 24, 32, 48.
- Max content width 1200px.

## Layout
- **Header:** a 56px bar holding the wordmark (a small key glyph plus "VUKA Ledger" 600), the network as plain text with a dot ("Hedera testnet"), and tabs underlined when active (Ledger · Verify · Method · Settings). On the right is a compact search/verify field: "Paste a record, or a 64-hex fingerprint". Enter goes to Verify, with the record or hash prefilled.
- **Ledger:**
  1. The title "Public ledger" with a one-line subtitle naming the topic and the network.
  2. A **system status line**: three inline items, each a dot plus a name plus a short state ("Azure API · unreachable"). Details go in a disclosure, not cards.
  3. A **key facts strip**: a 4-column definition list with vertical hairlines. The columns are Topic (linked), Latest root (seq and time), Key manifest (short hash and a pinned/unverified dot), and Network epoch.
  4. **"Topic messages"**: an explorer table with columns Seq · Type (Root/Manifest in plain text) · Payload (mono, shortened, copy) · Consensus time (UTC) · Links (HashScan ↗, Mirror ↗). When empty, a single quiet row explains why.
  5. **"Live events"**: a table (Subject · Index · Event hash · Received · Kind) with a small events-per-minute bar chart above it, in the same column. The chart has a thin baseline, bars in `--accent` at 70%, and one label for the newest value.
- **Verify:**
  - The title "Verify a record" and one sentence on where the record comes from.
  - A two-column grid: on the left, the input panel (drop area plus paste box, "Verify" primary, "Clear" secondary); on the right, the terminal.
  - The four steps become one plain sentence line under the title ("Member shares from VIGIL → you paste it here → your browser recomputes and checks Hedera → you file the fingerprint"). Drop the numbered circles.
  - **The result:** a full-width panel with a status line (dot plus "Live-verified" / "Unavailable" / "Failed at entry 6") and then a **definition table**: Merkle root, Chain head, Entries, Topic, Sequence, Consensus time, Running hash, Network, Key manifest, Checked at. It has a "Copy fingerprint" button.
- **Method** (was "How it works"):
  - Keep the SVG diagram, restyled to hairlines and flat fills with no rounded blobs. Arrows are 1.5px, labels 12px Plex Sans.
  - The formulas become a 3-column table: Step · Definition (mono) · What it guarantees.
  - "Proves / does not prove" becomes two plain lists side by side.
  - "Duress stays private" becomes a short note with a left rule.
- **Settings:** a plain form: labels above fields, one primary button.

## Copy
- Sentence case everywhere.
- No slogans.
- Plain error text: "Azure API: can't connect (network or CORS). Details". The raw error goes in the disclosure.
- Labels name what people recognise: "Record fingerprint (Merkle root)", not "0x01 payload".

## Don'ts
Pills, eyebrows, emoji, drop shadows, blobs, numbered circles, centred text blocks, cards in a grid of equal boxes.
