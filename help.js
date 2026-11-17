/* =====================================================================
   FiberLab Sim — help renderer. Reads the `help` field of each component
   (equations in LaTeX, effect of each setting, sources) and draws it.
   Used by the Help button in the program and by the standalone help page.
   ===================================================================== */
(function () {
  var OL = window.OL;
  function h(tag, attrs, text) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function math(tex) {
    var d = h("div", { class: "hmath", dir: "ltr" });
    try { if (window.temml) d.innerHTML = temml.renderToString(tex, { displayMode: true, throwOnError: false }); else d.textContent = tex; } catch (e) { d.textContent = tex; }
    return d;
  }
  function fmtDef(q) {
    if (q.def == null) return "Auto";
    if (q.type === "select") { var o = q.options.filter(function (x) { return String(x[0]) === String(q.def); })[0]; return o ? o[1] : String(q.def); }
    return q.def + (q.unit ? " " + q.unit : "");
  }
  /** Draw the help of one component into `box`. `current` (optional) = current parameter values. */
  OL.helpLang = "en";
  try { if (localStorage.getItem("osim-help-lang") === "ar") OL.helpLang = "ar"; } catch (e) {}
  OL.renderHelp = function (box, type, current, lang) {
    lang = lang || OL.helpLang;
    var d = OL.components[type], H0 = d.help || { eq: [], params: {}, src: [] }, A = lang === "ar" && H0.ar ? H0.ar : null, U = A ? (OL.HELP_UI_AR || {}) : {};
    var T = function (x) { return U[x] || x; };
    var H = { eq: H0.eq.map(function (e, i) { return { t: A && A.eq[i] ? A.eq[i].t : e.t, tex: e.tex, n: A && A.eq[i] ? A.eq[i].n : e.n }; }), params: A ? A.params : H0.params, extra: A ? A.extra : H0.extra, src: H0.src };
    box.setAttribute("dir", A ? "rtl" : "ltr"); box.setAttribute("lang", A ? "ar" : "en");
    box.appendChild(h("p", { class: "hdoc" }, A ? A.doc : (d.doc || "")));
    var io = [];
    var KN = { opt: "optical", elec: "electrical", bin: "binary", any: "optical or electrical" };
    d.inputs.forEach(function (p) { io.push(T("in") + ": " + (p.label || p.id) + " (" + T(KN[p.kind]) + ")"); });
    d.outputs.forEach(function (p) { io.push(T("out") + ": " + (p.label || p.id) + " (" + T(KN[p.kind]) + ")"); });
    if (io.length) box.appendChild(h("p", { class: "hio" }, io.join(" · ")));
    if (H.eq && H.eq.length) {
      box.appendChild(h("h3", {}, T("Governing equations")));
      var g = h("div", { class: "heqs" });
      H.eq.forEach(function (e) { var c = h("div", { class: "heq" }); c.appendChild(h("b", {}, e.t)); c.appendChild(math(e.tex)); if (e.n) c.appendChild(h("small", {}, e.n)); g.appendChild(c); });
      box.appendChild(g);
    }
    if (d.params.length) {
      box.appendChild(h("h3", {}, T("How the settings change the result")));
      var wrap = h("div", { class: "tbl" }), t = h("table", { class: "htbl" }), tr = h("tr");
      ["Setting", current ? "Now" : "Default", "Effect"].forEach(function (x) { tr.appendChild(h("th", {}, T(x))); });
      var th = h("thead"); th.appendChild(tr); t.appendChild(th); var tb = h("tbody");
      d.params.forEach(function (q) {
        var r = h("tr"); r.appendChild(h("td", { dir: "ltr" }, q.label + (q.unit ? " (" + q.unit + ")" : "")));
        var v = current ? (current[q.key] == null ? "Auto" : (q.type === "select" ? fmtDef({ def: current[q.key], type: "select", options: q.options }) : String(current[q.key]))) : fmtDef(q);
        r.appendChild(h("td", { dir: "ltr" }, v)); r.appendChild(h("td", {}, (H.params || {})[q.key] || "")); tb.appendChild(r);
      });
      t.appendChild(tb); wrap.appendChild(t); box.appendChild(wrap);
    }
    if (H.extra) box.appendChild(h("p", { class: "hextra" }, H.extra));
    if (H.src && H.src.length) {
      box.appendChild(h("h3", {}, T("Sources")));
      var ol = h("ol", { class: "hsrc", dir: "ltr" }); H.src.forEach(function (k) { ol.appendChild(h("li", {}, (OL.REFS || {})[k] || k)); }); box.appendChild(ol);
    }
  };
  OL.helpNote = function (lang) { return (lang || OL.helpLang) === "ar" && OL.HELP_UI_AR ? OL.HELP_UI_AR.note : OL.HELP_NOTE; };
  OL.HELP_NOTE = "Equations are standard textbook results. The sources are the usual references for each equation; check the edition you use for chapter and page numbers.";
})();
