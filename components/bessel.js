/* Bessel Low-Pass Filter — 4th-order Bessel, cut-off set as a fraction of the bit rate.
   It also adds the receiver noise left "pending" by the photodetector, for its own noise bandwidth. */
(function () {
  function bessel4(fc) { // H(s) = 105/(s^4+10s^3+45s^2+105s+105), scaled so |H| = -3 dB at fc, linear phase removed
    var w3 = 2.1139, td = 1; // normalized: group delay of the prototype at DC = 1
    return function (f) {
      var w = w3 * f / fc, re = w * w * w * w - 45 * w * w + 105, im = -10 * w * w * w + 105 * w; // denominator at s = jw
      var d = re * re + im * im, hr = 105 * re / d, hi = -105 * im / d, ph = w * td, c = Math.cos(ph), s = Math.sin(ph);
      return [hr * c - hi * s, hr * s + hi * c];
    };
  }
  OL.register({
    type: "bessel", name: "Bessel Low-Pass Filter", short: "Bessel LPF", category: "Receivers",
    doc: "4th-order Bessel low-pass filter (the usual receiver filter). Cut-off ≈ 0.75 × bit rate.",
    help: {"eq": [{"t": "4th-order Bessel filter", "tex": "H(s)=\\frac{105}{s^{4}+10s^{3}+45s^{2}+105s+105},\\qquad s=j\\,2.114\\,\\frac{f}{f_c}", "n": "Bessel filters have almost constant delay, so pulse shapes are kept. The constant delay is removed."}, {"t": "Noise bandwidth", "tex": "B_n=\\int_{0}^{\\infty}|H(f)|^{2}\\,df\\approx 1.1\\,f_c", "n": "Receiver noise is added for this bandwidth."}], "params": {"fc": "Lower f(c) → less noise but more ISI. Higher f(c) → sharper pulses but more noise. The usual choice is about 0.75 × bit rate."}, "extra": "", "src": ["thomson", "agrawal", "keiser"], "ar": {"doc": "مرشح Bessel للتمرير المنخفض من الرتبة الرابعة، وهو المرشح المعتاد في المستقبل. يُختار تردد القطع عادةً نحو 0.75 من معدل البتات.", "eq": [{"t": "مرشح Bessel من الرتبة الرابعة", "n": "يمتاز مرشح Bessel بتأخير شبه ثابت لكل الترددات، فيحافظ على شكل النبضة. والتأخير الثابت محذوف من النتائج."}, {"t": "عرض نطاق الضوضاء", "n": "ضوضاء المستقبل تُضاف على هذا العرض."}], "params": {"fc": "خفض f(c) يقلل الضوضاء لكنه يزيد التداخل بين البتات (ISI)، ورفعه يجعل النبضات أوضح لكنه يزيد الضوضاء. والاختيار المعتاد نحو 0.75 من معدل البتات."}, "extra": ""}},
    inputs: [{ id: "in", kind: "elec", label: "Input" }], outputs: [{ id: "out", kind: "elec", label: "Output" }],
    params: [{ key: "fc", label: "Cut-off frequency", unit: "× bit rate", type: "number", def: 0.75, min: 0.2, max: 2, step: 0.05 }],
    icon: '<rect x="10" y="6" width="44" height="28" rx="3" class="ic-line"/><path d="M14 14 C26 14 30 14 34 20 C38 28 42 30 50 30" class="ic-line"/><line x1="2" y1="20" x2="10" y2="20" class="ic-line"/><line x1="54" y1="20" x2="62" y2="20" class="ic-line"/>',
    run: function (p, inp, ctx) {
      var e = inp.in, t = e.t, h = bessel4(p.fc * t.B), s = OL.cloneElec(e), si = new Float64Array(t.N);
      OL.filt(s.x, si, t.fs, h);
      var Bn = OL.noiseBW(h, t.fs / 2);
      if (e.noise) s = OL.addNoise(s, Bn, ctx.rng);
      return { out: { out: s }, info: { text: "Noise bandwidth Bn = " + OL.fmt(Bn / 1e9, 2) + " GHz." } };
    }
  });
})();
