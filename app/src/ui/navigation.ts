/** Destination for the member Record tab: real devices must pass the PIN gate. */
export function recordDestination(simulated: boolean): 'record' | 'recordPin' {
  return simulated ? 'record' : 'recordPin';
}
