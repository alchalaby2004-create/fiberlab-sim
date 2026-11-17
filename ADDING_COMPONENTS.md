# FiberLab Sim — how to add a component

Each component is one file in `components/`. It calls `OL.register({...})` once.
Nothing else needs to change: the library, the properties panel, the sweep and the
"Components in this program" table read the registry automatically.

## Files
- `core.js` — math (FFT, filters), signal types, the graph solver, Q/BER decision.
- `components/*.js` — one component per file.
- `labs.js` — the experiments (text + starting layout).
- `ui.js` — editor, properties, results windows (Plotly), sweep, save/load.
- `app_shell.html`, `model.html` — page and the "model and equations" section.
- `build.py` — joins everything into one HTML file (`dist/`). `--inline-plotly` makes the offline file.
  New component files are picked up automatically (add the name to ORDER in build.py to set its place in the library).

## Signal kinds (port `kind`)
| kind | meaning | data |
|---|---|---|
| `bin` | bits | `{kind, t}` (t.bits) |
| `elec` | electrical | `{kind, t, x: Float64Array, unit: "A" or "drive", noise, rz}` |
| `opt` | optical field | `{kind, t, re, im (√W), lam (nm), coherent, dlam, fpModes, pendDL, pendModal2, aseS, aseBW}` |
| `any` | input only: elec or opt | — |

`t = {B, sps, fs, N, bits}` is the time base made by the PRBS generator.

Rules: never change an input signal; copy it first (`OL.cloneOpt`, `OL.cloneElec`, or `OL.materialize`
for optical signals that may carry pending LED/FP dispersion). Use `ctx.rng` for random numbers
(seeded by the node id, so results repeat).

## Template
```js
OL.register({
  type: "myfilter",                       // unique id
  name: "Optical Gaussian Filter",        // full name
  short: "Opt. Gauss Filter",             // label under the icon
  category: "Amplifiers and passive",     // one of OL.CATEGORIES
  doc: "One line: what it does and its equation.",
  tag: function (p) { return p.bw + " GHz"; }, // optional: short text after the id under the block
  inputs:  [{ id: "in",  kind: "opt", label: "Input" }],
  outputs: [{ id: "out", kind: "opt", label: "Output" }],
  params: [
    { key: "bw", label: "Bandwidth", unit: "GHz", type: "number", def: 50, min: 1, max: 500, step: 1 },
    // type "select": options: [[value, "text"], ...], num: true for numbers
    // type "autonum": def null = automatic value; show: function (p) {...} to hide a setting
  ],
  icon: '<rect x="10" y="6" width="44" height="28" rx="3" class="ic-line"/>', // SVG in a 64×40 box
  run: function (p, inp, ctx) {
    var s = OL.materialize(inp.in);                     // copy of the input
    OL.filt(s.re, s.im, s.t.fs, OL.gaussLP(p.bw * 1e9 / 2));
    return { out: { out: s }, info: { text: "shown in the properties panel" } };
  }
});
```

## Visualizers (instruments)
Add `instrument: true`, no outputs, and return a `view`:
```js
return { view: {
  badge: "Q = 6.20",                 // text above the block
  status: "ok" | "warn" | "bad",     // optional colour
  m: { Q: 6.2 },                     // values that the Sweep can measure
  numbers: [["Max. Q factor", "6.20"]],
  plots: [{ title: "...", x: "x label", y: "y label",
            traces: [{ x: [...], y: [...], name: "...", role: "main" }] }]  // role: main | second | ref | eye
} };
```
and list the measurable values: `metrics: [{ key: "Q", label: "Q factor" }]`.

## Help for a component
Each component has a `help` field: `eq` (equations in LaTeX, with title and note), `params`
(effect of each setting, one entry per param key), `extra` and `src` (keys of `refs.js`).
The ? button in the program and the standalone help are made from it.
For the built-in components the help text is kept in `tools/help_data.py`
(`python3 tools/help_data.py` writes it into the component files).

## Building
- `python3 build.py` → `dist/fiberlab_sim.html` (Plotly from the CDN)
- `python3 build.py --inline-plotly` → `dist/fiberlab_sim_offline.html` (works without internet)
- `python3 tools/build_help.py` → `dist/FiberLab_Sim_Help.html` and `.docx` (needs Node and pandoc)
