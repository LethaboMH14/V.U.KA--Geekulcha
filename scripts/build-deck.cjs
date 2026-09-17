/* VUKA — submission deck v2
   Six mandated sections: Problem · Solution · TRL · Technological Architecture ·
   User Journey Story · Go-to-market.  Plus the Build-for-Use criteria:
   identified users, validated problem, security-by-design, sustainability, measurable impact.
   Numbers reconciled against 19-VUKA-System-Architecture.md and 20-VUKA-SDLC.md.
   Run:  node build_deck2.cjs "<out.pptx>"                                            */

const pptxgen = require('pptxgenjs');
const OUT = process.argv[2] || 'VUKA-Pitch-Deck-v2.pptx';

const P = {
  night: '0B1220', raise: '18243A', edge: '2A3950',
  amber: 'E9A23B', green: '2FBF87', red: 'E5484D',
  ice: 'F2F4F7', mute: '9AA5B1', white: 'FFFFFF',
  paper: 'FFFFFF', pdark: '0B1220', pmute: '5B6672', pedge: 'DDE2E8', ptint: 'F4F6F9',
  // layer identity — same four colours as the document set
  vigil: '2F7AD6', umoja: '21B573', khaya: 'EA6A25', anchor: '4B32A8',
  vigilL: '6BA6EE', umojaL: '4FD69B', khayaL: 'F58A4E', anchorL: '9B85F0',
  dgreen: '1A8A61', dred: 'B02328', damber: 'A9741C',
};
const F = { h: 'Cambria', b: 'Calibri', m: 'Consolas' };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Team Sonar';
pres.company = 'VUKA';
pres.title = 'VUKA — Community safety you can verify';
pres.subject = 'Geekulcha Annual Hackathon 2026 · Blockchain for Impact Use · Safety';

const W = 13.3, H = 7.5, M = 0.6;

/* ---------------- helpers ---------------- */
function dark(s) { s.background = { color: P.night }; }
function light(s) { s.background = { color: P.paper }; }

function eyebrow(s, txt, onDark, x, y) {
  s.addText(txt.toUpperCase(), {
    x: x || M, y: y || 0.42, w: W - 2 * M - 2.4, h: 0.26, margin: 0,
    fontFace: F.b, fontSize: 11, bold: true, charSpacing: 2, color: P.amber,
  });
}
function title(s, txt, onDark, opts) {
  s.addText(txt, Object.assign({
    x: M, y: 0.76, w: W - 2 * M, h: 1.45, margin: 0,
    fontFace: F.h, fontSize: 34, bold: true, valign: 'top',
    color: onDark ? P.ice : P.pdark, lineSpacing: 38,
  }, opts || {}));
}
function monogram(s, activeIdx, onDark) {
  const letters = ['V', 'U', 'K', 'A'];
  const cols = [P.vigil, P.umoja, P.khaya, P.anchor];
  letters.forEach((L, i) => {
    const on = (activeIdx === -1) || (i === activeIdx);
    s.addShape(pres.ShapeType.ellipse, {
      x: W - M - 2.06 + i * 0.5, y: 0.38, w: 0.36, h: 0.36,
      fill: { color: on ? cols[i] : (onDark ? P.edge : P.pedge) },
      line: { color: on ? cols[i] : (onDark ? P.edge : P.pedge), width: 0.5 },
    });
    s.addText(L, {
      x: W - M - 2.06 + i * 0.5, y: 0.38, w: 0.36, h: 0.36, margin: 0,
      align: 'center', valign: 'middle', fontFace: F.b, fontSize: 12, bold: true,
      color: on ? P.white : (onDark ? P.mute : P.pmute),
    });
  });
}
function foot(s, txt, onDark) {
  s.addText(txt, { x: M, y: H - 0.52, w: W - 2 * M, h: 0.3, margin: 0, fontFace: F.b, fontSize: 10, color: onDark ? P.mute : P.pmute });
}
function card(s, x, y, w, h, onDark, tint, lineCol) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: tint || (onDark ? P.raise : P.ptint) },
    line: { color: lineCol || (onDark ? P.edge : P.pedge), width: 1 },
  });
}
function iconCircle(s, x, y, d, col, glyph, glyphCol) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: col }, line: { color: col, width: 0.5 } });
  s.addText(glyph, { x, y, w: d, h: d, margin: 0, align: 'center', valign: 'middle', fontFace: F.b, fontSize: d * 22, bold: true, color: glyphCol || P.white });
}
function statTile(s, x, y, w, val, unit, label, onDark, valCol) {
  s.addText([
    { text: val, options: { fontFace: F.h, fontSize: 38, bold: true, color: valCol || (onDark ? P.ice : P.pdark) } },
    { text: unit || '', options: { fontFace: F.b, fontSize: 14, bold: true, color: onDark ? P.mute : P.pmute } },
  ], { x, y, w, h: 0.64, margin: 0, valign: 'bottom' });
  s.addText(label.toUpperCase(), { x, y: y + 0.66, w, h: 0.3, margin: 0, fontFace: F.b, fontSize: 9.5, bold: true, charSpacing: 1, color: onDark ? P.mute : P.pmute });
}
function bullets(s, items, opts) {
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1 } })), opts);
}
function chip(s, x, y, w, h, label, col, onDark, sub) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.05, fill: { color: onDark ? P.raise : P.white }, line: { color: col, width: 1.5 } });
  s.addText(label, { x, y: sub ? y + 0.06 : y, w, h: sub ? h * 0.5 : h, margin: 0, align: 'center', valign: 'middle', fontFace: F.b, fontSize: 11, bold: true, color: onDark ? P.ice : P.pdark });
  if (sub) s.addText(sub, { x, y: y + h * 0.48, w, h: h * 0.45, margin: 0, align: 'center', valign: 'middle', fontFace: F.b, fontSize: 8.5, color: onDark ? P.mute : P.pmute });
}
function arrow(s, x, y, w, onDark, label) {
  s.addText('→', { x, y, w, h: 0.4, margin: 0, align: 'center', valign: 'middle', fontFace: F.b, fontSize: 16, color: onDark ? P.mute : P.pmute });
  if (label) s.addText(label, { x: x - 0.06, y: y + 0.32, w: w + 0.12, h: 0.26, margin: 0, align: 'center', fontFace: F.b, fontSize: 8, color: onDark ? P.mute : P.pmute });
}

/* ============ 1 · TITLE ============ */
{
  const s = pres.addSlide(); dark(s);
  s.addShape(pres.ShapeType.ellipse, { x: 10.05, y: 2.05, w: 2.9, h: 2.9, fill: { color: P.amber, transparency: 88 }, line: { type: 'none' } });
  s.addShape(pres.ShapeType.ellipse, { x: 10.65, y: 2.65, w: 1.7, h: 1.7, fill: { color: P.amber, transparency: 72 }, line: { type: 'none' } });
  s.addShape(pres.ShapeType.ellipse, { x: 11.15, y: 3.15, w: 0.7, h: 0.7, fill: { color: P.amber }, line: { color: P.amber, width: 1 } });

  [P.vigil, P.umoja, P.khaya, P.anchor].forEach((c, i) => {
    s.addShape(pres.ShapeType.rect, { x: M + i * 2.1, y: 1.12, w: 2.0, h: 0.1, fill: { color: c }, line: { type: 'none' } });
  });

  s.addText('TEAM SONAR  ·  JOHANNESBURG', { x: M, y: 1.44, w: 8.4, h: 0.3, margin: 0, fontFace: F.b, fontSize: 12, bold: true, charSpacing: 2, color: P.amber });
  s.addText('VUKA', { x: M, y: 1.86, w: 8.4, h: 1.5, margin: 0, fontFace: F.h, fontSize: 88, bold: true, color: P.ice, charSpacing: 3 });
  s.addText('You are not alone.', { x: M, y: 3.34, w: 8.4, h: 0.62, margin: 0, fontFace: F.h, fontSize: 30, bold: true, color: P.amber });
  s.addText('You don’t have to ask.', { x: M, y: 3.94, w: 8.4, h: 0.5, margin: 0, fontFace: F.b, fontSize: 20, italic: true, color: P.ice });

  s.addText([
    { text: 'VIGIL', options: { color: P.vigilL, bold: true } }, { text: ' · the person      ', options: { color: P.mute } },
    { text: 'UMOJA', options: { color: P.umojaL, bold: true } }, { text: ' · the street      ', options: { color: P.mute } },
    { text: 'KHAYA', options: { color: P.khayaL, bold: true } }, { text: ' · the property      ', options: { color: P.mute } },
    { text: 'ANCHOR', options: { color: P.anchorL, bold: true } }, { text: ' · the record', options: { color: P.mute } },
  ], { x: M, y: 4.92, w: 9.4, h: 0.32, margin: 0, fontFace: F.b, fontSize: 12.5 });
  s.addText('Community safety you can verify.', { x: M, y: 5.36, w: 9.0, h: 0.34, margin: 0, fontFace: F.b, fontSize: 14.5, bold: true, color: P.green });

  foot(s, 'Geekulcha Annual Hackathon 2026  ·  Blockchain for Impact Use  ·  Sector: Safety  ·  Theme: Build for Use', true);
  s.addNotes('Vuka is isiZulu for wake up. It is also the four layers: VIGIL the person, UMOJA the street, KHAYA the property, ANCHOR the record. Open with the coercion problem immediately, do not read the slide.');
}

