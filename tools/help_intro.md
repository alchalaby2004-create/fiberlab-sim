# FiberLab Sim — Help

*By: Dr. Ahmed A. Al-Chalaby · Version 1.20 beta*

FiberLab Sim is a teaching program for designing and simulating optical fiber links. Components are placed on a drawing area and joined with links, as in commercial optical-system simulators. It runs in a web browser. This help explains how to use the program and, for every component, the governing equations, how each setting changes the result, and the sources of the equations.

## 1. How to use the program

1. **Choose an experiment** from the list at the top: *Free design*, a *Tutorial* (ready layout, for learning) or an *Assignment* (build it yourself, personal values from your full name, graded).
2. **Add components.** Drag a component from the library (left) onto the layout. On a phone, tap it.
3. **Connect.** Drag from an output port (right side of a block) to an input port (left side). Ports and wires have colors: optical (red), electrical (blue), binary (grey, dashed). Only ports of the same kind can be connected. One output can feed several inputs (for example a fiber and a power meter).
4. **Set the components.** Select a block to see its settings on the right. Press **?** (Help) to see its equations.
5. **Press ▶ Run.** The program runs the components in the order of the wires. Results appear above the visualizers and in the *Results* area.
6. **Open a visualizer** (double-click, or *Open graphs*) to see its graphs: eye diagram, Q against sampling time, spectrum, signal in time.
7. **Sweep.** Change one setting step by step and measure one result (for example Q against fiber length). Copy the table into Word or Excel.
8. **Global settings** set the bit rate (up to 40 Gb/s), the sequence length (8 to 1024 bits) and the samples per bit (8 to 512) for the whole layout. Use many samples per bit only for short sequences (for example laser chirp studies).
9. **Export** saves the layout as a file (.json); **Import** opens a layout file (you can also drop the file on the layout).
10. **Send result** (assignments only, after Run): write your name and section; the program makes a short report with a verification code (your layout and results) and opens your instructor's form, or lets you copy the report. The first time, paste the **class code** (starts with OSC1.) that your instructor gives you. Do not edit the code: the instructor's grader calculates your layout again to check it.

To remove a block or a wire, select it and press *Delete* (or the *Delete* button). *Reset lab* returns to the starting layout of the experiment.

## 2. Signals on the wires

| Wire | Carries | Unit |
|---|---|---|
| Binary | the bit sequence and the time base (bit rate, samples per bit) | bits |
| Electrical | drive signal (0 to 1) or photocurrent | A |
| Optical | complex optical field, wavelength, spectral width, ASE noise level | √W |

The photodetector gives the clean current. Its shot and thermal noise are added by the low-pass filter after it, for the noise bandwidth of that filter. If no filter is used, the Eye & BER Meter adds the noise over the full simulation bandwidth (and shows a warning).

## 3. Reading the results

| Q | BER | Meaning |
|---|---|---|
| Q ≥ 6 | ≤ 10⁻⁹ | Works (green) |
| 4.75 to 6 | 10⁻⁶ to 10⁻⁹ | Marginal: needs error correction (yellow) |
| Q < 4.75 | > 10⁻⁶ | Fails (red) |

## 4. Limits of the model

- No fiber nonlinear effects (SPM, XPM, FWM), no PMD and no polarization effects.
- LED and Fabry–Pérot lasers are treated as incoherent sources: dispersion spreads their intensity.
- The Rate-Equation Laser has no laser noise (no relative intensity noise, no phase noise).
- Q is measured on 512 bits with a Gaussian-noise assumption; very small BER values are calculated from Q, not counted.
- Some values (laser damping, adiabatic chirp, thermal noise, filter bandwidth) were chosen so that results are close to typical textbook values.
- The noise uses a fixed seed: the same layout and settings always give the same numbers.

# Component reference
