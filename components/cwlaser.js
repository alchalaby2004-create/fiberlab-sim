/* DFB Laser (CW) — a DFB laser that stays on. Use it with an external modulator. */
OL.register({
  type: "cwlaser", name: "DFB Laser (CW)", short: "DFB Laser (CW)", category: "Transmitters",
  doc: "Continuous-wave single-mode (DFB) laser. Narrow spectrum, constant power.",
  help: {"eq": [{"t": "Output field", "tex": "E(t)=\\sqrt{P_{\\mathrm{CW}}},\\qquad \\nu=\\frac{c}{\\lambda}", "n": "A single-mode (DFB) laser that stays on. Its linewidth is taken as zero (much smaller than the signal)."}], "params": {"lw": "Laser linewidth Δν (phase noise, a random walk of the phase). It widens the carrier line in the spectrum. 0 = ideal laser (used in the tutorials and assignments); a typical DFB laser has about 1–10 MHz.", "power": "Sets the carrier power. After a Mach–Zehnder modulator the average power is about 3 dB lower (half of the time the light is switched off).", "lam": "Sets the fiber loss and dispersion (automatic values), the photodiode responsivity R ∝ λ, and the photon energy hν used for the amplifier noise."}, "extra": "", "src": ["agrawal", "keiser"], "ar": {"doc": "ليزر أحادي النمط (DFB) يعمل بشكل مستمر. طيف ضيق وقدرة ثابتة.", "eq": [{"t": "المجال الخارج", "n": "ليزر يبقى مشغّلاً. عرض خطه يُعدّ صفراً (أصغر بكثير من عرض الإشارة)."}], "params": {"lw": "عرض خط الليزر Δν (ضوضاء الطور، مشي عشوائي للطور). يوسّع خط الحامل في الطيف. القيمة 0 ليزر مثالي (مستخدمة في الدروس والواجبات)، وليزر DFB النموذجي له نحو 1–10 MHz.", "power": "يحدد قدرة الحامل. بعد معدِّل ماخ-زيندر تكون القدرة المتوسطة أقل بحوالي 3 dB (لأن الضوء مطفأ نصف الوقت).", "lam": "يحدد خسارة الليف وتشتته (القيم التلقائية)، واستجابية الكاشف R ∝ λ، وطاقة الفوتون hν المستخدمة في ضوضاء المضخم."}, "extra": ""}},
  inputs: [], outputs: [{ id: "out", kind: "opt", label: "Optical" }],
  params: [{ key: "power", label: "Power", unit: "dBm", type: "number", def: 3, min: -30, max: 20, step: 0.5 },
    { key: "lam", label: "Wavelength", unit: "nm", type: "number", def: 1550, min: 800, max: 1650, step: 0.0001 },
    { key: "lw", label: "Linewidth", unit: "MHz", type: "number", def: 0, min: 0, max: 1000, step: 1 }],
  icon: '<path d="M14 10 L14 30 L30 20 Z" class="ic-fill"/><line x1="30" y1="10" x2="30" y2="30" class="ic-line"/><line x1="6" y1="20" x2="14" y2="20" class="ic-line"/><line x1="30" y1="20" x2="40" y2="20" class="ic-line"/><path d="M42 14 l12 0 m-4 -3 l4 3 l-4 3 M42 26 l12 0 m-4 -3 l4 3 l-4 3" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var t = ctx.time, s = OL.newOpt(t, p.lam), a = Math.sqrt(OL.fromDbm(p.power));
    var ph = 0, sd = Math.sqrt(2 * Math.PI * p.lw * 1e6 / t.fs);   // phase noise: random walk, variance 2π·Δν·dt per sample
    for (var i = 0; i < t.N; i++) { s.re[i] = a * Math.cos(ph); s.im[i] = a * Math.sin(ph); if (p.lw > 0) ph += sd * OL.gauss(ctx.rng); }
    return { out: { out: s }, info: { text: "Frequency f = c/λ = " + OL.fmt(OL.C / (p.lam * 1e-9) / 1e12, 4) + " THz. Power " + OL.fmt(OL.fromDbm(p.power) * 1e3, 3) + " mW." } };
  }
});