/* ============ 2 · WHAT WAS ASKED FOR ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'How to read this deck', false); monogram(s, -1, false);
  title(s, 'Every section the brief asks for, in the order it asks.', false);

  const secs = [
    ['1', 'Problem statement', 'Slides 3–6', 'Who exactly, and the evidence it is real', P.vigil],
    ['2', 'Solution', 'Slides 7–9', 'Four layers, and the one property no rival has', P.umoja],
    ['3', 'Technology readiness level', 'Slide 10', 'Assessed TRL 5, with what caps it there', P.khaya],
    ['4', 'Technological architecture', 'Slides 11–16', 'System, pipeline, trust boundary, chain, security', P.anchor],
    ['5', 'User journey story', 'Slides 17–18', 'The member’s journey — and the subject’s', P.vigil],
    ['6', 'Go-to-market strategy', 'Slides 19–21', 'Channel, unit economics, sustainability, impact', P.umoja],
  ];
  secs.forEach((r, i) => {
    const x = M + (i % 2) * 6.2, y = 1.98 + Math.floor(i / 2) * 1.44;
    card(s, x, y, 5.9, 1.24, false);
    iconCircle(s, x + 0.26, y + 0.3, 0.42, r[4], r[0], P.white);
    s.addText(r[1], { x: x + 0.86, y: y + 0.2, w: 3.5, h: 0.34, margin: 0, fontFace: F.h, fontSize: 15.5, bold: true, color: P.pdark });
    s.addText(r[2], { x: x + 4.3, y: y + 0.22, w: 1.4, h: 0.3, margin: 0, align: 'right', fontFace: F.b, fontSize: 11, bold: true, color: P.pmute });
    s.addText(r[3], { x: x + 0.86, y: y + 0.6, w: 4.8, h: 0.5, margin: 0, fontFace: F.b, fontSize: 11.5, color: P.pmute, lineSpacing: 15 });
  });

  card(s, M, 6.4, W - 2 * M, 0.72, false, P.night);
  s.addText([
    { text: '“Would a real user trust and use this?”  ', options: { bold: true, color: P.amber } },
    { text: 'Our answer is not that they should trust it. It is that they do not have to — they can check it.', options: { color: P.ice } },
  ], { x: M + 0.35, y: 6.56, w: W - 2 * M - 0.7, h: 0.42, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 13.5 });
}

/* ============ 3 · PROBLEM — the forcing function ============ */
{
  const s = pres.addSlide(); dark(s);
  eyebrow(s, 'Problem statement · 1 of 4', true); monogram(s, -1, true);
  title(s, 'You cannot open a bank account here\nwithout installing the app.', true, { y: 0.8, h: 1.5, fontSize: 33 });

  s.addText('So all of us now carry the vault and the key in the same pocket — secured by a face or a finger that can be taken by force.', {
    x: M, y: 2.42, w: 7.5, h: 0.7, margin: 0, fontFace: F.b, fontSize: 15.5, color: P.mute });

  card(s, M, 3.3, 7.5, 2.5, true);
  s.addText('Criminals adapted before the banks did.', { x: M + 0.32, y: 3.52, w: 6.9, h: 0.36, margin: 0, fontFace: F.b, fontSize: 15, bold: true, color: P.amber });
  s.addText([
    { text: 'The robbery is no longer the wallet. It is: unlock the phone, open the app, transfer, then drive to an ATM for the daily limit.', options: { breakLine: true } },
    { text: '\nThe victim performs the transaction. Every record the bank holds says they authorised it — their face, their finger, their own device.', options: {} },
  ], { x: M + 0.32, y: 3.95, w: 6.9, h: 1.7, margin: 0, fontFace: F.b, fontSize: 14, color: P.ice, lineSpacing: 20 });

  card(s, 8.5, 3.3, 4.2, 2.5, true, '1E1418');
  iconCircle(s, 8.82, 3.52, 0.38, P.red, '!', P.white);
  s.addText('Nobody in a coerced robbery can reach for a phone and ask for help.', {
    x: 8.82, y: 4.05, w: 3.6, h: 0.9, margin: 0, fontFace: F.h, fontSize: 16, bold: true, color: P.ice, lineSpacing: 21 });
  s.addText('“Let someone call for help” was solved decades ago. All of it needs a free hand and a moment of privacy. Coercion removes both.', {
    x: 8.82, y: 4.95, w: 3.6, h: 0.75, margin: 0, fontFace: F.b, fontSize: 11.5, color: P.mute, lineSpacing: 15 });

  foot(s, 'This is personal. A family member of this team was stopped at his own gate and told to unlock his phone. He got away because a neighbour happened to be looking.', true);
  s.addNotes('Say the personal story here — the uncle at the gate, the friend forced into a car. Then land the line: not one of them could ask.');
}

/* ============ 4 · FOUR FAILURES ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'Problem statement · 2 of 4', false); monogram(s, -1, false);
  title(s, 'Four failures. All the same shape.', false);

  const items = [
    ['1', 'Help requires a free hand', 'Panic buttons, apps, speed dials — every one needs a hand and privacy. Nothing on the market serves the person who cannot ask.', P.vigil],
    ['2', 'Alarms sense motion, not people', 'A sensor mounted high enough to ignore the dog is high enough for a person to crawl under — and cannot tell them apart anyway. So people stop arming it.', P.khaya],
    ['3', 'Nobody watches the watchers', 'Camera networks decide who is suspicious with no record a resident can inspect. The insider is the unmodelled threat across the whole category.', P.red],
    ['4', 'Whoever owns the log wins the dispute', 'A coerced transfer, a jammed remote, an argument over response time. The party holding the record has money riding on the outcome.', P.red],
  ];
  items.forEach((it, i) => {
    const x = M + (i % 2) * 6.2, y = 2.02 + Math.floor(i / 2) * 2.34;
    card(s, x, y, 5.9, 2.1, false);
    iconCircle(s, x + 0.3, y + 0.3, 0.44, it[3], it[0], P.white);
    s.addText(it[1], { x: x + 0.92, y: y + 0.28, w: 4.75, h: 0.42, margin: 0, fontFace: F.h, fontSize: 16.5, bold: true, color: P.pdark });
    s.addText(it[2], { x: x + 0.92, y: y + 0.74, w: 4.75, h: 1.05, margin: 0, fontFace: F.b, fontSize: 12.5, color: P.pmute, lineSpacing: 17 });
  });
  foot(s, 'In every case the harmed party is the one who has to argue — against a file they cannot see.', false);
}

/* ============ 5 · THE SCALE ============ */
{
  const s = pres.addSlide(); dark(s);
  eyebrow(s, 'Problem statement · 3 of 4 · quantified', true); monogram(s, -1, true);
  title(s, 'The problem is validated on real records,\nnot on a market-size slide.', true, { y: 0.8, h: 1.4, fontSize: 30 });

  statTile(s, M, 2.55, 2.7, '15,712', '', 'Incident records cleaned', true, P.amber);
  statTile(s, 3.5, 2.55, 2.7, '678', '', 'Police precincts joined', true);
  statTile(s, 6.4, 2.55, 2.7, '709', '', 'Suburbs geocoded', true);
  statTile(s, 9.3, 2.55, 2.7, '9', '', 'Provinces covered', true);
  statTile(s, M, 4.15, 2.7, '1,296', '', 'Incidents in the 00:00 hour', true, P.amber);
  statTile(s, 3.5, 4.15, 2.7, '3x', '', 'The 05:00 trough', true);
  statTile(s, 6.4, 4.15, 2.7, '680', '', 'Hijackings in the set', true);
  statTile(s, 9.3, 4.15, 2.7, '17 / 18', '', 'Target towns SAPS covers', true, P.green);

  card(s, M, 5.6, W - 2 * M, 0.95, true);
  s.addText([
    { text: 'Crime here is concentrated in time and in place.  ', options: { bold: true, color: P.amber } },
    { text: 'Concentration is what makes it targetable — and it is why an 11–15 minute patrol dwell at the right hex at the right hour outperforms driving around all night.', options: { color: P.ice } },
  ], { x: M + 0.32, y: 5.78, w: W - 2 * M - 0.64, h: 0.6, margin: 0, fontFace: F.b, fontSize: 13.5, lineSpacing: 18 });
  foot(s, 'Sources: SAPS quarterly crime statistics (public domain, 2025–2026 Q4) · an insurer claims dataset analysed under a prior engagement, not redistributed — the public repository is re-based on SAPS open data only.', true);
  s.addNotes('If asked about the claims data: it was analysed under a prior engagement, it is not in the public repo, and the shipped risk layer runs on SAPS public data. Do not overstate ownership of it.');
}

