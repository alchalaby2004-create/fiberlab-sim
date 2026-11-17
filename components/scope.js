/* Time-Signal Scope — signal against time (optical power or electrical current). */
OL.register({
  type: "scope", name: "Time-Signal Scope", short: "Oscilloscope", category: "Visualizers", instrument: true,
  doc: "Shows the first bits of a signal in time. Optical input: power in mW. Electrical input: current in mA (or drive level).",
  help: {"eq": [{"t": "What is shown", "tex": "P(t)=|E(t)|^{2}\\quad \\mathrm{or}\\quad i(t)", "n": "Optical input: power in mW. Electrical input: current in mA."}], "params": {"nbits": "Number of bits shown (display only)."}, "extra": "", "src": ["agrawal"], "ar": {"doc": "يرسم البتات الأولى من الإشارة مع الزمن: القدرة بالـ mW إذا كان الدخل ضوئياً، والتيار بالـ mA (أو مستوى الدفع) إذا كان كهربائياً.", "eq": [{"t": "ما يُرسم", "n": "دخل ضوئي: القدرة بالـ mW. دخل كهربائي: التيار بالـ mA."}], "params": {"nbits": "عدد البتات المرسومة، ولا يؤثر في الحساب."}, "extra": ""}},
  inputs: [{ id: "in", kind: "any", label: "Signal" }], outputs: [],
  params: [{ key: "nbits", label: "Bits shown", unit: "", type: "number", def: 32, min: 4, max: 256, step: 1 }],
  icon: '<rect x="6" y="4" width="52" height="32" rx="3" class="ic-line"/><polyline points="10,28 18,28 20,12 30,12 32,28 40,28 42,12 54,12" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var s = inp.in, t = s.t, n = Math.min(p.nbits, t.bits.length) * t.sps, x = [], y = [], i, unit, note = "";
    if (s.kind === "opt") { var m = OL.materialize(s), I = OL.intensity(m); for (i = 0; i < n; i++) { x.push(i / t.fs * 1e9); y.push(I[i] * 1e3); } unit = "Optical power (mW)"; }
    else { var e = s.noise ? OL.addNoise(s, t.fs / 2, ctx.rng) : s, k = s.unit === "A" ? 1e3 : 1; if (s.noise) note = "No filter before the oscilloscope: full-bandwidth noise is shown.";
      for (i = 0; i < n; i++) { x.push(i / t.fs * 1e9); y.push(e.x[i] * k); } unit = s.unit === "A" ? "Current (mA)" : "Drive level"; }
    var bx = [], by = [], top = Math.max.apply(null, y), lo = Math.min.apply(null, y);
    for (i = 0; i < n / t.sps; i++) { bx.push((i + 0.5) / t.B * 1e9); by.push(t.bits[i]); }
    return { view: { badge: "", numbers: [["Bits", t.bits.slice(0, Math.min(p.nbits, 64)).join("")]].concat(note ? [["Note", note]] : []),
      plots: [{ title: "Signal in time", x: "Time (ns)", y: unit, traces: [{ x: x, y: y, name: "Signal", role: "main" }] }] } };
  }
});
