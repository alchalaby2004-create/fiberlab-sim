/* Fiber Span — loss, chromatic dispersion and (for multimode) modal dispersion. */
OL.register({
  type: "fiber", name: "Fiber Span", short: "Fiber Span", category: "Optical fibers",
  doc: "Loss αL in dB, then dispersion D·L. Laser (coherent) signals: H(f) = exp(jπDLλ²f²/c). LED/FP: pulse spreading Δτ = |D|LΔλ.",
  help: {"eq": [{"t": "Loss", "tex": "P_{\\mathrm{out}}\\,[\\mathrm{dBm}]=P_{\\mathrm{in}}\\,[\\mathrm{dBm}]-\\alpha L", "n": "α in dB/km, L in km."}, {"t": "Dispersion of standard SMF (G.652)", "tex": "D(\\lambda)=\\frac{S_0}{4}\\left(\\lambda-\\frac{\\lambda_0^{4}}{\\lambda^{3}}\\right)", "n": "λ₀ = 1312 nm, S₀ = 0.092 ps/(nm²·km)."}, {"t": "Dispersion on a laser signal (field)", "tex": "H(f)=\\exp\\!\\left(j\\,\\frac{\\pi D L \\lambda^{2}}{c}\\,f^{2}\\right)", "n": "Used for DFB, DML and MZM signals, so chirp and dispersion act together."}, {"t": "Wide sources and multimode fiber", "tex": "\\Delta\\tau=\\sqrt{\\left(|D|L\\Delta\\lambda\\right)^{2}+\\Delta\\tau_{\\mathrm{modal}}^{2}},\\qquad \\Delta\\tau_{\\mathrm{modal}}=\\frac{0.44\\,L}{BW_{\\mathrm{modal}}}", "n": "Gaussian spreading of the intensity (FWHM)."}], "params": {"ftype": "Sets the automatic values: SMF 2.0 / 0.35 / 0.2 dB/km at 850 / 1310 / 1550 nm with D from G.652; MMF 2.5 dB/km at 850 nm; DCF 0.5 dB/km and D = −100 ps/(nm·km).", "length": "Loss grows as αL (dB). Dispersion grows as DL (ps/nm).", "atten": "Untick Auto to set your own α.", "disp": "Untick Auto to set your own D. A negative D (DCF) cancels the positive D of SMF: L(DCF) = D(SMF)·L(SMF) / |D(DCF)|.", "modalBW": "Multimode only. Higher modal bandwidth → less modal dispersion."}, "extra": "", "src": ["keiser", "agrawal", "g652"], "ar": {"doc": "يطبّق خسارة αL بالـ dB ثم تشتتاً قدره D·L. مع إشارات الليزر (المترابطة) يُطبَّق التشتت على المجال: H(f) = exp(jπDLλ²f²/c). ومع LED أو ليزر FP يُحسب اتساع النبضة: Δτ = |D|LΔλ.", "eq": [{"t": "الخسارة", "n": "α بوحدة dB/km، وL بالكيلومتر."}, {"t": "تشتت الليف القياسي (G.652)", "n": "λ₀ = 1312 nm، وS₀ = 0.092 ps/(nm²·km)."}, {"t": "التشتت على إشارة الليزر (المجال)", "n": "يُطبَّق على إشارات DFB وDML وMZM، فيؤثر الـ chirp والتشتت معاً."}, {"t": "المصادر العريضة والليف متعدد الأنماط", "n": "يتسع شكل شدة الضوء اتساعاً غاوسياً (FWHM)."}], "params": {"ftype": "يحدد القيم التلقائية: SMF بخسارة 2.0 و0.35 و0.2 dB/km عند 850 و1310 و1550 nm، وتشتت حسب G.652. وMMF بخسارة 2.5 dB/km عند 850 nm. وDCF بخسارة 0.5 dB/km وتشتت D = −100 ps/(nm·km).", "length": "تزداد الخسارة مع الطول (αL بالـ dB)، ويزداد التشتت معه أيضاً (DL بوحدة ps/nm).", "atten": "ألغِ Auto لتكتب قيمة α بنفسك.", "disp": "ألغِ Auto لتكتب D بنفسك. والتشتت السالب في DCF يلغي التشتت الموجب في SMF إذا اخترت الطول: L(DCF) = D(SMF)·L(SMF) / |D(DCF)|.", "modalBW": "لليف متعدد الأنماط فقط. كلما ارتفع عرض النطاق الأنماطي قلّ التشتت بين الأنماط."}, "extra": ""}},
  inputs: [{ id: "in", kind: "opt", label: "Input" }], outputs: [{ id: "out", kind: "opt", label: "Output" }],
  tag: function (p) { return p.ftype + " · " + p.length + " km"; },
  params: [{ key: "ftype", label: "Fiber type", type: "select", def: "SMF", options: [["SMF", "Single-mode (G.652)"], ["MMF", "Multimode (graded-index)"], ["DCF", "Dispersion compensating (DCF)"]] },
    { key: "length", label: "Length", unit: "km", type: "number", def: 20, min: 0, max: 500, step: 1 },
    { key: "atten", label: "Attenuation", unit: "dB/km", type: "autonum", def: null, min: 0, max: 10, step: 0.01 },
    { key: "disp", label: "Dispersion", unit: "ps/(nm·km)", type: "autonum", def: null, min: -300, max: 300, step: 0.1 },
    { key: "modalBW", label: "Modal bandwidth", unit: "MHz·km", type: "number", def: 2000, min: 100, max: 10000, step: 100, show: function (p) { return p.ftype === "MMF"; } }],
  icon: '<circle cx="32" cy="20" r="15" class="ic-line"/><circle cx="32" cy="20" r="10" class="ic-line"/><circle cx="32" cy="20" r="5" class="ic-fill"/><line x1="2" y1="20" x2="17" y2="20" class="ic-line"/><line x1="47" y1="20" x2="62" y2="20" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var s = OL.cloneOpt(inp.in), au = OL.fiberAuto(p.ftype, s.lam);
    var a = p.atten == null ? au.a : p.atten, D = p.disp == null ? au.d : p.disp, L = p.length;
    var tl = Math.pow(10, -a * L / 20);
    for (var i = 0; i < s.re.length; i++) { s.re[i] *= tl; s.im[i] *= tl; }
    s.aseS *= tl * tl;
    var DL = D * L; // ps/nm
    if (s.coherent) {
      if (DL) { var lam = s.lam * 1e-9, dl = DL * 1e-3; // s/m
        OL.filt(s.re, s.im, s.t.fs, function (f) { var phi = Math.PI * dl * lam * lam * f * f / OL.C; return [Math.cos(phi), Math.sin(phi)]; }); }
    } else s.pendDL += DL;
    if (p.ftype === "MMF" && L > 0) {
      var m = 0.44 * L / (p.modalBW * 1e6);
      if (s.coherent) { var tmp = s.coherent; s.coherent = false; s.dlam = s.dlam || 0; s.pendModal2 = m * m; s = OL.materialize(s); s.coherent = tmp; }
      else s.pendModal2 += m * m;
    }
    return { out: { out: s }, info: { text: "Loss " + OL.fmt(a * L, 2) + " dB (α = " + OL.fmt(a, 2) + " dB/km). D = " + OL.fmt(D, 2) + " ps/(nm·km), total D·L = " + OL.fmt(DL, 0) + " ps/nm." } };
  }
});