/* ============ 6 · IDENTIFIED USERS ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'Problem statement · 4 of 4 · identified users', false); monogram(s, -1, false);
  title(s, 'Four users. Each one already pays for a worse version of this.', false, { fontSize: 31 });

  const u = [
    ['The commuter', 'Nomsa, 34, Tembisa → Midrand', 'Budget Android, prepaid data, drives home after dark. Owns a panic app she has never opened.', 'Needs help that starts without her hands.', P.vigil],
    ['The household', 'A family on one street in Kempton Park', 'Has an alarm they stopped arming because the dog sets it off. Pays R650/month for armed response.', 'Needs a sensor that can tell a person from a dog.', P.khaya],
    ['The control room', 'A mid-size security company, 40 vehicles', 'Fuel is the largest controllable cost. Response-time disputes are settled by their own log.', 'Needs a record the customer can check.', P.umoja],
    ['The subject', 'Anyone a camera saw — including the innocent', 'Has no way to learn what was recorded about them, or to have it removed.', 'Needs their own file, and a delete that holds.', P.anchor],
  ];
  u.forEach((r, i) => {
    const x = M + i * 3.06;
    card(s, x, 1.98, 2.86, 4.3, false);
    s.addShape(pres.ShapeType.rect, { x, y: 1.98, w: 2.86, h: 0.09, fill: { color: r[4] }, line: { type: 'none' } });
    s.addText(r[0], { x: x + 0.24, y: 2.2, w: 2.4, h: 0.34, margin: 0, fontFace: F.h, fontSize: 16, bold: true, color: P.pdark });
    s.addText(r[1], { x: x + 0.24, y: 2.54, w: 2.4, h: 0.5, margin: 0, fontFace: F.b, fontSize: 10, color: r[4] === P.anchor ? '4B32A8' : P.pmute, lineSpacing: 13 });
    s.addText(r[2], { x: x + 0.24, y: 3.14, w: 2.4, h: 1.5, margin: 0, fontFace: F.b, fontSize: 11.5, color: P.pmute, lineSpacing: 16 });
    s.addShape(pres.ShapeType.line, { x: x + 0.24, y: 4.72, w: 2.4, h: 0, line: { color: P.pedge, width: 1 } });
    s.addText(r[3], { x: x + 0.24, y: 4.86, w: 2.4, h: 1.1, margin: 0, fontFace: F.h, fontSize: 13, bold: true, color: P.pdark, lineSpacing: 17 });
  });

  card(s, M, 6.42, W - 2 * M, 0.72, false, 'EAF7F1');
  s.addText([
    { text: 'The fourth user is the one nobody builds for.  ', options: { bold: true, color: P.pdark } },
    { text: 'Every camera network has subjects. None of them gives a subject a way to see, check, or delete their own record. That is the gap we build into.', options: { color: '1A6E50' } },
  ], { x: M + 0.3, y: 6.58, w: W - 2 * M - 0.6, h: 0.42, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 13 });
}

/* ============ 7 · SOLUTION — four layers ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'Solution · 1 of 3', false); monogram(s, -1, false);
  title(s, 'VUKA means wake up. It also stands for\nthe four layers it is built from.', false, { y: 0.8, h: 1.35, fontSize: 30 });

  const layers = [
    ['V', 'VIGIL', 'VIJ-il · Latin', 'THE PERSON', ['Three independent senses on the phone', 'Phone-to-car link breaking = hijack signal', 'Covert duress PIN, unlocks normally', 'Works offline, screen off, no data'], P.vigil, 'Help that starts without her hands.'],
    ['U', 'UMOJA', 'oo-MOH-ja · Swahili', 'THE STREET', ['Learns who belongs before who does not', 'Recurrence counts only if unknown', 'Vectors, never images', 'Risk layer · patrol optimisation'], P.umoja, 'Whitelist before watchlist.'],
    ['K', 'KHAYA', 'KY-ah · isiZulu', 'THE PROPERTY', ['Tells a person from a dog', 'Glass-break + gunshot, two-stage', 'Deterrent siren when you are away', '48–72h battery · LTE failover'], P.khaya, 'An alarm you stop switching off.'],
    ['A', 'ANCHOR', 'AN-ker · English', 'THE RECORD', ['Hash chain over every decision', 'Hourly root published publicly', 'Two signatures to whitelist or disarm', 'Any person can retrieve their file'], P.anchor, 'Checkable by someone who distrusts us.'],
  ];
  layers.forEach((L, i) => {
    const x = M + i * 3.06;
    card(s, x, 2.28, 2.86, 4.02, false);
    iconCircle(s, x + 0.26, 2.5, 0.5, L[5], L[0], P.white);
    s.addText(L[1], { x: x + 0.86, y: 2.5, w: 1.9, h: 0.3, margin: 0, fontFace: F.h, fontSize: 16, bold: true, color: P.pdark });
    s.addText(L[2], { x: x + 0.86, y: 2.79, w: 1.9, h: 0.22, margin: 0, fontFace: F.b, fontSize: 8.5, color: P.pmute });
    s.addText(L[3], { x: x + 0.26, y: 3.16, w: 2.4, h: 0.24, margin: 0, fontFace: F.b, fontSize: 9.5, bold: true, charSpacing: 1.2, color: L[5] });
    bullets(s, L[4], { x: x + 0.26, y: 3.5, w: 2.4, h: 1.75, margin: 0, fontFace: F.b, fontSize: 11, color: P.pmute, lineSpacing: 15, paraSpaceAfter: 7, valign: 'top' });
    s.addShape(pres.ShapeType.line, { x: x + 0.26, y: 5.42, w: 2.34, h: 0, line: { color: P.pedge, width: 1 } });
    s.addText(L[6], { x: x + 0.26, y: 5.54, w: 2.36, h: 0.66, margin: 0, fontFace: F.h, fontSize: 12.5, bold: true, color: P.pdark, lineSpacing: 16 });
  });
  foot(s, 'One wakes. All wake.  ·  Person → property → street → record.', false);
  s.addNotes('Read it as a sentence: VIGIL wakes for one person, KHAYA watches one property, UMOJA connects a street, ANCHOR publishes what all three did.');
}

/* ============ 8 · THE ONE PROPERTY ============ */
{
  const s = pres.addSlide(); dark(s);
  eyebrow(s, 'Solution · 2 of 3 · the differentiator', true); monogram(s, -1, true);
  title(s, 'Every safety network here asks you to trust it.\nOurs can be checked instead.', true, { y: 0.8, h: 1.45, fontSize: 31 });

  s.addText('The binding constraint on safety technology in South Africa is not accuracy. It is legitimacy. So every design decision is made to leave the system more checkable, not more capable.', {
    x: M, y: 2.3, w: 11.5, h: 0.66, margin: 0, fontFace: F.b, fontSize: 14, color: P.mute, lineSpacing: 19 });

  const rows = [
    ['A machine can never accuse you', 'The machine’s ceiling is watch_candidate. Only human_verify() with an operator ID sets flagged. Grep the repository — no other code path exists.', 'ADR-0002'],
    ['One operator cannot un-protect a street', 'Whitelist, camera disarm, threshold change and deletion each need two independent signatures. Both are published.', 'ADR-0022'],
    ['You can hold your own file', 'A subject can retrieve every decision made about them, with a proof anyone can verify without asking us.', 'ADR-0023'],
    ['The record was public before the dispute', 'An hourly root, 32 bytes, on a chain we do not control. Precedence — not immutability.', 'ADR-0021'],
    ['The failures are published too', 'Our forecast loses to a constant baseline and it is in the repository, on the honesty slide, and in this deck.', 'D14'],
  ];
  rows.forEach((r, i) => {
    const y = 3.14 + i * 0.72;
    s.addShape(pres.ShapeType.rect, { x: M, y: y + 0.06, w: 0.06, h: 0.5, fill: { color: P.green }, line: { type: 'none' } });
    s.addText(r[0], { x: M + 0.24, y, w: 3.9, h: 0.34, margin: 0, fontFace: F.h, fontSize: 14.5, bold: true, color: P.ice });
    s.addText(r[1], { x: M + 0.24, y: y + 0.32, w: 9.9, h: 0.34, margin: 0, fontFace: F.b, fontSize: 11.5, color: P.mute });
    s.addText(r[2], { x: 11.4, y, w: 1.3, h: 0.34, margin: 0, align: 'right', fontFace: F.m, fontSize: 10.5, bold: true, color: P.amber });
  });
  foot(s, 'Every line above is a decision record in the repository, dated, append-only, and superseded rather than edited.', true);
}

/* ============ 9 · ALREADY BUILT ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'Solution · 3 of 3 · capability', false); monogram(s, -1, false);
  title(s, 'We are not proposing to build this. We shipped it in July.', false, { fontSize: 31 });

  statTile(s, M, 2.32, 3.0, '33,600', '', 'Lines across the repositories', false, P.pdark);
  statTile(s, 3.8, 2.32, 3.0, '510', '', 'Test-function definitions found · not run here', false, P.pdark);
  statTile(s, 7.0, 2.32, 3.0, '30', '', 'Accepted ADRs · 2 proposed', false, P.pdark);
  statTile(s, 10.2, 2.32, 2.6, '207', '', 'Commits, dated before this brief', false, P.dgreen);

  card(s, M, 3.86, 5.9, 2.4, false);
  s.addText('The commit history is the capability statement.', { x: M + 0.3, y: 4.06, w: 5.3, h: 0.6, margin: 0, fontFace: F.h, fontSize: 15.5, bold: true, color: P.pdark, lineSpacing: 20 });
  s.addText('VUKA and its predecessor were built in July 2026 for a different programme. The CLAUDE.md in that repository, dated July, already describes a two-layer architecture that shipped. ANCHOR is the third layer of a plan we published before this hackathon existed.', {
    x: M + 0.3, y: 4.62, w: 5.3, h: 1.5, margin: 0, fontFace: F.b, fontSize: 12, color: P.pmute, lineSpacing: 17 });

  card(s, 6.8, 3.86, 5.9, 2.4, false);
  bullets(s, [
    'Kotlin foreground service, on-device INT8 inference',
    'FastAPI + WebSockets, migrations from day zero',
    '15,712 records → 764 hotspot suburbs → 709 geocoded',
    'Calibration harness, false-alarm budget, held-out backtest',
    'SHA-256 evidence chain with a standalone verifier',
  ], { x: 7.1, y: 4.06, w: 5.3, h: 2.0, margin: 0, fontFace: F.b, fontSize: 12, color: P.pdark, lineSpacing: 16, paraSpaceAfter: 6, valign: 'top' });

  foot(s, 'Detection → alert render measured at p50 273 ms · p95 318 ms against a 2,000 ms budget — n = 10 runs, matched by sighting ID. A small sample, and we say so.', false);
}

/* ============ 10 · TRL ============ */
{
  const s = pres.addSlide(); dark(s);
  eyebrow(s, 'Technology readiness level', true); monogram(s, -1, true);
  title(s, 'Assessed TRL 5, with the evidence — and with what caps it there.', true, { fontSize: 31 });

  s.addText('The template asks for TRL 3. We are stating our actual level, because understating it would misrepresent the work — and misrepresentation is the one thing our honesty ledger forbids.', {
    x: M, y: 1.9, w: 11.5, h: 0.6, margin: 0, fontFace: F.b, fontSize: 13.5, color: P.mute, lineSpacing: 19 });

  for (let i = 1; i <= 9; i++) {
    const on = i <= 5, x = M + (i - 1) * 1.34;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 2.62, w: 1.2, h: 0.52, rectRadius: 0.05,
      fill: { color: on ? (i === 5 ? P.amber : '5A4520') : P.raise },
      line: { color: on ? P.amber : P.edge, width: 1 },
    });
    s.addText('TRL ' + i, { x, y: 2.62, w: 1.2, h: 0.52, margin: 0, align: 'center', valign: 'middle', fontFace: F.b, fontSize: 11.5, bold: i === 5, color: on ? (i === 5 ? P.night : P.ice) : P.mute });
  }
  s.addText('▲ we are here', { x: M + 5.36, y: 3.2, w: 1.6, h: 0.28, margin: 0, align: 'center', fontFace: F.b, fontSize: 10.5, bold: true, color: P.amber });

  const rows = [
    ['Integrated system running end to end across three machines over a public tunnel', 'TRL 5', P.green],
    ['Latency measured under load in the intended topology, not simulated', 'TRL 5', P.green],
    ['On-device model shipped inside an installable Android build', 'TRL 5', P.green],
    ['Real data through the full pipeline: 15,712 records, 709 geocoded, 678 precincts', 'TRL 4–5', P.green],
    ['510 test-function definitions found; executed-suite count pending', 'Historical implementation evidence', P.green],
    ['Appliance hardware not fabricated — breadboard and bench only', 'caps at 5', P.red],
    ['No field deployment in real households yet', 'caps at 5', P.red],
  ];
  rows.forEach((r, i) => {
    const y = 3.62 + i * 0.44;
    s.addShape(pres.ShapeType.ellipse, { x: M, y: y + 0.09, w: 0.15, h: 0.15, fill: { color: r[2] }, line: { type: 'none' } });
    s.addText(r[0], { x: M + 0.32, y, w: 9.5, h: 0.4, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 12.5, color: P.ice });
    s.addText(r[1], { x: 10.1, y, w: 1.4, h: 0.4, margin: 0, valign: 'middle', align: 'right', fontFace: F.b, fontSize: 11.5, bold: true, color: r[2] });
  });
  foot(s, 'What moves us to TRL 6: a fabricated appliance in a real yard, for a season, with the false-alarm rate published whatever it says. That is the G-10 line on our public gap register.', true);
}

