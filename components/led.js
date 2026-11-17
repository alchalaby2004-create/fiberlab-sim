/* LED — incoherent source with a wide spectrum (Δλ ≈ 1.45 λ² kT). */
OL.register({
  type: "led", name: "LED", short: "LED", category: "Transmitters",
  doc: "Light-emitting diode. Slow (carrier lifetime τ) and wide spectrum: Δλ ≈ 1.45·λ²·kT.",
  help: {"eq": [{"t": "Spectral width", "tex": "\\Delta\\lambda\\approx 1.45\\,\\lambda^{2}\\,kT", "n": "λ in µm and kT in eV give Δλ in µm (kT = 0.0259 eV at 300 K)."}, {"t": "Modulation response and bandwidth", "tex": "H(f)=\\frac{1}{1+j2\\pi f\\tau},\\qquad f_{3\\,\\mathrm{dB}}=\\frac{1}{2\\pi\\tau}", "n": "τ is the carrier lifetime."}], "params": {"power": "Average power coupled into the fiber (LEDs give little power, about −20 to −10 dBm).", "lam": "Δλ grows with λ²: about 27 nm at 850 nm and 60 nm at 1310 nm.", "er": "Extinction ratio.", "tau": "Longer τ → lower bandwidth (2 ns → 80 MHz). The LED cannot follow fast bits.", "temp": "Higher temperature → wider spectrum (Δλ ∝ kT).", "dlam": "Auto: Δλ from the formula above. Set a value to use the width given in a datasheet (real LEDs are about 30 to 180 nm)."}, "extra": "", "src": ["keiser"], "ar": {"doc": "دايود باعث للضوء. بطيء (عمر الحامل τ) وطيفه عريض: Δλ ≈ 1.45·λ²·kT.", "eq": [{"t": "العرض الطيفي", "n": "λ بالمايكرومتر و kT بالـ eV يعطيان Δλ بالمايكرومتر (kT = 0.0259 eV عند 300 K)."}, {"t": "استجابة التعديل وعرض النطاق", "n": "τ هو عمر حاملات الشحنة."}], "params": {"power": "القدرة المتوسطة الداخلة في الليف (الـ LED يعطي قدرة قليلة، حوالي −20 إلى −10 dBm).", "lam": "Δλ يزداد مع λ²: حوالي 27 nm عند 850 nm و 60 nm عند 1310 nm.", "er": "نسبة الإطفاء.", "tau": "τ أطول ← عرض نطاق أقل (2 ns ← 80 MHz). الـ LED لا يستطيع متابعة البتات السريعة.", "temp": "حرارة أعلى ← طيف أعرض (Δλ ∝ kT).", "dlam": "Auto: يُحسب Δλ من المعادلة أعلاه. أدخل قيمة لاستعمال العرض المذكور في ورقة بيانات الجهاز (الـ LED الحقيقي حوالي 30 إلى 180 nm)."}, "extra": ""}},
  inputs: [{ id: "in", kind: "elec", label: "Drive" }], outputs: [{ id: "out", kind: "opt", label: "Optical" }],
  params: [{ key: "power", label: "Average power", unit: "dBm", type: "number", def: -15, min: -40, max: 0, step: 0.5 },
    { key: "lam", label: "Wavelength", unit: "nm", type: "number", def: 850, min: 600, max: 1650, step: 1 },
    { key: "er", label: "Extinction ratio", unit: "dB", type: "number", def: 6, min: 1, max: 15, step: 0.5 },
    { key: "tau", label: "Carrier lifetime τ", unit: "ns", type: "number", def: 2, min: 0.2, max: 20, step: 0.1 },
    { key: "temp", label: "Temperature", unit: "K", type: "number", def: 300, min: 250, max: 400, step: 5 },
    { key: "dlam", label: "Spectral width (FWHM)", unit: "nm", type: "autonum", def: null, min: 1, max: 200, step: 1 }],
  icon: '<path d="M12 10 L12 30 L28 20 Z" class="ic-fill"/><line x1="28" y1="10" x2="28" y2="30" class="ic-line"/><path d="M34 12 l10 -6 m-4 0 l4 0 l0 4 M36 22 l12 -4 m-4 -1 l4 1 l-2 4 M36 30 l12 2 m-4 -3 l4 3 l-4 2" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var m = inp.in, t = m.t, N = t.N, i;
    var Pavg = OL.fromDbm(p.power), er = Math.pow(10, p.er / 10), mr = m.rz ? 0.25 : 0.5, P1 = Pavg / (mr + (1 - mr) / er), P0 = P1 / er;
    var d = Float64Array.from(m.x), di = new Float64Array(N), f3 = 1 / (2 * Math.PI * p.tau * 1e-9);
    OL.filt(d, di, t.fs, function (f) { var q = 1 + (f / f3) * (f / f3); return [1 / q, -(f / f3) / q]; });
    var P = new Float64Array(N); for (i = 0; i < N; i++) P[i] = Math.max(P0 + (P1 - P0) * d[i], P0 * 0.2);
    var mm = OL.mean(P), s = OL.newOpt(t, p.lam);
    for (i = 0; i < N; i++) s.re[i] = Math.sqrt(P[i] * Pavg / mm);
    s.coherent = false; s.dlam = p.dlam == null ? 1.45 * Math.pow(p.lam / 1000, 2) * (0.0259 * p.temp / 300) * 1000 : p.dlam; s.rz = m.rz;
    return { out: { out: s }, info: { text: "Spectral width Δλ ≈ " + OL.fmt(s.dlam, 1) + " nm, bandwidth ≈ " + OL.fmt(f3 / 1e6, 0) + " MHz" } };
  }
});
