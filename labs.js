/* =====================================================================
   FiberLab Sim — experiments. Each lab = text + a starting layout (graph).
   Node ids are fixed so that the noise (seeded by id) is the same for everybody.
   ===================================================================== */
(function (root) {
  var X = function (i) { return 20 + i * 165; };
  function N(id, type, x, y, params) { return { id: id, type: type, x: x, y: y, params: params || {} }; }
  function L(a, ap, b, bp) { return { from: [a, ap], to: [b, bp] }; }
  // external-modulation transmitter: PRBS → NRZ → MZM (+ CW laser above)
  function emlTx(lam, pw, y) {
    y = y || 140;
    return { nodes: [N("n1", "prbs", X(0), y), N("n2", "nrz", X(1), y), N("n3", "cwlaser", X(1), y - 120, { lam: lam, power: pw == null ? 3 : pw }), N("n4", "mzm", X(2), y)],
      links: [L("n1", "out", "n2", "in"), L("n3", "out", "n4", "opt"), L("n2", "out", "n4", "mod")] };
  }
  function rx(prev, col, y, pre) { // PIN → Bessel → BER
    pre = pre || "r";
    return { nodes: [N(pre + "1", "pin", X(col), y), N(pre + "2", "bessel", X(col + 1), y), N(pre + "3", "ber", X(col + 2), y)],
      links: [L(prev[0], prev[1], pre + "1", "in"), L(pre + "1", "out", pre + "2", "in"), L(pre + "2", "out", pre + "3", "in")] };
  }
  function join() { var g = { nodes: [], links: [] }; for (var i = 0; i < arguments.length; i++) { g.nodes = g.nodes.concat(arguments[i].nodes || []); g.links = g.links.concat(arguments[i].links || []); } return g; }
  function G(globals, parts) { var g = join.apply(null, parts); g.globals = globals; return g; }

  var LABS = [
    { id: "free", title: "Free design", goal: "Build any link. Drag components from the library, connect the ports, double-click to set them, then press Run.",
      steps: ["Drag components from the library onto the layout (or tap a component to add it).", "Connect an output port (right side) to an input port (left side) of the same color.", "Double-click a component to change its settings. Press Run.", "Double-click a visualizer to open its results. Use Sweep to change one setting step by step."],
      graph: G({ bitrate: 10 }, [emlTx(1550), { nodes: [N("f1", "fiber", X(3), 140, { length: 20 })], links: [L("n4", "out", "f1", "in")] }, rx(["f1", "out"], 4, 140),
        { nodes: [N("m1", "powermeter", X(3), 20), N("m2", "osa", X(4), 20)], links: [L("n4", "out", "m1", "in"), L("f1", "out", "m2", "in")] }]) },

    { task: "Set the fiber length to the longest whole number of km that still gives Q ≥ 6. Press Run.", id: "lab1", title: "Tutorial 1: Power budget of a simple link",
      goal: "Measure how the received power falls with fiber length, and find the longest working link.",
      steps: ["Press Run. Read the two power meters (after the modulator and after the fiber). Check: received = launch − fiber loss.",
        "Double-click the Fiber Span. Set the length to 10, 20, 30, 40, 50, 60, 70 and 80 km. Press Run each time. Record received power, Q and BER.",
        "Find the length where Q falls below 6 (BER worse than 10⁻⁹).",
        "Use Sweep: Fiber Span › Length, 10 to 90 km, 9 steps, result Eye & BER Meter › Q factor. Copy the table to your report."],
      graph: G({ bitrate: 2.5 }, [emlTx(1310), { nodes: [N("f1", "fiber", X(3), 140, { length: 20 }), N("m1", "powermeter", X(3), 20), N("m2", "powermeter", X(4), 20)],
        links: [L("n4", "out", "f1", "in"), L("n4", "out", "m1", "in"), L("f1", "out", "m2", "in")] }, rx(["f1", "out"], 4, 140)]) },

    { task: "At 10 Gb/s, set the attenuator (steps of 0.5 dB) to the highest value that still gives Q ≥ 6. Press Run.", id: "lab2", title: "Tutorial 2: Receiver sensitivity and the eye diagram",
      goal: "Find the smallest received power that gives BER = 10⁻⁹, and learn to read an eye diagram.",
      steps: ["This is a back-to-back test (no fiber). The attenuator sets the received power, shown by the power meter.",
        "Set the attenuator to 10, 14, 16, 18, 19, 20 and 22 dB. Press Run each time. Record received power, Q and BER. Open the Eye & BER Meter to see the eye.",
        "Find the sensitivity: the received power where Q = 6.",
        "Open Global settings and change the bit rate to 2.5 Gb/s. Repeat. Is the sensitivity better or worse? Why?"],
      graph: G({ bitrate: 10 }, [emlTx(1550), { nodes: [N("a1", "atten", X(3), 140, { db: 10 }), N("m1", "powermeter", X(4), 20)], links: [L("n4", "out", "a1", "in"), L("a1", "out", "m1", "in")] }, rx(["a1", "out"], 4, 140)]) },

    { task: "At 1550 nm with 100 km of SMF, add a DCF between the fiber and the EDFA and set its length (whole km) for the highest Q. Press Run.", id: "lab3", title: "Tutorial 3: Chromatic dispersion and its compensation",
      goal: "See how dispersion closes the eye, and fix it with a dispersion-compensating fiber (DCF).",
      steps: ["The EDFA (power control) keeps the received power at −8 dBm, so only dispersion changes the result.",
        "Set the fiber length to 0, 20, 40, 60, 80, 100 and 120 km. Record Q and the total dispersion (shown in the fiber's properties after Run).",
        "Change the DFB Laser (CW) wavelength to 1310 nm and repeat. Explain the difference.",
        "Back at 1550 nm and 100 km: drag a second Fiber Span between the fiber and the EDFA, and set its type to DCF. Change its length from 0 to 25 km. Find the best DCF length.",
        "Check your answer: L(DCF) = D(SMF) × L(SMF) ÷ |D(DCF)|."],
      graph: G({ bitrate: 10 }, [emlTx(1550), { nodes: [N("f1", "fiber", X(3), 140, { length: 100 }), N("e1", "edfa", X(4), 140, { mode: "power", pout: -8 }), N("m2", "osa", X(5), 20)],
        links: [L("n4", "out", "f1", "in"), L("f1", "out", "e1", "in"), L("e1", "out", "m2", "in")] }, rx(["e1", "out"], 5, 140)]) },

    { task: "Add an EDFA (gain control, NF = 5 dB) between the DCF and the PIN, and set the smallest gain (steps of 0.5 dB) that gives Q ≥ 6. Press Run.", id: "lab4", title: "Tutorial 4: The optical amplifier (EDFA)",
      goal: "Use an EDFA to save a long link, and see how its noise (ASE) limits the result.",
      steps: ["Press Run without an amplifier. Record the received power, Q and BER. Does the link work?",
        "Drag an EDFA from the library. Delete the wire between the DCF and the PIN, and connect DCF → EDFA → PIN. Keep Gain control, NF = 5 dB. Set the gain to 0, 5, 10, 15, 20 and 25 dB. Record received power, OSNR and Q.",
        "Set the gain to 30 dB and the DFB laser power to −7 dBm (launch ≈ −10 dBm). Change the noise figure to 4, 6, 8 and 10 dB. Record OSNR and Q.",
        "Keep NF = 5 dB. Change the DFB laser power from −17 to +3 dBm (launch −20 to 0 dBm). Record OSNR and Q.",
        "Connect an Optical Spectrum Monitor after the EDFA. Find the ASE noise floor around the signal."],
      graph: G({ bitrate: 10 }, [emlTx(1550), { nodes: [N("f1", "fiber", X(3), 140, { length: 100 }), N("f2", "fiber", X(4), 140, { ftype: "DCF", length: 17 }), N("m1", "powermeter", X(5), 20)],
        links: [L("n4", "out", "f1", "in"), L("f1", "out", "f2", "in"), L("f2", "out", "m1", "in")] }, rx(["f2", "out"], 5, 140)]) },

    { task: "Part A: set the LED fiber length (steps of 0.1 km) to the longest value that still gives Q ≥ 6. Press Run.", id: "lab5", title: "Tutorial 5: Optical sources: LED, FP laser and DFB laser",
      goal: "Compare the three sources and see how spectral width limits speed and distance.",
      steps: ["Part A: LED at 850 nm, multimode fiber, 100 Mb/s. Change the length from 0 to 5 km. Find the longest working link. Look at the oscilloscope.",
        "Part B: Build three links at 1550 nm, 2.5 Gb/s, single-mode fiber, EDFA (power control −8 dBm): Fabry-Perot laser, Direct-Modulation Laser, and DFB Laser (CW) + Ext. Modulator. Compare Q at 0, 10, 20, 50 and 100 km.",
        "Part C: Fabry-Perot laser at 1310 nm, 2.5 Gb/s, no EDFA. Lengths 0, 20 and 40 km. Explain why 1310 nm works better.",
        "Open the spectrum monitor for each source and compare the spectral widths."],
      graph: G({ bitrate: 0.1 }, [{ nodes: [N("n1", "prbs", X(0), 140), N("n2", "nrz", X(1), 140), N("s1", "led", X(2), 140, { lam: 850, power: -15 }), N("f1", "fiber", X(3), 140, { ftype: "MMF", length: 1 }),
          N("m1", "osa", X(3), 20), N("m3", "scope", X(7), 20)],
        links: [L("n1", "out", "n2", "in"), L("n2", "out", "s1", "in"), L("s1", "out", "f1", "in"), L("s1", "out", "m1", "in")] }, rx(["f1", "out"], 4, 140), { links: [L("r2", "out", "m3", "in")] }]) },

    { task: "Replace the PIN with an APD (k = 0.5), set the attenuator to 28 dB, and choose the whole-number gain M that gives the highest Q. Press Run.", id: "lab6", title: "Tutorial 6: PIN and APD photodetectors",
      goal: "Compare the sensitivity of PIN and APD receivers, and find the best APD gain.",
      steps: ["With the PIN, set the attenuator to 18, 20, 22, 24 and 26 dB. Record Q. Find the sensitivity (Q = 6).",
        "Replace the PIN with an APD Photodiode (M = 10): drag it in, delete the PIN, and connect attenuator → APD → filter. Set the attenuator to 22, 24, 26, 28 and 30 dB. Record Q.",
        "Set the attenuator to 28 dB. Sweep: Avalanche Photodiode (APD) › Gain M from 1 to 40, 14 steps. Find the best M.",
        "Explain why Q falls again at very high M. Repeat with k = 0.1."],
      graph: G({ bitrate: 10 }, [emlTx(1550), { nodes: [N("a1", "atten", X(3), 140, { db: 20 }), N("m1", "powermeter", X(4), 20)], links: [L("n4", "out", "a1", "in"), L("a1", "out", "m1", "in")] }, rx(["a1", "out"], 4, 140)]) },

    { task: "At 10 Gb/s and 1550 nm, set the top fiber (DML) and the bottom fiber (EML) to the longest whole-km lengths that still give Q ≥ 6. Press Run.", id: "lab7", title: "Tutorial 7: Direct and external (indirect) modulation",
      goal: "Compare a directly modulated laser (top) with a CW laser and external modulator (bottom), and see how chirp limits distance.",
      steps: ["Press Run at 0 km. Compare Q of the two Eye & BER Meters. Open both eyes.",
        "Open the two spectrum monitors. Compare the width of the transmitted spectra.",
        "Set both fiber lengths to 0, 5, 10, 20, 40, 60 and 80 km. Record Q. Find the maximum length for each.",
        "Top link at 20 km: change the chirp factor α of the Direct-Modulation Laser from 0 to 6. Record Q.",
        "Repeat the top link at 2.5 Gb/s (0 to 150 km), and at 1310 nm (0 to 40 km) after deleting its EDFA. When is direct modulation good enough?"],
      graph: (function () {
        var y1 = 100, y2 = 360;
        var g = G({ bitrate: 10 }, [
          { nodes: [N("n1", "prbs", X(0), 230), N("n2", "nrz", X(1), 230), N("d1", "dml", X(2), y1, { lam: 1550, power: 0 }), N("c1", "cwlaser", X(1), y2 + 110, { lam: 1550, power: 3 }), N("n4", "mzm", X(2), y2),
            N("f1", "fiber", X(3), y1, { length: 0 }), N("e1", "edfa", X(4), y1, { mode: "power", pout: -8 }), N("f2", "fiber", X(3), y2, { length: 0 }), N("e2", "edfa", X(4), y2, { mode: "power", pout: -8 }),
            N("o1", "osa", X(3), y1 - 100), N("o2", "osa", X(3), y2 + 110)],
            links: [L("n1", "out", "n2", "in"), L("n2", "out", "d1", "in"), L("n2", "out", "n4", "mod"), L("c1", "out", "n4", "opt"), L("d1", "out", "f1", "in"), L("f1", "out", "e1", "in"), L("n4", "out", "f2", "in"), L("f2", "out", "e2", "in"),
              L("d1", "out", "o1", "in"), L("n4", "out", "o2", "in")] },
          rx(["e1", "out"], 5, y1, "r"), rx(["e2", "out"], 5, y2, "s")]);
        return g;
      })() },

    { task: "Set the fiber length (steps of 0.1 km) to the dispersion length L_D: the length where the output pulse is √2 times wider than the input pulse. Press Run.", id: "lab8", title: "Tutorial 8: Pulse spreading by dispersion (Gaussian pulses)",
      goal: "Follow one short Gaussian pulse through a fiber and compare its width, peak power and chirp with the dispersion-length formula.",
      steps: ["Press Run. Open the Power & Chirp Monitor v0 (input): read the pulse width (FWHM) and peak power. Compute T₀ = T_FWHM/1.665, β₂ = −Dλ²/(2πc) and L_D = T₀²/|β₂| (D is shown in the Fiber Span info).",
        "Set the fiber length to 0, 1, 2, 2.5, 5, 7.5 and 10 km. Record the width and the peak power from v1 (output). Compare with T(z) = T₀√(1 + (z/L_D)²).",
        "At 5 km look at the chirp plot of v1. Which edge of the pulse is shifted to higher frequency (blue)?",
        "Open the Spectrum Monitor o1 at 0 km and at 5 km. Does the spectrum change?",
        "Fiber 1 km: set the initial chirp C of the pulse source to −2, 0 and +2. Record the output width. Which sign makes the pulse shorter first?",
        "Set the pulse width to 0.25 bit (6.25 ps) and repeat step 2 for 0, 1 and 2 km. How does L_D change?"],
      graph: G({ bitrate: 40, bits: 16, sps: 64 }, [{ nodes: [N("n1", "prbs", X(0), 140, { pattern: "single" }), N("p1", "gpulse", X(1), 140), N("f1", "fiber", X(2), 140, { length: 0, atten: 0 }),
          N("v0", "otdv", X(2), 20, { nbits: 4 }), N("v1", "otdv", X(3), 140, { nbits: 4 }), N("o1", "osa", X(3), 260, { span: 1.5 })],
        links: [L("n1", "out", "p1", "in"), L("p1", "out", "f1", "in"), L("p1", "out", "v0", "in"), L("f1", "out", "v1", "in"), L("f1", "out", "o1", "in")] }]) },

    { task: "With the modulation current 50 mA, set the bias current (whole mA) to the lowest value that gives a turn-on delay below 0.2 ns. Press Run.", id: "lab9", title: "Tutorial 9: Direct modulation of a semiconductor laser",
      goal: "Use the laser rate equations to see the threshold, the L-I curve, the turn-on delay, the relaxation oscillations and the chirp of a directly modulated laser.",
      steps: ["Set the modulation current to 0. Set the bias current to 10, 20, 30, 35, 40, 60, 80 and 100 mA. Record the average power from v1 (or use Sweep). Draw the L-I curve and find the threshold and the slope (W/A).",
        "Set the modulation current to 50 mA. One 1 bit starts at t = 1.0 ns (see the oscilloscope). For a bias of 10, 20, 30 and 34 mA record the time the light reaches 10% of its peak (v1) and the turn-on delay t_d = t − 1.0 ns. Compare with t_d = τn·ln[I_mod/(I_mod + I_bias − I_th)].",
        "Bias 40 mA: look at the ringing after the first spike (relaxation oscillations). Estimate their period.",
        "Compare the chirp plot of v1 for a bias of 20 mA and 40 mA. Then set α = 0. What happens to the chirp?",
        "Set the Global bit rate to 2.5 Gb/s and the Bit Source pattern to Pseudo-random, bias 20 mA. Look at the pulses. Why do they have different shapes?"],
      graph: G({ bitrate: 1, bits: 16, sps: 512 }, [{ nodes: [N("n1", "prbs", X(0), 140, { pattern: "single" }), N("n2", "nrz", X(1), 140, { bw: 6.8 }), N("l1", "rlaser", X(2), 140, { ib: 20, im: 50 }),
          N("s1", "scope", X(2), 20, { nbits: 4 }), N("v1", "otdv", X(3), 140, { nbits: 4 }), N("m1", "powermeter", X(3), 20)],
        links: [L("n1", "out", "n2", "in"), L("n2", "out", "l1", "in"), L("n2", "out", "s1", "in"), L("l1", "out", "v1", "in"), L("l1", "out", "m1", "in")] }]) }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = LABS; else root.LABS = LABS;
})(typeof window !== "undefined" ? window : globalThis);
