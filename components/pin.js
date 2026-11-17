/* PIN Photodiode — current I = R·P. Shot and thermal noise are added by the next filter. */
OL.register({
  type: "pin", name: "PIN Photodiode", short: "PIN Photodiode", category: "Receivers",
  doc: "I = R·P, R = ηqλ/hc. Noise: σ²shot = 2qRP·Bn, σth = in·√Bn (added by the low-pass filter).",
  help: {"eq": [{"t": "Responsivity and current", "tex": "R=\\frac{\\eta q\\lambda}{hc}\\approx\\frac{\\eta\\,\\lambda[\\mu\\mathrm{m}]}{1.24}\\ \\mathrm{A/W},\\qquad I=RP", "n": "About 1 A/W at 1550 nm for η = 0.8."}, {"t": "Noise (added by the low-pass filter)", "tex": "\\sigma_{\\mathrm{shot}}^{2}=2qI\\,B_n,\\qquad \\sigma_{\\mathrm{th}}=i_n\\sqrt{B_n}", "n": "Bₙ is the noise bandwidth of the filter after the photodiode."}, {"t": "Thermal noise density", "tex": "i_n=\\sqrt{\\frac{4kT}{R_L}}", "n": "iₙ = 20 pA/√Hz is a typical value for a 10 Gb/s receiver."}], "params": {"eta": "Higher η → more current for the same light → better sensitivity.", "th": "Thermal noise dominates in a PIN receiver: lower iₙ → better sensitivity."}, "extra": "", "src": ["keiser", "agrawal"], "ar": {"doc": "I = R·P حيث R = ηqλ/hc. الضوضاء: σ²shot = 2qRP·Bn و σth = in·√Bn (يضيفها المرشح منخفض التمرير).", "eq": [{"t": "الاستجابية والتيار", "n": "حوالي 1 A/W عند 1550 nm عندما η = 0.8."}, {"t": "الضوضاء (يضيفها المرشح منخفض التمرير)", "n": "Bₙ هو عرض نطاق الضوضاء للمرشح بعد الكاشف."}, {"t": "كثافة الضوضاء الحرارية", "n": "القيمة iₙ = 20 pA/√Hz نموذجية لمستقبل 10 Gb/s."}], "params": {"eta": "η أعلى ← تيار أكبر للضوء نفسه ← حساسية أفضل.", "th": "الضوضاء الحرارية هي الغالبة في مستقبل PIN: iₙ أقل ← حساسية أفضل."}, "extra": ""}},
  inputs: [{ id: "in", kind: "opt", label: "Optical" }], outputs: [{ id: "out", kind: "elec", label: "Current" }],
  params: [{ key: "eta", label: "Quantum efficiency η", unit: "", type: "number", def: 0.8, min: 0.1, max: 1, step: 0.05 },
    { key: "th", label: "Thermal noise", unit: "pA/√Hz", type: "number", def: 20, min: 0, max: 100, step: 1 }],
  icon: '<path d="M30 10 L30 30 L46 20 Z" class="ic-fill" transform="rotate(180 38 20)"/><line x1="30" y1="10" x2="30" y2="30" class="ic-line"/><path d="M6 12 l14 4 m-4 -4 l4 4 l-5 2 M6 26 l14 -2 m-5 -3 l5 3 l-4 3" class="ic-line"/><line x1="46" y1="20" x2="60" y2="20" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var s = OL.materialize(inp.in), t = s.t, R = p.eta * OL.Q * s.lam * 1e-9 / (OL.H * OL.C), I = OL.intensity(s), x = new Float64Array(t.N);
    for (var i = 0; i < t.N; i++) x[i] = R * I[i];
    return { out: { out: { kind: "elec", t: t, x: x, unit: "A", rz: s.rz, noise: { th: p.th * 1e-12, shotK: 2 * OL.Q } } },
      info: { text: "Responsivity R = " + OL.fmt(R, 3) + " A/W. Received power " + OL.fmt(OL.dbm(OL.power(s)), 2) + " dBm." + (s.spreadPs ? " Pulse spreading " + OL.fmt(s.spreadPs, 0) + " ps." : "") } };
  }
});
