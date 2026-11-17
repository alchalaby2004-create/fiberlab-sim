/* =====================================================================
   FiberLab Sim — user interface: library, layout editor, properties,
   results windows (Plotly), sweep, labs, save/load, theme.
   ===================================================================== */
(function () {
  "use strict";
  var OL = window.OL, LABS = window.LABS, $ = function (i) { return document.getElementById(i); };
  var NS = "http://www.w3.org/2000/svg", NW = 124, NH = 78;
  var graph = null, labId = "free", sel = null, result = null, dirty = true, view = { x: 0, y: 0, k: 1 }, nextId = 1;

  function el(tag, attrs, parent, ns) { var e = ns === false ? document.createElement(tag) : document.createElementNS(NS, tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function h(tag, attrs, text) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function node(id) { return graph.nodes.filter(function (n) { return n.id === id; })[0]; }
  function def(n) { return OL.components[n.type]; }
  function params(n) { var p = OL.defaults(n.type); for (var k in n.params) p[k] = n.params[k]; return p; }
  function portKind(n, side, pid) { var d = def(n), arr = side === "in" ? d.inputs : d.outputs; for (var i = 0; i < arr.length; i++) if (arr[i].id === pid) return arr[i].kind; return null; }
  function portPos(n, side, pid) { var d = def(n), arr = side === "in" ? d.inputs : d.outputs, i = 0; arr.forEach(function (p, j) { if (p.id === pid) i = j; }); return { x: n.x + (side === "in" ? 0 : NW), y: n.y + NH * (i + 1) / (arr.length + 1) }; }

  /* ---------- library ---------- */
  function icon(d, w, hgt) { var s = el("svg", { viewBox: "0 0 64 40", width: w, height: hgt, "aria-hidden": "true" }); s.innerHTML = d.icon || ""; return s; }
  function buildLib() {
    var lib = $("lib"); lib.innerHTML = "";
    OL.CATEGORIES.forEach(function (cat) {
      var items = OL.order.filter(function (t) { return OL.components[t].category === cat; }); if (!items.length) return;
      lib.appendChild(h("h4", {}, cat));
      items.forEach(function (t) {
        var d = OL.components[t], b = h("button", { type: "button", class: "item", title: d.name + ". " + (d.doc || "") + " (drag to the layout, or tap to add)", draggable: "true" });
        b.appendChild(icon(d, 42, 26)); b.appendChild(h("span", {}, d.short || d.name));
        b.addEventListener("dragstart", function (e) { e.dataTransfer.setData("text/plain", "osim:" + t); e.dataTransfer.effectAllowed = "copy"; });
        b.addEventListener("click", function () { var r = $("cv").getBoundingClientRect(), w = toWorld(r.left + r.width / 2, r.top + r.height / 2); addNode(t, w.x - NW / 2 + (nextId % 5) * 12, w.y - NH / 2 + (nextId % 5) * 12); });
        lib.appendChild(b);
      });
    });
  }

  /* ---------- editing ---------- */
  function renumber() { var m = 0; graph.nodes.forEach(function (n) { var v = parseInt(String(n.id).replace(/\D/g, ""), 10); if (v > m) m = v; }); nextId = Math.max(m + 1, nextId); }
  function addNode(type, x, y) {
    var id; do { id = "u" + nextId++; } while (node(id));
    graph.nodes.push({ id: id, type: type, x: Math.round(x / 10) * 10, y: Math.round(y / 10) * 10, params: {} });
    select({ t: "node", id: id }); changed();
  }
  function delSel() {
    if (!sel) return;
    if (sel.t === "node") { graph.links = graph.links.filter(function (l) { return l.from[0] !== sel.id && l.to[0] !== sel.id; }); graph.nodes = graph.nodes.filter(function (n) { return n.id !== sel.id; }); }
    else graph.links.splice(sel.i, 1);
    sel = null; changed();
  }
  function connect(a, b) { // a,b: {id, side, port}
    if (a.side === b.side || a.id === b.id) return "Connect an output (right side) to an input (left side).";
    var o = a.side === "out" ? a : b, i = a.side === "out" ? b : a;
    var ko = portKind(node(o.id), "out", o.port), ki = portKind(node(i.id), "in", i.port);
    var KN = { opt: "an optical", elec: "an electrical", bin: "a binary", any: "this" }; if (!OL.canConnect(ko, ki)) return "These ports do not match: " + KN[ko] + " output cannot go into " + KN[ki] + " input.";
    graph.links = graph.links.filter(function (l) { return !(l.to[0] === i.id && l.to[1] === i.port); });
    graph.links.push({ from: [o.id, o.port], to: [i.id, i.port] }); changed(); return null;
  }
  var winNode = null;
  function changed() { var sn = sel && sel.t === "node" && node(sel.id); if (sn && def(sn) && def(sn).instrument && result) { dirty = true; store("osim-layout", JSON.stringify({ lab: labId, graph: graph })); calculate(); return; } dirty = true; store("osim-layout", JSON.stringify({ lab: labId, graph: graph })); draw(); props(); status(); }
  function select(s) { sel = s; draw(); props(); }

  /* ---------- drawing ---------- */
  function draw() {
    var W = $("wires"), Nd = $("nodes"); W.innerHTML = ""; Nd.innerHTML = "";
    graph.links.forEach(function (l, i) {
      var a = node(l.from[0]), b = node(l.to[0]); if (!a || !b || !def(a) || !def(b)) return;
      var p = portPos(a, "out", l.from[1]), q = portPos(b, "in", l.to[1]), dx = Math.max(40, Math.abs(q.x - p.x) / 2);
      var d = "M" + p.x + " " + p.y + " C" + (p.x + dx) + " " + p.y + " " + (q.x - dx) + " " + q.y + " " + q.x + " " + q.y;
      var kind = portKind(a, "out", l.from[1]), isSel = sel && sel.t === "link" && sel.i === i;
      el("path", { d: d, class: "wire " + kind + (isSel ? " sel" : "") }, W);
      var hit = el("path", { d: d, class: "hit" }, W); hit.dataset.link = i;
    });
    graph.nodes.forEach(function (n) {
      var d = def(n); if (!d) return;
      var R = result && result.nodes[n.id], err = R && R.error;
      var g = el("g", { class: "node" + (sel && sel.t === "node" && sel.id === n.id ? " sel" : "") + (err && !dirty ? " err" : ""), transform: "translate(" + n.x + "," + n.y + ")" }, Nd);
      g.dataset.node = n.id;
      el("rect", { class: "nbox", width: NW, height: NH, rx: 9 }, g);
      var ic = icon(d, 64, 40); ic.setAttribute("x", (NW - 64) / 2); ic.setAttribute("y", 7); ic.style.pointerEvents = "none"; g.appendChild(ic);
      var t = el("text", { class: "nlabel", x: NW / 2, y: 60, "text-anchor": "middle" }, g); t.textContent = d.short || d.name;
      var t2 = el("text", { class: "nid", x: NW / 2, y: 72, "text-anchor": "middle" }, g); var tg = ""; if (d.tag) { try { tg = d.tag(params(n)); } catch (e) {} } t2.textContent = tg ? n.id + " · " + String(tg).replace(/-/g, "−") : n.id;
      el("title", {}, g).textContent = d.name + " (" + n.id + ")" + (err ? "\n" + err : "");
      ["in", "out"].forEach(function (side) {
        var arr = side === "in" ? d.inputs : d.outputs;
        arr.forEach(function (p, j) {
          var y = NH * (j + 1) / (arr.length + 1), r = el("rect", { class: "port " + p.kind, x: (side === "in" ? 0 : NW) - 6, y: y - 6, width: 12, height: 12, rx: 2 }, g);
          r.dataset.port = p.id; r.dataset.side = side; r.dataset.node = n.id;
          el("title", {}, r).textContent = (p.label || p.id) + " (" + (side === "in" ? "input" : "output") + ", " + p.kind + ")";
        });
      });
      var badge = R && R.view && R.view.badge;
      if (badge && !err) {
        var st = R.view.status, col = st === "ok" ? css("--ok") : st === "warn" ? css("--warn") : st === "bad" ? css("--bad") : css("--ink");
        var bw = badge.length * 7 + 14, bg = el("rect", { class: "badge-bg", x: (NW - bw) / 2, y: -22, width: bw, height: 18, rx: 9 }, g);
        var bt = el("text", { class: "badge", x: NW / 2, y: -9, "text-anchor": "middle", fill: col, opacity: dirty ? 0.45 : 1 }, g); bt.textContent = badge; if (dirty) bg.setAttribute("opacity", 0.5);
      }
    });
    $("world").setAttribute("transform", "translate(" + view.x + "," + view.y + ") scale(" + view.k + ")");
  }
  function status(msg, cls) {
    var s = $("status"); s.innerHTML = "";
    if (!msg) { if (dirty) { msg = "Layout changed. Press ▶ Run."; cls = "dirty"; } else if (result) { msg = result.ok ? "Done." : "Done, with errors: see the red components."; cls = result.ok ? "ok" : "err"; } }
    if (msg) { var sp = h("span", { class: cls || "" }, msg); s.appendChild(sp); }
  }

  /* ---------- pan / zoom ---------- */
  function toWorld(cx, cy) { var r = $("cv").getBoundingClientRect(); return { x: (cx - r.left - view.x) / view.k, y: (cy - r.top - view.y) / view.k }; }
  function zoomAt(f, cx, cy) { var r = $("cv").getBoundingClientRect(); cx = cx == null ? r.left + r.width / 2 : cx; cy = cy == null ? r.top + r.height / 2 : cy; var w = toWorld(cx, cy); view.k = Math.min(2.5, Math.max(0.25, view.k * f)); view.x = cx - r.left - w.x * view.k; view.y = cy - r.top - w.y * view.k; draw(); }
  function fit() {
    if (!graph.nodes.length) { view = { x: 40, y: 40, k: 1 }; draw(); return; }
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    graph.nodes.forEach(function (n) { x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y - 26); x1 = Math.max(x1, n.x + NW); y1 = Math.max(y1, n.y + NH); });
    var r = $("cv").getBoundingClientRect(), pad = 30, k = Math.min((r.width - 2 * pad) / (x1 - x0), (r.height - 2 * pad - 30) / (y1 - y0), 1.3);
    view.k = Math.max(0.3, k); view.x = (r.width - (x1 - x0) * view.k) / 2 - x0 * view.k;
    if (r.width < 700 && view.k < 0.55) { view.k = 0.55; view.x = pad - x0 * view.k; } view.y = (r.height - (y1 - y0) * view.k) / 2 - y0 * view.k + 8; draw();
  }
  $("zin").addEventListener("click", function () { zoomAt(1.2); });
  $("zout").addEventListener("click", function () { zoomAt(1 / 1.2); });
  $("zfit").addEventListener("click", fit);

  /* ---------- pointer interaction on the drawing ---------- */
  var drag = null, lastTap = { id: null, t: 0 };
  var cv = $("cv");
  cv.addEventListener("wheel", function (e) { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX, e.clientY); }, { passive: false });
  cv.addEventListener("pointerdown", function (e) {
    var tg = e.target, w = toWorld(e.clientX, e.clientY);
    if (tg.dataset && tg.dataset.port) {
      var n = node(tg.dataset.node), p = portPos(n, tg.dataset.side, tg.dataset.port);
      drag = { mode: "wire", from: { id: n.id, side: tg.dataset.side, port: tg.dataset.port }, p: p };
    } else if (tg.dataset && tg.dataset.link != null) { select({ t: "link", i: +tg.dataset.link }); return; }
    else {
      var g = tg.closest && tg.closest(".node");
      if (g) { var nn = node(g.dataset.node); drag = { mode: "node", id: nn.id, dx: w.x - nn.x, dy: w.y - nn.y, moved: false };
        var now = Date.now(); if (lastTap.id === nn.id && now - lastTap.t < 350) { drag = null; openNode(nn.id); lastTap = { id: null, t: 0 }; return; } lastTap = { id: nn.id, t: now };
        if (!(sel && sel.t === "node" && sel.id === nn.id)) select({ t: "node", id: nn.id }); }
      else { drag = { mode: "pan", sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false }; }
    }
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", function (e) {
    if (!drag) return; var w = toWorld(e.clientX, e.clientY);
    if (drag.mode === "node") { var n = node(drag.id); n.x = Math.round((w.x - drag.dx) / 10) * 10; n.y = Math.round((w.y - drag.dy) / 10) * 10; drag.moved = true; draw(); }
    else if (drag.mode === "pan") { view.x = drag.vx + e.clientX - drag.sx; view.y = drag.vy + e.clientY - drag.sy; drag.moved = Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 4; draw(); }
    else if (drag.mode === "wire") {
      var p = drag.p, out = drag.from.side === "out", dx = Math.max(40, Math.abs(w.x - p.x) / 2);
      $("ghost").setAttribute("d", "M" + p.x + " " + p.y + " C" + (p.x + (out ? dx : -dx)) + " " + p.y + " " + (w.x + (out ? -dx : dx)) + " " + w.y + " " + w.x + " " + w.y);
      document.querySelectorAll(".port.hot").forEach(function (x) { x.classList.remove("hot"); });
      var t = document.elementFromPoint(e.clientX, e.clientY); if (t && t.dataset && t.dataset.port) t.classList.add("hot");
    }
  });
  function endDrag(e) {
    if (!drag) return; var d = drag; drag = null;
    if (d.mode === "wire") {
      $("ghost").setAttribute("d", ""); var t = document.elementFromPoint(e.clientX, e.clientY);
      if (t && t.dataset && t.dataset.port) { var msg = connect(d.from, { id: t.dataset.node, side: t.dataset.side, port: t.dataset.port }); if (msg) status(msg, "err"); }
      else draw();
    } else if (d.mode === "node" && d.moved) { store("osim-layout", JSON.stringify({ lab: labId, graph: graph })); }
    else if (d.mode === "pan" && !d.moved) { select(null); }
  }
  cv.addEventListener("pointerup", endDrag); cv.addEventListener("pointercancel", function () { drag = null; $("ghost").setAttribute("d", ""); });
  // drop from the library
  var stage = $("stage");
  stage.addEventListener("dragover", function (e) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; });
  stage.addEventListener("drop", function (e) { e.preventDefault(); if (e.dataTransfer.files && e.dataTransfer.files.length) { var rd = new FileReader(); rd.onload = function () { importData(String(rd.result)); }; rd.readAsText(e.dataTransfer.files[0]); return; } var t = (e.dataTransfer.getData("text/plain") || "").replace(/^osim:/, ""); if (!OL.components[t]) return; var w = toWorld(e.clientX, e.clientY); addNode(t, w.x - NW / 2, w.y - NH / 2); });
  document.addEventListener("keydown", function (e) {
    if (!$("win").hidden && e.key === "Escape") { closeWin(); return; }
    var tag = (document.activeElement && document.activeElement.tagName) || ""; if (/INPUT|SELECT|TEXTAREA/.test(tag)) return;
    if ((e.key === "Delete" || e.key === "Backspace") && sel) { e.preventDefault(); delSel(); }
  });

  /* ---------- properties panel ---------- */
  function props() {
    var P = $("props"); P.innerHTML = "";
    if (!sel) {
      P.appendChild(h("h2", {}, "Properties"));
      P.appendChild(h("p", { class: "doc" }, "Select a component to see and change its settings. Drag from a port to another port to connect. Select a wire and press Delete to remove it."));
      P.appendChild(h("p", { class: "doc" }, "Components: " + graph.nodes.length + ". Wires: " + graph.links.length + "."));
      return;
    }
    if (sel.t === "link") {
      var l = graph.links[sel.i]; if (!l) { sel = null; return props(); }
      P.appendChild(h("h2", {}, "Wire"));
      P.appendChild(h("p", { class: "doc" }, l.from[0] + " (" + l.from[1] + ") → " + l.to[0] + " (" + l.to[1] + ")"));
      var b = h("button", { class: "btn danger", type: "button" }, "Delete wire"); b.addEventListener("click", delSel);
      var a = h("div", { class: "actions" }); a.appendChild(b); P.appendChild(a); return;
    }
    var n = node(sel.id); if (!n) { sel = null; return props(); }
    var d = def(n), p = params(n), R = result && result.nodes[n.id];
    var hd = h("div", { class: "phead" }); hd.appendChild(h("h2", {}, d.name)); var qb = h("button", { class: "qbtn", type: "button", title: "Governing equations, effect of each setting, and sources", "aria-label": "Help for " + d.name }, "?"); qb.addEventListener("click", function () { showHelp(n.type, params(n)); }); hd.appendChild(qb); P.appendChild(hd);
    P.appendChild(h("p", { class: "doc" }, n.id + " · " + (d.doc || "")));
    d.params.forEach(function (q) {
      if (q.show && !q.show(p)) return;
      var f = h("div", { class: "field" }), id = "p-" + q.key, lab = h("label", { for: id }); lab.appendChild(document.createTextNode(q.label)); if (q.unit) lab.appendChild(h("span", {}, q.unit)); f.appendChild(lab);
      var inp;
      if (q.type === "select") {
        inp = h("select", { id: id }); q.options.forEach(function (o) { var op = h("option", { value: String(o[0]) }, o[1]); inp.appendChild(op); }); inp.value = String(p[q.key]);
        inp.addEventListener("change", function () { n.params[q.key] = q.num ? +inp.value : inp.value; changed(); });
        f.appendChild(inp);
      } else {
        var row = h("div", { class: "row" }); inp = h("input", { id: id, type: "number", step: q.step || "any" }); if (q.min != null) inp.min = q.min; if (q.max != null) inp.max = q.max;
        row.appendChild(inp);
        if (q.type === "autonum") {
          var al = h("label", { class: "auto" }), cb = h("input", { type: "checkbox" }); cb.checked = p[q.key] == null; al.appendChild(cb); al.appendChild(document.createTextNode("Auto")); row.appendChild(al);
          inp.disabled = cb.checked; inp.value = p[q.key] == null ? "" : p[q.key]; inp.placeholder = "automatic";
          cb.addEventListener("change", function () { n.params[q.key] = cb.checked ? null : (+inp.value || 0); changed(); });
        } else inp.value = p[q.key];
        inp.addEventListener("change", function () { var v = parseFloat(inp.value); if (!isFinite(v)) { inp.value = p[q.key]; return; } if (q.min != null) v = Math.max(q.min, v); if (q.max != null) v = Math.min(q.max, v); n.params[q.key] = v; changed(); });
        f.appendChild(row);
      }
      P.appendChild(f);
    });
    if (R && !dirty) {
      if (R.error) P.appendChild(h("div", { class: "note bad" }, R.error));
      (R.warnings || []).forEach(function (w) { P.appendChild(h("div", { class: "note warn" }, w)); });
      if (R.info && R.info.text) P.appendChild(h("div", { class: "note" }, R.info.text));
    } else if (R && dirty) P.appendChild(h("div", { class: "note" }, "Press ▶ Run to update the results."));
    var acts = h("div", { class: "actions" });
    if (d.instrument) { var o = h("button", { class: "btn primary", type: "button" }, "Open results"); o.disabled = !(R && R.view); o.addEventListener("click", function () { openNode(n.id); }); acts.appendChild(o); }
    var hb = h("button", { class: "btn", type: "button" }, "? Help: equations"); hb.addEventListener("click", function () { showHelp(n.type, params(n)); }); acts.appendChild(hb);
    var del = h("button", { class: "btn danger", type: "button" }, "Delete component"); del.addEventListener("click", delSel); acts.appendChild(del);
    P.appendChild(acts);
  }

  /* ---------- calculate ---------- */
  function calculate() {
    status("Running…"); $("calcBtn").disabled = true;
    setTimeout(function () {
      try { result = OL.simulate(graph); } catch (e) { result = { ok: false, nodes: {}, errors: [e.message] }; }
      dirty = false; $("calcBtn").disabled = false; draw(); props(); results(); status();
      if (winNode && !$("win").hidden) openNode(winNode);
      if (result.errors && result.errors.length) status(result.errors.join(" "), "err");
    }, 20);
  }
  $("calcBtn").addEventListener("click", calculate);
  document.addEventListener("keydown", function (e) { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); if (!$("calcBtn").disabled) calculate(); } });
  function results() {
    var box = $("results"); box.innerHTML = "";
    var inst = graph.nodes.filter(function (n) { return def(n) && def(n).instrument; });
    if (!inst.length) { box.appendChild(h("p", { class: "muted small" }, "No visualizers in the layout. Add a Eye & BER Meter, Power Meter, Spectrum Monitor or Oscilloscope.")); return; }
    inst.forEach(function (n) {
      var R = result.nodes[n.id], c = h("div", { class: "rcard" }), t = h("h4"); t.appendChild(h("span", {}, def(n).short + " · " + n.id));
      if (R && R.view && R.view.status) { var st = R.view.status; t.appendChild(h("span", { class: "chip " + st }, st === "ok" ? "Works" : st === "warn" ? "Marginal" : "Fails")); }
      c.appendChild(t);
      if (!R || R.error) { c.appendChild(h("p", { class: "small", style: "color:var(--bad);margin:0" }, R ? R.error : "Not calculated.")); box.appendChild(c); return; }
      var dl = h("dl"); (R.view.numbers || []).slice(0, 4).forEach(function (x) { dl.appendChild(h("dt", {}, x[0])); dl.appendChild(h("dd", {}, x[1])); }); c.appendChild(dl);
      if (R.view.plots) { var b = h("button", { class: "btn", type: "button" }, "Open graphs"); b.addEventListener("click", function () { openNode(n.id); }); c.appendChild(b); }
      box.appendChild(c);
    });
  }

  /* ---------- windows and plots ---------- */
  var openFn = null;
  function openWin(title, fill) { if (!/·/.test(title) || /^Help/.test(title)) winNode = null; $("win-h").textContent = title; var b = $("win-body"); b.innerHTML = ""; openFn = function () { b.innerHTML = ""; fill(b); }; $("win").hidden = false; openFn(); $("winClose").focus(); }
  function closeWin() { $("win").hidden = true; openFn = null; winNode = null; if (window.Plotly) document.querySelectorAll("#win .plot").forEach(function (p) { try { Plotly.purge(p); } catch (e) {} }); }
  $("winClose").addEventListener("click", closeWin);
  $("win").addEventListener("click", function (e) { if (e.target === $("win")) closeWin(); });
  function plotInto(div, spec, extra) {
    var ink = css("--ink"), grid = css("--line"), roles = { main: css("--accent"), second: css("--blue"), ref: css("--blue"), eye: css("--accent") };
    if (!window.Plotly) { div.textContent = "The plotting library (Plotly) could not be loaded. Check the internet connection."; div.style.height = "auto"; return; }
    var data = spec.traces.map(function (t, i) {
      var tr = { x: t.x, y: t.y, name: t.name, type: "scatter", mode: t.mode || "lines", line: { color: t.color || roles[t.role] || roles.main, width: t.role === "eye" ? 1 : 2, dash: t.dash || "solid" }, connectgaps: false };
      if (t.role === "eye") { tr.opacity = 0.35; tr.hoverinfo = "skip"; }
      return tr;
    }).concat(extra || []);
    var layout = { separators: ". ", title: { text: spec.title, font: { size: 14, color: ink } }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", font: { family: css("--sans") || "sans-serif", color: ink, size: 12 },
      margin: { l: 64, r: 18, t: 40, b: 50 }, showlegend: data.length > 1 && !spec.eye, legend: { orientation: "h", y: -0.2 },
      xaxis: { title: { text: spec.x }, gridcolor: grid, zerolinecolor: grid, linecolor: grid }, yaxis: { title: { text: spec.y }, gridcolor: grid, zerolinecolor: grid, linecolor: grid, type: spec.ylog ? "log" : "linear" } };
    Plotly.newPlot(div, data, layout, { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["toImage", "lasso2d", "select2d"] });
  }
  function openNode(id) {
    var n = node(id); if (!n) return; var d = def(n), R = result && result.nodes[id];
    if (!d.instrument) { select({ t: "node", id: id }); if (window.innerWidth < 980) $("props").scrollIntoView({ behavior: "smooth" }); return; }
    if (!R || !R.view) { status("Press ▶ Run first, then open " + d.short + ".", "dirty"); select({ t: "node", id: id }); return; }
    winNode = id;
    openWin(d.name + " · " + id + (dirty ? " (old result)" : ""), function (b) {
      if (dirty) { var nb = h("div", { class: "note warn" }, "The layout changed after the last calculation. "); var cb2 = h("button", { class: "btn primary", type: "button" }, "▶ Run and refresh"); cb2.addEventListener("click", calculate); nb.appendChild(cb2); b.appendChild(nb); }
      var hb2 = h("button", { class: "btn", type: "button", style: "margin-bottom:8px" }, "? Help: equations"); hb2.addEventListener("click", function () { showHelp(n.type, params(n)); }); b.appendChild(hb2);
      var nums = h("div", { class: "nums" }); (R.view.numbers || []).forEach(function (x) { var q = h("div"); q.appendChild(h("small", {}, x[0])); q.appendChild(h("b", {}, x[1])); nums.appendChild(q); }); b.appendChild(nums);
      (R.warnings || []).forEach(function (w) { b.appendChild(h("div", { class: "note warn" }, w)); });
      (R.view.plots || []).forEach(function (s) { var dv = h("div", { class: "plot" }); b.appendChild(dv); plotInto(dv, s); });
    });
  }

  function langBtn(again) {
    var b = h("button", { class: "btn langbtn", type: "button", lang: OL.helpLang === "ar" ? "en" : "ar" }, OL.helpLang === "ar" ? "English" : "عربي");
    b.title = OL.helpLang === "ar" ? "Show the help in English" : "اعرض المساعدة بالعربية";
    b.addEventListener("click", function () { OL.helpLang = OL.helpLang === "ar" ? "en" : "ar"; store("osim-help-lang", OL.helpLang); again(); });
    return b;
  }
  function showHelp(type, cur) {
    var d = OL.components[type];
    openWin("Help · " + d.name, function (b) {
      var bar = h("div", { class: "actions", style: "margin:0 0 8px" }); bar.appendChild(langBtn(function () { showHelp(type, cur); })); b.appendChild(bar);
      var box = h("div"); b.appendChild(box); OL.renderHelp(box, type, cur);
      var nt = h("p", { class: "small muted", dir: OL.helpLang === "ar" ? "rtl" : "ltr" }, OL.helpNote()); b.appendChild(nt);
    });
  }
  function helpIndex() {
    openWin("Help · all components", function (b) {
      var bar = h("div", { class: "actions", style: "margin:0 0 8px" }); bar.appendChild(langBtn(helpIndex)); b.appendChild(bar);
      b.appendChild(h("p", { class: "small muted" }, "Choose a component to see its governing equations, how each setting changes the result, and the sources."));
      OL.CATEGORIES.forEach(function (cat) {
        var items = OL.order.filter(function (t) { return OL.components[t].category === cat; }); if (!items.length) return;
        b.appendChild(h("h3", {}, cat)); var row = h("div", { class: "actions" });
        items.forEach(function (t) { var x = h("button", { class: "btn", type: "button" }, OL.components[t].name); x.addEventListener("click", function () { showHelp(t); }); row.appendChild(x); });
        b.appendChild(row);
      });
    });
  }
  if ($("helpBtn")) $("helpBtn").addEventListener("click", helpIndex);

  /* ---------- sweep ---------- */
  function sweepWin() {
    var choices = [], targets = [];
    OL.GLOBALS.forEach(function (q) { if (q.key === "bitrate") choices.push({ k: "g:bitrate", label: "Layout › Bit rate (Gb/s)", cur: graph.globals.bitrate, min: 0.1, max: 25 }); });
    graph.nodes.forEach(function (n) { var d = def(n); if (!d) return; var p = params(n); d.params.forEach(function (q) { if (q.type === "number" || q.type === "autonum") choices.push({ k: n.id + ":" + q.key, label: d.short + " (" + n.id + ") › " + q.label + (q.unit ? " (" + q.unit + ")" : ""), cur: p[q.key], min: q.min, max: q.max, step: q.step }); });
      (d.metrics || []).forEach(function (m) { targets.push({ k: n.id + ":" + m.key, label: d.short + " (" + n.id + ") › " + m.label, key: m.key, id: n.id }); }); });
    openWin("Parameter sweep", function (b) {
      if (!targets.length) { b.appendChild(h("p", {}, "Add a Eye & BER Meter, Power Meter or Spectrum Monitor to measure a result.")); return; }
      var form = h("div", { class: "form" });
      function fld(label, inp, wide) { var f = h("div", { class: "field" + (wide ? " wide" : "") }), l = h("label", {}, label); f.appendChild(l); f.appendChild(inp); form.appendChild(f); return inp; }
      var ps = h("select"); choices.forEach(function (c, i) { ps.appendChild(h("option", { value: i }, c.label)); });
      var ts = h("select"); targets.forEach(function (c, i) { ts.appendChild(h("option", { value: i }, c.label)); });
      var a = h("input", { type: "number", step: "any" }), z = h("input", { type: "number", step: "any" }), st = h("input", { type: "number", min: 2, max: 40, step: 1, value: 9 });
      fld("Change this setting", ps, true); fld("From", a); fld("To", z); fld("Steps", st); fld("Measure this result", ts, true);
      var saved = window.__swPrefs || {};
      var pi = choices.findIndex(function (c) { return c.k === saved.p; }); ps.value = pi >= 0 ? pi : Math.max(0, choices.findIndex(function (c) { return /:length$|:db$|:M$/.test(c.k); }));
      var ti = targets.findIndex(function (c) { return c.k === saved.t; }); ts.value = ti >= 0 ? ti : Math.max(0, targets.findIndex(function (c) { return c.key === "Q"; }));
      function setRange() { var c = choices[+ps.value]; var cur = c.cur == null ? 0 : c.cur; a.value = saved.p === c.k && saved.a != null ? saved.a : (c.min != null ? c.min : cur); z.value = saved.p === c.k && saved.b != null ? saved.b : (c.max != null ? Math.min(c.max, Math.max(cur * 2, (c.min || 0) + 10)) : cur * 2 || 10); }
      setRange(); ps.addEventListener("change", function () { saved = {}; setRange(); });
      var run = h("button", { class: "btn primary", type: "button" }, "Run sweep"), cp = h("button", { class: "btn", type: "button" }, "Copy table");
      form.appendChild(run); form.appendChild(cp); b.appendChild(form);
      var msg = h("p", { class: "small muted" }, "The sweep runs the whole layout once for each value."); b.appendChild(msg);
      var pd = h("div", { class: "plot" }); b.appendChild(pd); var tb = h("div", { class: "tbl" }); b.appendChild(tb);
      var rows = [];
      run.addEventListener("click", function () {
        var c = choices[+ps.value], t = targets[+ts.value], n = Math.max(2, Math.min(40, Math.round(+st.value) || 9)), lo = +a.value, hi = +z.value, vals = [];
        window.__swPrefs = { p: c.k, t: t.k, a: lo, b: hi };
        for (var i = 0; i < n; i++) { var v = lo + (hi - lo) * i / (n - 1); vals.push(c.step >= 1 ? Math.round(v / c.step) * c.step : +v.toFixed(4)); }
        vals = vals.filter(function (v, i) { return vals.indexOf(v) === i; }); rows = []; run.disabled = true;
        (function step(j) {
          if (j >= vals.length) { run.disabled = false; finish(c, t); return; }
          var g = clone(graph), parts = c.k.split(":");
          if (parts[0] === "g") g.globals[parts[1]] = vals[j]; else g.nodes.filter(function (q) { return q.id === parts[0]; })[0].params[parts[1]] = vals[j];
          var r = OL.simulate(g), R = r.nodes[t.id], v = R && R.view && R.view.m ? R.view.m[t.key] : null;
          rows.push([vals[j], v, R && R.error]); msg.textContent = "Running " + (j + 1) + " of " + vals.length + " …";
          setTimeout(function () { step(j + 1); }, 0);
        })(0);
      });
      function finish(c, t) {
        window.__lastSweep = { setting: c.label, result: t.label, rows: rows.map(function (r) { return [r[0], r[1]]; }) };
        var ok = rows.filter(function (r) { return r[1] != null && isFinite(r[1]); });
        msg.textContent = ok.length + " of " + rows.length + " points calculated." + (t.key === "Q" ? " The dashed line Q = 6 marks BER = 10⁻⁹." : "");
        var extra = t.key === "Q" ? [{ x: [rows[0][0], rows[rows.length - 1][0]], y: [6, 6], name: "Q = 6", type: "scatter", mode: "lines", line: { color: css("--blue"), dash: "dash", width: 1.5 } }] : [];
        plotInto(pd, { title: t.label, x: c.label.split(" › ")[1], y: t.label.split(" › ")[1], traces: [{ x: ok.map(function (r) { return r[0]; }), y: ok.map(function (r) { return r[1]; }), name: t.label, mode: "lines+markers", role: "main" }] }, extra);
        var tbl = h("table"); tbl.innerHTML = "<thead><tr><th></th><th></th></tr></thead>"; tbl.querySelectorAll("th")[0].textContent = c.label.split(" › ")[1]; tbl.querySelectorAll("th")[1].textContent = t.label.split(" › ")[1];
        var tbody = h("tbody"); rows.forEach(function (r) { var tr = h("tr"); tr.appendChild(h("td", {}, String(r[0]))); tr.appendChild(h("td", {}, r[1] == null ? (r[2] || "–") : OL.fmt(r[1], 3))); tbody.appendChild(tr); }); tbl.appendChild(tbody);
        tb.innerHTML = ""; tb.appendChild(tbl);
        cp.onclick = function () {
          var txt = [c.label + "\t" + t.label].concat(rows.map(function (r) { return r[0] + "\t" + (r[1] == null ? "" : OL.fmt(r[1], 3)); })).join("\n");
          var fb = function () { var rg = document.createRange(); rg.selectNodeContents(tbl); var s = getSelection(); s.removeAllRanges(); s.addRange(rg); msg.textContent = "Table selected: press Ctrl+C to copy."; };
          try { navigator.clipboard.writeText(txt).then(function () { msg.textContent = "Table copied. Paste it into Word or Excel."; }, fb); } catch (e) { fb(); }
        };
      }
    });
  }
  $("sweepBtn").addEventListener("click", sweepWin);

  /* ---------- layout (global) parameters ---------- */
  $("globBtn").addEventListener("click", function () {
    openWin("Global settings", function (b) {
      b.appendChild(h("p", { class: "small muted" }, "These settings apply to the whole layout."));
      var form = h("div", { class: "form" });
      OL.GLOBALS.forEach(function (q) {
        var f = h("div", { class: "field" }), l = h("label", {}, q.label + (q.unit ? " (" + q.unit + ")" : "")), inp;
        if (q.type === "select") { inp = h("select"); q.options.forEach(function (o) { inp.appendChild(h("option", { value: String(o[0]) }, o[1])); }); }
        else { inp = h("input", { type: "number", min: q.min, max: q.max, step: q.step }); }
        inp.value = String(graph.globals[q.key] != null ? graph.globals[q.key] : q.def);
        inp.addEventListener("change", function () { graph.globals[q.key] = q.num || q.type === "number" ? +inp.value : inp.value; changed(); });
        f.appendChild(l); f.appendChild(inp); form.appendChild(f);
      });
      b.appendChild(form);
    });
  });

  /* ---------- export / import ---------- */
  var dlCap = null;
  if (window.claude && claude.use) claude.use("downloads").then(function (d) { dlCap = d; }, function () {});
  function layoutFile() {
    return JSON.stringify({ app: "FiberLab Sim", format: 1, lab: labId, saved: new Date().toISOString(), graph: graph }, null, 1);
  }
  function fileName() { var d = new Date(), p = function (x) { return (x < 10 ? "0" : "") + x; }; return "fiberlab_" + labId + "_" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "_" + p(d.getHours()) + p(d.getMinutes()) + ".json"; }
  function exportText(data, why) {
    openWin("Export layout", function (b) {
      b.appendChild(h("p", { class: "small muted" }, (why ? why + " " : "") + "Copy this text and keep it in a .json file (or send it). Import accepts the file or the text."));
      var ta = h("textarea", { readonly: "", "aria-label": "Layout text" }); ta.value = data; b.appendChild(ta);
      var m = h("p", { class: "small muted" }), cp = h("button", { class: "btn primary", type: "button" }, "Copy");
      cp.addEventListener("click", function () { var fb = function () { ta.select(); m.textContent = "Text selected: press Ctrl+C to copy."; }; try { navigator.clipboard.writeText(ta.value).then(function () { m.textContent = "Copied."; }, fb); } catch (e) { fb(); } });
      var a = h("div", { class: "actions" }); a.appendChild(cp); b.appendChild(a); b.appendChild(m);
    });
  }
  function doExport() {
    var data = layoutFile(), name = fileName();
    if (dlCap) { dlCap.save({ filename: name, data: data }).then(function () { status("Layout exported: " + name, "ok"); }, function (e) { var c = e && e.code; if (c === "declined") status("Export cancelled.", "dirty"); else if (c === "rate_limited") status("Wait a moment, then press Export again.", "dirty"); else exportText(data, "The file could not be saved here."); }); return; }
    if (window.claude) { exportText(data); return; } // inside claude.ai without the downloads capability
    try { var url = URL.createObjectURL(new Blob([data], { type: "application/json" })), a = h("a", { href: url, download: name }); document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000); status("Layout exported: " + name, "ok"); }
    catch (e) { exportText(data); }
  }
  function importData(text, done) {
    try {
      var o = JSON.parse(text), g = o.graph || o, lab = o.lab;
      if (!g.nodes || !g.links) throw new Error("not a layout");
      var unknown = g.nodes.filter(function (n) { return !OL.components[n.type]; }).map(function (n) { return n.type; });
      if (unknown.length) throw new Error("unknown components: " + unknown.join(", "));
      g.globals = g.globals || {}; closeWin();
      if (lab && LABS.some(function (l) { return l.id === lab; })) { if (location.hash.slice(1) !== lab) history.replaceState(null, "", "#" + lab); loadLab(lab, g); } else { graph = g; renumber(); result = null; sel = null; changed(); fit(); }
      store("osim-layout", JSON.stringify({ lab: labId, graph: graph }));
      status("Layout imported. Press ▶ Run.", "ok"); if (done) done(null);
    } catch (e) { if (done) done(e); else status("This file is not a valid FiberLab Sim layout (" + e.message + ").", "err"); }
  }
  function readFile(f, done) { var rd = new FileReader(); rd.onload = function () { importData(String(rd.result), done); }; rd.onerror = function () { done && done(new Error("could not read the file")); }; rd.readAsText(f); }
  function doImport() {
    openWin("Import layout", function (b) {
      b.appendChild(h("p", { class: "small muted" }, "Choose an FiberLab Sim layout file (.json), or drop it here. You can also paste the layout text. The current layout is replaced."));
      var fi = h("input", { type: "file", accept: ".json,.osim,.txt,application/json,text/plain", hidden: "" }), pick = h("button", { class: "btn primary", type: "button" }, "Choose file…"), m = h("p", { class: "small" });
      var zone = h("div", { class: "drop" }); zone.appendChild(pick); zone.appendChild(h("span", { class: "small muted" }, "  or drop the file here")); b.appendChild(zone); b.appendChild(fi);
      var show = function (err) { if (err) { m.textContent = "Not a valid FiberLab Sim layout: " + err.message; m.style.color = "var(--bad)"; } };
      pick.addEventListener("click", function () { fi.click(); });
      fi.addEventListener("change", function () { if (fi.files[0]) readFile(fi.files[0], show); });
      zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("over"); });
      zone.addEventListener("dragleave", function () { zone.classList.remove("over"); });
      zone.addEventListener("drop", function (e) { e.preventDefault(); zone.classList.remove("over"); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0], show); });
      var d = h("details"); d.appendChild(h("summary", {}, "Paste text instead")); var ta = h("textarea", { "aria-label": "Layout text" }); d.appendChild(ta);
      var ld = h("button", { class: "btn", type: "button", style: "margin-top:6px" }, "Import text"); ld.addEventListener("click", function () { importData(ta.value, show); }); d.appendChild(ld);
      b.appendChild(d); b.appendChild(m);
    });
  }
  $("exportBtn").addEventListener("click", doExport);
  $("importBtn").addEventListener("click", doImport);

  /* ---------- labs ---------- */
  // assignments (graded, build it yourself) come from assignments.js
  if (OL.ASSIGN) OL.ASSIGN.list.forEach(function (a) { LABS.push({ id: a.id, title: a.title, goal: a.goal, steps: a.steps, task: a.task, assignment: true, graph: { globals: { bitrate: a.bitrate }, nodes: [], links: [] } }); });
  (function () {
    var groups = [["Practice", LABS.filter(function (l) { return !l.assignment && l.id === "free"; })], ["Tutorials (ready layouts, for learning)", LABS.filter(function (l) { return !l.assignment && l.id !== "free"; })], ["Assignments (build it yourself, graded)", LABS.filter(function (l) { return l.assignment; })]];
    groups.forEach(function (gr) { if (!gr[1].length) return; var og = h("optgroup"); og.label = gr[0]; gr[1].forEach(function (l) { og.appendChild(h("option", { value: l.id }, l.title)); }); $("labSel").appendChild(og); });
  })();
  /* ---------- student identity (assignments) ---------- */
  function ident() { try { return JSON.parse(store("osim-id") || "null"); } catch (e) { return null; } }
  window.__osimIdent = ident;
  function askIdent(after) {
    openWin("Start the assignment", function (b) {
      b.appendChild(h("p", { class: "small" }, "Assignments give each student personal values, made from your full name. Write your full name (first, father's and grandfather's names) exactly as in the university records, and always write it the same way. You will send your result with the same name."));
      var form = h("div", { class: "form sendform" }), cur = ident() || {};
      function fld(label, inp) { var f = h("div", { class: "field" }); f.appendChild(h("label", {}, label)); f.appendChild(inp); form.appendChild(f); return inp; }
      var nm = fld("Full name", h("input", { type: "text", autocomplete: "name" })), sc = fld("Section", h("input", { type: "text" })), sid = fld("Student number (optional)", h("input", { type: "text" }));
      nm.value = cur.name || store("osim-name") || ""; sc.value = cur.sec || store("osim-sec") || ""; sid.value = cur.sid || store("osim-sid") || "";
      var go = h("button", { class: "btn primary", type: "button" }, "Start"); form.appendChild(go); b.appendChild(form); var m = h("p", { class: "small" }); b.appendChild(m);
      go.addEventListener("click", function () {
        var o = { name: nm.value.trim(), sec: sc.value.trim(), sid: sid.value.trim() };
        if (o.name.split(/\s+/).filter(Boolean).length < 2 || !o.sec) { m.textContent = "Write your full name (at least two names) and your section."; m.style.color = "var(--bad)"; return; }
        store("osim-id", JSON.stringify(o)); store("osim-name", o.name); store("osim-sec", o.sec); store("osim-sid", o.sid); closeWin(); if (after) after();
      });
    });
  }
  function assignCard(t, lab) {
    var a = OL.ASSIGN.get(lab.id), me = ident(), box = h("div", { class: "tasknote" });
    if (!me) { box.appendChild(h("b", {}, "Start: ")); box.appendChild(document.createTextNode("write your full name to get your personal values. ")); var st = h("button", { class: "btn primary", type: "button" }, "Start the assignment"); st.addEventListener("click", function () { askIdent(function () { loadLab(lab.id); }); }); box.appendChild(st); t.appendChild(box); return; }
    var v = OL.ASSIGN.personal(a, OL.ASSIGN.keyOf(me.name));
    var hd = h("p", { style: "margin:0 0 6px" }); hd.appendChild(h("b", {}, "Student: ")); hd.appendChild(document.createTextNode(me.name + " · Section " + me.sec + (me.sid ? " · No. " + me.sid : "") + "  ")); var ch = h("button", { class: "btn", type: "button" }, "Change"); ch.addEventListener("click", function () { askIdent(function () { loadLab(lab.id); }); }); hd.appendChild(ch); box.appendChild(hd);
    var tb = h("table", { class: "pv" }); tb.innerHTML = "<thead><tr><th>Your personal values</th><th>Value</th></tr></thead>"; var tbd = h("tbody");
    a.personal.forEach(function (q) { var tr = h("tr"); tr.appendChild(h("td", {}, q.label)); tr.appendChild(h("td", {}, v[q.key] + (q.unit ? " " + q.unit : ""))); tbd.appendChild(tr); }); tb.appendChild(tbd); box.appendChild(tb);
    var tk = h("p", { style: "margin:6px 0 0" }); tk.appendChild(h("b", {}, "Task: ")); tk.appendChild(document.createTextNode(a.task + " Then press Send result.")); box.appendChild(tk);
    t.appendChild(box);
  }
  
  function loadLab(id, fromSave) {
    var lab = LABS.filter(function (l) { return l.id === id; })[0] || LABS[0]; labId = lab.id; $("labSel").value = lab.id;
    graph = fromSave || clone(lab.graph); window.__lastSweep = null; graph.globals = graph.globals || {}; renumber(); result = null; sel = null; dirty = true; window.__swPrefs = null;
    if ($("sendBtn")) $("sendBtn").hidden = !(OL.ASSIGN && OL.ASSIGN.get(lab.id));
    var t = $("task"); t.innerHTML = ""; t.appendChild(h("h2", {}, lab.title));
    var g = h("p"); g.appendChild(h("b", {}, "Goal: ")); g.appendChild(document.createTextNode(lab.goal)); t.appendChild(g);
    var d = h("details"); d.open = true; d.appendChild(h("summary", {}, "Steps")); var ol = h("ol"); lab.steps.forEach(function (s) { ol.appendChild(h("li", {}, s.replace(/_DCF/g, "DCF").replace(/_SMF/g, "SMF"))); }); d.appendChild(ol); t.appendChild(d); if (lab.assignment) assignCard(t, lab); else if (lab.task) { var tk = h("p", { class: "tasknote" }); tk.appendChild(h("b", {}, "Try it: ")); tk.appendChild(document.createTextNode(lab.task + " (Practice: assignments are graded, tutorials are not.)")); t.appendChild(tk); }
    $("results").innerHTML = '<p class="muted small">Press ▶ Run to run the simulation. Then double-click a visualizer (or press Open graphs) to see its graphs.</p>';
    if (!fromSave) store("osim-layout", JSON.stringify({ lab: labId, graph: graph }));
    draw(); props(); status(); requestAnimationFrame(fit);
  }
  $("labSel").addEventListener("change", function () { location.hash = $("labSel").value; });
  window.addEventListener("hashchange", function () { var id = location.hash.slice(1); if (LABS.some(function (l) { return l.id === id; })) loadLab(id); });
  $("resetBtn").addEventListener("click", function () { loadLab(labId); });

  /* ---------- theme and model ---------- */
  function applyTheme() { draw(); if (openFn && !$("win").hidden) openFn(); }
  $("themeBtn").addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme"), dark = cur ? cur === "dark" : window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches, t = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t); store("osim-theme", t); applyTheme();
  });
  var th = store("osim-theme"); if (th === "light" || th === "dark") document.documentElement.setAttribute("data-theme", th);
  if (window.matchMedia) try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme); } catch (e) {}
  if ($("modelBtn")) $("modelBtn").addEventListener("click", function () { var d = $("model-d"); if (d) { d.open = true; $("model").scrollIntoView({ behavior: "smooth", block: "start" }); } });
  // component list in the model section, made from the registry
  (function () {
    var box = $("comp-list"); if (!box) return;
    var tbl = h("table"); tbl.innerHTML = "<thead><tr><th style='text-align:left'>Component</th><th style='text-align:left'>Ports</th><th style='text-align:left'>Model</th></tr></thead>";
    var tb = h("tbody");
    OL.order.forEach(function (t) { var d = OL.components[t], tr = h("tr");
      [d.name, d.inputs.map(function (p) { return "in: " + p.kind; }).concat(d.outputs.map(function (p) { return "out: " + p.kind; })).join(", "), d.doc || ""].forEach(function (v) { var td = h("td", { style: "text-align:left;font-family:var(--sans)" }, v); tr.appendChild(td); }); tb.appendChild(tr); });
    tbl.appendChild(tb); box.appendChild(tbl);
  })();

  /* ---------- start ---------- */
  buildLib();
  var start = location.hash.slice(1), saved = null;
  try { saved = JSON.parse(store("osim-layout") || "null"); } catch (e) { saved = null; }
  if (LABS.some(function (l) { return l.id === start; })) { if (saved && saved.lab === start && saved.graph) loadLab(start, saved.graph); else loadLab(start); }
  else if (saved && saved.graph) loadLab(saved.lab, saved.graph); else loadLab("free");
  window.addEventListener("resize", function () { draw(); });
  window.__osim = { askIdent: askIdent, labInfo: function () { return LABS.filter(function (l) { return l.id === labId; })[0]; }, lab: function () { return labId; }, isDirty: function () { return dirty; }, openWin: openWin, closeWin: closeWin, help: showHelp, helpIndex: helpIndex, graph: function () { return graph; }, result: function () { return result; }, calc: calculate, load: loadLab, open: openNode, sweep: sweepWin, setParam: function (id, k, v) { node(id).params[k] = v; changed(); } };
})();
