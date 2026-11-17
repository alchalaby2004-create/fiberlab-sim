/* =====================================================================
   FiberLab Sim — core
   The simulation kernel: math helpers, signal types, the component
   registry and the graph solver. Components live in components/*.js
   and only call OL.register({...}). See ADDING_COMPONENTS.md.
   Units inside signals: power W, time s, frequency Hz, wavelength nm.
   ===================================================================== */
(function (root) {
  "use strict";
  var OL = root.OL = root.OL || {};
  var C = OL.C = 299792458, H = OL.H = 6.626e-34, Q = OL.Q = 1.602e-19;

  /* ---------- math helpers ---------- */
  OL.rng = function (seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  OL.gauss = function (r) { var u = 0; while (u === 0) u = r(); var v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  OL.fft = function (re, im, inv) {
    var n = re.length, i, j, k, l;
    for (i = 1, j = 0; i < n; i++) { var bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { var t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (l = 2; l <= n; l <<= 1) {
      var ang = (inv ? 2 : -2) * Math.PI / l, wr = Math.cos(ang), wi = Math.sin(ang);
      for (i = 0; i < n; i += l) { var cr = 1, ci = 0;
        for (k = 0; k < l / 2; k++) {
          var a = i + k, b = a + l / 2, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
          var ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr; } } }
    if (inv) for (i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  };
  OL.freqs = function (n, fs) { var f = new Float64Array(n); for (var k = 0; k < n; k++) f[k] = (k < n / 2 ? k : k - n) * fs / n; return f; };
  /** Multiply (re, im) by a transfer function h(f) -> [re, im], in place. */
  OL.filt = function (re, im, fs, h) {
    var n = re.length, f = OL.freqs(n, fs); OL.fft(re, im, false);
    for (var k = 0; k < n; k++) { var t = h(f[k]), a = re[k], b = im[k]; re[k] = a * t[0] - b * t[1]; im[k] = a * t[1] + b * t[0]; }
    OL.fft(re, im, true);
  };
  OL.gaussLP = function (f3) { var a = Math.log(2) / 2; return function (f) { return [Math.exp(-a * (f / f3) * (f / f3)), 0]; }; };
  OL.erfc = function (x) {
    var z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    var r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  };
  OL.prbs = function (n, order) {
    var taps = { 7: [7, 6], 9: [9, 5], 11: [11, 9] }[order] || [9, 5], reg = (1 << order) - 1, out = [];
    for (var i = 0; i < n; i++) { var b = ((reg >> (taps[0] - 1)) ^ (reg >> (taps[1] - 1))) & 1; out.push(reg & 1); reg = ((reg << 1) | b) & ((1 << order) - 1); }
    return out;
  };
  OL.dbm = function (w) { return 10 * Math.log10(Math.max(w, 1e-15) / 1e-3); };
  OL.fromDbm = function (d) { return 1e-3 * Math.pow(10, d / 10); };
  OL.mean = function (a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; };

  /* ---------- standard fiber values (used by the fiber and the UI) ---------- */
  OL.fiberAuto = function (type, lam) {
    if (type === "DCF") return { a: 0.5, d: -100 };
    if (type === "MMF") return { a: lam < 1000 ? 2.5 : 0.8, d: lam < 1000 ? -90 : -2 };
    var a = lam < 1000 ? 2.0 : lam < 1400 ? 0.35 : 0.2;
    var d = lam < 1000 ? -90 : 0.092 / 4 * (lam - Math.pow(1312, 4) / Math.pow(lam, 3));
    return { a: a, d: d };
  };

  /* ---------- signals ----------
     Every signal carries t = {B, sps, fs, N, bits} (the time base made by the PRBS).
     bin : { kind:"bin",  t }
     elec: { kind:"elec", t, x:Float64Array (A or drive 0..1), unit, noise:null|{th, shotK} }
            noise is "pending" receiver noise; a filter (or the BER analyzer) adds it.
     opt : { kind:"opt",  t, re, im (sqrt(W)), lam (nm), coherent, dlam (nm, incoherent width),
            fpModes (nm spacing, or 0), pendDL (ps/nm), pendModal2 (s^2), aseS (W/Hz) } */
  OL.newOpt = function (t, lam) { return { kind: "opt", t: t, re: new Float64Array(t.N), im: new Float64Array(t.N), lam: lam, coherent: true, dlam: 0, fpModes: 0, pendDL: 0, pendModal2: 0, aseS: 0 }; };
  OL.cloneOpt = function (s) { var o = {}; for (var k in s) o[k] = s[k]; o.re = Float64Array.from(s.re); o.im = Float64Array.from(s.im); return o; };
  OL.cloneElec = function (s) { var o = {}; for (var k in s) o[k] = s[k]; o.x = Float64Array.from(s.x); return o; };
  OL.power = function (s) { var p = 0; for (var i = 0; i < s.re.length; i++) p += s.re[i] * s.re[i] + s.im[i] * s.im[i]; return p / s.re.length; };
  OL.intensity = function (s) { var I = new Float64Array(s.re.length); for (var i = 0; i < I.length; i++) I[i] = s.re[i] * s.re[i] + s.im[i] * s.im[i]; return I; };
  /** Apply any dispersion still pending on an incoherent (LED / FP) signal. Returns a new signal. */
  OL.materialize = function (s) {
    var o = OL.cloneOpt(s); if (s.coherent || (!s.pendDL && !s.pendModal2)) return o;
    var chrom = Math.abs(s.pendDL) * 1e-12 * s.dlam, fw = Math.sqrt(chrom * chrom + s.pendModal2);
    o.spreadPs = (s.spreadPs || 0) + fw * 1e12; o.pendDL = 0; o.pendModal2 = 0;
    if (fw > 0) {
      var I = OL.intensity(s), Ii = new Float64Array(I.length), sig = fw / 2.355;
      OL.filt(I, Ii, s.t.fs, function (f) { return [Math.exp(-2 * Math.PI * Math.PI * sig * sig * f * f), 0]; });
      for (var i = 0; i < I.length; i++) { o.re[i] = Math.sqrt(Math.max(I[i], 0)); o.im[i] = 0; }
    }
    return o;
  };
  /** Add pending receiver noise to an electrical signal, for a noise bandwidth Bn (Hz). */
  OL.addNoise = function (s, Bn, r) {
    var o = OL.cloneElec(s); if (!s.noise) return o;
    var sth = s.noise.th * Math.sqrt(Bn);
    for (var i = 0; i < o.x.length; i++) o.x[i] += sth * OL.gauss(r) + Math.sqrt(s.noise.shotK * Math.max(s.x[i], 0) * Bn) * OL.gauss(r);
    o.noise = null; return o;
  };
  /** Equivalent noise bandwidth of a power transfer |h(f)|^2 (one-sided, Hz). */
  OL.noiseBW = function (h, fmax) { var n = 4000, df = fmax / n, s = 0; for (var i = 0; i < n; i++) { var t = h((i + 0.5) * df); s += (t[0] * t[0] + t[1] * t[1]) * df; } return s; };

  /* ---------- decision: best sampling time, Q and BER ---------- */
  OL.decide = function (y, t, rz) {
    var sps = t.sps, nb = t.bits.length, N = y.length, base = Math.floor(sps / (rz ? 4 : 2)), best = { q: -1, off: 0 }, qt = [];
    for (var off = 0; off < 2 * sps; off++) {
      var s1 = 0, s0 = 0, q1 = 0, q0 = 0, n1 = 0, n0 = 0;
      for (var j = 2; j < nb - 2; j++) { var v = y[(j * sps + off + base) % N]; if (t.bits[j]) { s1 += v; q1 += v * v; n1++; } else { s0 += v; q0 += v * v; n0++; } }
      var m1 = s1 / n1, m0 = s0 / n0, v1 = Math.sqrt(Math.max(q1 / n1 - m1 * m1, 1e-30)), v0 = Math.sqrt(Math.max(q0 / n0 - m0 * m0, 1e-30));
      var qq = (m1 - m0) / (v1 + v0); qt.push(Math.max(qq, 0));
      if (qq > best.q) best = { q: qq, off: off, m1: m1, m0: m0, v1: v1, v0: v0 };
    }
    var Qf = Math.max(best.q, 0);
    return { Q: Qf, ber: 0.5 * OL.erfc(Qf / Math.SQRT2), off: best.off + base, m1: best.m1, m0: best.m0, s1: best.v1, s0: best.v0,
      threshold: (best.m1 * best.v0 + best.m0 * best.v1) / (best.v0 + best.v1), eyeHeight: (best.m1 - 3 * best.v1) - (best.m0 + 3 * best.v0), qVsTime: qt, qBase: base };
  };

  /* ---------- registry ---------- */
  OL.components = {}; OL.order = [];
  OL.CATEGORIES = ["Transmitters", "Optical fibers", "Amplifiers and passive", "Receivers", "Visualizers"];
  OL.register = function (def) {
    if (!def.type || !def.run) throw new Error("component needs type and run()");
    def.inputs = def.inputs || []; def.outputs = def.outputs || []; def.params = def.params || [];
    if (!OL.components[def.type]) OL.order.push(def.type);
    OL.components[def.type] = def;
  };
  OL.defaults = function (type) { var d = OL.components[type], p = {}; d.params.forEach(function (q) { p[q.key] = q.def; }); return p; };
  OL.canConnect = function (outKind, inKind) { return inKind === "any" ? outKind !== "bin" : outKind === inKind; };

  /* ---------- global (layout) parameters ---------- */
  OL.GLOBALS = [
    { key: "bitrate", label: "Bit rate", unit: "Gb/s", type: "select", def: 10, num: true, options: [[0.1, "100 Mb/s"], [0.155, "155 Mb/s"], [0.622, "622 Mb/s"], [1, "1 Gb/s"], [2.5, "2.5 Gb/s"], [10, "10 Gb/s"], [25, "25 Gb/s"], [40, "40 Gb/s"]] },
    { key: "bits", label: "Sequence length", unit: "bits", type: "select", def: 512, num: true, options: [[8, "8"], [16, "16"], [32, "32"], [64, "64"], [128, "128"], [256, "256"], [512, "512"], [1024, "1024"]] },
    { key: "sps", label: "Samples per bit", unit: "", type: "select", def: 16, num: true, options: [[8, "8"], [16, "16"], [32, "32"], [64, "64"], [128, "128"], [256, "256"], [512, "512"]] },
    { key: "seed", label: "Noise seed", unit: "", type: "number", def: 7, min: 1, max: 9999, step: 1 }
  ];
  OL.globalDefaults = function () { var g = {}; OL.GLOBALS.forEach(function (q) { g[q.key] = q.def; }); return g; };
  OL.timeBase = function (g) { var B = g.bitrate * 1e9; return { B: B, sps: g.sps, fs: B * g.sps, N: g.bits * g.sps, nbits: g.bits, bits: null }; };

  /* ---------- graph solver ----------
     graph = { globals, nodes:[{id, type, x, y, params}], links:[{from:[nodeId, port], to:[nodeId, port]}] }
     Returns { ok, order, nodes: { id: { outputs, info, view, error, warnings, skipped } }, errors:[] } */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  OL.simulate = function (graph) {
    var g = {}, k; var gd = OL.globalDefaults(); for (k in gd) g[k] = gd[k]; for (k in graph.globals || {}) g[k] = graph.globals[k];
    var nodes = {}, res = { ok: true, nodes: {}, errors: [], order: [] }, indeg = {}, outs = {};
    graph.nodes.forEach(function (n) { nodes[n.id] = n; indeg[n.id] = 0; outs[n.id] = []; res.nodes[n.id] = { warnings: [] }; if (!OL.components[n.type]) res.nodes[n.id].error = "Unknown component: " + n.type; });
    var inputLink = {};
    graph.links.forEach(function (l) {
      if (!nodes[l.from[0]] || !nodes[l.to[0]]) return;
      var key = l.to[0] + ":" + l.to[1];
      if (inputLink[key]) { res.nodes[l.to[0]].error = "Two wires go into the same input port."; return; }
      inputLink[key] = l; indeg[l.to[0]]++; outs[l.from[0]].push(l);
    });
    // Kahn topological order
    var queue = graph.nodes.filter(function (n) { return indeg[n.id] === 0; }).map(function (n) { return n.id; }), order = [];
    while (queue.length) { var id = queue.shift(); order.push(id); outs[id].forEach(function (l) { if (--indeg[l.to[0]] === 0) queue.push(l.to[0]); }); }
    if (order.length < graph.nodes.length) { res.ok = false; res.errors.push("The layout has a loop. Remove the wire that goes back."); }
    res.order = order;
    var tb = OL.timeBase(g); tb.bits = null;
    order.forEach(function (id) {
      var n = nodes[id], R = res.nodes[id], def = OL.components[n.type]; if (R.error) { res.ok = false; return; }
      var p = {}, d = OL.defaults(n.type); for (k in d) p[k] = d[k]; for (k in n.params || {}) p[k] = n.params[k];
      var inp = {}, missing = [];
      def.inputs.forEach(function (port) {
        var l = inputLink[id + ":" + port.id];
        if (!l) { if (!port.optional) missing.push(port.label || port.id); return; }
        var up = res.nodes[l.from[0]];
        if (!up.outputs || !up.outputs[l.from[1]]) { R.skipped = true; return; }
        inp[port.id] = up.outputs[l.from[1]];
      });
      if (R.skipped) { R.error = "Not calculated: a component before it has an error."; return; }
      if (missing.length) { R.error = "Connect the input: " + missing.join(", ") + "."; res.ok = false; return; }
      var ctx = { g: g, time: tb, rng: OL.rng(hash(id) ^ (g.seed * 2654435761)), warn: function (m) { R.warnings.push(m); } };
      try {
        var out = def.run(p, inp, ctx) || {};
        R.outputs = out.out || {}; R.info = out.info || null; R.view = out.view || null;
      } catch (e) { R.error = "Error: " + e.message; res.ok = false; }
    });
    return res;
  };

  /* ---------- helpers for components ---------- */
  OL.fmt = function (v, d) { return v == null || !isFinite(v) ? "–" : (+v).toFixed(d); };
  OL.sup = function (n) { var m = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" }; return String(n).split("").map(function (c) { return m[c] || c; }).join(""); };
  OL.fmtBer = function (b) { if (!(b > 0) || b < 1e-40) return "< 10" + OL.sup(-40); var e = Math.floor(Math.log10(b)); if (e >= -1) return b.toFixed(2); return (b / Math.pow(10, e)).toFixed(1) + "×10" + OL.sup(e); };

  if (typeof module !== "undefined" && module.exports) module.exports = OL;
})(typeof window !== "undefined" ? window : globalThis);