/* ============ 11 · ARCHITECTURE — the system ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'Technological architecture · 1 of 6', false); monogram(s, -1, false);
  title(s, 'Four layers, one boundary, and 32 bytes that leave.', false);

  // trust boundary
  s.addShape(pres.ShapeType.roundRect, { x: M - 0.06, y: 1.92, w: 10.2, h: 3.9, rectRadius: 0.04, fill: { type: 'none' }, line: { color: P.pedge, width: 1.5, dashType: 'dash' } });
  s.addText('OUR TRUST BOUNDARY — everything inside is data we hold and can be compelled to produce', {
    x: M + 0.1, y: 1.98, w: 9.9, h: 0.26, margin: 0, fontFace: F.b, fontSize: 8.5, bold: true, charSpacing: 1, color: P.pmute });

  // edge column
  card(s, 0.74, 2.36, 2.45, 1.5, false, P.white, P.vigil);
  s.addText('VIGIL · the phone', { x: 0.92, y: 2.48, w: 2.2, h: 0.28, margin: 0, fontFace: F.b, fontSize: 11, bold: true, color: P.vigil });
  s.addText('Kotlin foreground service · LiteRT INT8 · mic, IMU, BT radio · fusion on device · duress PIN', { x: 0.92, y: 2.76, w: 2.12, h: 1.0, margin: 0, fontFace: F.b, fontSize: 10, color: P.pmute, lineSpacing: 13 });

  card(s, 0.74, 3.98, 2.45, 1.5, false, P.white, P.khaya);
  s.addText('KHAYA · the appliance', { x: 0.92, y: 4.1, w: 2.2, h: 0.28, margin: 0, fontFace: F.b, fontSize: 11, bold: true, color: P.khaya });
  s.addText('YOLOv8 person/animal · two-stage acoustics · 3-second ring buffer · local decision loop · siren', { x: 0.92, y: 4.38, w: 2.12, h: 1.0, margin: 0, fontFace: F.b, fontSize: 10, color: P.pmute, lineSpacing: 13 });

  arrow(s, 3.24, 3.42, 0.5, false, 'signed');
  arrow(s, 3.24, 4.5, 0.5, false, 'vectors');

  // umoja
  card(s, 3.80, 2.36, 3.05, 3.12, false, P.white, P.umoja);
  s.addText('UMOJA · the service', { x: 3.98, y: 2.48, w: 2.8, h: 0.28, margin: 0, fontFace: F.b, fontSize: 11, bold: true, color: P.umoja });
  bullets(s, ['FastAPI + WebSockets', 'Entity graph, lazy decay', 'Suspicion score · conflict K', 'Risk layer, 3-tier fallback', 'Patrol solve, fuel budget'],
    { x: 3.98, y: 2.78, w: 2.72, h: 1.6, margin: 0, fontFace: F.b, fontSize: 10, color: P.pmute, lineSpacing: 13, paraSpaceAfter: 3, valign: 'top' });
  s.addShape(pres.ShapeType.roundRect, { x: 3.98, y: 4.46, w: 2.72, h: 0.86, rectRadius: 0.04, fill: { color: 'FDF0F0' }, line: { color: P.red, width: 1 } });
  s.addText('CEILING: watch_candidate', { x: 4.08, y: 4.54, w: 2.56, h: 0.24, margin: 0, fontFace: F.m, fontSize: 9, bold: true, color: P.dred });
  s.addText('No code path sets flagged. Only human_verify() with an operator ID.', { x: 4.08, y: 4.78, w: 2.56, h: 0.5, margin: 0, fontFace: F.b, fontSize: 9, color: P.pmute, lineSpacing: 11 });

  arrow(s, 6.90, 3.6, 0.5, false, 'decisions');

  // anchor
  card(s, 7.46, 2.36, 3.05, 3.12, false, P.white, P.anchor);
  s.addText('ANCHOR · the record', { x: 7.64, y: 2.48, w: 2.8, h: 0.28, margin: 0, fontFace: F.b, fontSize: 11, bold: true, color: P.anchor });
  bullets(s, ['prev-hash chain', 'Ed25519 per-party signing', 'Two-of-two on destructive acts', 'Hourly Merkle root', 'Subject access + deletion'],
    { x: 7.64, y: 2.78, w: 2.72, h: 1.6, margin: 0, fontFace: F.b, fontSize: 10, color: P.pmute, lineSpacing: 13, paraSpaceAfter: 3, valign: 'top' });
  s.addShape(pres.ShapeType.roundRect, { x: 7.64, y: 4.46, w: 2.72, h: 0.86, rectRadius: 0.04, fill: { color: 'EAF7F1' }, line: { color: P.green, width: 1 } });
  s.addText('OPERATOR', { x: 7.74, y: 4.54, w: 2.54, h: 0.24, margin: 0, fontFace: F.b, fontSize: 9, bold: true, charSpacing: 1, color: P.dgreen });
  s.addText('Every human decision is signed, chained, and inside the next root.', { x: 7.74, y: 4.78, w: 2.54, h: 0.5, margin: 0, fontFace: F.b, fontSize: 9, color: P.pmute, lineSpacing: 11 });

  arrow(s, 10.85, 3.6, 0.5, false, '32 B/hr');

  // public
  s.addShape(pres.ShapeType.roundRect, { x: 11.5, y: 2.36, w: 1.2, h: 3.12, rectRadius: 0.05, fill: { color: P.night }, line: { color: P.anchor, width: 1.5 } });
  s.addText('PUBLIC\nOpen\nTimestamps\n↓\nBitcoin', { x: 11.5, y: 2.9, w: 1.2, h: 1.6, margin: 0, align: 'center', fontFace: F.b, fontSize: 10, bold: true, color: P.ice, lineSpacing: 14 });
  s.addText('no wallet\nno token\nno account', { x: 11.5, y: 4.6, w: 1.2, h: 0.7, margin: 0, align: 'center', fontFace: F.b, fontSize: 8.5, color: P.mute, lineSpacing: 11 });

  card(s, M, 6.0, W - 2 * M, 1.06, false, P.night);
  s.addText('Every layer states what it does when the layer above it disappears.', { x: M + 0.35, y: 6.14, w: 11.4, h: 0.3, margin: 0, fontFace: F.b, fontSize: 12.5, bold: true, color: P.amber });
  s.addText('Phone offline: VIGIL still fuses and still records · Service unreachable: KHAYA still sirens and queues · Chain unreachable: the hash chain still verifies, the root publishes late and says so. Stale data is marked stale, never blank and never invented.', {
    x: M + 0.35, y: 6.44, w: 11.4, h: 0.5, margin: 0, fontFace: F.b, fontSize: 11.5, color: P.ice, lineSpacing: 15 });
}

/* ============ 12 · ARCHITECTURE — the pipeline ============ */
{
  const s = pres.addSlide(); dark(s);
  eyebrow(s, 'Technological architecture · 2 of 6', true); monogram(s, 0, true);
  title(s, 'One incident, through the decision engine.', true);

  const stages = [
    ['SENSE', 'Three physically independent channels — acoustic, motion, vehicle link. Independence is the point: never stack correlated models and call it confidence.'],
    ['CALIBRATE', 'Each channel emits a calibrated probability. A raw softmax entering fusion is a correctness bug, not a style issue.'],
    ['FUSE', 'posterior = σ( prior + Σ wᵢ · logit(pᵢ) ).  Log-odds, not Dempster–Shafer — D–S misbehaves under high conflict and our worst cases are high-conflict.'],
    ['CONFLICT GATE', 'Coefficient K rises when channels contradict. High K suppresses escalation and routes to verification. Disagreement is information, not noise.'],
    ['ESCALATE', 'L0→L3 with per-level hysteresis, so the state cannot chatter at a boundary. Every escalation carries a visible cancel window.'],
  ];
  stages.forEach((st, i) => {
    const y = 1.98 + i * 0.63;
    s.addText(st[0], { x: M, y, w: 1.75, h: 0.5, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 10.5, bold: true, charSpacing: 1, color: P.amber });
    s.addText(st[1], { x: M + 1.85, y, w: 10.6, h: 0.56, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 11.8, color: P.ice, lineSpacing: 15.5 });
  });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.24, w: W - 2 * M, h: 1.05, rectRadius: 0.06, fill: { color: '2A1418' }, line: { color: P.red, width: 2 } });
  s.addText('THE HARD BOUNDARY — ADR-0002, accepted July 2026', { x: M + 0.3, y: 5.36, w: 11.5, h: 0.28, margin: 0, fontFace: F.b, fontSize: 10.5, bold: true, charSpacing: 1, color: 'F5898D' });
  s.addText('The machine’s ceiling is watch_candidate. No code path can set flagged — only human_verify() can, and it requires an operator ID. A biometric match is a lead for a human, never a verdict.', {
    x: M + 0.3, y: 5.66, w: 11.5, h: 0.52, margin: 0, fontFace: F.b, fontSize: 12.5, color: P.ice, lineSpacing: 16 });

  s.addText('then →  human decides  →  signed record  →  hourly root published  →  suspicion decays at 0.5^(days/7)', {
    x: M, y: 6.48, w: 11.5, h: 0.3, margin: 0, fontFace: F.b, fontSize: 12, bold: true, color: P.green });
  foot(s, 'Measured end to end: p50 273 ms · p95 318 ms · budget 2,000 ms · n = 10.  This is also our statutory answer to POPIA s71 on automated decision making.', true);
}

