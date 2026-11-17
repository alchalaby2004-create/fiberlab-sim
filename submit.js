/* =====================================================================
   FiberLab Sim — "Send result": builds a short report and a verification
   code (the full layout + the results), then opens the instructor's
   Google Form pre-filled, or lets the student copy it.
   ===================================================================== */
(function () {
  var OL = window.OL, $ = function (i) { return document.getElementById(i); };
  function h(tag, attrs, text) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function b64url(bytes) { var s = ""; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function unb64url(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  /** payload object -> "OSL1.<deflate+base64url>" (or "OSL0.<base64url>" without CompressionStream) */
  OL.encodeSubmission = function (obj) {
    var bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream === "undefined") return Promise.resolve("OSL0." + b64url(bytes));
    var cs = new CompressionStream("deflate-raw"), w = cs.writable.getWriter(); w.write(bytes); w.close();
    return new Response(cs.readable).arrayBuffer().then(function (buf) { return "OSL1." + b64url(new Uint8Array(buf)); });
  };
  /** Class code: lets each instructor use his own Google Form without rebuilding the program. */
  OL.makeClassCode = function (o) { return "OSC1." + b64url(new TextEncoder().encode(JSON.stringify({ n: o.name || "", i: o.instructor || "", f: o.formUrl || "" }))); };
  OL.readClassCode = function (code) { var m = /^OSC1\.([A-Za-z0-9_-]+)$/.exec(String(code || "").trim()); if (!m) return null; try { var o = JSON.parse(new TextDecoder().decode(unb64url(m[1]))); return o && o.f ? { name: o.n, instructor: o.i, formUrl: o.f, code: code.trim() } : null; } catch (e) { return null; } };
  function getClass() { try { return OL.readClassCode(localStorage.getItem("osim-class")); } catch (e) { return null; } }
  OL.decodeSubmission = function (code) {
    var m = /^OSL([01])\.([A-Za-z0-9_-]+)$/.exec(code.trim()); if (!m) return Promise.reject(new Error("not a submission code"));
    var bytes = unb64url(m[2]);
    if (m[1] === "0") return Promise.resolve(JSON.parse(new TextDecoder().decode(bytes)));
    var ds = new DecompressionStream("deflate-raw"), w = ds.writable.getWriter(); w.write(bytes); w.close();
    return new Response(ds.readable).text().then(JSON.parse);
  };
  function metrics(result) {
    var r = {}; if (!result) return r;
    for (var id in result.nodes) { var R = result.nodes[id]; if (R.view && R.view.m) { r[id] = {}; for (var k in R.view.m) r[id][k] = R.view.m[k] == null ? null : +(+R.view.m[k]).toPrecision(6); } }
    return r;
  }
  function settingsText(g) {
    var lines = [];
    g.nodes.forEach(function (n) { var d = OL.components[n.type]; if (!d) return; var keys = Object.keys(n.params || {}); if (!keys.length) return;
      lines.push(n.id + " " + d.short + ": " + keys.map(function (k) { var q = d.params.filter(function (x) { return x.key === k; })[0]; return (q ? q.label : k) + " " + (n.params[k] == null ? "auto" : n.params[k]) + (q && q.unit ? " " + q.unit : ""); }).join(", ")); });
    return lines;
  }
  function resultText(g, result) {
    var lines = [];
    g.nodes.forEach(function (n) { var d = OL.components[n.type], R = result && result.nodes[n.id]; if (!d || !d.instrument || !R) return;
      if (R.error) { lines.push(n.id + " " + d.short + ": " + R.error); return; }
      lines.push(n.id + " " + d.short + ": " + (R.view.numbers || []).slice(0, 2).map(function (x) { return x[0] + " " + x[1]; }).join(", ")); });
    return lines;
  }
  function open() {
    var S = window.__osim, g = S.graph(), result = S.result(), labId = S.lab(), lab = (window.LABS || []).filter(function (l) { return l.id === labId; })[0] || { title: labId };
    var info = S.labInfo && S.labInfo();
    if (info && !info.assignment) { S.openWin("Send result", function (b) { b.appendChild(h("div", { class: "note" }, "Send result is for the graded assignments. Tutorials are for practice and are not sent. Choose an assignment (Assignment 1 to 7) from the experiment list.")); }); return; }
    var me = window.__osimIdent && window.__osimIdent();
    if (!me) { S.askIdent(open); return; }
    S.openWin("Send result", function (b) {
      if (!result || S.isDirty()) { b.appendChild(h("div", { class: "note warn" }, "Press ▶ Run first. The result you send must match the layout.")); return; }
      if (lab.task) { var tk = h("p", { class: "tasknote" }); tk.appendChild(h("b", {}, lab.title + ". Task: ")); tk.appendChild(document.createTextNode(lab.task)); b.appendChild(tk); }
      var form = h("div", { class: "form sendform" });
      function fld(label, inp) { var f = h("div", { class: "field" }); f.appendChild(h("label", {}, label)); f.appendChild(inp); form.appendChild(f); return inp; }
      var nm = fld("Full name (required)", h("input", { type: "text", autocomplete: "name" }));
      var sc = fld("Section (required)", h("input", { type: "text", list: "secList" }));
      var dl = h("datalist", { id: "secList" }); ((OL.SUBMIT && OL.SUBMIT.sections) || []).forEach(function (x) { dl.appendChild(h("option", { value: x })); }); form.appendChild(dl);
      var sid = fld("Student number (optional)", h("input", { type: "text" }));
      nm.value = me.name; sc.value = me.sec; sid.value = me.sid; [nm, sc, sid].forEach(function (x) { x.readOnly = true; });
      var chg = h("button", { class: "btn", type: "button" }, "Not you? Change"); chg.addEventListener("click", function () { S.askIdent(function () { location.reload(); }); }); form.appendChild(chg);
      var mk = h("button", { class: "btn primary", type: "button" }, "Make my result"); form.appendChild(mk); b.appendChild(form);
      // class (instructor's form)
      var cls = getClass(), cbox = h("div", { class: "note" });
      function drawClass() {
        cbox.innerHTML = ""; cls = getClass();
        if (cls) { cbox.appendChild(document.createTextNode("Class: " + (cls.name || "—") + (cls.instructor ? " · Instructor: " + cls.instructor : "") + "  ")); var c2 = h("button", { class: "btn", type: "button" }, "Change class"); c2.addEventListener("click", function () { try { localStorage.removeItem("osim-class"); } catch (e) {} drawClass(); }); cbox.appendChild(c2); }
        else { cbox.appendChild(document.createTextNode((OL.SUBMIT && OL.SUBMIT.formUrl ? "Optional: " : "") + "Class code from your instructor (starts with OSC1.): ")); var ci = h("input", { type: "text", style: "width:100%;margin:4px 0" }), c3 = h("button", { class: "btn", type: "button" }, "Save class code"), cm = h("span", { class: "small" });
          c3.addEventListener("click", function () { var o = OL.readClassCode(ci.value); if (!o) { cm.textContent = " Not a valid class code."; return; } try { localStorage.setItem("osim-class", o.code); } catch (e) {} drawClass(); });
          cbox.appendChild(ci); cbox.appendChild(c3); cbox.appendChild(cm); }
      }
      drawClass(); b.appendChild(cbox);
      var out = h("div"); b.appendChild(out);
      mk.addEventListener("click", function () {
        var name = nm.value.trim(), sec = sc.value.trim(); out.innerHTML = "";
        if (name.length < 3 || !sec) { out.appendChild(h("div", { class: "note bad" }, "Write your full name and your section.")); return; }
        store("osim-name", name); store("osim-sec", sec); store("osim-sid", sid.value.trim());
        var payload = { v: 2, app: "FiberLab Sim", name: name, sec: sec, sid: sid.value.trim(), pv: OL.ASSIGN && OL.ASSIGN.get(labId) ? OL.ASSIGN.personal(OL.ASSIGN.get(labId), OL.ASSIGN.keyOf(name)) : null, lab: labId, t: new Date().toISOString(), g: g, r: metrics(result), sw: window.__lastSweep || null };
        OL.encodeSubmission(payload).then(function (code) {
          var rep = ["FiberLab Sim result" + (getClass() ? " · Class: " + getClass().name : ""), "Name: " + name + "   Section: " + sec + (payload.sid ? "   Student number: " + payload.sid : ""), "Lab: " + (lab.title || labId), "Time: " + new Date(payload.t).toLocaleString(), "", "Results:"]
            .concat(resultText(g, result)).concat(["", "Settings changed:"]).concat(settingsText(g)).concat(["", "Verification code (do not edit):", code]).join("\n");
          var ta = h("textarea", { readonly: "", "aria-label": "Your report" }); ta.value = rep; ta.style.height = "200px";
          var acts = h("div", { class: "actions" }), msg = h("p", { class: "small muted" });
          var url = (getClass() && getClass().formUrl) || (OL.SUBMIT && OL.SUBMIT.formUrl);
          if (url) {
            var u = url.replace(/=NAME(&|$)/, "=" + encodeURIComponent(name) + "$1").replace(/=SECTION(&|$)/, "=" + encodeURIComponent(sec) + "$1").replace(/=LAB(&|$)/, "=" + encodeURIComponent(lab.title || labId) + "$1")
              .replace(/=STUDENTID(&|$)/, "=" + encodeURIComponent(payload.sid) + "$1").replace(/=CODE(&|$)/, "=" + encodeURIComponent(code) + "$1");
            var a = h("a", { class: "btn primary sendlink", href: u, target: "_blank", rel: "noopener" }, "Open the form and send ↗"); acts.appendChild(a);
            msg.textContent = "The form opens in a new tab with your answers filled in. Check your name, then press Submit in the form.";
          } else msg.textContent = "Copy the report and send it to your instructor in the way they asked (message or e-mail).";
          var cp = h("button", { class: "btn", type: "button" }, "Copy report");
          cp.addEventListener("click", function () { var fb = function () { ta.select(); msg.textContent = "Report selected: press Ctrl+C to copy."; }; try { navigator.clipboard.writeText(rep).then(function () { msg.textContent = "Report copied."; }, fb); } catch (e) { fb(); } });
          acts.appendChild(cp);
          out.appendChild(h("div", { class: "note" }, "Your result is ready. The verification code holds your layout and results; your instructor's grader re-runs it to check the numbers."));
          out.appendChild(acts); out.appendChild(msg); out.appendChild(ta);
        }).catch(function (e) { out.appendChild(h("div", { class: "note bad" }, "Could not make the code: " + e.message)); });
      });
    });
  }
  if ($("sendBtn")) $("sendBtn").addEventListener("click", open);
})();
