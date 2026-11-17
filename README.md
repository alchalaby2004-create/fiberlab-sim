# FiberLab Sim (beta)

**A free, browser-based simulator for optical fiber communication links, made for undergraduate laboratory courses.**

By **Dr. Ahmed A. Al-Chalaby** · Version 1.20 beta · License: GPL-3.0

🔗 **Open the program:** https://alchalaby2004-create.github.io/fiberlab-sim/  
📘 **Help (equations, settings and sources for every component):** https://alchalaby2004-create.github.io/fiberlab-sim/help.html

> العربية: [انظر الأسفل](#بالعربية)

---

## What it is

FiberLab Sim lets students build an optical link on a drawing area (drag components, connect them, press **▶ Run**) and see the results with scientific plots: eye diagram, Q factor and BER, optical and electrical spectra, power and chirp in time, and power meters. It runs completely in the web browser: nothing is installed, and nothing is sent anywhere unless a student chooses to send an assignment result to his instructor's form.

- **24 components:** bit source (PRBS, single pulse, 1010), NRZ/RZ coders, DFB laser, Mach-Zehnder external modulator, directly modulated laser, rate-equation laser, Gaussian pulse source, Fabry-Perot laser, LED, fiber span (SMF, MMF, DCF), EDFA, attenuator, coupler, PIN and APD photodiodes, Bessel and Gaussian filters, and six instruments: eye & BER meter, optical spectrum monitor, electrical spectrum monitor, power & chirp monitor, time-signal scope and power meter.
- **Help for every component:** governing equations, the effect of each setting, and textbook sources (English and Arabic).
- **9 tutorials** (ready layouts): power budget, receiver sensitivity, dispersion and compensation, EDFA and OSNR, multimode sources, PIN vs APD, direct vs external modulation, Gaussian pulse spreading, laser rate equations.
- **7 graded assignments:** each student gets personal values made from his full name, builds the link himself, and sends a verification code to his instructor's Google Form (the instructor gives the class a *class code* that points to his form). The instructor's grader re-runs the student's layout to check and grade it.
- **Sweep tool** (one setting against one result), export/import of layouts (.json), light and dark themes, Ctrl+Enter to run.

## How to use

- **Online:** open the link above in a recent browser (Chrome, Edge, Firefox, Safari) on a computer.
- **Offline:** download [`docs/FiberLab_Sim_offline.html`](docs/FiberLab_Sim_offline.html) and open it; it works without internet.
- **Help as Word files:** [English](docs/FiberLab_Sim_Help.docx) · [Arabic](docs/FiberLab_Sim_Help_AR.docx).
- **Students:** read the student guide ([English](docs/FiberLab_Sim_Student_Guide.docx), [Arabic](docs/FiberLab_Sim_Student_Guide_AR.docx)).
- **Lab tutorial (Word):** [docs/FiberLab_Sim_Lab_Tutorial.docx](docs/FiberLab_Sim_Lab_Tutorial.docx): theory, steps, result tables and questions for the 9 tutorials and the 7 assignments (student version, without answers).
- **Instructors:** the grader, the assignment key, the lab tutorial with answers and the instructor guide (English and Arabic) are not in this repository, so students cannot read the solutions. Instructors can ask the author for them.

## Models and limits

The models follow standard textbook equations (G. P. Agrawal, *Fiber-Optic Communication Systems*; G. Keiser, *Optical Fiber Communications*; L. A. Coldren and S. W. Corzine, *Diode Lasers and Photonic Integrated Circuits*; E. Desurvire, *Erbium-Doped Fiber Amplifiers*). Every component's help lists its sources. The results were compared with published simulation tutorials and with theory: time and spectrum shapes, receiver Q, sensitivity, extinction-ratio penalty, APD gain, pulse spreading by dispersion and laser turn-on dynamics agree closely.

This is a **teaching tool**, not a design tool. It does not model fiber nonlinearity (SPM, XPM, FWM), PMD, WDM systems, detailed erbium-fiber physics or laser noise. Q is estimated from a limited number of bits.

**Beta:** please report problems or ideas in [Issues](../../issues).

## Building from source

```
python3 build.py                  # web page        → dist/fiberlab_sim_web.html (copy to docs/index.html; Plotly from CDN)
python3 build.py --inline-plotly  # one offline file → dist/fiberlab_sim_offline.html
python3 tools/help_data.py        # writes the help text into the components (run after editing the help)
python3 tools/build_help.py out.docx  # help page and Word files (needs Node.js and pandoc)
```
**Repository layout:** `docs/` is the published site (program, help, offline file, guides); `components/` has one file per component; `core.js` is the simulation engine; `labs.js` the tutorials; `assignments.js` the public part of the assignments (values and tasks); `ui.js` the editor; `app_shell.html` the page template.

Each component is one file in `components/`. See [ADDING_COMPONENTS.md](ADDING_COMPONENTS.md) to add a new one. Help text: `tools/help_data.py` (English) and `tools/help_ar.py` (Arabic).

## License

Copyright © 2026 Dr. Ahmed A. Al-Chalaby.  
This program is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License version 3** (or any later version). It is distributed WITHOUT ANY WARRANTY. See [LICENSE](LICENSE).  
Third-party libraries: see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

---

## بالعربية

**FiberLab Sim** برنامج مجاني يعمل في متصفح الإنترنت، لمحاكاة وصلات الاتصالات بالألياف الضوئية، وقد صُمّم لمختبرات طلبة البكالوريوس.
إعداد: **Dr. Ahmed A. Al-Chalaby** · الإصدار 1.20 (تجريبي) · الرخصة GPL-3.0

- **افتح البرنامج:** https://alchalaby2004-create.github.io/fiberlab-sim/
- يبني الطالب الوصلة بسحب المكونات وربطها، ثم يضغط **▶ Run** فيرى مخطط العين وقيمة Q ومعدل الخطأ BER والطيف والقدرة والـ chirp.
- لكل مكوّن نافذة مساعدة تشرح معادلاته وأثر كل إعداد فيه ومصادره، بالعربية والإنجليزية.
- في البرنامج **9 دروس** بمخططات جاهزة، و**7 واجبات** يحصل فيها كل طالب على قيم شخصية تُحسب من اسمه الثلاثي، فيرسل حله إلى نموذج Google الخاص بأستاذه، ويصححه الأستاذ ببرنامج التصحيح.
- يضم البرنامج 24 مكوّناً، منها ستة أجهزة قياس: مقياس العين وBER، ومراقب الطيف الضوئي، ومراقب الطيف الكهربائي، ومراقب القدرة والـ chirp، وراسم الإشارة، ومقياس القدرة.
- يعمل البرنامج أيضاً دون إنترنت: نزّل الملف [`docs/FiberLab_Sim_offline.html`](docs/FiberLab_Sim_offline.html) وافتحه.
- ملف المساعدة (Word): [عربي](docs/FiberLab_Sim_Help_AR.docx) · [English](docs/FiberLab_Sim_Help.docx).
- دليل الطالب: [عربي](docs/FiberLab_Sim_Student_Guide_AR.docx) · [English](docs/FiberLab_Sim_Student_Guide.docx).
- ملف الدروس (Word): [docs/FiberLab_Sim_Lab_Tutorial.docx](docs/FiberLab_Sim_Lab_Tutorial.docx)، وفيه النظرية والخطوات وجداول النتائج والأسئلة للدروس التسعة والواجبات السبعة (نسخة الطالب، دون إجابات).
- لا يحتوي هذا المستودع على برنامج التصحيح، ولا مفتاح الواجبات، ولا ملف الدروس بإجاباته، ولا دليل الأستاذ، حتى لا يطّلع الطلبة على الحلول. ويمكن للأساتذة طلبها من المؤلف.
- البرنامج أداة تعليمية، ولا يحسب الظواهر اللاخطية في الليف ولا PMD ولا أنظمة WDM.
- هذه نسخة تجريبية، فنرحب بملاحظاتكم وبلاغاتكم عن الأخطاء في صفحة [Issues](../../issues).
