/* Eye & BER Meter — eye diagram, best sampling time, Q factor and BER = ½·erfc(Q/√2). */
OL.register({
  type: "ber", name: "Eye & BER Meter", short: "Eye & BER Meter", category: "Visualizers", instrument: true,
  doc: "Finds the best sampling time and measures Q = (I1 − I0)/(σ1 + σ0), BER = ½ erfc(Q/√2), and the eye diagram.",
  help: {"eq": [{"t": "Q factor", "tex": "Q=\\frac{I_1-I_0}{\\sigma_1+\\sigma_0}", "n": "Means and standard deviations of the 1 and 0 levels at the best sampling time."}, {"t": "Bit error rate", "tex": "\\mathrm{BER}=\\frac{1}{2}\\operatorname{erfc}\\left(\\frac{Q}{\\sqrt{2}}\\right)", "n": "Q = 6 → BER ≈ 10⁻⁹. Q = 7 → BER ≈ 10⁻¹²."}, {"t": "Best decision threshold and eye height", "tex": "I_D=\\frac{\\sigma_0 I_1+\\sigma_1 I_0}{\\sigma_0+\\sigma_1},\\qquad H_{\\mathrm{eye}}=(I_1-3\\sigma_1)-(I_0+3\\sigma_0)", "n": ""}], "params": {"traces": "Only changes how many bits are drawn in the eye diagram. It does not change Q."}, "extra": "The analyzer tries every sampling time in two bit periods and keeps the one with the highest Q (the graph 'Q factor against sampling time').", "src": ["personick", "agrawal", "keiser"], "ar": {"doc": "يبحث عن أفضل لحظة لأخذ العينة، ويقيس عندها Q = (I1 − I0)/(σ1 + σ0) وBER = ½ erfc(Q/√2)، ويرسم مخطط العين.", "eq": [{"t": "عامل Q", "n": "I1 وI0 متوسطا مستويي 1 و0، وσ1 وσ0 انحرافاهما المعياريان، كلها عند أفضل لحظة لأخذ العينة."}, {"t": "معدل خطأ البت", "n": "Q = 6 يقابل BER ≈ 10⁻⁹، وQ = 7 يقابل BER ≈ 10⁻¹²."}, {"t": "أفضل عتبة قرار وارتفاع العين", "n": ""}], "params": {"traces": "عدد البتات المرسومة في مخطط العين فقط، ولا يؤثر في Q."}, "extra": "يجرّب المقياس كل لحظات أخذ العينة خلال بتّين، ويختار اللحظة التي تعطي أعلى Q (انظر الرسم «Q factor against sampling time»)."}},
  inputs: [{ id: "in", kind: "elec", label: "Electrical" }], outputs: [],
  params: [{ key: "traces", label: "Bits drawn in the eye", unit: "", type: "number", def: 300, min: 20, max: 1000, step: 10 }],
  metrics: [{ key: "Q", label: "Q factor" }, { key: "logber", label: "log₁₀(BER)" }, { key: "eye", label: "Eye height (µA)" }],
  icon: '<rect x="6" y="4" width="52" height="32" rx="3" class="ic-line"/><path d="M10 28 C22 28 22 12 32 12 C42 12 42 28 54 28 M10 12 C22 12 22 28 32 28 C42 28 42 12 54 12" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var s = inp.in, t = s.t;
    if (s.noise) { ctx.warn("No low-pass filter before the BER analyzer: receiver noise is taken over the full simulation bandwidth."); s = OL.addNoise(s, t.fs / 2, ctx.rng); }
    var d = OL.decide(s.x, t, s.rz), k = s.unit === "A" ? 1e3 : 1, N = t.N, sps = t.sps, nb = t.bits.length;
    var ex = [], ey = [], j, i, cnt = 0;
    for (j = 2; j < nb - 3 && cnt < p.traces; j++, cnt++) {
      var st = j * sps + d.off - sps;
      for (i = 0; i <= 2 * sps; i++) { ex.push((i - sps) / sps); ey.push(s.x[(st + i + N) % N] * k); }
      ex.push(null); ey.push(null);
    }
    var qx = d.qVsTime.map(function (q, o) { var r = (o + d.qBase - d.off) / sps; while (r < -1) r += 2; while (r >= 1) r -= 2; return r; }), qy = d.qVsTime.slice();
    var pr = qx.map(function (v, o) { return [v, qy[o]]; }).sort(function (a, b) { return a[0] - b[0]; });
    var lb = d.ber > 0 ? Math.log10(Math.max(d.ber, 1e-300)) : -300;
    return { view: { m: { Q: d.Q, logber: lb, eye: d.eyeHeight * 1e6 }, badge: "Q = " + OL.fmt(d.Q, 2), status: d.Q >= 6 ? "ok" : d.Q >= 4.75 ? "warn" : "bad",
      numbers: [["Max. Q factor", OL.fmt(d.Q, 2)], ["Min. BER", OL.fmtBer(d.ber)], ["Eye height", OL.fmt(d.eyeHeight * k * 1e3, 1) + (k === 1e3 ? " µA" : " ×10⁻³")], ["Decision threshold", OL.fmt(d.threshold * k, 4) + (k === 1e3 ? " mA" : "")], ["Mean of 1 / 0", OL.fmt(d.m1 * k, 4) + " / " + OL.fmt(d.m0 * k, 4) + (k === 1e3 ? " mA" : "")]],
      plots: [{ title: "Eye diagram", x: "Time (bit periods)", y: k === 1e3 ? "Current (mA)" : "Level", eye: true,
          traces: [{ x: ex, y: ey, name: "Eye", role: "eye" }, { x: [0, 0], y: [Math.min.apply(null, ey.filter(function (v) { return v != null; })), Math.max.apply(null, ey.filter(function (v) { return v != null; }))], name: "Best sampling time", role: "ref", dash: "dash" }] },
        { title: "Q factor against sampling time", x: "Time (bit periods)", y: "Q", traces: [{ x: pr.map(function (q) { return q[0]; }), y: pr.map(function (q) { return q[1]; }), name: "Q", role: "main" }] }] } };
  }
});
