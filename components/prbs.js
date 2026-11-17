/* Bit Source — makes the bit sequence and the time base for the whole layout. */
OL.register({
  type: "prbs", name: "Bit Source (PRBS)", short: "Bit Source", category: "Transmitters",
  doc: "Makes a pseudo-random sequence of 0s and 1s at the global bit rate.",
  help: {"eq": [{"t": "Generator polynomial (order 9)", "tex": "x^{9}+x^{5}+1", "n": "A shift register with feedback makes the bits. The pattern repeats after 2ⁿ − 1 bits."}, {"t": "Pattern length and bit period", "tex": "L_{\\mathrm{PRBS}}=2^{n}-1,\\qquad T=\\frac{1}{B}", "n": "B is the bit rate (Global settings)."}], "params": {"pattern": "Pseudo-random for normal links. Single 1 gives one isolated pulse (for pulse spreading or laser turn-on studies). Alternating gives 1010…, the fastest pattern.", "order": "A higher order gives a longer pattern with longer runs of 1s and 0s (up to n in a row). Long runs test the low-frequency response of the receiver. With 512 bits, order 9 (511 bits) fits once."}, "extra": "The bit rate B is a layout parameter. A higher B makes each bit shorter (T = 1/B), so dispersion closes the eye sooner and the receiver needs a wider bandwidth (more noise).", "src": ["o150", "agrawal"], "ar": {"doc": "يولّد تسلسلاً شبه عشوائي من الأصفار والآحاد بمعدل البتات العام.", "eq": [{"t": "كثيرة حدود المولّد (الرتبة 9)", "n": "مسجّل إزاحة مع تغذية راجعة يولّد البتات، ويتكرر النمط بعد 2ⁿ − 1 بت."}, {"t": "طول النمط وزمن البت", "n": "B هو معدل البتات (من إعدادات المخطط)."}], "params": {"pattern": "شبه عشوائي للوصلات العادية. Single 1 يعطي نبضة واحدة منفردة (لدراسة اتساع النبضة أو تشغيل الليزر). Alternating يعطي 1010… وهو أسرع نمط.", "order": "الرتبة الأعلى تعطي نمطاً أطول فيه سلاسل أطول من الآحاد والأصفار (حتى n متتالية)، وهذه تختبر استجابة المستقبل للترددات المنخفضة. مع 512 بت تناسب الرتبة 9 (511 بت) نمطاً كاملاً واحداً."}, "extra": "معدل البتات B من إعدادات المخطط. زيادة B تجعل البت أقصر (T = 1/B)، فيغلق التشتت العين أسرع، ويحتاج المستقبل عرض نطاق أكبر (ضوضاء أكثر)."}},
  inputs: [], outputs: [{ id: "out", kind: "bin", label: "Bits" }],
  params: [{ key: "order", label: "PRBS order (2ⁿ−1)", type: "select", num: true, def: 9, options: [[7, "7"], [9, "9"], [11, "11"]] },
    { key: "pattern", label: "Pattern", type: "select", def: "prbs", options: [["prbs", "Pseudo-random (PRBS)"], ["single", "Single 1 (0100 0000…)"], ["alt", "Alternating (1010…)"]] }],
  icon: '<rect x="6" y="8" width="52" height="24" rx="3" class="ic-fill"/><text x="32" y="25" text-anchor="middle" class="ic-text">1 0 1 1</text>',
  run: function (p, inp, ctx) {
    var t = {}; for (var k in ctx.time) t[k] = ctx.time[k];
    t.bits = p.pattern === "single" ? Array.from({ length: t.nbits }, function (_, i) { return i === 1 ? 1 : 0; }) : p.pattern === "alt" ? Array.from({ length: t.nbits }, function (_, i) { return (i + 1) % 2; }) : OL.prbs(t.nbits, p.order);
    return { out: { out: { kind: "bin", t: t } }, info: { text: t.nbits + " bits at " + ctx.g.bitrate + " Gb/s" } };
  }
});
