/* Avalanche Photodiode (APD) — internal gain M with excess noise F = kM + (1 − k)(2 − 1/M). */
OL.register({
  type: "apd", name: "Avalanche Photodiode (APD)", short: "APD Photodiode", category: "Receivers",
  doc: "I = M·R·P. Shot noise grows as M²F: σ²shot = 2qM²F·RP·Bn. Thermal noise is unchanged, so a moderate M helps.",
  help: {"eq": [{"t": "Current with gain", "tex": "I=M R P", "n": ""}, {"t": "Shot noise with excess noise", "tex": "\\sigma_{\\mathrm{shot}}^{2}=2q\\,M^{2}F\\,RP\\,B_n", "n": "Thermal noise σₜₕ = iₙ√Bₙ is not multiplied."}, {"t": "Excess noise factor", "tex": "F=kM+(1-k)\\left(2-\\frac{1}{M}\\right)", "n": "k = ionization ratio (small k is better)."}], "params": {"M": "M raises the signal above the thermal noise, but shot noise grows as M²F. Q has a maximum at an optimum M (about 15–20 for k = 0.5).", "k": "Smaller k → smaller F → higher optimum M and higher Q.", "eta": "Quantum efficiency (as PIN).", "th": "Thermal noise of the amplifier after the APD."}, "extra": "", "src": ["mcintyre", "keiser", "agrawal"], "ar": {"doc": "ثنائي ضوئي انهياري: I = M·R·P. ضوضاء الطلقات تكبر بنسبة M²F: σ²shot = 2qM²F·RP·Bn، أما الضوضاء الحرارية فلا تتغير، ولذلك تكون أفضل نتيجة عند ربح متوسط.", "eq": [{"t": "التيار مع الربح", "n": ""}, {"t": "ضوضاء الطلقات مع الضوضاء الزائدة", "n": "الضوضاء الحرارية σₜₕ = iₙ√Bₙ لا تُضرب في M."}, {"t": "عامل الضوضاء الزائدة", "n": "k نسبة معاملي التأين، وكلما صغرت كان أفضل."}], "params": {"M": "الربح M يرفع الإشارة فوق الضوضاء الحرارية، لكن ضوضاء الطلقات تكبر بنسبة M²F. لذلك تبلغ Q أعلى قيمة لها عند ربح أمثل (بين 15 و20 تقريباً عندما k = 0.5).", "k": "كلما صغرت k صغر F، فيرتفع الربح الأمثل وترتفع Q.", "eta": "الكفاءة الكمية (كما في PIN).", "th": "الضوضاء الحرارية لمضخم ما بعد الكاشف."}, "extra": ""}},
  inputs: [{ id: "in", kind: "opt", label: "Optical" }], outputs: [{ id: "out", kind: "elec", label: "Current" }],
  params: [{ key: "M", label: "Gain M", unit: "", type: "number", def: 10, min: 1, max: 100, step: 1 },
    { key: "k", label: "Ionization ratio k", unit: "", type: "number", def: 0.5, min: 0.01, max: 1, step: 0.01 },
    { key: "eta", label: "Quantum efficiency η", unit: "", type: "number", def: 0.8, min: 0.1, max: 1, step: 0.05 },
    { key: "th", label: "Thermal noise", unit: "pA/√Hz", type: "number", def: 20, min: 0, max: 100, step: 1 }],
  icon: '<path d="M30 10 L30 30 L46 20 Z" class="ic-fill" transform="rotate(180 38 20)"/><line x1="30" y1="10" x2="30" y2="30" class="ic-line"/><path d="M6 12 l14 4 m-4 -4 l4 4 l-5 2 M6 26 l14 -2 m-5 -3 l5 3 l-4 3" class="ic-line"/><line x1="46" y1="20" x2="60" y2="20" class="ic-line"/><text x="54" y="13" text-anchor="middle" class="ic-text">M</text>',
  run: function (p, inp, ctx) {
    var s = OL.materialize(inp.in), t = s.t, R = p.eta * OL.Q * s.lam * 1e-9 / (OL.H * OL.C), I = OL.intensity(s), x = new Float64Array(t.N);
    var F = p.k * p.M + (1 - p.k) * (2 - 1 / p.M);
    for (var i = 0; i < t.N; i++) x[i] = p.M * R * I[i];
    return { out: { out: { kind: "elec", t: t, x: x, unit: "A", rz: s.rz, noise: { th: p.th * 1e-12, shotK: 2 * OL.Q * p.M * F } } },
      info: { text: "Excess noise factor F = " + OL.fmt(F, 2) + ". Received power " + OL.fmt(OL.dbm(OL.power(s)), 2) + " dBm." } };
  }
});
