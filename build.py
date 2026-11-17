# Bundles the program into one HTML file. Usage: python3 build.py [--inline-plotly]
import sys, os, glob
D = os.path.dirname(os.path.abspath(__file__))
inline = "--inline-plotly" in sys.argv
page = open(D + "/index.html").read().replace("<!--MODEL-->", open(D + "/model.html").read())
js = [open(D + "/vendor/temml.min.js").read(), open(D + "/core.js").read(), open(D + "/refs.js").read()]
ORDER = ["prbs", "nrz", "rz", "cwlaser", "mzm", "dml", "rlaser", "gpulse", "fplaser", "led", "fiber", "edfa", "atten", "attenuator", "splitter", "pin", "apd", "bessel", "gausslpf", "ber", "scope", "otdv", "osa", "esa", "powermeter"]
files = sorted(glob.glob(D + "/components/*.js"), key=lambda f: (ORDER.index(os.path.basename(f)[:-3]) if os.path.basename(f)[:-3] in ORDER else 999, f))
for f in files:
    js.append("/* ==== components/" + os.path.basename(f) + " ==== */\n" + open(f).read())
js.append(open(D + "/help.js").read()); js.append(open(D + "/config.js").read()); js.append(open(D + "/assignments.js").read()); js.append(open(D + "/labs.js").read()); js.append(open(D + "/ui.js").read()); js.append(open(D + "/submit.js").read())
plot = ("<script>\n" + open(D + "/vendor/plotly.min.js").read() + "\n</script>\n") if inline else '<script src="https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.35.2/plotly.min.js"></script>\n'
out = page + plot + "".join("<script>\n" + s + "\n</script>\n" for s in js)
name = "fiberlab_sim_offline.html" if inline else "fiberlab_sim.html"
if inline: out = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n' + out + "</body></html>\n"
os.makedirs(D + "/dist", exist_ok=True); open(D + "/dist/" + name, "w").write(out); print(name, len(out))
# a stand-alone page for any web server (GitHub Pages): doctype + UTF-8 charset (artifact hosting adds these itself)
if not inline:
    sa = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n' + out + "</body></html>\n"
    open(D + "/dist/fiberlab_sim_web.html", "w").write(sa); print("fiberlab_sim_web.html", len(sa))

# ---- grader (instructor only: needs the private files assignments_key.js, asgrade.js, grading.js, grader.*) ----
PRIV = ["assignments_key.js", "grading.js", "asgrade.js", "grader.js", "grader.html"]
if not inline and all(os.path.exists(D + "/" + p) for p in PRIV):
    import re as _re
    idx = open(D + "/index.html").read(); root_css = _re.search(r"(:root\{.*?\n\}\n@media \(prefers-color-scheme: dark\)\{.*?\}\}\n:root\[data-theme=\"dark\"\]\{.*?\})", idx, _re.S).group(1)
    gpage = open(D + "/grader.html").read().replace("/*ROOTCSS*/", root_css)
    gjs = [open(D + "/core.js").read()] + [open(f).read() for f in files] + [open(D + "/" + x).read() for x in ["config.js", "assignments.js", "assignments_key.js", "labs.js", "submit.js", "grading.js", "asgrade.js", "grader.js"]]
    gout = gpage + "".join("<script>\n" + s + "\n</script>\n" for s in gjs)
    open(D + "/dist/fiberlab_grader.html", "w").write(gout); print("fiberlab_grader.html", len(gout))
