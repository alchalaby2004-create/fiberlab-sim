/* Optical Gaussian Pulse Source — a Gaussian optical pulse in every 1 bit (optional linear chirp C). */
OL.register({
  type: "gpulse", name: "Optical Gaussian Pulse Source", short: "Gaussian Pulses", category: "Transmitters",
  doc: "Each 1 bit gives a Gaussian pulse E(t) = √P₀·exp[−(1 + jC)t²/(2T₀²)], T₀ = T_FWHM/1.665, centred in the bit.",
  help: {"eq": [{"t": "Chirped Gaussian pulse", "tex": "E(0,t)=\\sqrt{P_0}\\,\\exp\\!\\left[-\\frac{(1+jC)\\,t^{2}}{2T_0^{2}}\\right],\\qquad T_{\\mathrm{FWHM}}=2\\sqrt{\\ln 2}\\,T_0\\approx1.665\\,T_0", "n": "One pulse in the middle of every 1 bit. C > 0: the frequency rises from the leading to the trailing edge."}, {"t": "Dispersion length", "tex": "L_D=\\frac{T_0^{2}}{|\\beta_2|},\\qquad \\beta_2=-\\frac{D\\lambda^{2}}{2\\pi c}", "n": "For SMF at 1550 nm, D ≈ 16 ps/(nm·km) gives β₂ ≈ −20 ps²/km."}, {"t": "Pulse width after a length z", "tex": "\\frac{T(z)}{T_0}=\\sqrt{\\left(1+\\frac{C\\beta_2 z}{T_0^{2}}\\right)^{2}+\\left(\\frac{\\beta_2 z}{T_0^{2}}\\right)^{2}}", "n": "C = 0: the width grows by √2 at z = L(D) and the peak power falls by √2. When C·β₂ < 0 the pulse first gets shorter."}], "params": {"power": "Peak power of each pulse.", "lam": "Carrier wavelength (sets D of the fiber in auto mode).", "width": "FWHM as a part of the bit period. A shorter pulse has a wider spectrum, so it spreads faster (L(D) ∝ T₀²).", "chirp": "Initial linear chirp C. In normal SMF at 1550 nm (β₂ < 0) a positive C compresses the pulse first; a negative C makes it spread faster."}, "extra": "Use Bit Source › Pattern = Single 1 to look at one isolated pulse.", "src": ["agrawal"], "ar": {"doc": "يضع نبضة ضوئية غاوسية في منتصف كل بت 1: E(t) = √P₀·exp[−(1 + jC)t²/(2T₀²)]، حيث T₀ = T_FWHM/1.665.", "eq": [{"t": "نبضة غاوسية مع chirp", "n": "نبضة واحدة في منتصف كل بت 1. وعندما C > 0 يرتفع التردد من مقدمة النبضة إلى مؤخرتها."}, {"t": "طول التشتت", "n": "في الليف أحادي النمط عند 1550 nm، القيمة D ≈ 16 ps/(nm·km) تعطي β₂ ≈ −20 ps²/km."}, {"t": "عرض النبضة بعد مسافة z", "n": "عندما C = 0 يزداد العرض √2 مرة عند z = L(D)، وتنخفض القدرة القصوى √2 مرة. أما إذا كان C·β₂ < 0 فتقصر النبضة أولاً ثم تتسع."}], "params": {"power": "القدرة القصوى لكل نبضة.", "lam": "الطول الموجي للحامل، ومنه يحسب الليف قيمة D في الوضع التلقائي.", "width": "عرض النبضة (FWHM) كجزء من زمن البت. النبضة الأقصر طيفها أعرض فتتسع أسرع، لأن L(D) يتناسب مع T₀².", "chirp": "الـ chirp الخطي الابتدائي C. في الليف العادي عند 1550 nm (حيث β₂ < 0) تنضغط النبضة أولاً إذا كانت C موجبة، وتتسع أسرع إذا كانت سالبة."}, "extra": "لترى نبضة واحدة منفردة اختر في Bit Source: Pattern = Single 1."}},
  inputs: [{ id: "in", kind: "bin", label: "Bits" }], outputs: [{ id: "out", kind: "opt", label: "Optical" }],
  params: [{ key: "power", label: "Peak power", unit: "dBm", type: "number", def: 0, min: -40, max: 30, step: 0.5 },
    { key: "lam", label: "Wavelength", unit: "nm", type: "number", def: 1550, min: 800, max: 1650, step: 1 },
    { key: "width", label: "Pulse width (FWHM)", unit: "× bit period", type: "number", def: 0.5, min: 0.05, max: 1, step: 0.05 },
    { key: "chirp", label: "Initial chirp C", unit: "", type: "number", def: 0, min: -10, max: 10, step: 0.5 }],
  icon: '<line x1="4" y1="32" x2="60" y2="32" class="ic-line"/><path d="M8 32 C18 32 18 8 24 8 C30 8 30 32 40 32 C46 32 48 18 52 18 C56 18 56 32 60 32" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var t = inp.in.t, N = t.N, T = 1 / t.B, Tf = p.width * T, T0 = Tf / (2 * Math.sqrt(Math.log(2))), A = Math.sqrt(OL.fromDbm(p.power));
    var s = OL.newOpt(t, p.lam), dt = 1 / t.fs, span = Math.ceil(6 * T0 / dt), nb = t.bits.length;
    for (var k = 0; k < nb; k++) {
      if (!t.bits[k]) continue;
      var c = (k + 0.5) * t.sps;
      for (var j = -span; j <= span; j++) {
        var i = Math.round(c) + j, tt = (i - c) * dt, x = tt * tt / (2 * T0 * T0), a = A * Math.exp(-x), ph = p.chirp * x, ii = ((i % N) + N) % N;
        s.re[ii] += a * Math.cos(ph); s.im[ii] += a * Math.sin(ph);
      }
    }
    s.rz = true;
    return { out: { out: s }, info: { text: "T_FWHM = " + OL.fmt(Tf * 1e12, 2) + " ps, T₀ = " + OL.fmt(T0 * 1e12, 2) + " ps. Dispersion length L_D = T₀²/|β₂| (for example β₂ = −20 ps²/km gives L_D = " + OL.fmt(T0 * T0 * 1e24 / 20, 2) + " km)." } };
  }
});
