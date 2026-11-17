/* =====================================================================
   FiberLab Sim — graded assignments (build-it-yourself, personal values).
   Each student gets personal values from his full name, so the
   correct answer is different for each student. Shared by the program
   (to show the values) and the grader (to check and grade).
   The correct answers are NOT stored here: the grader finds them with
   the simulator from the student's personal values.
   ===================================================================== */
(function (root) {
  var OL = root.OL;
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function range(a, b, s) { var r = []; for (var v = a; v <= b + 1e-9; v += s) r.push(+v.toFixed(4)); return r; }

  /* Fields of an assignment:
     personal: values chosen from the student number; fixed: values that are the same for all.
     req: components that must be on the signal path, with required settings ("$key" = personal value).
     chain: the order of component types along the path (checked with the wires).
     allow: setting keys a student may change for each component type (others must stay default).
     The search rules for the answers and the reference layouts are in assignments_key.js (instructor only, not public). */
  var A = [
    { id: "as1", title: "Assignment 1: Power budget (graded)", bitrate: 2.5,
      goal: "Build a 1310 nm, 2.5 Gb/s link with external modulation and find its maximum length.",
      personal: [{ key: "P", label: "DFB laser power", unit: "dBm", values: range(1, 5, 0.5) }, { key: "alpha", label: "Fiber attenuation (set it, untick Auto)", unit: "dB/km", values: range(0.30, 0.40, 0.01) }],
      req: [{ type: "prbs" }, { type: "nrz" }, { type: "cwlaser", p: { lam: 1310, power: "$P" } }, { type: "mzm" }, { type: "fiber", p: { ftype: "SMF", atten: "$alpha" } }, { type: "pin" }, { type: "bessel" }, { type: "ber" }],
      chain: [["prbs", "nrz", "mzm", "fiber", "pin", "bessel", "ber"], ["cwlaser", "mzm"]],
      allow: { cwlaser: ["lam", "power"], fiber: ["ftype", "length", "atten"] },
      task: "Find the longest fiber length (whole km) that still gives Q ≥ 6.",
      steps: ["Build the link of the figure in your Lab Tutorial: PRBS → NRZ → Ext. Modulator (with DFB Laser (CW)) → Fiber Span → PIN → Bessel Low-Pass Filter → Eye & BER Meter.",
        "Set Global settings: bit rate 2.5 Gb/s. Set the DFB Laser (CW) to 1310 nm and your power. In the fiber, untick Auto attenuation and type your value.",
        "Change the fiber length (and use Sweep) to find the answer. Set the fiber to your answer, press Run, then Send result."] },
    { id: "as2", title: "Assignment 2: Receiver sensitivity (graded)", bitrate: 10,
      goal: "Build a back-to-back 10 Gb/s test with an attenuator and find the sensitivity of your receiver.",
      personal: [{ key: "P", label: "DFB laser power", unit: "dBm", values: range(1, 5, 0.5) }, { key: "th", label: "PIN thermal noise", unit: "pA/√Hz", values: range(14, 26, 2) }],
      req: [{ type: "prbs" }, { type: "nrz" }, { type: "cwlaser", p: { lam: 1550, power: "$P" } }, { type: "mzm" }, { type: "atten" }, { type: "pin", p: { th: "$th" } }, { type: "bessel" }, { type: "ber" }],
      chain: [["prbs", "nrz", "mzm", "atten", "pin", "bessel", "ber"], ["cwlaser", "mzm"]],
      allow: { cwlaser: ["lam", "power"], atten: ["db"], pin: ["th"] },
      task: "Find the highest attenuation (steps of 0.5 dB) that still gives Q ≥ 6. The received power at that point is your sensitivity.",
      steps: ["Build: PRBS → NRZ → Ext. Modulator (with DFB Laser (CW)) → Variable Attenuator → PIN → Bessel Low-Pass Filter → Eye & BER Meter. Add a power meter after the attenuator.",
        "Bit rate 10 Gb/s, DFB Laser (CW) 1550 nm with your power, PIN thermal noise = your value.",
        "Find the answer, set the attenuator to it, press Run, then Send result."] },
    { id: "as3", title: "Assignment 3: Dispersion compensation (graded)", bitrate: 10,
      goal: "Build a 10 Gb/s, 1550 nm link with SMF, DCF and an EDFA, and find the best DCF length.",
      personal: [{ key: "Ls", label: "SMF length", unit: "km", values: range(60, 120, 10) }, { key: "Dd", label: "DCF dispersion (set it, untick Auto)", unit: "ps/(nm·km)", values: range(-120, -80, 10) }],
      req: [{ type: "prbs" }, { type: "nrz" }, { type: "cwlaser", p: { lam: 1550, power: 3 } }, { type: "mzm" }, { type: "fiber", p: { ftype: "SMF", length: "$Ls" } }, { type: "fiber", p: { ftype: "DCF", disp: "$Dd" } }, { type: "edfa", p: { mode: "power", pout: -8 } }, { type: "pin" }, { type: "bessel" }, { type: "ber" }],
      chain: [["prbs", "nrz", "mzm", "fiber", "fiber", "edfa", "pin", "bessel", "ber"], ["cwlaser", "mzm"]],
      allow: { cwlaser: ["lam", "power"], fiber: ["ftype", "length", "disp"], edfa: ["mode", "pout"] },
      task: "Find the DCF length (whole km) that gives the highest Q.",
      steps: ["Build: PRBS → NRZ → Ext. Modulator (DFB Laser (CW) 1550 nm, +3 dBm) → Fiber Span (SMF, your length) → Fiber Span (type DCF, untick Auto dispersion, your value) → EDFA (power control, −8 dBm) → PIN → Bessel filter → Eye & BER Meter.",
        "Bit rate 10 Gb/s. Use L(DCF) = D(SMF)·L(SMF)/|D(DCF)| as a first guess, then check around it with Sweep.",
        "Set the DCF to your best length, press Run, then Send result."] },
    { id: "as4", title: "Assignment 4: Optical amplifier (graded)", bitrate: 10,
      goal: "Build a 10 Gb/s, 1310 nm link with a long fiber and an EDFA pre-amplifier, and find the smallest gain that makes it work.",
      personal: [{ key: "Ls", label: "Fiber length", unit: "km", values: range(70, 95, 5) }, { key: "nf", label: "EDFA noise figure", unit: "dB", values: range(4, 6, 0.5) }],
      req: [{ type: "prbs" }, { type: "nrz" }, { type: "cwlaser", p: { lam: 1310, power: 3 } }, { type: "mzm" }, { type: "fiber", p: { ftype: "SMF", length: "$Ls" } }, { type: "edfa", p: { mode: "gain", nf: "$nf" } }, { type: "pin" }, { type: "bessel" }, { type: "ber" }],
      chain: [["prbs", "nrz", "mzm", "fiber", "edfa", "pin", "bessel", "ber"], ["cwlaser", "mzm"]],
      allow: { cwlaser: ["lam", "power"], fiber: ["ftype", "length"], edfa: ["mode", "gain", "nf"] },
      task: "Find the smallest EDFA gain (steps of 0.5 dB) that gives Q ≥ 6.",
      steps: ["Build: PRBS → NRZ → Ext. Modulator (DFB Laser (CW) 1310 nm, +3 dBm) → Fiber Span (SMF, your length) → EDFA (gain control, your noise figure) → PIN → Bessel filter → Eye & BER Meter. Add a Spectrum Monitor after the EDFA to read the OSNR.",
        "Bit rate 10 Gb/s.", "Set the EDFA to your answer, press Run, then Send result."] },
    { id: "as5", title: "Assignment 5: LED link (graded)", bitrate: 0.1,
      goal: "Build a 100 Mb/s LED link on multimode fiber and find its maximum length.",
      personal: [{ key: "tau", label: "LED carrier lifetime", unit: "ns", values: range(1, 3, 0.5) }, { key: "mbw", label: "Fiber modal bandwidth", unit: "MHz·km", values: [1000, 1500, 2000, 3000] }],
      req: [{ type: "prbs" }, { type: "nrz" }, { type: "led", p: { lam: 850, power: -15, tau: "$tau" } }, { type: "fiber", p: { ftype: "MMF", modalBW: "$mbw" } }, { type: "pin" }, { type: "bessel" }, { type: "ber" }],
      chain: [["prbs", "nrz", "led", "fiber", "pin", "bessel", "ber"]],
      allow: { led: ["lam", "power", "tau"], fiber: ["ftype", "length", "modalBW"] },
      task: "Find the longest multimode fiber length (steps of 0.1 km) that still gives Q ≥ 6.",
      steps: ["Build: PRBS → NRZ → LED (850 nm, −15 dBm, your lifetime) → Fiber Span (multimode, your modal bandwidth) → PIN → Bessel filter → Eye & BER Meter. Add an Oscilloscope after the filter.",
        "Bit rate 100 Mb/s.", "Set the fiber to your answer, press Run, then Send result."] },
    { id: "as6", title: "Assignment 6: APD receiver (graded)", bitrate: 10,
      goal: "Build a 10 Gb/s back-to-back test with an APD receiver and find the best APD gain.",
      personal: [{ key: "att", label: "Attenuator", unit: "dB", values: range(26, 30, 0.5) }, { key: "k", label: "APD ionization ratio k", unit: "", values: range(0.2, 0.6, 0.1) }],
      req: [{ type: "prbs" }, { type: "nrz" }, { type: "cwlaser", p: { lam: 1550, power: 3 } }, { type: "mzm" }, { type: "atten", p: { db: "$att" } }, { type: "apd", p: { k: "$k" } }, { type: "bessel" }, { type: "ber" }],
      chain: [["prbs", "nrz", "mzm", "atten", "apd", "bessel", "ber"], ["cwlaser", "mzm"]],
      allow: { cwlaser: ["lam", "power"], atten: ["db"], apd: ["M", "k"] },
      task: "Find the whole-number APD gain M that gives the highest Q.",
      steps: ["Build: PRBS → NRZ → Ext. Modulator (DFB Laser (CW) 1550 nm, +3 dBm) → Variable Attenuator (your value) → Avalanche Photodiode (APD) (your k) → Bessel filter → Eye & BER Meter.",
        "Bit rate 10 Gb/s. Use Sweep on the APD gain M.", "Set M to your answer, press Run, then Send result."] },
    { id: "as7", title: "Assignment 7: Direct vs external modulation (graded)", bitrate: 10,
      goal: "Build two 10 Gb/s links side by side, one with a directly modulated laser and one with a CW laser and MZ modulator, and find the reach of each.",
      personal: [{ key: "lam", label: "Wavelength (both lasers)", unit: "nm", values: range(1530, 1565, 5) }, { key: "alpha", label: "DML chirp factor α", unit: "", values: range(3, 6, 0.5) }],
      req: [{ type: "prbs" }, { type: "nrz" }, { type: "dml", p: { lam: "$lam", power: 0, alpha: "$alpha" } }, { type: "cwlaser", p: { lam: "$lam", power: 3 } }, { type: "mzm" }, { type: "fiber", p: { ftype: "SMF" }, after: "dml" }, { type: "fiber", p: { ftype: "SMF" }, after: "mzm" }, { type: "edfa", p: { mode: "power", pout: -8 } }, { type: "pin" }, { type: "bessel" }, { type: "ber", after: "dml" }, { type: "ber", after: "mzm" }],
      chain: [["prbs", "nrz", "dml", "fiber", "edfa", "pin", "bessel", "ber"], ["prbs", "nrz", "mzm", "fiber", "edfa", "pin", "bessel", "ber"], ["cwlaser", "mzm"]],
      allow: { dml: ["lam", "power", "alpha"], cwlaser: ["lam", "power"], fiber: ["ftype", "length"], edfa: ["mode", "pout"] },
      task: "Find the longest whole-km fiber length with Q ≥ 6 for the DML link and for the EML link. Set both fibers to your answers.",
      steps: ["Build two links from the same NRZ generator: (top) Direct-Modulation Laser → Fiber Span → EDFA (power control −8 dBm) → PIN → Bessel → Eye & BER Meter; (bottom) DFB Laser (CW) + Ext. Modulator → Fiber Span → EDFA (power control −8 dBm) → PIN → Bessel → Eye & BER Meter.",
        "Bit rate 10 Gb/s. Both lasers at your wavelength; DML 0 dBm with your α; DFB Laser (CW) +3 dBm.",
        "Find both lengths, set them, press Run, then Send result."] }
  ];

  /** The personal key is the student's full name, normalized so that small writing differences
   *  (letter case, extra spaces, Arabic hamza/taa-marbuta/diacritics) give the same values. */
  function normName(s) {
    s = String(s || "").normalize("NFKD").toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u0640\u0300-\u036f]/g, "")
      .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627").replace(/\u0629/g, "\u0647").replace(/\u0649/g, "\u064A").replace(/\u0624/g, "\u0648").replace(/\u0626/g, "\u064A");
    return s.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  }
  function keyOf(name) { return "n:" + normName(name); }
  /** Personal values for an assignment and a personal key (made by keyOf from the full name). */
  function personal(a, key) {
    key = String(key || ""); var v = {};
    a.personal.forEach(function (q, i) { var h = hash(a.id + ":" + q.key + ":" + key + ":" + i); v[q.key] = q.values[h % q.values.length]; });
    return v;
  }
  var API = { list: A, personal: personal, keyOf: keyOf, normName: normName, get: function (id) { return A.filter(function (a) { return a.id === id; })[0]; },
    /** Adds the instructor-only parts (answer rules, reference layouts) to the assignments. */
    addKey: function (k) { A.forEach(function (a) { if (k[a.id]) Object.keys(k[a.id]).forEach(function (f) { a[f] = k[a.id][f]; }); }); } };
  if (OL) OL.ASSIGN = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
