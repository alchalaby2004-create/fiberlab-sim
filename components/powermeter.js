/* Optical Power Meter — average optical power. */
OL.register({
  type: "powermeter", name: "Optical Power Meter", short: "Power Meter", category: "Visualizers", instrument: true,
  doc: "Shows the average optical power in dBm and in W.",
  help: {"eq": [{"t": "Average power", "tex": "P=\\frac{1}{N}\\sum_{i}|E_i|^{2},\\qquad P\\,[\\mathrm{dBm}]=10\\log_{10}\\frac{P}{1\\ \\mathrm{mW}}", "n": ""}], "params": {}, "extra": "", "src": ["keiser"], "ar": {"doc": "يعرض القدرة الضوئية المتوسطة بالـ dBm والواط.", "eq": [{"t": "القدرة المتوسطة", "n": ""}], "params": {}, "extra": ""}},
  inputs: [{ id: "in", kind: "opt", label: "Optical" }], outputs: [],
  metrics: [{ key: "dbm", label: "Power (dBm)" }],
  icon: '<rect x="8" y="4" width="48" height="32" rx="4" class="ic-line"/><path d="M16 28 A16 16 0 0 1 48 28" class="ic-line"/><line x1="32" y1="28" x2="42" y2="14" class="ic-line"/><circle cx="32" cy="28" r="2.5" class="ic-fill"/>',
  run: function (p, inp, ctx) {
    var P = OL.power(inp.in), d = OL.dbm(P), w = P >= 1e-3 ? OL.fmt(P * 1e3, 3) + " mW" : P >= 1e-6 ? OL.fmt(P * 1e6, 3) + " µW" : OL.fmt(P * 1e9, 3) + " nW";
    return { view: { m: { dbm: d }, badge: OL.fmt(d, 2) + " dBm", numbers: [["Power", OL.fmt(d, 3) + " dBm"], ["Power", w]] } };
  }
});
