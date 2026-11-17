/* Power & Chirp Monitor — optical power and chirp (frequency deviation) against time. */
OL.register({
  type: "otdv", name: "Power & Chirp Monitor", short: "Power/Chirp Monitor", category: "Visualizers", instrument: true,
  doc: "Shows the optical power P(t) = |E(t)|² and the chirp Δν(t) = (1/2π)·dφ/dt of an optical signal against time.",
  help: {"eq": [{"t": "Optical power", "tex": "P(t)=|E(t)|^{2}", "n": "Shown in mW against time."}, {"t": "Chirp (instantaneous frequency deviation)", "tex": "\\Delta\\nu(t)=\\frac{1}{2\\pi}\\frac{d\\varphi(t)}{dt}", "n": "φ(t) is the phase of the optical field. An external modulator gives Δν ≈ 0; a directly modulated laser gives large Δν at the bit edges."}], "params": {"nbits": "Number of bits shown (display only)."}, "extra": "", "src": ["agrawal"], "ar": {"doc": "يرسم مع الزمن القدرة الضوئية P(t) = |E(t)|²، والـ chirp أي انحراف التردد Δν(t) = (1/2π)·dφ/dt.", "eq": [{"t": "القدرة الضوئية", "n": "بالـ mW مقابل الزمن."}, {"t": "الـ chirp (انحراف التردد اللحظي)", "n": "φ(t) طور المجال الضوئي. المعدِّل الخارجي يعطي Δν ≈ 0، أما الليزر المعدَّل مباشرة فيعطي Δν كبيراً عند حواف البتات."}], "params": {"nbits": "عدد البتات المرسومة، ولا يؤثر في الحساب."}, "extra": ""}},
  inputs: [{ id: "in", kind: "opt", label: "Optical" }], outputs: [],
  params: [{ key: "nbits", label: "Bits shown", unit: "", type: "number", def: 32, min: 4, max: 1024, step: 1 }],
  metrics: [{ key: "pmax", label: "Peak power (mW)" }, { key: "pavg", label: "Average power (mW)" }, { key: "chirp", label: "Peak chirp (GHz)" }, { key: "fwhm", label: "Width of the highest pulse, FWHM (ps)" }, { key: "ton", label: "Time the power first reaches 10% of the peak (ns)" }],
  icon: '<rect x="6" y="4" width="52" height="32" rx="3" class="ic-line"/><polyline points="10,28 18,28 21,12 31,12 34,28 42,28 45,12 54,12" class="ic-line"/><text x="49" y="31" text-anchor="middle" class="ic-text">λ</text>',
  run: function (p, inp, ctx) {
    var s = OL.materialize(inp.in), t = s.t, N = s.re.length, n = Math.min(p.nbits * t.sps, N), x = [], pw = [], ch = [], i, mx = 0, sum = 0, cmax = 0;
    for (i = 0; i < N; i++) { var P = s.re[i] * s.re[i] + s.im[i] * s.im[i]; sum += P; if (P > mx) mx = P; }
    var mean = sum / N, thr = mean * 0.05;
    for (i = 0; i < n; i++) {
      var P = s.re[i] * s.re[i] + s.im[i] * s.im[i], j = (i + 1) % N, k = (i - 1 + N) % N;
      // phase step to each neighbour, wrapped separately: the chirp can be read up to ±fs/2
      var pc = Math.atan2(s.im[i], s.re[i]), d1 = Math.atan2(s.im[j], s.re[j]) - pc, d0 = pc - Math.atan2(s.im[k], s.re[k]);
      while (d1 > Math.PI) d1 -= 2 * Math.PI; while (d1 < -Math.PI) d1 += 2 * Math.PI; while (d0 > Math.PI) d0 -= 2 * Math.PI; while (d0 < -Math.PI) d0 += 2 * Math.PI;
      var nu = s.coherent && P > thr ? (d0 + d1) / 2 / (2 * Math.PI) * t.fs / 1e9 : null;
      x.push(i / t.fs * 1e9); pw.push(P * 1e3); ch.push(nu); if (nu != null && Math.abs(nu) > cmax) cmax = Math.abs(nu);
    }
    // width (FWHM) of the highest pulse, with linear interpolation, and the first time the power reaches 10 % of the peak
    var Pw = new Float64Array(N); for (i = 0; i < N; i++) Pw[i] = s.re[i] * s.re[i] + s.im[i] * s.im[i];
    var ip = 0; for (i = 1; i < N; i++) if (Pw[i] > Pw[ip]) ip = i;
    var hm = Pw[ip] / 2, a = ip, b = ip, cnt = 0; while (Pw[(a - 1 + N) % N] > hm && cnt++ < N) a--; cnt = 0; while (Pw[(b + 1) % N] > hm && cnt++ < N) b++;
    var pa = Pw[(a - 1 + N) % N], pa1 = Pw[(a + N) % N], pb = Pw[b % N], pb1 = Pw[(b + 1) % N];
    var fw = ((b + (pb - hm) / Math.max(pb - pb1, 1e-30)) - (a - 1 + (hm - pa) / Math.max(pa1 - pa, 1e-30))) / t.fs * 1e12;
    var ton = null; for (i = 0; i < N; i++) if (Pw[i] >= 0.1 * Pw[ip]) { ton = i / t.fs * 1e9; break; }
    var plots = [{ title: "Optical power", x: "Time (ns)", y: "Power (mW)", traces: [{ x: x, y: pw, name: "Power", role: "main" }] }];
    if (s.coherent) plots.push({ title: "Chirp (frequency deviation from the carrier)", x: "Time (ns)", y: "Δν (GHz)", traces: [{ x: x, y: ch, name: "Chirp", role: "second" }] });
    return { view: { m: { pmax: mx * 1e3, pavg: mean * 1e3, chirp: s.coherent ? cmax : null, fwhm: fw, ton: ton }, badge: OL.fmt(mx * 1e3, 3) + " mW peak",
      numbers: [["Peak power", OL.fmt(mx * 1e3, 4) + " mW"], ["Average power", OL.fmt(mean * 1e3, 4) + " mW (" + OL.fmt(OL.dbm(mean), 2) + " dBm)"], ["Peak chirp", s.coherent ? OL.fmt(cmax, 3) + " GHz" : "wide source (no phase)"], ["Width of the highest pulse (FWHM)", OL.fmt(fw, 2) + " ps"], ["Power first reaches 10% of the peak", OL.fmt(ton, 3) + " ns"]].concat(s.spreadPs ? [["Pulse spreading", OL.fmt(s.spreadPs, 0) + " ps"]] : []),
      plots: plots } };
  }
});
