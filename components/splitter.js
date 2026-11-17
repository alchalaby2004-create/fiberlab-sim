/* Optical Coupler 1×2 — divides the power between two outputs. */
OL.register({
  type: "splitter", name: "Optical Coupler 1×2", short: "Coupler 1×2", category: "Amplifiers and passive",
  doc: "Sends part of the light to output 1 and the rest to output 2, with a small excess loss.",
  help: {"eq": [{"t": "Output powers", "tex": "P_1=r\\,P\\,10^{-EL/10},\\qquad P_2=(1-r)\\,P\\,10^{-EL/10}", "n": "r = 50% gives a 3 dB split."}], "params": {"ratio": "Share of power to output 1 (r). A 50/50 splitter costs 3 dB on each output.", "excess": "Extra loss EL of a real splitter."}, "extra": "", "src": ["keiser"], "ar": {"doc": "يرسل جزءاً من الضوء إلى الخرج 1 والباقي إلى الخرج 2، مع خسارة إضافية صغيرة.", "eq": [{"t": "قدرتا الخرج", "n": "عندما r = 50% تنقسم القدرة بالتساوي، أي 3 dB لكل خرج."}], "params": {"ratio": "نسبة القدرة التي تذهب إلى الخرج 1 (r). والمقسِّم 50/50 يخسر 3 dB على كل خرج.", "excess": "الخسارة الإضافية EL الموجودة في أي مقسِّم حقيقي."}, "extra": ""}},
  inputs: [{ id: "in", kind: "opt", label: "Input" }], outputs: [{ id: "o1", kind: "opt", label: "Output 1" }, { id: "o2", kind: "opt", label: "Output 2" }],
  params: [{ key: "ratio", label: "Power to output 1", unit: "%", type: "number", def: 50, min: 1, max: 99, step: 1 },
    { key: "excess", label: "Excess loss", unit: "dB", type: "number", def: 0.2, min: 0, max: 3, step: 0.1 }],
  icon: '<line x1="2" y1="20" x2="22" y2="20" class="ic-line"/><path d="M22 20 C34 20 36 10 60 10 M22 20 C34 20 36 30 60 30" class="ic-line"/><circle cx="22" cy="20" r="3" class="ic-fill"/>',
  run: function (p, inp, ctx) {
    var ex = Math.pow(10, -p.excess / 10), mk = function (fr) { var s = OL.cloneOpt(inp.in), a = Math.sqrt(fr * ex); for (var i = 0; i < s.re.length; i++) { s.re[i] *= a; s.im[i] *= a; } s.aseS *= fr * ex; return s; };
    return { out: { o1: mk(p.ratio / 100), o2: mk(1 - p.ratio / 100) } };
  }
});
