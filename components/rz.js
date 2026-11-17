/* RZ Line Coder — return-to-zero pulses with a set duty cycle. */
OL.register({
  type: "rz", name: "RZ Line Coder", short: "RZ Coder", category: "Transmitters",
  doc: "Return-to-zero pulses: a 1 is high only for part of the bit (the duty cycle).",
  help: {"eq": [{"t": "RZ signal", "tex": "v(t)=\\sum_{k} a_k\\,p(t-kT),\\qquad p(t)=1\\ \\ \\mathrm{for}\\ \\ 0\\le t< dT", "n": "d is the duty cycle. A 1 returns to zero before the end of the bit."}, {"t": "Driver filter", "tex": "H(f)=\\exp\\!\\left[-\\frac{\\ln 2}{2}\\left(\\frac{f}{f_d}\\right)^{2}\\right],\\qquad f_d=\\mathrm{bw}\\cdot B", "n": ""}], "params": {"duty": "A shorter duty cycle gives shorter pulses: a wider spectrum (more dispersion) but more time between pulses (less ISI). For the same average power the peak power is higher.", "bw": "As for NRZ: a low bandwidth rounds the pulses. RZ needs about twice the NRZ bandwidth."}, "extra": "", "src": ["agrawal"], "ar": {"doc": "نبضات RZ (عودة إلى الصفر): البت 1 يبقى مرتفعاً لجزء من زمن البت فقط (نسبة العمل).", "eq": [{"t": "إشارة RZ", "n": "d هي نسبة العمل. البت 1 يعود إلى الصفر قبل نهاية البت."}, {"t": "مرشح المشغّل", "n": ""}], "params": {"duty": "نسبة عمل أقصر تعطي نبضات أقصر: طيف أعرض (تشتت أكبر) لكن مسافة أكبر بين النبضات (تداخل أقل). ولنفس القدرة المتوسطة تكون القدرة القصوى أعلى.", "bw": "كما في NRZ: عرض النطاق المنخفض يدوّر النبضات. RZ يحتاج تقريباً ضعف عرض نطاق NRZ."}, "extra": ""}},
  inputs: [{ id: "in", kind: "bin", label: "Bits" }], outputs: [{ id: "out", kind: "elec", label: "Drive" }],
  params: [{ key: "duty", label: "Duty cycle", unit: "bit", type: "number", def: 0.5, min: 0.2, max: 0.8, step: 0.05 },
    { key: "bw", label: "Driver bandwidth", unit: "× bit rate", type: "number", def: 1.6, min: 0.4, max: 4, step: 0.1 }],
  icon: '<polyline points="6,30 12,30 12,10 20,10 20,30 30,30 30,10 38,10 38,30 58,30" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var t = inp.in.t, x = new Float64Array(t.N), xi = new Float64Array(t.N);
    for (var i = 0; i < t.N; i++) x[i] = t.bits[Math.floor(i / t.sps)] && (i % t.sps) / t.sps < p.duty ? 1 : 0;
    OL.filt(x, xi, t.fs, OL.gaussLP(Math.min(p.bw * t.B, 40e9)));
    return { out: { out: { kind: "elec", t: t, x: x, unit: "drive", noise: null, rz: true } } };
  }
});
