/* Rate-Equation Laser — single-mode semiconductor laser solved from the carrier and photon rate equations. */
OL.register({
  type: "rlaser", name: "Rate-Equation Laser", short: "Rate-Eq. Laser", category: "Transmitters",
  doc: "Current I(t) = I_bias + I_mod·v(t) drives the carrier (N) and photon (S) rate equations. Shows threshold, turn-on delay, relaxation oscillations and chirp.",
  help: {"eq": [{"t": "Carrier rate equation", "tex": "\\frac{dN}{dt}=\\frac{I(t)}{qV}-\\frac{N}{\\tau_n}-\\frac{v_g a (N-N_{tr})}{1+\\varepsilon S}\\,S", "n": "N: carrier density, I = I(bias) + I(mod)·v(t)."}, {"t": "Photon rate equation", "tex": "\\frac{dS}{dt}=\\Gamma\\frac{v_g a (N-N_{tr})}{1+\\varepsilon S}\\,S-\\frac{S}{\\tau_p}+\\Gamma\\beta\\frac{N}{\\tau_n}", "n": "S: photon density. The last term is spontaneous emission that starts the lasing."}, {"t": "Phase (chirp)", "tex": "\\frac{d\\varphi}{dt}=\\frac{\\alpha}{2}\\left[\\Gamma v_g a (N-N_{tr})-\\frac{1}{\\tau_p}\\right]", "n": "α turns every change of N into a change of frequency (transient and adiabatic chirp)."}, {"t": "Threshold and output power", "tex": "I_{th}=\\frac{qV}{\\tau_n}\\left(N_{tr}+\\frac{1}{\\Gamma v_g a\\tau_p}\\right),\\qquad P=\\frac{\\eta\\,h\\nu\\,V}{2\\Gamma\\tau_p}\\,S", "n": "Fixed device values: V = 1.5×10⁻¹⁰ cm³, v(g) = 8.5×10⁹ cm/s, a = 2.5×10⁻¹⁶ cm², Nₜᵣ = 10¹⁸ cm⁻³, Γ = 0.4, β = 3×10⁻⁵. With the defaults Iₜₕ ≈ 33.5 mA."}, {"t": "Turn-on delay (bias below threshold)", "tex": "t_d\\approx\\tau_n\\ln\\frac{I_{mod}}{I_{mod}+I_{bias}-I_{th}}", "n": "Biasing at or above threshold removes the delay."}], "params": {"ib": "Bias current. Below Iₜₕ the laser is off between pulses: turn-on delay and a strong first spike. Above Iₜₕ the 0 level is not dark (lower extinction ratio) and adiabatic chirp appears.", "im": "Current added for a 1 bit. A larger value gives more power and more chirp.", "lam": "Emission wavelength.", "tn": "Carrier lifetime. A longer τn gives a longer turn-on delay (and a lower threshold).", "tp": "Photon lifetime. It sets the threshold (shorter τp → higher Iₜₕ) and the speed of the relaxation oscillations.", "alpha": "Linewidth enhancement factor. α = 0 removes the chirp.", "eps": "Gain compression. It damps the relaxation oscillations and lowers the first spike.", "eta": "Output (differential) efficiency. It scales the power: slope ≈ η·hν/(2q) ≈ 0.16 W/A for η = 0.4."}, "extra": "The equations are solved with a 4th-order Runge–Kutta method (step ≤ 0.25 ps). To see fast chirp details use a high Samples per bit (128 or more). There is no laser noise in this model.", "src": ["agrawal", "coldren"], "ar": {"doc": "يقود التيار I(t) = I_bias + I_mod·v(t) معادلتي المعدل للحاملات (N) والفوتونات (S). ومنهما يظهر تيار العتبة، وتأخر التشغيل، والتذبذبات الاسترخائية، والـ chirp.", "eq": [{"t": "معادلة معدل الحاملات", "n": "N كثافة الحاملات، وI = I(bias) + I(mod)·v(t)."}, {"t": "معادلة معدل الفوتونات", "n": "S كثافة الفوتونات. والحد الأخير هو الانبعاث التلقائي، وهو الذي يبدأ منه عمل الليزر."}, {"t": "الطور (chirp)", "n": "يحوّل α كل تغيّر في N إلى تغيّر في التردد، فيظهر chirp عابر وchirp ثابت."}, {"t": "العتبة والقدرة الخارجة", "n": "قيم الجهاز الثابتة: V = 1.5×10⁻¹⁰ cm³، وv(g) = 8.5×10⁹ cm/s، وa = 2.5×10⁻¹⁶ cm²، وNₜᵣ = 10¹⁸ cm⁻³، وΓ = 0.4، وβ = 3×10⁻⁵. ومع القيم الافتراضية يكون Iₜₕ ≈ 33.5 mA."}, {"t": "تأخر التشغيل (انحياز تحت العتبة)", "n": "إذا كان الانحياز عند العتبة أو فوقها يختفي التأخر."}], "params": {"ib": "تيار الانحياز. إذا كان تحت Iₜₕ ينطفئ الليزر بين النبضات، فيظهر تأخر في التشغيل وقمة أولى قوية. وإذا كان فوقها لا يكون مستوى 0 مظلماً (فتنخفض نسبة الإطفاء)، ويظهر chirp ثابت.", "im": "التيار المضاف عند البت 1. كلما زاد زادت القدرة وزاد الـ chirp.", "lam": "الطول الموجي الذي يبعثه الليزر.", "tn": "عمر الحاملات. كلما طال τn طال تأخر التشغيل (وانخفضت العتبة).", "tp": "عمر الفوتونات. يحدد العتبة (τp الأقصر يعني Iₜₕ أعلى)، ويحدد سرعة التذبذبات الاسترخائية.", "alpha": "معامل تعزيز عرض الخط. عندما α = 0 يختفي الـ chirp.", "eps": "انضغاط الربح. يخمد التذبذبات الاسترخائية ويخفض القمة الأولى.", "eta": "الكفاءة الخارجية (التفاضلية)، وتتناسب معها القدرة: الميل ≈ η·hν/(2q)، أي نحو 0.16 W/A عندما η = 0.4."}, "extra": "تُحل المعادلات بطريقة Runge–Kutta من الرتبة الرابعة (بخطوة لا تزيد على 0.25 ps). ولرؤية تفاصيل الـ chirp السريعة استعمل عدداً كبيراً من العينات لكل بت (128 أو أكثر). ولا يتضمن هذا النموذج ضوضاء الليزر."}},
  inputs: [{ id: "in", kind: "elec", label: "Drive" }], outputs: [{ id: "out", kind: "opt", label: "Optical" }],
  params: [{ key: "ib", label: "Bias current", unit: "mA", type: "number", def: 40, min: 0, max: 200, step: 1 },
    { key: "im", label: "Modulation peak current", unit: "mA", type: "number", def: 20, min: 0, max: 200, step: 1 },
    { key: "lam", label: "Wavelength", unit: "nm", type: "number", def: 1550, min: 800, max: 1650, step: 1 },
    { key: "tn", label: "Carrier lifetime τn", unit: "ns", type: "number", def: 1, min: 0.1, max: 10, step: 0.1 },
    { key: "tp", label: "Photon lifetime τp", unit: "ps", type: "number", def: 3, min: 0.5, max: 10, step: 0.1 },
    { key: "alpha", label: "Linewidth factor α", unit: "", type: "number", def: 5, min: 0, max: 10, step: 0.5 },
    { key: "eps", label: "Gain compression ε", unit: "×10⁻¹⁷ cm³", type: "number", def: 1, min: 0, max: 10, step: 0.1 },
    { key: "eta", label: "Output efficiency η", unit: "", type: "number", def: 0.4, min: 0.05, max: 1, step: 0.05 }],
  icon: '<path d="M10 10 L10 30 L26 20 Z" class="ic-fill"/><line x1="26" y1="10" x2="26" y2="30" class="ic-line"/><path d="M34 14 l12 0 m-4 -3 l4 3 l-4 3 M34 26 l12 0 m-4 -3 l4 3 l-4 3" class="ic-line"/><text x="54" y="13" text-anchor="middle" class="ic-text">dN</text>',
  run: function (p, inp, ctx) {
    var m = inp.in, t = m.t, N = t.N, dt = 1 / t.fs;
    // fixed device constants (cm units, typical InGaAsP DFB, Agrawal)
    var V = 1.5e-10, vg = 8.5e9, a = 2.5e-16, Ntr = 1e18, G = 0.4, beta = 3e-5, q = OL.Q;
    var tn = p.tn * 1e-9, tp = p.tp * 1e-12, eps = p.eps * 1e-17, hv = OL.H * OL.C / (p.lam * 1e-9);
    var Nth = Ntr + 1 / (G * vg * a * tp), Ith = q * V * Nth / tn;
    var I = new Float64Array(N); for (var i = 0; i < N; i++) I[i] = (p.ib + p.im * Math.min(Math.max(m.x[i], 0), 1)) * 1e-3;
    function f(n, s, cur) { var g = vg * a * (n - Ntr) / (1 + eps * s); return [cur / (q * V) - n / tn - g * s, G * g * s - s / tp + G * beta * n / tn]; }
    // start at the bias steady state
    var Ib = p.ib * 1e-3, n0, s0;
    if (Ib > Ith) { n0 = Nth; s0 = G * tp * (Ib - Ith) / (q * V); } else { n0 = Ib * tn / (q * V); s0 = G * beta * n0 / tn / Math.max(1 / tp - G * vg * a * (n0 - Ntr), 1e9); }
    var sub = Math.max(1, Math.ceil(dt / 0.25e-12)), h = dt / sub, n = n0, s = s0;
    var S = new Float64Array(N), Nn = new Float64Array(N);
    for (var pass = 0; pass < 2; pass++) for (i = 0; i < N; i++) {
      var c0 = I[(i - 1 + N) % N], c1 = I[i];
      for (var k = 0; k < sub; k++) {
        var ca = c0 + (c1 - c0) * k / sub, cm = c0 + (c1 - c0) * (k + 0.5) / sub, cb = c0 + (c1 - c0) * (k + 1) / sub;
        var k1 = f(n, s, ca), k2 = f(n + h / 2 * k1[0], s + h / 2 * k1[1], cm), k3 = f(n + h / 2 * k2[0], s + h / 2 * k2[1], cm), k4 = f(n + h * k3[0], s + h * k3[1], cb);
        n += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); s += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); if (s < 0) s = 0;
      }
      S[i] = s; Nn[i] = n;
    }
    var o = OL.newOpt(t, p.lam), ph = 0, Pk = S.map(function (x) { return x * V * p.eta * hv / (2 * G * tp); });
    // phase steps; the mean frequency is taken as the carrier, so the chirp is shown relative to it and the phase stays periodic
    // The carrier is the power-weighted mean frequency (the frequency of the emitted light). The phase left over at the
    // end of the window is spread over the dark parts of the signal, so the phase stays periodic (the time window repeats).
    var dph = new Float64Array(N), sw = 0, swd = 0, pm = 0;
    for (i = 0; i < N; i++) { dph[i] = p.alpha / 2 * (G * vg * a * (Nn[i] - Ntr) - 1 / tp) * dt; sw += Pk[i]; swd += Pk[i] * dph[i]; if (Pk[i] > pm) pm = Pk[i]; }
    var fw = sw > 0 ? swd / sw : 0, res = 0, su = 0, u = new Float64Array(N);
    for (i = 0; i < N; i++) { dph[i] -= fw; res += dph[i]; u[i] = Math.pow(1 - Pk[i] / (pm || 1), 4) + 1e-9; su += u[i]; }
    for (i = 0; i < N; i++) { ph += dph[i] - res * u[i] / su; var A = Math.sqrt(Pk[i]); o.re[i] = A * Math.cos(ph); o.im[i] = A * Math.sin(ph); }
    o.rz = m.rz;
    var slope = p.eta * hv / (2 * q);
    return { out: { out: o }, info: { text: "Threshold current I_th = " + OL.fmt(Ith * 1e3, 2) + " mA. Slope efficiency ≈ " + OL.fmt(slope, 3) + " W/A. Average power " + OL.fmt(OL.dbm(OL.mean(Pk)), 2) + " dBm." + (p.ib < Ith * 1e3 ? " Bias below threshold: expect a turn-on delay t_d ≈ τn·ln[I_mod/(I_mod + I_bias − I_th)]." : "") } };
  }
});
