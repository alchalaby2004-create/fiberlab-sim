# FiberLab Sim (beta)

**A free, browser-based simulator for optical fiber communication links, made for undergraduate laboratory courses.**

By **Dr. Ahmed A. Al-Chalaby** · Version 1.20 beta · License: GPL-3.0

🔗 **Open the program:** https://alchalaby2004-create.github.io/fiberlab-sim/  
📘 **Help (equations, settings and sources for every component):** https://alchalaby2004-create.github.io/fiberlab-sim/help.html

> العربية: [انظر الأسفل](#بالعربية)

---

## What it is

FiberLab Sim lets students build an optical link on a drawing area (drag components, connect them, press **▶ Run**) and see the results with scientific plots: eye diagram, Q factor and BER, optical and electrical spectra, power and chirp in time, and power meters. It runs completely in the web browser; nothing is installed and no data is sent anywhere.

- **24 components:** bit source (PRBS, single pulse, 1010), NRZ/RZ coders, DFB laser, Mach-Zehnder external modulator, directly modulated laser, rate-equation laser, Gaussian pulse source, Fabry-Perot laser, LED, fiber span (SMF, MMF, DCF), EDFA, attenuator, coupler, PIN and APD photodiodes, Bessel and Gaussian filters, and visualizers.
- **Help for every component:** governing equations, the effect of each setting, and textbook sources (English and Arabic).
- **9 tutorials** (ready layouts): power budget, receiver sensitivity, dispersion and compensation, EDFA and OSNR, multimode sources, PIN vs APD, direct vs external modulation, Gaussian pulse spreading, laser rate equations.
- **7 graded assignments:** each student gets personal values made from his full name, builds the link himself, and sends a verification code to his instructor's Google Form. The instructor's grader re-runs the student's layout to check and grade it.
- **Sweep tool**, export/import of layouts (.json), light and dark themes.

## How to use

- **Online:** open the link above in a recent browser (Chrome, Edge, Firefox, Safari) on a computer.
- **Offline:** download [`docs/FiberLab_Sim_offline.html`](docs/FiberLab_Sim_offline.html) and open it; it works without internet.
- **Students:** read the student guide ([English](docs/FiberLab_Sim_Student_Guide.docx), [Arabic](docs/FiberLab_Sim_Student_Guide_AR.docx)).
- **Instructors:** the grader and the answer keys are not in this repository (so students cannot read the solutions). Instructors can ask the author for the grader and the instructor guide.

## Models and limits

The models follow standard textbook equations (G. P. Agrawal, *Fiber-Optic Communication Systems*; G. Keiser, *Optical Fiber Communications*; Coldren & Corzine for laser rate equations). The results were compared with published simulation tutorials and with theory: time and spectrum shapes, receiver Q, sensitivity, extinction-ratio penalty, APD gain, pulse spreading by dispersion and laser turn-on dynamics agree closely.

This is a **teaching tool**, not a design tool. It does not model fiber nonlinearity (SPM, XPM, FWM), PMD, WDM systems, detailed erbium-fiber physics or laser noise. Q is estimated from a limited number of bits.

**Beta:** please report problems or ideas in [Issues](../../issues).

## Building from source

```
python3 build.py                  # docs-ready program  → dist/fiberlab_sim.html (Plotly from CDN)
python3 build.py --inline-plotly  # one offline file    → dist/fiberlab_sim_offline.html
```
Each component is one file in `components/`. See [ADDING_COMPONENTS.md](ADDING_COMPONENTS.md) to add a new one. Help text: `tools/help_data.py` (English) and `tools/help_ar.py` (Arabic).

## License

Copyright © 2026 Dr. Ahmed A. Al-Chalaby.  
This program is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License version 3** (or any later version). It is distributed WITHOUT ANY WARRANTY. See [LICENSE](LICENSE).  
Third-party libraries: see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

---

## بالعربية

**FiberLab Sim** برنامج مجاني يعمل في المتصفح لمحاكاة وصلات الاتصالات بالألياف الضوئية، مصمم لمختبرات طلبة البكالوريوس.  
إعداد **Dr. Ahmed A. Al-Chalaby** · الإصدار 1.20 (تجريبي) · الرخصة GPL-3.0

- **افتح البرنامج:** https://alchalaby2004-create.github.io/fiberlab-sim/
- يبني الطالب الوصلة بالسحب والإفلات ثم يضغط **▶ Run** ويرى مخطط العين و Q و BER والطيف والقدرة والـ chirp.
- لكل مكوّن نافذة مساعدة فيها المعادلات وأثر كل إعداد والمصادر، بالعربية والإنجليزية.
- **9 دروس** بمخططات جاهزة، و**7 واجبات** بقيم شخصية تُحسب من الاسم الثلاثي للطالب، يُرسل حلها إلى نموذج Google الخاص بالأستاذ ويصححها برنامج المصحح.
- يعمل أيضاً بدون إنترنت: نزّل الملف [`docs/FiberLab_Sim_offline.html`](docs/FiberLab_Sim_offline.html).
- دليل الطالب: [عربي](docs/FiberLab_Sim_Student_Guide_AR.docx) · [English](docs/FiberLab_Sim_Student_Guide.docx).
- المصحح ومفاتيح الإجابة ليست في هذا المستودع حتى لا يطّلع الطلبة على الحلول؛ يمكن للأساتذة طلبها من المؤلف.
- البرنامج أداة تعليمية، ولا يشمل اللاخطية في الليف ولا PMD ولا أنظمة WDM.
- هذه نسخة تجريبية: أرسل الملاحظات والمشاكل في [Issues](../../issues).
