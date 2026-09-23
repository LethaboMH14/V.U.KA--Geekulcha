# P2.3 — discard-by-default embedding boundary

Status: proposed architecture for privacy review; implementation and ADR are pending.

Face embeddings are special personal information under the project’s POPIA analysis. The system must discard an embedding unless it matches an enrolled resident who has given explicit, documented consent for this purpose. A vector is still biometric information; storing it instead of an image does not create a lawful basis.

The processing boundary is:

1. Receive the transient sensor result in memory.
2. Compare it only against the consented enrolment set for the stated tenant and purpose.
3. Retain a match result and its consent reference only when the match is valid.
4. Discard every non-match immediately. Do not persist the embedding, raw image, or a recoverable derivative.

Any future exception requires a recorded ADR, Information Officer and privacy review, and the prior authorisation analysis required by POPIA s57. This note does not authorise an exception or claim that the boundary is implemented.

Acceptance evidence will be a test showing that a non-match leaves no embedding in the persistence boundary, alongside a consented-match test and an audit record that contains no biometric payload.