/* ============ 13 · TRUST BOUNDARY ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'Technological architecture · 3 of 6', false); monogram(s, 3, false);
  title(s, 'What crosses the boundary — and what never does.', false);

  const hdr = ['Data', 'Leaves device', 'Reaches cloud', 'Goes on chain'];
  const cols = [M, 5.9, 8.2, 10.5];
  const wds = [5.1, 2.1, 2.1, 2.2];
  hdr.forEach((h, i) => s.addText(h.toUpperCase(), { x: cols[i], y: 1.9, w: wds[i], h: 0.3, margin: 0, fontFace: F.b, fontSize: 9.5, bold: true, charSpacing: 1, color: P.pmute }));
  s.addShape(pres.ShapeType.line, { x: M, y: 2.24, w: W - 2 * M, h: 0, line: { color: P.pedge, width: 1 } });

  const rows = [
    ['Raw audio', 'x', 'x', 'x', '3-second ring buffer, discarded. Only the label survives'],
    ['Face / plate images', 'x', 'x', 'x', 'Vectors only — enforced in the vision layer, not in policy'],
    ['Embeddings (vectors)', 'y', 'y', 'x', 'Needed for re-identification. Retention TTL in the data layer'],
    ['Location', 'y', 'y', 'x', 'Public ledgers are permanent and correlatable'],
    ['Decision events', 'y', 'y', 'h', 'Only the hash. The payload stays in our database'],
    ['Merkle root', 'n', 'y', 'y', '32 bytes per hour, built server-side. A hash of a hash — the entire on-chain footprint'],
  ];
  rows.forEach((r, i) => {
    const y = 2.42 + i * 0.62;
    if (i % 2 === 0) s.addShape(pres.ShapeType.rect, { x: M - 0.1, y: y - 0.04, w: W - 2 * M + 0.2, h: 0.58, fill: { color: P.ptint }, line: { type: 'none' } });
    s.addText(r[0], { x: cols[0], y, w: wds[0], h: 0.28, margin: 0, fontFace: F.b, fontSize: 13, bold: true, color: P.pdark });
    s.addText(r[4], { x: cols[0], y: y + 0.24, w: wds[0] + 0.4, h: 0.24, margin: 0, fontFace: F.b, fontSize: 10.5, color: P.pmute });
    [1, 2, 3].forEach(k => {
      const v = r[k];
      const txt = v === 'y' ? '✓ yes' : v === 'x' ? '✕ never' : v === 'n' ? '— n/a' : '✓ hashed';
      const col = v === 'y' ? P.dgreen : v === 'x' ? P.dred : v === 'n' ? P.pmute : P.damber;
      s.addText(txt, { x: cols[k], y, w: wds[k], h: 0.5, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 12, bold: true, color: col });
    });
  });
  card(s, M, 6.28, W - 2 * M, 0.72, false, 'EAF7F1');
  s.addText([
    { text: '“So you are putting biometrics on a blockchain?”  ', options: { bold: true, color: P.pdark } },
    { text: 'No. We anchor a hash of a hash. Deleting a person’s data does not break the chain, because the chain never held it.', options: { color: '1A6E50' } },
  ], { x: M + 0.3, y: 6.44, w: W - 2 * M - 0.6, h: 0.42, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 13 });
}

/* ============ 14 · BLOCKCHAIN — precedence ============ */
{
  const s = pres.addSlide(); dark(s);
  eyebrow(s, 'Technological architecture · 4 of 6 · blockchain for impact', true); monogram(s, 3, true);
  title(s, 'Blockchain does not make records immutable.\nIt proves they existed before you had a reason to lie.', true, { y: 0.78, h: 1.5, fontSize: 27 });

  card(s, M, 2.42, 7.4, 2.5, true, '141F16');
  s.addText('The case a database cannot make', { x: M + 0.3, y: 2.6, w: 6.8, h: 0.3, margin: 0, fontFace: F.b, fontSize: 11, bold: true, charSpacing: 1, color: P.green });
  const tl = [
    ['22:41', 'A duress signal is recorded on the phone', P.amber],
    ['22:44', 'A transfer leaves the account', P.ice],
    ['23:00', 'The hourly root is published — the 22:41 event is inside it', P.green],
    ['3 days later', 'He disputes the transfer', P.ice],
  ];
  tl.forEach((t, i) => {
    const y = 2.98 + i * 0.44;
    s.addText(t[0], { x: M + 0.3, y, w: 1.15, h: 0.34, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 11.5, bold: true, color: t[2] });
    s.addText(t[1], { x: M + 1.5, y, w: 5.6, h: 0.34, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 12, color: P.ice });
  });

  card(s, 8.4, 2.42, 4.3, 2.5, true);
  s.addText('The bank’s records show a correctly authenticated, correctly authorised instruction.', { x: 8.7, y: 2.6, w: 3.7, h: 0.7, margin: 0, fontFace: F.b, fontSize: 12.5, color: P.mute, lineSpacing: 16 });
  s.addText('The anchored record proves the duress signal existed three minutes earlier — and was public before anyone knew there would be a dispute.', {
    x: 8.7, y: 3.35, w: 3.7, h: 1.35, margin: 0, fontFace: F.h, fontSize: 14, bold: true, color: P.ice, lineSpacing: 19 });

  const flow = ['event', 'prev-hash chain', 'Ed25519 signature', 'hourly Merkle root', 'OpenTimestamps', 'anyone verifies'];
  let fx = M;
  flow.forEach((f, i) => {
    const w = 1.78;
    s.addShape(pres.ShapeType.roundRect, { x: fx, y: 5.2, w, h: 0.56, rectRadius: 0.05, fill: { color: i === flow.length - 1 ? '143026' : P.raise }, line: { color: i === flow.length - 1 ? P.green : P.edge, width: 1 } });
    s.addText(f, { x: fx, y: 5.2, w, h: 0.56, margin: 0, align: 'center', valign: 'middle', fontFace: F.b, fontSize: 10.5, bold: i === flow.length - 1, color: i === flow.length - 1 ? P.green : P.ice });
    if (i < flow.length - 1) s.addText('→', { x: fx + w, y: 5.2, w: 0.32, h: 0.56, margin: 0, align: 'center', valign: 'middle', fontFace: F.b, fontSize: 14, color: P.mute });
    fx += w + 0.32;
  });

  statTile(s, M, 6.05, 3.2, '32', 'bytes', 'On chain, per hour', true, P.green);
  statTile(s, 4.4, 6.05, 4.0, 'R1.30', '/month', 'Entire network — fixed, not per user', true, P.green);
  statTile(s, 9.0, 6.05, 3.7, '0', '', 'Personal data on chain, ever', true, P.green);
  s.addNotes('Say the R1.30 line slowly. Because we batch every household into one hourly root it is a FIXED cost. At a hundred homes or a hundred thousand it is the same number. Rivals will be explaining gas fees. Also: we chose OpenTimestamps over a permissioned chain because in a dispute between the insurer, the security company and us, those three would be the validators (ADR-0021).');
}

