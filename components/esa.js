/* Electrical Spectrum Monitor — power spectrum of an electrical signal (RF spectrum analyzer). */
OL.register({
  type: "esa", name: "Electrical Spectrum Monitor", short: "RF Spectrum", category: "Visualizers", instrument: true,
  doc: "Shows the power spectrum |X(f)|² of an electrical signal against frequency (one side, 0 to f_max).",
  help: {"eq": [{"t": "Power spectrum", "tex": "S(f)=\\frac{2\\,|X(f)|^{2}}{N^{2}},\\qquad P\\,[\\mathrm{dBm}]=10\\log_{10}\\frac{S(f)\\cdot 50\\,\\Omega}{1\\ \\mathrm{mW}}", "n": "X(f) is the FFT of the signal (mean removed). Current signals are shown as power into 50 Ω; drive signals relative to the peak."}, {"t": "Nulls of NRZ and RZ", "tex": "S_{\\mathrm{NRZ}}(f)\\propto \\mathrm{sinc}^{2}(fT),\\qquad S_{\\mathrm{RZ}}(f)\\propto \\mathrm{sinc}^{2}(f\\,dT)", "n": "First null at f = B for NRZ and at f = B/d for RZ (d = duty cycle): RZ needs about twice the bandwidth."}], "params": {"fmax": "Highest frequency shown, as a multiple of the bit rate."}, "extra": "", "src": ["agrawal", "keiser"], "ar": {"doc": "يرسم طيف القدرة |X(f)|² لإشارة كهربائية مقابل التردد، على جانب واحد من 0 إلى f_max.", "eq": [{"t": "طيف القدرة", "n": "X(f) هو تحويل FFT للإشارة بعد طرح متوسطها. إشارات التيار تُرسم كقدرة على مقاومة 50 Ω، وإشارات الدفع تُرسم نسبةً إلى القمة."}, {"t": "أصفار طيف NRZ وRZ", "n": "أول صفر يقع عند f = B في NRZ، وعند f = B/d في RZ حيث d نسبة العمل. لذلك تحتاج RZ تقريباً إلى ضعف عرض النطاق."}], "params": {"fmax": "أعلى تردد في الرسم، كمضاعف لمعدل البتات."}, "extra": ""}},
  inputs: [{ id: "in", kind: "elec", label: "Electrical" }], outputs: [],
  params: [{ key: "fmax", label: "Frequency span", unit: "× bit rate", type: "number", def: 4, min: 0.5, max: 16, step: 0.5 }],
  metrics: [{ key: "null1", label: "First spectral null (GHz)" }],
  icon: '<rect x="6" y="4" width="52" height="32" rx="3" class="ic-line"/><path d="M10 30 L14 8 L18 30 L22 20 L26 30 L30 25 L34 30 L54 30" class="ic-line"/><text x="49" y="16" text-anchor="middle" class="ic-text">f</text>',
  run: function (p, inp, ctx) {
    var s = inp.in, t = s.t, n = s.x.length;
    if (s.noise) s = OL.addNoise(s, t.fs / 2, ctx.rng);
    var re = Float64Array.from(s.x), im = new Float64Array(n), mu = OL.mean(re); for (var i = 0; i < n; i++) re[i] -= mu;
    OL.fft(re, im, false);
    var df = t.fs / n, kmax = Math.min(Math.floor(p.fmax * t.B / df), n / 2 - 1), x = [], y = [], P = [], pk = 0, A = s.unit === "A";
    for (var k = 1; k <= kmax; k++) { var v = (re[k] * re[k] + im[k] * im[k]) / (n * n) * 2; P.push(v); if (v > pk) pk = v; }
    // smooth over one bit-rate/64 to show the envelope, as a real analyzer with an RBW does
    var w = Math.max(1, Math.round(t.B / 64 / df)), nul = null;
    for (k = 0; k < P.length; k++) { var a = 0, c = 0; for (var j = Math.max(0, k - w); j <= Math.min(P.length - 1, k + w); j++) { a += P[j]; c++; } var e = a / c;
      x.push((k + 1) * df / 1e9); y.push(A ? 10 * Math.log10(Math.max(e * 50, 1e-30) / 1e-3) : 10 * Math.log10(Math.max(e / pk, 1e-15))); }
    var hw = Math.max(2, Math.round(0.25 * t.B / ((x[1] - x[0]) * 1e9)));
    for (k = hw; k < y.length - hw && nul == null; k++) { if (x[k] < 0.3 * t.B / 1e9) continue; var lo = true, hi = -1e9;
      for (j = k - hw; j <= k + hw; j++) { if (y[j] < y[k]) { lo = false; break; } if (y[j] > hi) hi = y[j]; }
      if (lo && y[k] < hi - 10) nul = x[k]; }
    return { view: { m: { null1: nul }, badge: "", numbers: [["Resolution", OL.fmt(df * (2 * w + 1) / 1e6, 1) + " MHz"], ["First null", nul == null ? "–" : OL.fmt(nul, 2) + " GHz"]],
      plots: [{ title: "Electrical spectrum" + (A ? " (power into 50 Ω)" : " (relative to the peak)"), x: "Frequency (GHz)", y: A ? "Power (dBm)" : "Relative power (dB)", traces: [{ x: x, y: y, name: "Spectrum", role: "main" }] }] } };
  }
});
