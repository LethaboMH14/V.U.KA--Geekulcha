import {createHash} from 'crypto';
import {canonicalJson} from '../../../../../shared/canonical.js';
import {RULESET_CANONICAL, RULESET_DIGEST} from '../ruleset';

it('RULESET_DIGEST is the SHA-256 of the canonical ruleset (update both together)', () => {
  const digest = createHash('sha256').update(canonicalJson(RULESET_CANONICAL), 'utf8').digest('hex');
  expect(RULESET_DIGEST).toBe(digest);
});
