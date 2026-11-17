/* EDFA — optical amplifier with ASE noise S = nsp·hν·(G − 1), nsp ≈ NF/2, then a Gaussian optical filter. */
OL.register({
  type: "edfa", name: "Erbium Fiber Amplifier (EDFA)", short: "EDFA", category: "Amplifiers and passive",
  doc: "Erbium-doped fiber amplifier. Gain control or power control. Adds ASE noise; OSNR ≈ 58 + Pin − NF (+3 dB here: one polarization).",
  help: {"eq": [{"t": "Gain", "tex": "G\\,[\\mathrm{dB}]=P_{\\mathrm{out}}-P_{\\mathrm{in}}", "n": "Power control: G is chosen so that Pₒᵤₜ is the value you set."}, {"t": "ASE noise", "tex": "S_{\\mathrm{ASE}}=n_{sp}\\,h\\nu\\,(G-1),\\qquad n_{sp}\\approx\\frac{F}{2},\\quad F=10^{NF/10}", "n": "Added as Gaussian noise to the field (signal polarization), then a Gaussian optical filter."}, {"t": "OSNR (0.1 nm)", "tex": "\\mathrm{OSNR}\\approx 58+P_{\\mathrm{in}}\\,[\\mathrm{dBm}]-NF\\,[\\mathrm{dB}]", "n": "Textbook rule (both polarizations). This simulator counts one polarization, so its OSNR is about 3 dB higher."}], "params": {"mode": "Gain control: fixed G. Power control: fixed output power (the gain changes with the input).", "gain": "Raises the signal above the receiver thermal noise. The OSNR does not improve with more gain.", "pout": "Output power in power-control mode.", "nf": "Each 1 dB more NF → 1 dB less OSNR.", "fbw": "A narrower optical filter removes more ASE noise (better Q). Too narrow cuts the signal spectrum."}, "extra": "", "src": ["desurvire", "ramaswami", "agrawal"], "ar": {"doc": "مضخم ليفي مُطعَّم بالإربيوم، يعمل بربح ثابت أو بقدرة خرج ثابتة، ويضيف ضوضاء ASE. القاعدة المعروفة في الكتب لحساب OSNR هي 58 + Pin − NF، والنتيجة في هذا المحاكي أعلى منها بنحو 3 dB لأنه يحسب استقطاباً واحداً.", "eq": [{"t": "الربح", "n": "في وضع التحكم بالقدرة يُختار الربح G تلقائياً بحيث تساوي Pₒᵤₜ القيمة التي تكتبها."}, {"t": "ضوضاء ASE", "n": "تُضاف إلى المجال ضوضاءً غاوسية (في استقطاب الإشارة)، ثم يمر الضوء بمرشح ضوئي غاوسي."}, {"t": "OSNR (ضمن 0.1 nm)", "n": "هذه قاعدة الكتب، وهي تحسب الاستقطابين. أما هذا المحاكي فيحسب استقطاباً واحداً، لذلك يظهر OSNR فيه أعلى بنحو 3 dB."}], "params": {"mode": "التحكم بالربح يعني ربحاً ثابتاً G. والتحكم بالقدرة يعني قدرة خرج ثابتة، ويتغير الربح حسب قدرة الدخل.", "gain": "الربح يرفع الإشارة فوق الضوضاء الحرارية في المستقبل، لكن زيادته لا تحسّن OSNR.", "pout": "قدرة الخرج في وضع التحكم بالقدرة.", "nf": "كل زيادة قدرها 1 dB في عامل الضوضاء NF تنقص OSNR بمقدار 1 dB.", "fbw": "المرشح الضوئي الأضيق يزيل قدراً أكبر من ضوضاء ASE فتتحسن Q، لكنه إذا ضاق كثيراً قطع جزءاً من طيف الإشارة نفسها."}, "extra": ""}},
  inputs: [{ id: "in", kind: "opt", label: "Input" }], outputs: [{ id: "out", kind: "opt", label: "Output" }],
  tag: function (p) { return p.mode === "gain" ? "G " + p.gain + " dB" : "P " + p.pout + " dBm"; },
  params: [{ key: "mode", label: "Operation mode", type: "select", def: "gain", options: [["gain", "Gain control"], ["power", "Power control"]] },
    { key: "gain", label: "Gain", unit: "dB", type: "number", def: 20, min: 0, max: 45, step: 0.5, show: function (p) { return p.mode === "gain"; } },
    { key: "pout", label: "Output power", unit: "dBm", type: "number", def: -8, min: -30, max: 23, step: 0.5, show: function (p) { return p.mode === "power"; } },
    { key: "nf", label: "Noise figure", unit: "dB", type: "number", def: 5, min: 3, max: 12, step: 0.5 },
    { key: "fbw", label: "Optical filter bandwidth", unit: "GHz", type: "number", def: 50, min: 10, max: 500, step: 5 }],
  icon: '<path d="M14 6 L14 34 L50 20 Z" class="ic-fill"/><line x1="2" y1="20" x2="14" y2="20" class="ic-line"/><line x1="50" y1="20" x2="62" y2="20" class="ic-line"/><text x="27" y="24" text-anchor="middle" class="ic-text">G</text>',
  run: function (p, inp, ctx) {
    var s = OL.materialize(inp.in), Pin = OL.power(s), nu = OL.C / (s.lam * 1e-9);
    var Gdb = p.mode === "power" ? p.pout - OL.dbm(Pin) : p.gain, G = Math.pow(10, Gdb / 10);
    var nsp = Math.max(Math.pow(10, p.nf / 10) / 2, 0.5), S = Gdb > 0.05 ? nsp * OL.H * nu * (G - 1) : 0;
    var sg = Math.sqrt(S * s.t.fs / 2), g = Math.sqrt(G), r = ctx.rng;
    for (var i = 0; i < s.re.length; i++) { s.re[i] = s.re[i] * g + sg * OL.gauss(r); s.im[i] = s.im[i] * g + sg * OL.gauss(r); }
    OL.filt(s.re, s.im, s.t.fs, OL.gaussLP(p.fbw * 1e9 / 2));
    s.aseS = s.aseS * G + S; if (S > 0) s.aseBW = Math.min(1.0645 * p.fbw * 1e9, s.t.fs);
    var osnr = s.aseS > 0 ? 10 * Math.log10(Pin * G / (s.aseS * 12.5e9)) : null;
    if (Gdb < 0) ctx.warn("The gain is negative: the input power is higher than the output power you asked for.");
    return { out: { out: s }, info: { gain: Gdb, osnr: osnr, text: "Gain " + OL.fmt(Gdb, 1) + " dB. Input " + OL.fmt(OL.dbm(Pin), 1) + " dBm. OSNR " + (osnr == null ? "–" : OL.fmt(osnr, 1) + " dB") + "." } };
  }
});
