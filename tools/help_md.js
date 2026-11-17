// Builds the help as Markdown (LaTeX math) from the component registry.
const fs = require('fs'), path = require('path');
const { OL } = require('../load.js');
const LANG = process.argv[2] === 'ar' ? 'ar' : 'en';
new Function('OL', fs.readFileSync(path.join(__dirname, '../refs.js'), 'utf8'))(OL);
const U = LANG === 'ar' ? OL.HELP_UI_AR : {}; const T = (x) => U[x] || x;
const CAT_AR = { 'Transmitters': 'المرسلات', 'Optical fibers': 'الألياف الضوئية', 'Amplifiers and passive': 'المضخمات والمكونات المنفعلة', 'Receivers': 'المستقبلات', 'Visualizers': 'أجهزة العرض' };
const KN = { opt: 'optical', elec: 'electrical', bin: 'binary', any: 'optical or electrical' };
const esc = (s) => String(s).replace(/\|/g, '\\|');
let md = fs.readFileSync(path.join(__dirname, LANG === 'ar' ? 'help_intro_ar.md' : 'help_intro.md'), 'utf8') + '\n';
let sec = 5;
for (const cat of OL.CATEGORIES) {
  const items = OL.order.filter((t) => OL.components[t].category === cat); if (!items.length) continue;
  md += `\n## ${sec}. ${LANG === 'ar' ? CAT_AR[cat] + ' (' + cat + ')' : cat}\n`; let k = 1;
  for (const t of items) {
    const d = OL.components[t], H0 = d.help, A = LANG === 'ar' ? H0.ar : null;
    const H = { eq: H0.eq.map((e, i) => ({ t: A ? A.eq[i].t : e.t, tex: e.tex, n: A ? A.eq[i].n : e.n })), params: A ? A.params : H0.params, extra: A ? A.extra : H0.extra, src: H0.src };
    md += `\n### ${sec}.${k++} ${d.name}\n\n${A ? A.doc : d.doc}\n\n`;
    const io = d.inputs.map((p) => `${T('in')}: ${p.label} (${T(KN[p.kind])})`).concat(d.outputs.map((p) => `${T('out')}: ${p.label} (${T(KN[p.kind])})`));
    if (io.length) md += `*${LANG === 'ar' ? 'المنافذ' : 'Ports'}:* ${io.join('; ')}.\n\n`;
    md += `**${T('Governing equations')}**\n\n`;
    for (const e of H.eq) md += `*${e.t}*\n\n$$${e.tex}$$\n\n${e.n ? e.n + '\n\n' : ''}`;
    if (d.params.length) {
      md += `**${T('How the settings change the result')}**\n\n| ${T('Setting')} | ${T('Default')} | ${T('Effect')} |\n|------------------|----------|------------------------------------------|\n`;
      for (const q of d.params) {
        let def = q.def == null ? 'Auto' : q.type === 'select' ? (q.options.find((o) => String(o[0]) === String(q.def)) || [0, q.def])[1] : q.def + (q.unit ? ' ' + q.unit : '');
        md += `| ${esc(q.label + (q.unit ? ' (' + q.unit + ')' : ''))} | ${esc(def)} | ${esc(H.params[q.key] || '')} |\n`;
      }
      md += '\n';
    }
    if (H.extra) md += `${H.extra}\n\n`;
    md += `**${T('Sources')}:** ${H.src.map((s) => OL.REFS[s]).join(' ')}\n\n`;
  }
  sec++;
}
md += `\n# ${T('Sources')}\n\n`;
Object.values(OL.REFS).forEach((r, i) => { md += `${i + 1}. ${r}\n`; });
md += `\n${LANG === 'ar' ? OL.HELP_UI_AR.note : 'Equations are standard textbook results. The sources are the usual references for each equation; check the edition you use for chapter and page numbers.'}\n`;
fs.writeFileSync(path.join(__dirname, '../dist/' + (LANG === 'ar' ? 'help_ar.md' : 'help.md')), md);
console.log('help.md', md.length);
