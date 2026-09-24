# Software composition analysis waivers

CI fails on dependency vulnerabilities reported by `npm audit`, `pip-audit`, or
OSV-Scanner. Fix the affected dependency and regenerate the relevant lockfile
when a safe upgrade is available. If a finding cannot be fixed before merge,
record a narrowly scoped waiver in the same pull request that introduces or
retains the affected dependency.

Every waiver must include:

- a unique waiver ID and the scanner advisory URL or ID;
- the exact package, affected version, and lockfile or requirements path;
- the owning person and a short impact/exploitability assessment tied to this
  repository's actual use of the package;
- a concrete mitigation or reason no mitigation is available;
- an expiry date and the command/date for the next recheck; and
- approval from the code owners required for that dependency surface.

Do not add scanner-wide ignores, suppress an advisory without a matching
waiver, or extend an expired waiver silently. Remove the waiver in the same
change that upgrades or removes the affected package. No waiver is active as of
this file's creation.

## Waiver record template

```text
ID:
Advisory:
Package and affected version:
Manifest/lockfile:
Owner:
Impact and exploitability:
Mitigation:
Expiry:
Recheck command and date:
Required code-owner approvals:
```
