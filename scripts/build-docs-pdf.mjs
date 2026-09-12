// md -> print-ready HTML (mermaid rendered client-side), for headless-Chrome --print-to-pdf
// usage: node build_pdf.js <in.md> <out.html> "<Title>" "<Subtitle>" "<Kicker>"
import fs from 'node:fs';
import { marked } from 'marked';

const [, , inPath, outPath, title, subtitle, kicker] = process.argv;
const src = fs.readFileSync(inPath, 'utf8');

// pull mermaid fences out before marked touches them
const blocks = [];
const staged = src.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
  blocks.push(code);
  return `\n@@MERMAID_${blocks.length - 1}@@\n`;
});

marked.setOptions({ gfm: true, breaks: false });
let html = marked.parse(staged);

// marked v18 drops header ids; add our own so the contents list can link
const seen = {};
html = html.replace(/<h1>([\s\S]*?)<\/h1>/g, (m, inner) => {
  let slug = inner.replace(/<[^>]+>/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
  seen[slug] = (seen[slug] || 0) + 1;
  if (seen[slug] > 1) slug += '-' + seen[slug];
  return `<h1 id="${slug}">${inner}</h1>`;
});

html = html.replace(/<p>@@MERMAID_(\d+)@@<\/p>/g,
  (_, i) => `<div class="mfig"><pre class="mermaid">${blocks[i]
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>`);

// contents from the PART / APPENDIX h1s
const toc = [...html.matchAll(/<h1 id="([^"]+)">([\s\S]*?)<\/h1>/g)]
  .map(m => ({ id: m[1], text: m[2].replace(/<[^>]+>/g, '') }))
  .filter(h => /^(PART|APPEND|\d)/i.test(h.text) || h.text.includes('·'));

const tocHtml = toc.length > 2 ? `
<section class="toc">
  <h2 class="toch">Contents</h2>
  <ol>${toc.map(h => `<li><a href="#${h.id}">${h.text}</a></li>`).join('')}</ol>
</section>` : '';

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<style>
:root{
  --vigil:#2a78d6; --khaya:#eb6834; --umoja:#1baf7a; --anchor:#4a3aa7;
  --ink:#16161a; --mid:#4a4a55; --soft:#767683; --rule:#e2e2dc;
  --page:#ffffff; --tint:#f7f7f4;
}
@page{ size:A4; margin:15mm 12mm 16mm 12mm; }
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact; print-color-adjust:exact;}
body{
  margin:0; background:var(--page); color:var(--ink);
  font:10.5pt/1.55 "Segoe UI", system-ui, -apple-system, sans-serif;
  font-variant-numeric:tabular-nums;
}

/* ---------- cover ---------- */
.cover{
  page-break-after:always; padding:6mm 0 4mm;
}
.bars{display:flex; height:7mm; border-radius:2px; overflow:hidden}
.bars i{flex:1}
.bars i:nth-child(1){background:var(--vigil)}
.bars i:nth-child(2){background:var(--umoja)}
.bars i:nth-child(3){background:var(--khaya)}
.bars i:nth-child(4){background:var(--anchor)}
.cmid{padding-top:22mm}
.kick{font-size:9.5pt; letter-spacing:.22em; text-transform:uppercase; color:var(--soft); margin-bottom:10mm}
.ctitle{font-size:32pt; line-height:1.02; font-weight:700; letter-spacing:-.025em; margin:0 0 7mm; page-break-before:avoid; page-break-after:avoid}
.csub{font-size:14pt; line-height:1.35; color:var(--mid); font-weight:400; max-width:150mm; margin:0}
.cwords{margin-top:11mm; font-size:12.5pt; color:var(--anchor); font-weight:600; letter-spacing:-.01em}
.cfoot{margin-top:70mm; font-size:9pt; color:var(--soft); display:flex; justify-content:space-between; border-top:1px solid var(--rule); padding-top:3mm}
.layers{display:flex; gap:4mm; margin-top:9mm; font-size:9pt}
.layers div{flex:1; border-top:2.5px solid; padding-top:2.5mm}
.layers div b{display:block; font-size:11pt; letter-spacing:.04em}
.l1{border-color:var(--vigil)} .l2{border-color:var(--umoja)}
.l3{border-color:var(--khaya)} .l4{border-color:var(--anchor)}
.l1 b{color:var(--vigil)} .l2 b{color:var(--umoja)}
.l3 b{color:var(--khaya)} .l4 b{color:var(--anchor)}

