import fs from 'node:fs';

const errors = [];
const event = JSON.parse(fs.readFileSync('contracts/events.schema.json', 'utf8'));
const required = new Set(event.required || []);
for (const key of ['event_id', 'event_type', 'tenant_id', 'source_time', 'received_time', 'payload', 'simulated']) {
  if (!required.has(key)) errors.push(`events.schema.json: required envelope field missing: ${key}`);
}
if (event.properties?.event_type?.enum?.length !== 5) errors.push('events.schema.json: expected five approved event types');
if (event.properties?.simulated?.type !== 'boolean') errors.push('events.schema.json: simulated must be boolean');
const openapi = fs.readFileSync('contracts/openapi.yaml', 'utf8');
for (const path of ['/v1/sightings:', '/v1/entities/{id}:', '/v1/entities/{id}/verify:', '/v1/risk:', '/v1/hotspots:', '/v1/safest-route:', '/v1/routes/patrol:', '/v1/evidence/integrity:', '/v1/anchor/latest:', '/v1/subjects/{id}/record:', '/v1/subjects/{id}/data:', '/ws/ops:', '/ws/member:']) {
  if (!openapi.includes(`  ${path}`)) errors.push(`openapi.yaml: required path missing: ${path}`);
}
for (const phrase of ['tenant_id', 'idempotency_key', 'X-Device-Signature', 'whitelist requires two distinct', 'must never receive operator events']) {
  if (!openapi.includes(phrase)) errors.push(`openapi.yaml: required rule missing: ${phrase}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Contract checks passed: event envelope, required paths and governance rules are present.');
