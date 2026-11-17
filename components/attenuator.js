/* Variable Attenuator — fixed loss in dB. */
OL.register({
  type: "atten", name: "Variable Attenuator", short: "Attenuator", category: "Amplifiers and passive",
  doc: "Reduces the optical power by a set number of dB (noise is reduced by the same amount).",
  help: {"eq": [{"t": "Attenuation", "tex": "P_{\\mathrm{out}}\\,[\\mathrm{dBm}]=P_{\\mathrm{in}}\\,[\\mathrm{dBm}]-A", "n": "Signal and ASE noise are reduced by the same amount, so the OSNR stays the same."}], "params": {"db": "Sets the received power. Used to measure receiver sensitivity (the power where Q = 6)."}, "extra": "", "src": ["keiser"], "ar": {"doc": "يخفض القدرة الضوئية بعدد محدد من الـ dB (والضوضاء تنخفض بالمقدار نفسه).", "eq": [{"t": "التوهين", "n": "الإشارة وضوضاء ASE تنخفضان بالمقدار نفسه، فيبقى OSNR كما هو."}], "params": {"db": "يحدد القدرة المستقبلة. يُستخدم لقياس حساسية المستقبل (القدرة التي يكون عندها Q = 6)."}, "extra": ""}},
  inputs: [{ id: "in", kind: "opt", label: "Input" }], outputs: [{ id: "out", kind: "opt", label: "Output" }],
  tag: function (p) { return p.db + " dB"; },
  params: [{ key: "db", label: "Attenuation", unit: "dB", type: "number", def: 10, min: 0, max: 60, step: 0.5 }],
  icon: '<rect x="12" y="8" width="40" height="24" rx="3" class="ic-line"/><polyline points="16,26 22,14 28,26 34,14 40,26 46,14" class="ic-line"/><line x1="2" y1="20" x2="12" y2="20" class="ic-line"/><line x1="52" y1="20" x2="62" y2="20" class="ic-line"/>',
  run: function (p, inp, ctx) {
    var s = OL.cloneOpt(inp.in), a = Math.pow(10, -p.db / 20);
    for (var i = 0; i < s.re.length; i++) { s.re[i] *= a; s.im[i] *= a; }
    s.aseS *= a * a;
    return { out: { out: s } };
  }
});
