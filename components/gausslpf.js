/* Gaussian Low-Pass Filter — same role as the Bessel filter, with a Gaussian shape (Bn ≈ 1.06 fc). */
OL.register({
  type: "gausslpf", name: "Gaussian Low-Pass Filter", short: "Gaussian LPF", category: "Receivers",
  doc: "Gaussian low-pass filter. Adds the pending receiver noise for its noise bandwidth Bn ≈ 1.06·fc.",
  help: {"eq": [{"t": "Gaussian filter", "tex": "H(f)=\\exp\\!\\left[-\\frac{\\ln 2}{2}\\left(\\frac{f}{f_c}\\right)^{2}\\right],\\qquad B_n\\approx 1.06\\,f_c", "n": ""}], "params": {"fc": "Same trade-off as the Bessel filter: noise against ISI."}, "extra": "", "src": ["agrawal"], "ar": {"doc": "مرشح غاوسي للتمرير المنخفض. يضيف ضوضاء المستقبل على عرض نطاق ضوضاء Bn ≈ 1.06·fc.", "eq": [{"t": "المرشح الغاوسي", "n": ""}], "params": {"fc": "الموازنة نفسها كما في مرشح Bessel: ضوضاء أقل مقابل تداخل أكبر بين البتات."}, "extra": ""}},
  inputs: [{ id: "in", kind: "elec", label: "Input" }], outputs: [{ id: "out", kind: "elec", label: "Output" }],
  params: [{ key: "fc", label: "Cut-off frequency", unit: "× bit rate", type: "number", def: 0.75, min: 0.2, max: 2, step: 0.05 }],
  icon: '<rect x="10" y="6" width="44" height="28" rx="3" class="ic-line"/><path d="M14 30 C24 30 26 12 32 12 C38 12 40 30 50 30" class="ic-line"/><line x1="2" y1="20" x2="10" y2="20" class="ic-line"/><line x1="54" y1="20" x2="62" y2="20" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var e = inp.in, t = e.t, h = OL.gaussLP(p.fc * t.B), s = OL.cloneElec(e), si = new Float64Array(t.N);
    OL.filt(s.x, si, t.fs, h);
    var Bn = 1.0645 * p.fc * t.B;
    if (e.noise) s = OL.addNoise(s, Bn, ctx.rng);
    return { out: { out: s } };
  }
});
