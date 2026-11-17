/* Direct-Modulation Laser — the drive current changes power AND frequency (chirp). */
OL.register({
  type: "dml", name: "Direct-Modulation Laser", short: "Direct-Mod Laser", category: "Transmitters",
  doc: "DFB laser modulated by its current. Second-order response (fr) and chirp Δν = α/4π·d(lnP)/dt + κ(P − P̄).",
  help: {"eq": [{"t": "Power levels", "tex": "P_1=\\frac{\\overline{P}}{m+(1-m)/ER},\\qquad P_0=\\frac{P_1}{ER}", "n": "m = 0.5 for NRZ (half of the bits are 1)."}, {"t": "Laser modulation response", "tex": "H(f)=\\frac{1}{1-\\left(f/f_r\\right)^{2}+j\\,\\dfrac{f/f_r}{Q_r}}", "n": "Second-order response from the rate equations: resonance at fᵣ, damping Qᵣ."}, {"t": "Frequency chirp", "tex": "\\Delta\\nu(t)=\\frac{\\alpha}{4\\pi}\\,\\frac{d\\ln P}{dt}+\\kappa\\left(P-\\overline{P}\\right)", "n": "Transient chirp (α) at the edges, and adiabatic chirp (κ): 1s and 0s have different frequencies."}], "params": {"power": "Average launch power P̄.", "lam": "At 1550 nm (D ≈ 17 ps/(nm·km)) chirp turns into strong pulse spreading; at 1310 nm (D ≈ 0) chirp does little.", "er": "Low ER (typical 4–8 dB for a DML) → small eye opening. A higher ER means a lower P₀ and stronger chirp in real lasers.", "alpha": "α = 0 → no transient chirp. Larger α → wider spectrum → much more dispersion penalty after fiber at 1550 nm.", "kappa": "Adiabatic chirp: the 1s and 0s are at different frequencies, so after dispersion they arrive at different times.", "fr": "Higher fᵣ → faster laser. If fᵣ is close to the bit rate, the eye shows ringing and closes.", "qr": "Higher Qᵣ → less damping → more overshoot and ringing."}, "extra": "", "src": ["coldren", "henry", "koch", "agrawal"], "ar": {"doc": "ليزر DFB يُعدَّل بتياره. استجابة من الدرجة الثانية (fr) و chirp: Δν = α/4π·d(lnP)/dt + κ(P − P̄).", "eq": [{"t": "مستويات القدرة", "n": "m = 0.5 في NRZ (نصف البتات آحاد)."}, {"t": "استجابة تعديل الليزر", "n": "استجابة من الدرجة الثانية مستمدة من معادلات المعدّل: رنين عند fᵣ وتخميد Qᵣ."}, {"t": "انزياح التردد (chirp)", "n": "chirp عابر (α) عند الحواف، و chirp أديباتي (κ): الآحاد والأصفار بترددات مختلفة."}], "params": {"power": "القدرة المتوسطة المُطلقة P̄.", "lam": "عند 1550 nm (D ≈ 17 ps/(nm·km)) يتحول الـ chirp إلى اتساع كبير للنبضة؛ وعند 1310 nm (D ≈ 0) يكون أثره قليلاً.", "er": "ER منخفض (4–8 dB نموذجياً في DML) ← فتحة عين صغيرة. وفي الليزرات الحقيقية ER أعلى يعني P₀ أقل و chirp أقوى.", "alpha": "α = 0 ← لا chirp عابر. α أكبر ← طيف أعرض ← عقوبة تشتت أكبر بكثير بعد الليف عند 1550 nm.", "kappa": "chirp أديباتي: الآحاد والأصفار بترددات مختلفة، فتصل في أوقات مختلفة بعد التشتت.", "fr": "fᵣ أعلى ← ليزر أسرع. إذا اقترب fᵣ من معدل البتات تظهر اهتزازات في العين وتنغلق.", "qr": "Qᵣ أعلى ← تخميد أقل ← تجاوز واهتزاز أكثر."}, "extra": ""}},
  inputs: [{ id: "in", kind: "elec", label: "Drive" }], outputs: [{ id: "out", kind: "opt", label: "Optical" }],
  params: [{ key: "power", label: "Average power", unit: "dBm", type: "number", def: 0, min: -30, max: 20, step: 0.5 },
    { key: "lam", label: "Wavelength", unit: "nm", type: "number", def: 1550, min: 800, max: 1650, step: 1 },
    { key: "er", label: "Extinction ratio", unit: "dB", type: "number", def: 6, min: 1, max: 15, step: 0.5 },
    { key: "alpha", label: "Chirp factor α", unit: "", type: "number", def: 5, min: 0, max: 10, step: 0.5 },
    { key: "kappa", label: "Adiabatic chirp κ", unit: "GHz/mW", type: "number", def: 2, min: 0, max: 10, step: 0.5 },
    { key: "fr", label: "Resonance frequency fr", unit: "GHz", type: "number", def: 12, min: 1, max: 40, step: 0.5 },
    { key: "qr", label: "Resonance damping Qr", unit: "", type: "number", def: 1.6, min: 0.5, max: 5, step: 0.1 }],
  icon: '<path d="M10 10 L10 30 L26 20 Z" class="ic-fill"/><line x1="26" y1="10" x2="26" y2="30" class="ic-line"/><line x1="26" y1="20" x2="34" y2="20" class="ic-line"/><path d="M36 14 l12 0 m-4 -3 l4 3 l-4 3 M36 26 l12 0 m-4 -3 l4 3 l-4 3" class="ic-line"/><polyline points="50,34 53,34 53,28 57,28 57,34 60,34" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var m = inp.in, t = m.t, N = t.N, dt = 1 / t.fs, i;
    var Pavg = OL.fromDbm(p.power), er = Math.pow(10, p.er / 10), mr = m.rz ? 0.25 : 0.5;
    var P1 = Pavg / (mr + (1 - mr) / er), P0 = P1 / er;
    var d = Float64Array.from(m.x), di = new Float64Array(N), fr = p.fr * 1e9, Qr = p.qr;
    OL.filt(d, di, t.fs, function (f) { var x = f / fr, re = 1 - x * x, im = x / Qr, q = re * re + im * im; return [re / q, -im / q]; });
    var P = new Float64Array(N); for (i = 0; i < N; i++) P[i] = Math.max(P0 + (P1 - P0) * d[i], P0 * 0.2);
    var mm = OL.mean(P); for (i = 0; i < N; i++) P[i] *= Pavg / mm;
    var s = OL.newOpt(t, p.lam), acc = 0, ka = p.kappa * 1e9 / 1e-3;
    for (i = 0; i < N; i++) {
      var dl = (Math.log(P[(i + 1) % N]) - Math.log(P[(i - 1 + N) % N])) / (2 * dt);
      acc += 2 * Math.PI * (p.alpha / (4 * Math.PI) * dl + ka * (P[i] - Pavg)) * dt;
      var a = Math.sqrt(P[i]); s.re[i] = a * Math.cos(acc); s.im[i] = a * Math.sin(acc);
    }
    s.rz = m.rz;
    return { out: { out: s } };
  }
});
