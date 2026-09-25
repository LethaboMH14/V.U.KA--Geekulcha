const css = `
:root { color-scheme: light; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #F5F3EE; color: #1F2328; }
* { box-sizing: border-box; }
body { margin: 0; background: #F5F3EE; color: #1F2328; line-height: 1.55; }
.wrap { width: min(100% - 2rem, 76rem); margin-inline: auto; }
header.wrap { padding-block: 2.5rem 1.25rem; }
main.wrap { padding-block: 1rem 3rem; }
footer.wrap { border-top: 1px solid #77766F; padding-block: 1rem 2rem; color: #444A51; }
.eyebrow { color: #1E3A5F; font-size: .78rem; font-weight: 750; letter-spacing: .1em; text-transform: uppercase; }
h1 { max-width: 15ch; margin: .2rem 0 .6rem; font-size: clamp(2.1rem, 7vw, 3.5rem); line-height: 1.05; letter-spacing: -.035em; }
h2 { margin-block: 2.5rem 1rem; font-size: clamp(1.45rem, 4vw, 2rem); line-height: 1.2; }
h3 { margin-block: 0 .4rem; font-size: 1.05rem; }
p { margin-block: .45rem; }
.intro { max-width: 60ch; color: #444A51; font-size: 1.1rem; }
.definition { margin-top: -.5rem; color: #444A51; }
.score-grid, .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.score-grid { margin-block: 1.2rem; }
.score-card { min-width: 0; padding: 1.2rem; border: 1px solid #77766F; border-radius: .7rem; background: #FFFEFB; }
.score-value { margin: .25rem 0; color: #1E3A5F; font-size: clamp(2rem, 8vw, 3rem); font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; }
.meta-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-block: 1.25rem 1.5rem; }
.meta-grid p { min-width: 0; margin: 0; padding: .8rem; border-left: 3px solid #1E3A5F; background: #E9E6DE; overflow-wrap: anywhere; }
code { font-size: .88em; }
a { color: #1E3A5F; font-weight: 700; text-decoration-thickness: .09em; text-underline-offset: .17em; }
a:hover { text-decoration-thickness: .16em; }
a:focus-visible, button:focus-visible, summary:focus-visible, [tabindex="0"]:focus-visible { outline: 3px solid #1E3A5F; outline-offset: 3px; }
.e4-note { display: inline-block; margin-block: .2rem; padding: .55rem .75rem; border: 1px dashed #4B5563; border-radius: .4rem; font-weight: 650; }
.category-list { display: grid; gap: .85rem; }
.category { padding: .9rem; border: 1px solid #77766F; border-radius: .55rem; background: #FFFEFB; }
.category-heading { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .3rem .8rem; }
.category-heading strong { overflow-wrap: anywhere; }
.bar-track { height: .8rem; margin-block: .55rem; overflow: hidden; border: 1px solid #565B61; border-radius: 99px; background: #E9E6DE; }
.bar-fill { height: 100%; background: #1E3A5F; }
.mix { color: #444A51; font-size: .92rem; }
.table-scroll { max-width: 100%; overflow-x: auto; border: 1px solid #77766F; border-radius: .55rem; background: #FFFEFB; }
table { width: 100%; min-width: 47rem; border-collapse: collapse; text-align: left; }
caption { padding: .8rem; color: #444A51; text-align: left; }
th, td { padding: .7rem .75rem; border-top: 1px solid #A4A29B; vertical-align: top; }
th { color: #1F2328; background: #E9E6DE; font-size: .88rem; }
tbody tr:nth-child(even) { background: #F8F7F2; }
.control-title { min-width: 12rem; max-width: 22rem; font-weight: 700; overflow-wrap: anywhere; }
.level-chip { display: inline-block; min-width: 2.5rem; padding: .18rem .5rem; border: 1px solid #555B62; border-radius: 99px; background: #E9E6DE; color: #1F2328; font-size: .85rem; font-weight: 800; text-align: center; }
.level-chip.e3, .level-chip.e4 { border-color: #065F46; background: #DCFCE7; color: #065F46; }
details { min-width: 10rem; }
summary { width: fit-content; color: #1E3A5F; cursor: pointer; font-weight: 700; }
.detail-list { display: grid; gap: .45rem; min-width: 16rem; max-width: 34rem; padding-top: .65rem; }
.detail-list p { margin: 0; overflow-wrap: anywhere; }
.detail-label { display: block; color: #1F2328; font-weight: 750; }
#load-state[data-error="true"] { padding: 1rem; border-left: 4px solid #1E3A5F; background: #E9E6DE; font-weight: 650; }
@media (max-width: 560px) {
  .wrap { width: min(100% - 1.25rem, 76rem); }
  header.wrap { padding-top: 1.7rem; }
  .score-grid, .meta-grid { grid-template-columns: 1fr; }
  .score-card { padding: 1rem; }
  .meta-grid { gap: .6rem; }
  h2 { margin-top: 2rem; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; } }
`;

