/* NRZ Line Coder — turns bits into an electrical drive signal (0 to 1). */
OL.register({
  type: "nrz", name: "NRZ Line Coder", short: "NRZ Coder", category: "Transmitters",
  doc: "Non-return-to-zero pulses. The rise time is set by a Gaussian low-pass shape.",
  help: {"eq": [{"t": "NRZ signal", "tex": "v(t)=\\sum_{k} a_k\\,p(t-kT),\\qquad a_k\\in\\{0,1\\}", "n": "p(t) is a rectangular pulse of width T (the whole bit)."}, {"t": "Driver (rise-time) filter", "tex": "H(f)=\\exp\\!\\left[-\\frac{\\ln 2}{2}\\left(\\frac{f}{f_d}\\right)^{2}\\right],\\qquad f_d=\\mathrm{bw}\\cdot B", "n": "f(d) is the −3 dB bandwidth of the driver."}], "params": {"bw": "Smaller value → slower edges (longer rise time), the bits run into each other (ISI) and the eye closes. Larger value → sharp edges but a wider spectrum."}, "extra": "", "src": ["agrawal", "keiser"], "ar": {"doc": "نبضات NRZ (لا عودة إلى الصفر). زمن الصعود يحدده مرشح غاوسي.", "eq": [{"t": "إشارة NRZ", "n": "p(t) نبضة مستطيلة عرضها T (البت كاملاً)."}, {"t": "مرشح المشغّل (زمن الصعود)", "n": "f(d) هو عرض نطاق المشغّل عند −3 dB."}], "params": {"bw": "قيمة أصغر ← حواف أبطأ (زمن صعود أطول)، فتتداخل البتات (ISI) وتنغلق العين. قيمة أكبر ← حواف حادة لكن طيف أعرض."}, "extra": ""}},
  inputs: [{ id: "in", kind: "bin", label: "Bits" }], outputs: [{ id: "out", kind: "elec", label: "Drive" }],
  params: [{ key: "bw", label: "Driver bandwidth", unit: "× bit rate", type: "number", def: 0.8, min: 0.2, max: 10, step: 0.05 }],
  icon: '<polyline points="6,30 14,30 14,10 30,10 30,30 38,30 38,10 58,10" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var t = inp.in.t, x = new Float64Array(t.N), xi = new Float64Array(t.N);
    for (var i = 0; i < t.N; i++) x[i] = t.bits[Math.floor(i / t.sps)];
    OL.filt(x, xi, t.fs, OL.gaussLP(Math.min(p.bw * t.B, 40e9)));
    var f3 = Math.min(p.bw * t.B, 40e9);
    return { out: { out: { kind: "elec", t: t, x: x, unit: "drive", noise: null, rz: false } }, info: { text: "Rise time (10–90%) ≈ " + OL.fmt(0.34 / f3 * t.B, 3) + " bit = " + OL.fmt(0.34 / f3 * 1e12, 0) + " ps." } };
  }
});