/* ============ 15 · SECURITY BY DESIGN ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'Technological architecture · 5 of 6 · security by design', false); monogram(s, 3, false);
  title(s, 'Everyone worries about who a system puts on a watchlist.\nThe dangerous power is who it takes off.', false, { y: 0.78, h: 1.45, fontSize: 27 });

  card(s, M, 2.35, 5.9, 2.35, false, 'FDF0F0');
  s.addText('We found this by auditing our own code', { x: M + 0.3, y: 2.52, w: 5.5, h: 0.3, margin: 0, fontFace: F.b, fontSize: 11, bold: true, charSpacing: 1, color: P.dred });
  s.addText('def factor_f1_recurrence(entity, is_whitelisted):\n    if is_whitelisted:\n        return False   # exits immediately', {
    x: M + 0.3, y: 2.88, w: 5.5, h: 0.9, margin: 0, fontFace: F.m, fontSize: 10.5, color: P.pdark, lineSpacing: 15 });
  s.addText('A whitelisted entity accumulates no suspicion at all — and one operator could add one with a single unwitnessed API call.', {
    x: M + 0.3, y: 3.86, w: 5.5, h: 0.7, margin: 0, fontFace: F.b, fontSize: 12.5, color: P.pmute, lineSpacing: 17 });

  card(s, 6.8, 2.35, 5.9, 2.35, false, 'EAF7F1');
  s.addText('The control — two of two, both published', { x: 7.1, y: 2.52, w: 5.4, h: 0.3, margin: 0, fontFace: F.b, fontSize: 11, bold: true, charSpacing: 1, color: '1A6E50' });
  bullets(s, ['Whitelist an entity', 'Disarm a camera', 'Change a fusion threshold', 'Delete a record'], { x: 7.2, y: 2.9, w: 5.2, h: 1.15, margin: 0, fontFace: F.b, fontSize: 12.5, color: P.pdark, lineSpacing: 16, paraSpaceAfter: 4, valign: 'top' });
  s.addText('The attempt is itself an anchored event — including the one that fails.', { x: 7.1, y: 4.14, w: 5.4, h: 0.42, margin: 0, fontFace: F.h, fontSize: 14, bold: true, color: '1A6E50' });

  const sec = [
    ['STRIDE model + abuse-case suite', 'Written before the code, run in CI'],
    ['Secret scanning, pre-commit and gate', 'After we committed secrets and disclosed it'],
    ['SAST · DAST · dependency scan', 'Gate G5, 24 September'],
    ['POPIA: retention TTL, subject access, deletion', 'Gate G3 — our own ADR recorded the gap first'],
  ];
  sec.forEach((r, i) => {
    const x = M + (i % 2) * 6.2, y = 4.92 + Math.floor(i / 2) * 0.62;
    s.addShape(pres.ShapeType.ellipse, { x, y: y + 0.11, w: 0.15, h: 0.15, fill: { color: P.umoja }, line: { type: 'none' } });
    s.addText(r[0], { x: x + 0.3, y, w: 3.5, h: 0.36, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 12, bold: true, color: P.pdark });
    s.addText(r[1], { x: x + 3.85, y, w: 2.2, h: 0.36, margin: 0, valign: 'middle', align: 'right', fontFace: F.b, fontSize: 10, color: P.pmute });
  });

  foot(s, 'A guard who has been paid to un-protect a street cannot do it alone, and cannot do it quietly. No commercial camera network in this market defends against its own operators.', false);
}

/* ============ 16 · WHAT WE REFUSED ============ */
{
  const s = pres.addSlide(); dark(s);
  eyebrow(s, 'Technological architecture · 6 of 6 · design discipline', true); monogram(s, -1, true);
  title(s, 'Four blockchain features we designed — and rejected.', true);

  const rej = [
    ['Alerts on chain', 'Our relay is 318 ms measured. The fastest chain is seconds. Consensus in the alert path costs time and buys nothing.'],
    ['Autonomous gate unlock', 'A machine deciding alone to open someone’s home. Violates ADR-0002 — and our own glass-break log holds a 0.71-confidence detection that was wrong.'],
    ['First-responder bounties', 'Paying the first vehicle to arrive creates an incentive to race to a possibly-false alarm. We do not engineer a violent encounter.'],
    ['Reward tokens', 'A database with an audit log beats a chain on cost, speed and UX. Tokenising it would be decoration.'],
  ];
  rej.forEach((r, i) => {
    const y = 1.95 + i * 1.0;
    s.addShape(pres.ShapeType.ellipse, { x: M, y: y + 0.1, w: 0.34, h: 0.34, fill: { color: '3A1A1E' }, line: { color: P.red, width: 1.25 } });
    s.addText('✕', { x: M, y: y + 0.1, w: 0.34, h: 0.34, margin: 0, align: 'center', valign: 'middle', fontFace: F.b, fontSize: 13, bold: true, color: P.red });
    s.addText(r[0], { x: M + 0.5, y, w: 3.6, h: 0.4, margin: 0, valign: 'top', fontFace: F.h, fontSize: 15.5, bold: true, color: P.ice });
    s.addText(r[1], { x: 4.3, y: y + 0.02, w: 8.4, h: 0.85, margin: 0, valign: 'top', fontFace: F.b, fontSize: 12.5, color: P.mute, lineSpacing: 17 });
  });

  card(s, M, 6.0, W - 2 * M, 0.95, true, '141F16');
  s.addText('Total autonomy in perception. Zero autonomy in consequence. The system may decide what it is looking at. It may never decide what happens to a person.', {
    x: M + 0.35, y: 6.18, w: 11.4, h: 0.6, margin: 0, valign: 'middle', fontFace: F.h, fontSize: 15, bold: true, color: P.green });
  s.addNotes('This is the slide that separates us in a blockchain bucket. Others will tokenise something. We refused four blockchain features because our own accepted ADRs forbid them.');
}

/* ============ 17 · USER JOURNEY — the member ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'User journey story · 1 of 2 · the member', false); monogram(s, -1, false);
  title(s, 'One incident. One clock. Three pairs of hands.', false);

  const j = [
    ['19:41', 'Nomsa’s phone loses its link to her car while the car is still moving', 'She touches nothing', P.vigil],
    ['19:41', 'Three independent channels agree. Context lifts it: dark, a road with history. Conflict K stays low', 'Threshold crossed → L2', P.vigil],
    ['19:42', 'Her Guardian is notified. A countdown appears on her screen', 'She can still stop this', P.amber],
    ['19:43', 'An operator opens the queue. The state reads watch_candidate — visibly locked there', 'The machine cannot go further', P.red],
    ['19:44', 'The operator dismisses it. A parking garage; the link dropped on the ramp', 'Nothing was sent to police', P.green],
    ['20:00', 'The dismissal is published inside the hourly root', '32 bytes', P.green],
    ['later', 'Nomsa opens her record and verifies the dismissal happened and has not been altered', 'So can a regulator', P.green],
  ];
  j.forEach((r, i) => {
    const y = 1.95 + i * 0.62;
    s.addShape(pres.ShapeType.ellipse, { x: M + 0.72, y: y + 0.16, w: 0.16, h: 0.16, fill: { color: r[3] }, line: { type: 'none' } });
    if (i < j.length - 1) s.addShape(pres.ShapeType.line, { x: M + 0.8, y: y + 0.32, w: 0, h: 0.46, line: { color: P.pedge, width: 1.25 } });
    s.addText(r[0], { x: M, y, w: 0.66, h: 0.45, margin: 0, align: 'right', valign: 'middle', fontFace: F.b, fontSize: 11.5, bold: true, color: P.pmute });
    s.addText(r[1], { x: M + 1.1, y, w: 6.6, h: 0.5, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 12.5, color: P.pdark, lineSpacing: 16 });
    s.addText(r[2], { x: 8.5, y, w: 4.2, h: 0.45, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 11.5, italic: true, color: r[3] === P.green ? P.dgreen : r[3] === P.red ? P.dred : P.damber });
  });

  card(s, M, 6.35, W - 2 * M, 0.72, false, P.night);
  s.addText('The climax is 19:44 — the system decided not to accuse someone. 20:00 made that decision permanent.', {
    x: M + 0.35, y: 6.5, w: 11.4, h: 0.42, margin: 0, valign: 'middle', fontFace: F.h, fontSize: 15, bold: true, color: P.amber });
}

/* ============ 18 · USER JOURNEY — the subject ============ */
{
  const s = pres.addSlide(); dark(s);
  eyebrow(s, 'User journey story · 2 of 2 · the subject', true); monogram(s, 3, true);
  title(s, 'The second journey belongs to the person the cameras saw.', true, { fontSize: 31 });

  s.addText('Thabo delivers on that street twice a week. He was never a member, never asked, never consented to anything. Every camera network in the country has a Thabo. None of them gives him this.', {
    x: M, y: 1.9, w: 11.5, h: 0.66, margin: 0, fontFace: F.b, fontSize: 13.5, color: P.mute, lineSpacing: 19 });

  const steps = [
    ['1', 'He asks', 'GET /v1/subjects/{id}/record — every decision ever made about him: seen, scored, verified, dismissed, whitelisted. With actor IDs and timestamps.', P.vigil],
    ['2', 'He checks it himself', 'The bundle carries the chain entries, the Merkle path and the anchor reference. He can verify it with a public OpenTimestamps client that has never heard of us.', P.umoja],
    ['3', 'He asks for deletion', 'DELETE /v1/subjects/{id}/data — the payload is removed. The hash stays, so the chain still verifies. Deletion does not become a way to erase the fact that a decision was made.', P.khaya],
    ['4', 'He is forgotten anyway', 'Suspicion decays at 0.5^(days/7) with nobody required to clear him. Most systems need a human to decide to release you. Ours decides on its own to stop watching.', P.anchor],
  ];
  steps.forEach((r, i) => {
    const y = 2.72 + i * 1.02;
    iconCircle(s, M, y + 0.06, 0.4, r[3], r[0], P.white);
    s.addText(r[1], { x: M + 0.58, y, w: 2.6, h: 0.4, margin: 0, valign: 'middle', fontFace: F.h, fontSize: 15, bold: true, color: P.ice });
    s.addText(r[2], { x: 3.4, y: y - 0.02, w: 9.3, h: 0.9, margin: 0, valign: 'top', fontFace: F.b, fontSize: 12, color: P.mute, lineSpacing: 16 });
  });

  card(s, M, 6.42, W - 2 * M, 0.7, true, '141F16');
  s.addText('This is the POPIA answer, and it is also the product. A person can hold their own file without asking our permission to see it.', {
    x: M + 0.35, y: 6.56, w: 11.4, h: 0.42, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 13, bold: true, color: P.green });
}

