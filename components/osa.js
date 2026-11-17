/* Optical Spectrum Monitor — power spectrum in dBm per resolution bandwidth, against wavelength. */
OL.register({
  type: "osa", name: "Optical Spectrum Monitor", short: "Spectrum Monitor", category: "Visualizers", instrument: true,
  doc: "Optical spectrum (dBm in the resolution bandwidth). Shows OSNR when an EDFA is before it.",
  help: {"eq": [{"t": "Spectrum", "tex": "P(\\lambda)=\\sum_{|f-f_\\lambda|<RBW/2}\\frac{|E(f)|^{2}}{N^{2}},\\qquad \\Delta\\lambda=\\frac{\\lambda^{2}}{c}\\,\\Delta f", "n": "Power in the resolution bandwidth around each wavelength."}, {"t": "OSNR", "tex": "\\mathrm{OSNR}=10\\log_{10}\\frac{P_{\\mathrm{signal}}}{S_{\\mathrm{ASE}}\\cdot 12.5\\ \\mathrm{GHz}}", "n": "12.5 GHz = 0.1 nm at 1550 nm."}], "params": {"res": "On: power in the resolution bandwidth (like a real OSA). Off: the power of each FFT bin, the finest detail the simulation can show.", "xunit": "Show the spectrum against wavelength (nm) or frequency (THz).", "rbw": "A wider resolution bandwidth collects more noise in each point (higher noise floor) and smooths the spectrum. The total power does not change.", "span": "Width of the wavelength window for laser signals (display only)."}, "extra": "", "src": ["ramaswami", "agrawal"], "ar": {"doc": "يرسم الطيف الضوئي (بالـ dBm ضمن عرض نطاق الدقة)، ويعرض OSNR إذا كان قبله مضخم EDFA.", "eq": [{"t": "الطيف", "n": "القدرة الواقعة ضمن عرض نطاق الدقة حول كل طول موجي (باستعمال مرشح دقة غاوسي)."}, {"t": "OSNR", "n": "عرض 0.1 nm يساوي 12.5 GHz عند 1550 nm."}], "params": {"res": "On: القدرة ضمن عرض نطاق الدقة، كما يعرضها جهاز OSA حقيقي. Off: قدرة كل خانة من خانات FFT، وهي أدق تفصيل تستطيع المحاكاة إظهاره.", "xunit": "رسم الطيف مقابل الطول الموجي (nm) أو مقابل التردد (THz).", "rbw": "عرض نطاق الدقة الأكبر يجمع ضوضاء أكثر عند كل نقطة، فترتفع أرضية الضوضاء ويصبح الطيف أنعم، دون أن تتغير القدرة الكلية.", "span": "عرض النافذة المرسومة من الأطوال الموجية لإشارات الليزر، ولا يؤثر في الحساب."}, "extra": ""}},
  inputs: [{ id: "in", kind: "opt", label: "Optical" }], outputs: [],
  params: [{ key: "res", label: "Resolution bandwidth filter", type: "select", def: "on", options: [["on", "On"], ["off", "Off (each FFT bin)"]] },
    { key: "rbw", label: "Resolution bandwidth", unit: "nm", type: "number", def: 0.01, min: 0.001, max: 1, step: 0.001, show: function (p) { return p.res !== "off"; } },
    { key: "xunit", label: "Horizontal axis", type: "select", def: "nm", options: [["nm", "Wavelength (nm)"], ["THz", "Frequency (THz)"]] },
    { key: "span", label: "Span (laser signals)", unit: "nm", type: "number", def: 0.8, min: 0.05, max: 10, step: 0.05 }],
  metrics: [{ key: "osnr", label: "OSNR (dB, 0.1 nm)" }, { key: "dbm", label: "Total power (dBm)" }],
  icon: '<rect x="6" y="4" width="52" height="32" rx="3" class="ic-line"/><polyline points="10,30 22,29 28,26 31,9 34,26 40,29 54,30" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var s = inp.in, lam = s.lam, P = OL.power(s), x = [], y = [], i, peak = null;
    var osnr = s.aseS > 0 ? 10 * Math.log10(Math.max(P - s.aseS * (s.aseBW || s.t.fs), 1e-18) / (s.aseS * 12.5e9)) : null;
    if (s.coherent) {
      var n = s.re.length, a = Float64Array.from(s.re), b = Float64Array.from(s.im); OL.fft(a, b, false);
      var f = OL.freqs(n, s.t.fs), df = s.t.fs / n, rbwHz = p.rbw * 1e-9 * OL.C / Math.pow(lam * 1e-9, 2), h = 0;
      var pw = new Float64Array(n); for (i = 0; i < n; i++) pw[i] = (a[i] * a[i] + b[i] * b[i]) / (n * n);
      var idx = []; for (i = 0; i < n; i++) idx.push(i); idx.sort(function (u, v) { return f[u] - f[v]; });
      var sorted = idx.map(function (k) { return pw[k]; }), fx = idx.map(function (k) { return f[k]; });
      // Gaussian resolution filter (FWHM = RBW): a single tone keeps its full power at the peak
      var sg = p.res === "off" ? 1e-9 : Math.max(rbwHz / df / 2.3548, 1e-9), ar = Float64Array.from(sorted), ai = new Float64Array(n), kr = new Float64Array(n), ki = new Float64Array(n);
      for (i = 0; i < n; i++) { var dq = i <= n / 2 ? i : i - n; kr[i] = Math.exp(-dq * dq / (2 * sg * sg)); }   // circular convolution by FFT
      OL.fft(ar, ai, false); OL.fft(kr, ki, false);
      for (i = 0; i < n; i++) { var xr = ar[i] * kr[i] - ai[i] * ki[i], xi = ar[i] * ki[i] + ai[i] * kr[i]; ar[i] = xr; ai[i] = xi; }
      OL.fft(ar, ai, true);
      var c = []; for (i = 0; i < n; i++) c.push(Math.max(ar[i], 0));
      // ASE floor: white noise continues outside the simulated band, add it per RBW
      for (i = 0; i < n; i++) { var dl = -fx[i] * Math.pow(lam * 1e-9, 2) / OL.C * 1e9; if (Math.abs(dl) <= p.span / 2) { x.push(lam + dl); y.push(OL.dbm(Math.max(c[i], 1e-18))); } }
      var rev = x.map(function (v, k) { return [v, y[k]]; }).sort(function (u, v) { return u[0] - v[0]; }); x = rev.map(function (q) { return q[0]; }); y = rev.map(function (q) { return q[1]; });
      var peak = Math.max.apply(null, y);
    } else {
      var w = s.dlam, win = Math.max(6 * w, 4), sig = w / 2.355, step = win / 1200, rbw = Math.max(p.rbw, step), shape = [], sum = 0;
      for (i = 0; i <= 1200; i++) { var l = lam - win / 2 + i * step, e = Math.exp(-Math.pow(l - lam, 2) / (2 * sig * sig)), v = e;
        if (s.fpModes) { v = 0; for (var m = -40; m <= 40; m++) v += e * Math.exp(-Math.pow(l - (lam + m * s.fpModes), 2) / (2 * 0.02 * 0.02)); }
        shape.push(v); sum += v; x.push(l); }
      // power per RBW
      y = shape.map(function (v) { return OL.dbm(Math.max(P * v / sum * rbw / step, 1e-18)); });
    }
    var thz = p.xunit === "THz"; if (thz) { x = x.map(function (l) { return OL.C / (l * 1e-9) / 1e12; }); }
    var ttl = "Optical spectrum (" + (s.coherent && p.res === "off" ? "each FFT bin, Δf = " + OL.fmt(s.t.fs / s.re.length / 1e6, 1) + " MHz" : "resolution " + p.rbw + " nm") + ")";
    return { view: { m: { osnr: osnr, dbm: OL.dbm(P) }, badge: osnr != null ? "OSNR " + OL.fmt(osnr, 1) + " dB" : OL.fmt(OL.dbm(P), 1) + " dBm",
      numbers: [["Total power", OL.fmt(OL.dbm(P), 2) + " dBm"], ["Center wavelength", OL.fmt(lam, 2) + " nm"], ["Source", s.coherent ? "Single-mode laser" : "Wide spectrum, Δλ ≈ " + OL.fmt(s.dlam, 1) + " nm"], ["Peak", peak != null ? OL.fmt(peak, 2) + " dBm" : "–"], ["OSNR (0.1 nm)", osnr == null ? "no amplifier" : OL.fmt(osnr, 1) + " dB"]],
      plots: [{ title: ttl, x: thz ? "Frequency (THz)" : "Wavelength (nm)", y: "Power (dBm)", traces: [{ x: x, y: y, name: "Spectrum", role: "main" }] }] } };
  }
});
