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

---

## Reference system (26 Sep, supersedes the Tokens and Type sections above)

**References:**
- **Visual system:** IBM's **Carbon Design System**. Its tokens are read from the published packages: `@carbon/themes` 11.82.0 (g10 light, g100 dark, `buttonTokens`), `@carbon/type` and `@carbon/layout`. They live in `carbon.css`.
- **Fonts:** **IBM Plex Sans 1.1.0 and IBM Plex Mono 2.5.0**, self-hosted from `@ibm/plex-sans` and `@ibm/plex-mono` (SIL OFL 1.1, `fonts/OFL-IBM-Plex.txt`). The page no longer depends on Google Fonts.
- **Page layout:** block explorers that banks and auditors already know: **HashScan** (Hedera's explorer, the same network as ours) and **Etherscan**. Both use a summary key-value panel, then entity lists as dense tables, with hashes in monospace plus a copy control.
- **Scope:** Carbon's docs site and Mobbin weren't reachable from the build environment. So component geometry follows Carbon's published tokens and its well-known component conventions below, and exact values come from the packages.

**Components (Carbon conventions):**
- **UI shell header:**
  - 48px tall (`--size-lg`), g100 in both themes (`--shell-*`). Product name as "VUKA **Ledger**" in Plex Sans 14px.
  - Nav items are 48px tall, `--shell-muted` text, `--shell-hover` background on hover. The active item has a 3px bottom border in `--cds-interactive` with `--shell-text`.
  - The search field sits in the shell at 48px, with `--shell-hover` fill.
- **Buttons:**
  - Radius 0, `body-compact-01` (14px, 0.16px letter-spacing).
  - Sizes: `lg` 48px (the primary action), `md` 40px, `sm` 32px. Padding is 0 64px 0 16px for text buttons (Carbon's left-aligned label), or 0 16px for compact ones.
  - **Primary:** `--cds-button-primary`, hover `-hover`, active `-active`, text `--cds-text-on-color`.
  - **Secondary:** `--cds-button-secondary`.
  - **Tertiary:** 1px outline in `--cds-button-tertiary`, with a filled hover.
  - **Ghost:** transparent, `--cds-link-primary` text, `--cds-layer-hover-01` hover.
  - **Focus:** a 2px inset `--cds-focus` border plus a 1px inset `--cds-layer-01` ring.
- **Text input and textarea:**
  - Radius 0, background `--cds-field-01` on the page (or `--cds-layer-02` inside a tile).
  - 1px bottom border in `--cds-border-strong-01` and no other borders.
  - Height 40px; the label above is `label-01` (12px, 0.32px) in `--cds-text-secondary`; helper text is `helper-text-01` in `--cds-text-helper`.
  - Focus is a 2px outline `--cds-focus` (inset).
- **Data table:**
  - Header row on `--cds-layer-accent-01`, `heading-compact-01` (14px/600), 48px tall.
  - Body rows on `--cds-layer-01`, 48px tall, or 32px for the dense "Live events" and "Topic messages" lists.
  - Cell padding 16px. Rows are separated by a 1px `--cds-border-subtle-01` bottom border.
  - Row hover `--cds-layer-hover-01`. No zebra striping, no outer border, radius 0.
  - Toolbar above the table: the title in `heading-03` (20px/400) and actions on the right.
- **Structured list (key-value):**
  - Rows with a 1px `--cds-border-subtle-01` bottom border and a 16px vertical rhythm.
  - Label column in `--cds-text-secondary` 14px; value column in `code-02` (Plex Mono 14px) for hashes.
  - Use it for the latest-anchor facts and the fingerprint result.
- **Status indicator:** a shape icon plus a text label, never colour alone. Shapes are 16px SVGs:
  - success: filled circle with check, `--cds-support-success`;
  - error: filled circle with ×, `--cds-support-error`;
  - warning: filled triangle with !, `--cds-support-warning` (a dark glyph inside);
  - idle or unknown: hollow circle, `--cds-border-strong-01`.

  Label text stays `--cds-text-primary`.
- **Inline notification:**
  - A full-width bar on `--cds-layer-01` with a 3px left border in the status colour, plus the status icon.
  - Title in `heading-compact-01` and subtitle in `body-compact-01`.
  - Use it for "can't connect" source errors, the non-default-server warning and the verify verdict.
- **Code snippet:** a multi-line block on `--cds-layer-01` in `code-02`, with a 40px square copy button top-right that shows "Copied" feedback. Use it for the fingerprint's full hashes. The terminal keeps its own dark surface.
- **Tiles:** `--cds-layer-01`, no border, no shadow, radius 0, 16px padding. Only for grouped facts (the key-facts strip becomes a row of tiles separated by 1px gaps on `--cds-border-subtle-01`).
- **Grid:** max width 1584px, 32px gutters (Carbon 2x grid); 16px side margins at 400px.
- **Type:**
  - page title `heading-04`: 28px/400, line-height 1.2857;
  - section title `heading-03`: 20px/400;
  - sub-heading `heading-02`: 16px/600;
  - body `body-01`: 14px, 0.16px;
  - labels `label-01`;
  - hashes `code-02`.

  Carbon headings are regular weight (400), not bold, and Plex carries the voice.
