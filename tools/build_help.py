# Builds the standalone help: dist/FiberLab_Sim_Help.html (MathML, no scripts needed) and the Word file.
import subprocess, os, re, sys
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); dist = D + "/dist"
subprocess.run(["node", D + "/tools/help_md.js"], check=True); subprocess.run(["node", D + "/tools/help_md.js", "ar"], check=True)
def part(md, lang):
    body = subprocess.run(["pandoc", md, "-f", "markdown", "-t", "html", "--mathml", "--toc", "--toc-depth=2", "-s", "--metadata", "title=x", "--id-prefix=" + lang + "-"], capture_output=True, text=True, check=True).stdout
    toc = re.search(r'<nav id="[^"]*TOC".*?</nav>', body, re.S); toc = toc.group(0) if toc else ""
    main = re.search(r"<body>(.*)</body>", body, re.S).group(1)
    main = re.sub(r'<header id="[^"]*title-block-header">.*?</header>', "", main, flags=re.S).replace(toc, "")
    main = re.sub(r"(<table.*?</table>)", r'<div class="tw">\1</div>', main, flags=re.S)
    return toc.replace("<nav", '<nav aria-label="Contents"'), main
toc, main = part(dist + "/help.md", "en"); toc_ar, main_ar = part(dist + "/help_ar.md", "ar")
idx = open(D + "/app_shell.html").read(); root_css = re.search(r"(:root\{.*?\n\}\n@media \(prefers-color-scheme: dark\)\{.*?\}\}\n:root\[data-theme=\"dark\"\]\{.*?\})", idx, re.S).group(1)
page = """<title>FiberLab Sim Help</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
""" + root_css + """
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:15.5px;line-height:1.55;padding-left:max(16px, env(safe-area-inset-left, 0px));padding-right:max(16px, env(safe-area-inset-right, 0px));padding-block:14px 60px}
.page{max-width:900px;margin:0 auto}
.top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}
.btn{border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:8px;padding:6px 12px;font:600 .84rem var(--sans);cursor:pointer}
h1{font-size:1.6rem;margin:28px 0 10px;text-wrap:balance} h1:first-child{margin-top:4px}
h2{font-size:1.2rem;color:var(--accent);margin:28px 0 8px;border-bottom:1px solid var(--line);padding-bottom:4px}
h3{font-size:1.05rem;color:var(--blue);margin:24px 0 6px}
p,li{max-width:72ch}
nav#TOC{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 16px;margin:10px 0 20px;font-size:.92rem}
nav#TOC ul{margin:4px 0;padding-left:1.2em} nav#TOC a{color:var(--blue);text-decoration:none}
.tw{overflow-x:auto} table{border-collapse:collapse;width:100%;font-size:.88rem;margin:8px 0 14px}
th,td{border:1px solid var(--line);padding:5px 8px;text-align:left;vertical-align:top} th{background:var(--blue-soft)}
math[display="block"]{display:block;overflow-x:auto;overflow-y:hidden;padding:8px 0;font-size:1.12em}
code{font-family:var(--mono)}
a{color:var(--blue)}
#ar{font-family:"Noto Naskh Arabic",var(--sans);font-size:1.04em} #ar th,#ar td{text-align:right} #ar td:nth-child(1),#ar td:nth-child(2){direction:ltr;unicode-bidi:plaintext} #ar math{direction:ltr} #ar nav#TOC ul{padding-left:0;padding-right:1.2em}
</style>
<div class="page">
<div class="top"><b>FiberLab Sim · Help <span style="font-weight:400;color:var(--muted);font-size:.85em">· By: Dr. Ahmed A. Al-Chalaby · Version 1.20 beta</span></b><span><button class="btn" id="langBtn" type="button" lang="ar">عربي</button> <button class="btn" id="themeBtn" type="button">Theme</button></span></div>
<div id="en" lang="en" dir="ltr">""" + toc + main + """</div>
<div id="ar" lang="ar" dir="rtl" hidden>""" + toc_ar + main_ar + """</div>
</div>
<script>
(function(){var k="osim-theme";try{var t=localStorage.getItem(k);if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}
var L="osim-help-lang";function setL(l){document.getElementById("en").hidden=l==="ar";document.getElementById("ar").hidden=l!=="ar";var b=document.getElementById("langBtn");b.textContent=l==="ar"?"English":"عربي";b.lang=l==="ar"?"en":"ar";try{localStorage.setItem(L,l)}catch(e){}}
try{if(localStorage.getItem(L)==="ar")setL("ar")}catch(e){}
document.getElementById("langBtn").addEventListener("click",function(){setL(document.getElementById("ar").hidden?"ar":"en")});
document.getElementById("themeBtn").addEventListener("click",function(){var c=document.documentElement.getAttribute("data-theme"),d=c?c==="dark":matchMedia("(prefers-color-scheme: dark)").matches,t=d?"light":"dark";document.documentElement.setAttribute("data-theme",t);try{localStorage.setItem(k,t)}catch(e){}});})();
</script>
"""
open(dist + "/FiberLab_Sim_Help.html", "w").write(page)
out = sys.argv[1] if len(sys.argv) > 1 else dist + "/FiberLab_Sim_Help.docx"
subprocess.run(["pandoc", dist + "/help.md", "-f", "markdown", "-t", "docx", "--reference-doc", D + "/tools/reference.docx", "-o", out], check=True)
subprocess.run(["python3", D + "/tools/fix_pandoc_docx.py", out], check=True)
out_ar = out.replace(".docx", "_AR.docx")
subprocess.run(["pandoc", dist + "/help_ar.md", "-f", "markdown", "-t", "docx", "--reference-doc", D + "/tools/reference.docx", "--metadata", "dir=rtl", "--metadata", "lang=ar", "-o", out_ar], check=True)
subprocess.run(["python3", D + "/tools/fix_pandoc_docx.py", out_ar], check=True)
print("help built", len(page))