/* ============ 19 · GO TO MARKET ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'Go-to-market strategy · 1 of 3', false); monogram(s, -1, false);
  title(s, 'Sell through security companies, not against them.', false);

  s.addText('They already hold the customer, the monthly billing rail and the vehicles on the road. Competing means buying households one at a time. Partnering means one integration reaches thousands — and customer acquisition cost collapses.', {
    x: M, y: 1.82, w: 11.5, h: 0.66, margin: 0, fontFace: F.b, fontSize: 13.5, color: P.pmute, lineSpacing: 19 });

  const ph = [
    ['1', 'PROVE', 'GKSS chapters and our own street. 20–50 honest installs. Publish the false-alarm rate whatever it says.', P.vigil],
    ['2', 'PARTNER', 'One mid-size security company. Prove the fuel saving and provable response times on their own data.', P.vigil],
    ['3', 'BUNDLE', 'One short-term insurer. Their premium discount acquires the customer — we pay no marketing rand.', P.umoja],
    ['4', 'GOVERN', 'Estates and body corporates. One committee decision covers 200+ homes.', P.umoja],
    ['5', 'ANCHOR', 'A bank’s fraud and disputes team. A verifiable duress record is unavailable today at any price.', P.anchor],
    ['6', 'CONTINENTAL', 'Kenya via Reboot Republic. Swap the crime dataset; the architecture ports.', P.anchor],
  ];
  ph.forEach((p, i) => {
    const x = M + (i % 3) * 4.06, y = 2.62 + Math.floor(i / 3) * 1.42;
    card(s, x, y, 3.82, 1.24, false);
    iconCircle(s, x + 0.24, y + 0.22, 0.36, p[3], p[0], P.white);
    s.addText(p[1], { x: x + 0.72, y: y + 0.24, w: 2.9, h: 0.3, margin: 0, fontFace: F.b, fontSize: 11, bold: true, charSpacing: 1.2, color: p[3] });
    s.addText(p[2], { x: x + 0.24, y: y + 0.6, w: 3.36, h: 0.58, margin: 0, fontFace: F.b, fontSize: 10.5, color: P.pmute, lineSpacing: 14 });
  });

  card(s, M, 5.62, W - 2 * M, 1.24, false, P.night);
  s.addText('Every adoption is self-interested — nobody is asked to do us a favour.', { x: M + 0.35, y: 5.78, w: 11.4, h: 0.32, margin: 0, fontFace: F.b, fontSize: 13.5, bold: true, color: P.amber });
  s.addText('The member gets something that notices when they cannot reach a phone. The security company gets a lower fuel bill and proof it was fast when a customer says otherwise. The insurer gets evidenced claims. The estate gets a camera nobody can disable alone. The bank gets evidence that does not currently exist at any price.', {
    x: M + 0.35, y: 6.12, w: 11.4, h: 0.66, margin: 0, fontFace: F.b, fontSize: 11.5, color: P.ice, lineSpacing: 15 });
}

/* ============ 20 · UNIT ECONOMICS ============ */
{
  const s = pres.addSlide(); dark(s);
  eyebrow(s, 'Go-to-market strategy · 2 of 3 · the numbers', true); monogram(s, -1, true);
  title(s, 'A blockchain that gets cheaper per user as you grow.', true);

  card(s, M, 1.9, 5.9, 2.9, true);
  s.addText('KHAYA home bundle · R299 / month', { x: M + 0.3, y: 2.08, w: 5.3, h: 0.3, margin: 0, fontFace: F.b, fontSize: 12, bold: true, charSpacing: 0.6, color: P.amber });
  const ue = [['Hardware amortised (R3,000 ÷ 24)', 'R125'], ['Cloud + anchor, per household', 'R12'], ['Support and operations', 'R25']];
  ue.forEach((r, i) => {
    const y = 2.5 + i * 0.42;
    s.addText(r[0], { x: M + 0.3, y, w: 4.1, h: 0.34, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 12.5, color: P.mute });
    s.addText(r[1], { x: M + 4.4, y, w: 1.2, h: 0.34, margin: 0, valign: 'middle', align: 'right', fontFace: F.b, fontSize: 12.5, color: P.ice });
  });
  s.addShape(pres.ShapeType.line, { x: M + 0.3, y: 3.8, w: 5.3, h: 0, line: { color: P.edge, width: 1 } });
  s.addText('Gross margin', { x: M + 0.3, y: 3.9, w: 4.1, h: 0.4, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 13.5, bold: true, color: P.ice });
  s.addText('R137  ·  46%', { x: M + 4.0, y: 3.9, w: 1.6, h: 0.4, margin: 0, valign: 'middle', align: 'right', fontFace: F.b, fontSize: 13.5, bold: true, color: P.green });
  s.addText('Prototype BOM R3,900, modelled at R3,000 at 1,000 units. Flagged as an estimate, not a quote.', { x: M + 0.3, y: 4.36, w: 5.3, h: 0.36, margin: 0, fontFace: F.b, fontSize: 10.5, italic: true, color: P.mute });

  card(s, 6.8, 1.9, 5.9, 2.9, true);
  s.addText('Revenue lines', { x: 7.1, y: 2.08, w: 5.4, h: 0.3, margin: 0, fontFace: F.b, fontSize: 12, bold: true, charSpacing: 0.6, color: P.amber });
  const rv = [
    ['Security company licence', 'R35 / subscriber / mo'],
    ['Patrol optimiser SaaS', 'R12,000 / control room'],
    ['Estate / body corporate', 'R5,500 / estate / mo'],
    ['Insurer verified installation', 'R40 / member / mo'],
    ['Anchored claim record', 'R15 / record'],
  ];
  rv.forEach((r, i) => {
    const y = 2.5 + i * 0.44;
    s.addText(r[0], { x: 7.1, y, w: 3.2, h: 0.36, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 12, color: P.ice });
    s.addText(r[1], { x: 10.3, y, w: 2.1, h: 0.36, margin: 0, valign: 'middle', align: 'right', fontFace: F.b, fontSize: 11.5, bold: true, color: P.mute });
  });

  card(s, M, 5.0, W - 2 * M, 1.72, true, '141F16');
  s.addText('R1.30 per month.', { x: M + 0.4, y: 5.18, w: 4.0, h: 0.62, margin: 0, fontFace: F.h, fontSize: 34, bold: true, color: P.green });
  s.addText('For the entire network.', { x: M + 0.4, y: 5.82, w: 4.6, h: 0.36, margin: 0, fontFace: F.b, fontSize: 15, bold: true, color: P.ice });
  s.addText('720 anchors a month. Because every household is batched into one hourly root, it is a fixed cost — at a hundred homes or a hundred thousand, the same number.\n\nMost blockchain products die on cost and UX. Ours has no wallet, no token, no per-user fee, and no personal data on chain.', {
    x: 5.4, y: 5.2, w: 7.1, h: 1.34, margin: 0, fontFace: F.b, fontSize: 12.5, color: P.mute, lineSpacing: 17 });
  foot(s, 'Rand figures marked as estimates in the business case are flagged there and here. None of them is a quote.', true);
}

/* ============ 21 · SUSTAINABILITY & IMPACT ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'Go-to-market strategy · 3 of 3 · sustainability and impact', false); monogram(s, -1, false);
  title(s, 'What keeps running after demo day — and how you would measure it.', false, { fontSize: 31 });

  card(s, M, 1.94, 5.9, 2.5, false);
  s.addText('SUSTAINABILITY — why it survives', { x: M + 0.3, y: 2.1, w: 5.4, h: 0.3, margin: 0, fontFace: F.b, fontSize: 11, bold: true, charSpacing: 1, color: P.damber });
  bullets(s, [
    'Anchoring cost is fixed, not per user — growth cannot break the unit economics',
    'No token, no wallet, no exchange listing — nothing to collapse',
    'Runs on a laptop and a tunnel; cloud is a flex, never the decision path',
    'MIT-licensed core, public gap register — someone else can carry it if we stop',
    'Chosen for longevity: a claim may reach a court in ten years',
  ], { x: M + 0.3, y: 2.44, w: 5.4, h: 1.9, margin: 0, fontFace: F.b, fontSize: 11.5, color: P.pdark, lineSpacing: 15, paraSpaceAfter: 5, valign: 'top' });

  card(s, 6.8, 1.94, 5.9, 2.5, false);
  s.addText('MEASURABLE IMPACT — the metrics we publish', { x: 7.1, y: 2.1, w: 5.4, h: 0.3, margin: 0, fontFace: F.b, fontSize: 11, bold: true, charSpacing: 1, color: P.damber });
  const mi = [
    ['False alerts per camera-week', '≤ 1'],
    ['Detection → alert render, p95', '≤ 2,000 ms'],
    ['Anchor liveness — hours with a root', '100%'],
    ['Dual-signature compliance', '100%'],
    ['Subject requests answered inside 30 days', '100%'],
  ];
  mi.forEach((r, i) => {
    const y = 2.5 + i * 0.38;
    s.addText(r[0], { x: 7.1, y, w: 4.1, h: 0.32, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 11.5, color: P.pdark });
    s.addText(r[1], { x: 11.2, y, w: 1.2, h: 0.32, margin: 0, valign: 'middle', align: 'right', fontFace: F.b, fontSize: 11.5, bold: true, color: P.dgreen });
  });

  const gates = [
    ['G2 · 8 Sep', 'Anchored', 'Merkle batching, Ed25519 signing, public anchor, verifier extended', P.vigil],
    ['G3 · 14 Sep', 'Governed', 'Two-signature gates, subject access, deletion route — POPIA gap closed', P.umoja],
    ['G4 · 20 Sep', 'Calibrated', 'Fusion weights fitted on real data. Reliability diagram and ECE published', P.khaya],
    ['G5 · 24 Sep', 'Hardened', 'SAST, DAST, dependency scan, abuse-case suite, ingest fuzzing', P.anchor],
  ];
  gates.forEach((g, i) => {
    const x = M + i * 3.06;
    card(s, x, 4.66, 2.86, 1.62, false);
    s.addShape(pres.ShapeType.rect, { x, y: 4.66, w: 2.86, h: 0.08, fill: { color: g[3] }, line: { type: 'none' } });
    s.addText(g[0], { x: x + 0.22, y: 4.84, w: 2.5, h: 0.26, margin: 0, fontFace: F.b, fontSize: 10, bold: true, charSpacing: 0.8, color: g[3] });
    s.addText(g[1], { x: x + 0.22, y: 5.08, w: 2.5, h: 0.32, margin: 0, fontFace: F.h, fontSize: 15, bold: true, color: P.pdark });
    s.addText(g[2], { x: x + 0.22, y: 5.42, w: 2.5, h: 0.78, margin: 0, fontFace: F.b, fontSize: 10, color: P.pmute, lineSpacing: 13 });
  });

  card(s, M, 6.44, W - 2 * M, 0.68, false, 'EAF7F1');
  s.addText([
    { text: 'The dates are gates, not hopes.  ', options: { bold: true, color: P.pdark } },
    { text: 'Each one has a test that has to pass before the next begins, and the build log is append-only.', options: { color: '1A6E50' } },
  ], { x: M + 0.3, y: 6.58, w: W - 2 * M - 0.6, h: 0.4, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 12.5 });
}

/* ============ 22 · TEAM ============ */
{
  const s = pres.addSlide(); dark(s);
  eyebrow(s, 'Team composition · skills and capabilities', true); monogram(s, -1, true);
  title(s, 'Seven builders, four universities.\nContracts frozen before implementation.', true, { fontSize: 30, h: 1.0, lineSpacing: 34 });

  const team = [
    ['LH', 'Lethabo Hoaeane', 'University of South Africa', 'Profiler · co-lead', 'Architecture, product and UX. The spec, the ADRs, final review.', P.vigil],
    ['SK', 'Sibusiso Khumalo', 'Witwatersrand', 'Backend · co-lead', 'Service, evidence chain, CI, demo orchestration.', P.umoja],
    ['BA', 'Babatunde Adelusi', 'Pretoria', 'Business Developer', 'Business case, unit economics, go-to-market, the pitch.', P.anchor],
    ['MC', 'Mutarisi Chibaya', 'Pretoria', 'Frontend Developer', 'Operator dashboard and the member-facing screens.', P.vigil],
    ['KM', 'Khutso Mothopa', 'Witwatersrand', 'System Analyst', 'Requirements, work breakdown, traceability, verification map.', P.umoja],
    ['VK', 'Vukosi Khoza', 'Witwatersrand', 'IoT Developer', 'KHAYA appliance — sensors, edge runtime, power, tamper.', P.khaya],
    ['IM', 'Ipeleng Constance Modise', 'Tshwane University of Technology', 'Security Designer', 'OWASP coverage, threat model, SSDLC, physical security.', P.anchor],
  ];

  const CW = 2.84, GAP = 0.24, CH = 1.58;
  function member(t, x, y) {
    card(s, x, y, CW, CH, true);
    iconCircle(s, x + 0.16, y + 0.14, 0.4, t[5], t[0], P.white);
    s.addText(t[1], { x: x + 0.64, y: y + 0.12, w: CW - 0.78, h: 0.24, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 10, bold: true, color: P.ice });
    s.addText(t[2], { x: x + 0.64, y: y + 0.35, w: CW - 0.78, h: 0.19, margin: 0, valign: 'middle', fontFace: F.b, fontSize: 7.5, color: P.mute });
    s.addText(t[3].toUpperCase(), { x: x + 0.16, y: y + 0.62, w: CW - 0.32, h: 0.22, margin: 0, fontFace: F.b, fontSize: 8.5, bold: true, charSpacing: 0.8, color: t[5] });
    s.addText(t[4], { x: x + 0.16, y: y + 0.86, w: CW - 0.32, h: 0.62, margin: 0, valign: 'top', fontFace: F.b, fontSize: 8.5, color: P.mute, lineSpacing: 11 });
  }
  team.slice(0, 4).forEach((t, i) => member(t, M + i * (CW + GAP), 1.80));
  const bx = (W - (3 * CW + 2 * GAP)) / 2;
  team.slice(4).forEach((t, i) => member(t, bx + i * (CW + GAP), 3.50));

  card(s, M, 5.24, 5.9, 1.60, true);
  s.addText('Skills coverage', { x: M + 0.3, y: 5.38, w: 5.4, h: 0.26, margin: 0, fontFace: F.b, fontSize: 10.5, bold: true, charSpacing: 1, color: P.amber });
  s.addText('Software · backend · enterprise architecture · UI/UX · IoT and hardware · security design · systems analysis · business development. Four universities, and gender variety in the team.', {
    x: M + 0.3, y: 5.66, w: 5.4, h: 1.04, margin: 0, valign: 'top', fontFace: F.b, fontSize: 10.5, color: P.ice, lineSpacing: 13.5 });

  card(s, 6.8, 5.24, 5.9, 1.60, true, '2A1418');
  s.addText('Stated gap', { x: 7.1, y: 5.38, w: 5.3, h: 0.26, margin: 0, fontFace: F.b, fontSize: 10.5, bold: true, charSpacing: 1, color: 'F5898D' });
  s.addText('We are distributed across four universities and will not have built together in one room until the 25th. UI/UX is now owned rather than shared — but by a co-lead who also owns architecture, which is a single point of failure we are managing, not one we have removed.', {
    x: 7.1, y: 5.66, w: 5.3, h: 1.04, margin: 0, valign: 'top', fontFace: F.b, fontSize: 9.5, color: P.ice, lineSpacing: 12.5 });

  foot(s, 'Frozen contracts so nobody blocks. Sequenced gates, not concurrent sprints. A pull request for everything, including documents. Tests are the specification.', true);
}