/* ---------- contents ---------- */
.toc{page-break-after:always; padding-top:4mm}
.toch{font-size:20pt; margin:0 0 6mm; letter-spacing:-.02em; border:0; padding:0}
.toc ol{list-style:none; margin:0; padding:0; column-count:1}
.toc li{padding:2.1mm 0; border-bottom:1px dotted var(--rule); font-size:10.5pt}
.toc a{color:var(--ink); text-decoration:none}

/* ---------- flow ---------- */
main{padding-top:2mm}
h1{
  font-size:19pt; letter-spacing:-.02em; margin:0 0 5mm; padding:0 0 2.5mm;
  border-bottom:2.5px solid var(--anchor); page-break-before:always; page-break-after:avoid;
}
main > h1:first-child{page-break-before:avoid}
h2{font-size:14pt; letter-spacing:-.015em; margin:7mm 0 2.5mm; page-break-after:avoid; color:#0f0f14}
h3{font-size:11.5pt; margin:6mm 0 2mm; page-break-after:avoid; color:var(--mid)}
h4{font-size:10.5pt; margin:5mm 0 2mm; page-break-after:avoid; color:var(--mid)}
p{margin:0 0 3mm; orphans:3; widows:3}
ul,ol{margin:0 0 3.5mm; padding-left:5.5mm}
li{margin:.9mm 0}
a{color:var(--vigil); text-decoration:none}
strong{font-weight:650}
hr{border:0; border-top:1px solid var(--rule); margin:7mm 0}

blockquote{
  margin:4mm 0; padding:3mm 5mm; background:#f4f2fb;
  border-left:3.5px solid var(--anchor); border-radius:0 3px 3px 0;
  page-break-inside:avoid;
}
blockquote > :last-child{margin-bottom:0}
blockquote h2,blockquote h3{margin-top:0}

code{
  font:9.2pt/1.4 "Cascadia Mono", Consolas, ui-monospace, monospace;
  background:var(--tint); padding:.4mm 1.2mm; border-radius:2px; color:#2f2f3a;
}
pre{
  background:var(--tint); border:1px solid var(--rule); border-left:3px solid var(--soft);
  border-radius:3px; padding:3mm 4mm; overflow-x:auto; page-break-inside:avoid; margin:3.5mm 0;
}
pre code{background:none; padding:0; font-size:8.8pt; line-height:1.5}

table{
  width:100%; border-collapse:collapse; margin:3.5mm 0; font-size:9pt;
  page-break-inside:avoid;
}
thead{background:#eeeef0}
th,td{border:1px solid var(--rule); padding:1.8mm 2.2mm; text-align:left; vertical-align:top}
th{font-weight:650; font-size:8.8pt; letter-spacing:.01em}
tbody tr:nth-child(even){background:#fafaf8}
td code{font-size:8.4pt}

.mfig{
  margin:4mm 0; padding:3mm 4mm; background:#fcfcfb; border:1px solid var(--rule);
  border-radius:4px; text-align:center; page-break-inside:avoid;
}
.mfig svg{
  max-width:100%!important; width:auto!important; height:auto!important;
  overflow:visible;                       /* notes that sit just outside the viewBox */
}
/* wide-ish diagrams: cap the height so the figure always fits on one page */
.mfig.fit svg{ max-height:236mm!important; }
/* very wide figures: full column, never wider than the printable area */
.mfig.wide{ padding-left:2mm; padding-right:2mm; }
.mfig.wide svg{ max-height:200mm!important; }
/* very tall diagrams: full width, allowed to run across a page break rather than
   being shrunk into illegibility */
/* tall figures get the whole usable page height, alone on their page */
.mfig.tall{ page-break-inside:avoid; }
.mfig.tall svg{ max-height:243mm!important; }
.mfig.xtall{ page-break-inside:avoid; margin:5mm 0; }
.mfig.xtall svg{ max-height:245mm!important; }
.mermaid{background:none; border:0; padding:0; margin:0; text-align:center}

/* long tables are allowed to split rather than overflow a page */
table.long{page-break-inside:auto}
table.long tr{page-break-inside:avoid}
</style></head>
<body>

<section class="cover">
  <div>
    <div class="bars"><i></i><i></i><i></i><i></i></div>
    <div class="cmid">
      <div class="kick">${kicker || ''}</div>
      <h1 class="ctitle">${title}</h1>
      <p class="csub">${subtitle || ''}</p>
      <div class="cwords">You are not alone. You don't have to ask.</div>
    </div>
    <div class="layers">
      <div class="l1"><b>VIGIL</b>the person</div>
      <div class="l2"><b>UMOJA</b>the street</div>
      <div class="l3"><b>KHAYA</b>the property</div>
      <div class="l4"><b>ANCHOR</b>the record</div>
    </div>
  </div>
  <div class="cfoot">
    <span>Geekulcha Annual Hackathon 2026 &middot; Blockchain for Impact &middot; Safety</span>
    <span>v1.0 &middot; 19 August 2026</span>
  </div>
</section>

${tocHtml}

<main>
${html}
</main>

<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script type="module">
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      background:'#fcfcfb', primaryColor:'#eef3fb', primaryTextColor:'#16161a',
      primaryBorderColor:'#2a78d6', lineColor:'#5a5a68', secondaryColor:'#f2f6f4',
      tertiaryColor:'#f7f7f4', fontFamily:'Segoe UI, system-ui, sans-serif', fontSize:'12px',
      clusterBkg:'#f7f7f4', clusterBorder:'#d8d8d2',
      actorBkg:'#eef3fb', actorBorder:'#2a78d6', actorTextColor:'#16161a',
      noteBkg:'#fff7e0', noteBorder:'#d4a017'
    },
    flowchart:{ useMaxWidth:true, htmlLabels:true, curve:'basis', padding:8, nodeSpacing:30, rankSpacing:36, subGraphTitleMargin:{top:2,bottom:4} },
    sequence:{ useMaxWidth:true, wrap:true, width:165, diagramMarginX:46, actorMargin:58, boxMargin:10, noteMargin:12 },
    er:{ useMaxWidth:true },
    state:{ useMaxWidth:true }
  });
  // widen tables with many rows so they may break across pages
  document.querySelectorAll('table').forEach(t => {
    if (t.querySelectorAll('tbody tr').length > 14) t.classList.add('long');
  });

  // render, then size each figure by its aspect ratio
  await mermaid.run();
  document.querySelectorAll('.mfig > pre.mermaid > svg').forEach(svg => {
    const box = svg.viewBox && svg.viewBox.baseVal;
    const w = (box && box.width) || 1, h = (box && box.height) || 1;
    const r = h / w;
    const fig = svg.closest('.mfig');
    fig.dataset.vb = w.toFixed(0) + 'x' + h.toFixed(0);
    fig.dataset.ratio = r.toFixed(2);
    fig.classList.add(r < 0.45 ? 'wide' : (r > 2.3 ? 'xtall' : (r > 1.55 ? 'tall' : 'fit')));
  });
</script>
</body></html>`;

fs.writeFileSync(outPath, page, 'utf8');
console.log('wrote', outPath, (page.length / 1024).toFixed(0) + ' KB,', blocks.length, 'mermaid blocks');
