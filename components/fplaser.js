/* Fabry–Pérot Laser — multimode laser, modulated directly. Treated as incoherent with width Δλ. */
OL.register({
  type: "fplaser", name: "Multimode FP Laser", short: "Multimode FP Laser", category: "Transmitters",
  doc: "Multimode laser. Several modes inside a width Δλ (1–5 nm), so dispersion is large.",
  help: {"eq": [{"t": "Mode spacing of the cavity", "tex": "\\Delta\\lambda_{m}=\\frac{\\lambda^{2}}{2nL_c}", "n": "Several modes lie inside the spectral width Δλ."}, {"t": "Pulse spreading in the fiber", "tex": "\\Delta\\tau=|D|\\,L\\,\\Delta\\lambda", "n": "The FP laser is treated as an incoherent source with width Δλ."}, {"t": "Modulation response", "tex": "H(f)=\\frac{1}{1-\\left(f/f_r\\right)^{2}+j\\,\\dfrac{f/f_r}{1.6}}", "n": ""}], "params": {"power": "Average launch power.", "lam": "Choose 1310 nm (D ≈ 0) to avoid the dispersion problem of the wide spectrum.", "er": "Extinction ratio of the direct modulation.", "dlam": "Wider spectrum → more pulse spreading Δτ = |D|LΔλ → shorter maximum length.", "spacing": "Only changes the drawing on the spectrum monitor (the modes).", "fr": "Resonance frequency: limits the speed of the laser."}, "extra": "", "src": ["keiser", "agrawal"], "ar": {"doc": "ليزر متعدد الأنماط، تقع عدة أنماط منه ضمن عرض طيفي Δλ قدره 1 إلى 5 nm تقريباً، ولذلك يكون أثر التشتت فيه كبيراً.", "eq": [{"t": "المسافة بين أنماط التجويف", "n": "عدد من الأنماط يقع داخل العرض الطيفي Δλ."}, {"t": "اتساع النبضة في الليف", "n": "يُعامَل ليزر FP كمصدر غير مترابط عرضه الطيفي Δλ."}, {"t": "استجابة التعديل", "n": ""}], "params": {"power": "القدرة المتوسطة التي يطلقها الليزر.", "lam": "اختر 1310 nm (حيث D ≈ 0) لتتجنب أثر التشتت الذي يسببه الطيف العريض.", "er": "نسبة الإطفاء في التعديل المباشر.", "dlam": "كلما اتسع الطيف زاد اتساع النبضة Δτ = |D|LΔλ، فيقصر أقصى طول ممكن للوصلة.", "spacing": "لا يؤثر إلا في رسم الأنماط على مراقب الطيف.", "fr": "تردد الرنين، ويحدد سرعة الليزر."}, "extra": ""}},
  inputs: [{ id: "in", kind: "elec", label: "Drive" }], outputs: [{ id: "out", kind: "opt", label: "Optical" }],
  params: [{ key: "power", label: "Average power", unit: "dBm", type: "number", def: 0, min: -30, max: 15, step: 0.5 },
    { key: "lam", label: "Wavelength", unit: "nm", type: "number", def: 1310, min: 800, max: 1650, step: 1 },
    { key: "er", label: "Extinction ratio", unit: "dB", type: "number", def: 6, min: 1, max: 15, step: 0.5 },
    { key: "dlam", label: "Spectral width (FWHM)", unit: "nm", type: "number", def: 2, min: 0.2, max: 10, step: 0.1 },
    { key: "spacing", label: "Mode spacing", unit: "nm", type: "number", def: 0.6, min: 0.1, max: 3, step: 0.05 },
    { key: "fr", label: "Resonance frequency fr", unit: "GHz", type: "number", def: 12, min: 1, max: 40, step: 0.5 }],
  icon: '<line x1="10" y1="8" x2="10" y2="32" class="ic-line"/><line x1="46" y1="8" x2="46" y2="32" class="ic-line"/><path d="M18 12 L18 28 L34 20 Z" class="ic-fill"/><line x1="34" y1="12" x2="34" y2="28" class="ic-line"/><line x1="46" y1="20" x2="58" y2="20" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var m = inp.in, t = m.t, N = t.N, i;
    var Pavg = OL.fromDbm(p.power), er = Math.pow(10, p.er / 10), mr = m.rz ? 0.25 : 0.5, P1 = Pavg / (mr + (1 - mr) / er), P0 = P1 / er;
    var d = Float64Array.from(m.x), di = new Float64Array(N), fr = p.fr * 1e9;
    OL.filt(d, di, t.fs, function (f) { var x = f / fr, re = 1 - x * x, im = x / 1.6, q = re * re + im * im; return [re / q, -im / q]; });
    var P = new Float64Array(N); for (i = 0; i < N; i++) P[i] = Math.max(P0 + (P1 - P0) * d[i], P0 * 0.2);
    var mm = OL.mean(P), s = OL.newOpt(t, p.lam);
    for (i = 0; i < N; i++) s.re[i] = Math.sqrt(P[i] * Pavg / mm);
    s.coherent = false; s.dlam = p.dlam; s.fpModes = p.spacing; s.rz = m.rz;
    return { out: { out: s } };
  }
});