const sheet = new CSSStyleSheet();
sheet.replaceSync(css);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
let barIndex = 0;

const byId = id => document.getElementById(id);
const setText = (element, value) => { element.textContent = value; };
const pct = value => `${Number(value).toFixed(2)}%`;
const titleCase = level => String(level || 'E0').toUpperCase();

function mixText(mix) {
  const entries = ['E4', 'E3', 'E2', 'E1', 'E0'].filter(level => Number(mix?.[level] || 0) > 0);
  const total = Object.values(mix || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  return `${total} controls: ${entries.map(level => `${mix[level]}×${level}`).join(', ') || 'no controls'}`;
}

function categoryCard(category) {
  const article = document.createElement('article');
  article.className = 'category';
  const heading = document.createElement('div');
  heading.className = 'category-heading';
  const name = document.createElement('strong');
  setText(name, category.name);
  const score = document.createElement('span');
  setText(score, `${pct(category.evidence_score)} evidence score · ${pct(category.evidence_confidence)} evidence confidence`);
  heading.append(name, score);
  const track = document.createElement('div');
  track.className = 'bar-track';
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-label', `${category.name} evidence score`);
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', '100');
  track.setAttribute('aria-valuenow', String(category.evidence_score));
  const fill = document.createElement('div');
  const width = Math.max(0, Math.min(100, Number(category.evidence_score)));
  const fillClass = `bar-fill-${barIndex++}`;
  fill.className = `bar-fill ${fillClass}`;
  sheet.insertRule(`.${fillClass} { width: ${width}%; }`, sheet.cssRules.length);
  track.append(fill);
  const mix = document.createElement('p');
  mix.className = 'mix';
  setText(mix, mixText(category.level_mix));
  article.append(heading, track, mix);
  return article;
}

function detail(label, value) {
  const item = document.createElement('p');
  const name = document.createElement('span');
  name.className = 'detail-label';
  setText(name, label);
  const text = document.createElement('span');
  setText(text, value || 'None recorded.');
  item.append(name, text);
  return item;
}

function controlRow(control) {
  const row = document.createElement('tr');
  const title = document.createElement('th');
  title.scope = 'row';
  title.className = 'control-title';
  setText(title, `${control.id} · ${control.title}`);
  const category = document.createElement('td');
  setText(category, control.category);
  const levelCell = document.createElement('td');
  const chip = document.createElement('span');
  const level = titleCase(control.level);
  chip.className = `level-chip ${level.toLowerCase()}`;
  setText(chip, level);
  levelCell.append(chip);
  const weight = document.createElement('td');
  setText(weight, String(control.weight));
  const info = document.createElement('td');
  const disclosure = document.createElement('details');
  const summary = document.createElement('summary');
  setText(summary, 'Show evidence details');
  const fields = document.createElement('div');
  fields.className = 'detail-list';
  fields.append(
    detail('What', control.what), detail('How', control.how), detail('Method', control.method),
    detail('Documentation paths', (control.doc_paths || []).map(item => typeof item === 'string' ? item : `${item.path}${item.exists ? '' : ' (missing)'}`).join(', ')),
    detail('Why', control.why), detail('Next', control.next),
  );
  disclosure.append(summary, fields);
  info.append(disclosure);
  row.append(title, category, levelCell, weight, info);
  return row;
}

function render(data) {
  setText(byId('overall-score'), pct(data.overall.evidence_score));
  setText(byId('overall-confidence'), pct(data.overall.evidence_confidence));
  setText(byId('commit-hash'), data.commit || 'Unavailable for this build');
  const date = new Date(data.generated_at);
  if (Number.isNaN(date.valueOf())) throw new Error('The score has no valid generated time.');
  const time = byId('computed-time');
  time.dateTime = date.toISOString();
  setText(time, date.toLocaleString());
  setText(byId('ci-state'), data.ci?.status || 'No CI result');
  if (data.ci?.run_url && /^https:\/\//.test(data.ci.run_url)) {
    const link = byId('ci-link');
    link.href = data.ci.run_url;
    byId('ci-link-container').hidden = false;
  }
  const e4Count = (data.controls || []).filter(control => control.level === 'E4').length;
  setText(byId('e4-note'), e4Count ? `E4: ${e4Count} independently verified control${e4Count === 1 ? '' : 's'}.` : 'No independent assessment yet (G8)');
  const list = byId('category-list');
  for (const category of data.categories || []) list.append(categoryCard(category));
  const rows = byId('control-rows');
  for (const control of data.controls || []) rows.append(controlRow(control));
  byId('score-content').hidden = false;
  byId('load-state').hidden = true;
}

fetch('./security-score.json', { cache: 'no-store' })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(render)
  .catch(error => {
    const state = byId('load-state');
    state.dataset.error = 'true';
    setText(state, `The security evidence record could not be loaded (${error.message}). No score is available.`);
  });
