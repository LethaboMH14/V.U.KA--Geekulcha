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
change that upgrades or removes the affected package. No waiver was active when this file was created.
Active waivers are listed under **Active waivers** below.

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

## Active waivers

```text
ID: SCA-W1
Advisory: GHSA-5p2g-fcmc-qvqq (image-size: JXL and HEIF parsers, infinite loop, DoS, CVSS 8.7);
          GHSA-w3rx-r6r6-pgpr (image-size: ICNS parser, infinite loop, DoS, CVSS 8.7).
          Both published 2026-06-10; OSV lists no fixed version.
Package and affected version: image-size 1.2.1 (via metro 0.80.12 <- @react-native/metro-config 0.74.87)
Manifest/lockfile: app/package-lock.json
Owner: Vukosi (app build), with the security lead
Impact and exploitability: Build-time only. Metro calls image-size to read the dimensions of image
  assets that are bundled from this repository. It is not in the shipped APK and never parses
  user-supplied or network images. Exploiting it needs a malicious JXL, HEIF or ICNS file committed
  to app/ and then bundled, which makes a build hang (a denial of service on our own build machine).
  There is no confidentiality or integrity impact on users.
Mitigation: app/ ships no JXL, HEIF or ICNS assets. Review assets that enter app/ in the PR, as for
  any code. The advisory IDs are ignored only for app/ (app/osv-scanner.toml) and only until the
  expiry below. The companion finding, GHSA-gh4j-gqv2-49f6 (fast-xml-parser 4.5.7), is FIXED, not
  waived: an npm override pins fast-xml-parser ^5.7.0; `react-native config` and a signed
  assembleRelease were verified after the change (24 Sep 2026).
Expiry: 2026-10-31
Recheck command and date: `osv-scanner scan source --recursive .` on each release, and at the expiry;
  upgrade metro when a fixed image-size is published.
Required code-owner approvals: Vukosi or Mutarisi (app), and the security lead (Ipeleng)
```

```text
ID: SCA-W2
Advisory: GHSA-vfj7-8cjw-p6xm (braces 3.0.3, CVSS 8.7);
          GHSA-86w9-cpqp-85rv (node-forge 1.4.0, CVSS 8.7);
          GHSA-hp3w-g68c-fv3c (sprintf-js 1.1.3, CVSS 6.9).
          OSV-Scanner v2.6.0 reports no fixed version for any of the three on 14 Oct 2026, and each
          is already the newest published release.
Package and affected version: braces 3.0.3 (via babel-jest > @jest/transform > micromatch 4.0.8);
          node-forge 1.4.0 (via react-native > @react-native/community-cli-plugin > @react-native/dev-middleware > selfsigned 2.4.1);
          sprintf-js 1.1.3 (via metro-config > cosmiconfig 5.2.1 > js-yaml 3.15.2 > argparse 1.0.10).
Manifest/lockfile: app/package-lock.json
Owner: Lethabo and Sibusiso (the two leads)
Impact and exploitability: The dependency paths above were read with `npm ls --all` in app/. All
  three packages are reached only through test or build tooling (the Jest transformer, Metro's
  development server and Metro's config loader). None is imported by VIGIL's own code, and none is
  bundled into the APK. The three advisory texts could NOT be read when this waiver was written
  (osv.dev was unreachable from the authoring environment), so the exploitability claim rests on
  the dependency paths, not on the advisories. THE APPROVERS MUST READ THE THREE ADVISORIES
  BEFORE APPROVING THIS WAIVER.
Mitigation: Each package processes input from this repository's own files on a developer or CI
  machine; none processes network or user input in the shipped app. The IDs are ignored only for
  app/ (app/osv-scanner.toml) and only until the expiry below. Run the Metro development server
  only on trusted networks.
Expiry: 2026-11-15
Recheck command and date: `osv-scanner scan source --recursive .` on each release and at the
  expiry; upgrade braces, node-forge or sprintf-js (or the packages that pull them in) as soon as
  a fixed version exists.
Required code-owner approvals: Lethabo and Sibusiso (both leads)
```