/* ============ 23 · HONESTY LEDGER ============ */
{
  const s = pres.addSlide(); light(s);
  eyebrow(s, 'Honesty ledger', false); monogram(s, -1, false);
  title(s, 'The numbers that embarrass us, and the claims we refuse.', false, { fontSize: 30 });

  card(s, M, 1.9, 5.9, 2.55, false, 'FDF0F0');
  s.addText('Open gaps — disclosed, not discovered', { x: M + 0.3, y: 2.06, w: 5.5, h: 0.3, margin: 0, fontFace: F.b, fontSize: 11, bold: true, charSpacing: 1, color: P.dred });
  bullets(s, [
    'Our forecast loses to a constant baseline: MAE 0.484 vs 0.246. Published',
    'Fusion weights are hand-set, not fitted — the params file says so in machine-readable text',
    'Face thresholds 0.55 / 0.65 cosine are targets. Uncalibrated, and labelled as targets',
    'Latency is n = 10. A real p95 needs a real sample',
    'Bias evaluation on the face pipeline has not been run yet',
  ], { x: M + 0.3, y: 2.44, w: 5.5, h: 1.9, margin: 0, fontFace: F.b, fontSize: 11, color: P.pdark, lineSpacing: 14, paraSpaceAfter: 5, valign: 'top' });

  card(s, 6.8, 1.9, 5.9, 2.55, false);
  s.addText('Claims we refuse to make', { x: 7.1, y: 2.06, w: 5.4, h: 0.3, margin: 0, fontFace: F.b, fontSize: 11, bold: true, charSpacing: 1, color: P.pmute });
  bullets(s, [
    '“Identifies criminals” — it produces leads; humans identify',
    '“Court-admissible” — ours is structured to support a case',
    '“Unbiased AI” — bias-aware, and the human gate is the answer',
    '“Unhackable” — nothing is. Our claim is that intrusion is visible',
    '“Prevents crime”, and any uncalibrated precision, ever',
  ], { x: 7.1, y: 2.44, w: 5.4, h: 1.9, margin: 0, fontFace: F.b, fontSize: 11, color: P.pdark, lineSpacing: 14, paraSpaceAfter: 5, valign: 'top' });

  card(s, M, 4.66, W - 2 * M, 1.5, false, P.night);
  s.addText('Why we publish the failures', { x: M + 0.4, y: 4.84, w: 11.3, h: 0.3, margin: 0, fontFace: F.b, fontSize: 11, bold: true, charSpacing: 1, color: P.amber });
  s.addText('One of our own scripts opens by attacking its own project — “that is descriptive analytics, not prediction, no matter how it is presented” — and then gives the reader three ways to catch it lying. A parameter file carries a machine-readable warning against our own future overclaiming. A competitor can copy the practice. They cannot produce six weeks of it, dated before they knew they would need it.', {
    x: M + 0.4, y: 5.18, w: 11.3, h: 0.9, margin: 0, fontFace: F.b, fontSize: 12, color: P.ice, lineSpacing: 16 });

  const ev = [['104 pp', 'System Architecture & Design'], ['19 pp', 'Secure Development Lifecycle'], ['10 pp', 'SDLC Gap Analysis'], ['public', 'OPEN-GAPS.md, kept current']];
  ev.forEach((e, i) => {
    const x = M + i * 3.06;
    s.addText([{ text: e[0] + '  ', options: { bold: true, color: P.pdark } }, { text: e[1], options: { color: P.pmute } }],
      { x, y: 6.34, w: 3.0, h: 0.3, margin: 0, fontFace: F.b, fontSize: 11 });
  });
  foot(s, 'Publishing the numbers that embarrass us is the only reason to believe the ones that do not.', false);
}

/* ============ 24 · CLOSE ============ */
{
  const s = pres.addSlide(); dark(s);
  s.addShape(pres.ShapeType.ellipse, { x: 9.7, y: 1.55, w: 3.3, h: 3.3, fill: { color: P.amber, transparency: 90 }, line: { type: 'none' } });
  s.addShape(pres.ShapeType.ellipse, { x: 10.4, y: 2.25, w: 1.9, h: 1.9, fill: { color: P.amber, transparency: 74 }, line: { type: 'none' } });
  s.addShape(pres.ShapeType.ellipse, { x: 10.95, y: 2.8, w: 0.8, h: 0.8, fill: { color: P.amber }, line: { color: P.amber, width: 1 } });

  s.addText('It forgets you.', { x: M, y: 2.15, w: 8.6, h: 0.95, margin: 0, fontFace: F.h, fontSize: 50, bold: true, color: P.ice });
  s.addText('It never forgets what it did.', { x: M, y: 3.05, w: 8.6, h: 0.95, margin: 0, fontFace: F.h, fontSize: 50, bold: true, color: P.amber });
  s.addText('A documented seven-day half-life, with nobody required to clear you. Most surveillance systems need a human to decide to release you. Ours decides on its own to stop watching.', {
    x: M, y: 4.2, w: 8.2, h: 0.9, margin: 0, fontFace: F.b, fontSize: 14.5, color: P.mute, lineSpacing: 20 });

  s.addText('Every safety network in South Africa asks you to trust it. Ours can be verified.', { x: M, y: 5.25, w: 8.6, h: 0.4, margin: 0, fontFace: F.b, fontSize: 15, bold: true, color: P.green });
  s.addText('VUKA  ·  You are not alone. You don’t have to ask.', { x: M, y: 5.85, w: 8.6, h: 0.4, margin: 0, fontFace: F.h, fontSize: 18, bold: true, color: P.ice });
  foot(s, 'Team Sonar · VIGIL · UMOJA · KHAYA · ANCHOR · Geekulcha Annual Hackathon 2026', true);
  s.addNotes('Do not say anything after this. Let it land.');
}

pres.writeFile({ fileName: OUT }).then(f => console.log('WROTE', f, '| slides:', pres.slides ? pres.slides.length : 24));
