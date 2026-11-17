# Help content for every component: governing equations (LaTeX), effect of each setting, sources.
# Run:  python3 tools/help_data.py   -> inserts/updates the `help:` field in components/*.js
HELP = {
"prbs": dict(
  eq=[("Generator polynomial (order 9)", r"x^{9}+x^{5}+1", "A shift register with feedback makes the bits. The pattern repeats after 2ⁿ − 1 bits."),
      ("Pattern length and bit period", r"L_{\mathrm{PRBS}}=2^{n}-1,\qquad T=\frac{1}{B}", "B is the bit rate (Global settings).")],
  p={"pattern": "Pseudo-random for normal links. Single 1 gives one isolated pulse (for pulse spreading or laser turn-on studies). Alternating gives 1010…, the fastest pattern.", "order": "A higher order gives a longer pattern with longer runs of 1s and 0s (up to n in a row). Long runs test the low-frequency response of the receiver. With 512 bits, order 9 (511 bits) fits once."},
  extra="The bit rate B is a layout parameter. A higher B makes each bit shorter (T = 1/B), so dispersion closes the eye sooner and the receiver needs a wider bandwidth (more noise).",
  src=["o150", "agrawal"]),
"nrz": dict(
  eq=[("NRZ signal", r"v(t)=\sum_{k} a_k\,p(t-kT),\qquad a_k\in\{0,1\}", "p(t) is a rectangular pulse of width T (the whole bit)."),
      ("Driver (rise-time) filter", r"H(f)=\exp\!\left[-\frac{\ln 2}{2}\left(\frac{f}{f_d}\right)^{2}\right],\qquad f_d=\mathrm{bw}\cdot B", "f_d is the −3 dB bandwidth of the driver.")],
  p={"bw": "Smaller value → slower edges (longer rise time), the bits run into each other (ISI) and the eye closes. Larger value → sharp edges but a wider spectrum."},
  src=["agrawal", "keiser"]),
"rz": dict(
  eq=[("RZ signal", r"v(t)=\sum_{k} a_k\,p(t-kT),\qquad p(t)=1\ \ \mathrm{for}\ \ 0\le t< dT", "d is the duty cycle. A 1 returns to zero before the end of the bit."),
      ("Driver filter", r"H(f)=\exp\!\left[-\frac{\ln 2}{2}\left(\frac{f}{f_d}\right)^{2}\right],\qquad f_d=\mathrm{bw}\cdot B", "")],
  p={"duty": "A shorter duty cycle gives shorter pulses: a wider spectrum (more dispersion) but more time between pulses (less ISI). For the same average power the peak power is higher.",
     "bw": "As for NRZ: a low bandwidth rounds the pulses. RZ needs about twice the NRZ bandwidth."},
  src=["agrawal"]),
"cwlaser": dict(
  eq=[("Output field", r"E(t)=\sqrt{P_{\mathrm{CW}}},\qquad \nu=\frac{c}{\lambda}", "A single-mode (DFB) laser that stays on. By default its linewidth is zero (much smaller than the signal spectrum); set Δν to add phase noise.")],
  p={"lw": "Laser linewidth Δν (phase noise, a random walk of the phase). It widens the carrier line in the spectrum. 0 = ideal laser (used in the tutorials and assignments); a typical DFB laser has about 1–10 MHz.",
     "power": "Sets the carrier power. After a Mach–Zehnder modulator the average power is about 3 dB lower (half of the time the light is switched off).",
     "lam": "Sets the fiber loss and dispersion (automatic values), the photodiode responsivity R ∝ λ, and the photon energy hν used for the amplifier noise."},
  src=["agrawal", "keiser"]),
"mzm": dict(
  eq=[("Output field", r"E_{\mathrm{out}}(t)=E_{\mathrm{in}}(t)\cos\!\left[\frac{\pi}{2}\left(\frac{1}{2}-a\left(v-\frac{1}{2}\right)\right)\right]10^{-IL/20}", "v is the drive (0 to 1). The modulator is biased at the half-power point, so the average output power is half the input whatever the ER. Balanced (push-pull) drive: no phase change, so no chirp."),
      ("Drive swing from the extinction ratio", r"a=1-\frac{4}{\pi}\arctan\frac{1}{\sqrt{ER}}", "ER is the extinction ratio (linear). a = 1 gives a perfect 0 level; a smaller swing gives a brighter 0 and a dimmer 1."),
      ("Power penalty of a finite extinction ratio", r"\delta_{ER}=10\log_{10}\frac{ER+1}{ER-1}\ \ \mathrm{dB}", "For ER = 20 dB the penalty is about 0.1 dB; for 6 dB it is about 2.2 dB.")],
  p={"er": "Higher ER → the 0 level is darker and the 1 level brighter (same average power) → larger eye opening and higher Q (smaller penalty δ).",
     "il": "Insertion loss lowers the whole signal by IL dB.",
     "bw": "The modulator bandwidth limits how fast the light can change. Low values round the pulses (ISI)."},
  src=["agrawal", "keiser"]),
"dml": dict(
  eq=[("Power levels", r"P_1=\frac{\overline{P}}{m+(1-m)/ER},\qquad P_0=\frac{P_1}{ER}", "m = 0.5 for NRZ (half of the bits are 1)."),
      ("Laser modulation response", r"H(f)=\frac{1}{1-\left(f/f_r\right)^{2}+j\,\dfrac{f/f_r}{Q_r}}", "Second-order response from the rate equations: resonance at f_r, damping Q_r."),
      ("Frequency chirp", r"\Delta\nu(t)=\frac{\alpha}{4\pi}\,\frac{d\ln P}{dt}+\kappa\left(P-\overline{P}\right)", "Transient chirp (α) at the edges, and adiabatic chirp (κ): 1s and 0s have different frequencies.")],
  p={"power": "Average launch power P̄.",
     "lam": "At 1550 nm (D ≈ 17 ps/(nm·km)) chirp turns into strong pulse spreading; at 1310 nm (D ≈ 0) chirp does little.",
     "er": "Low ER (typical 4–8 dB for a DML) → small eye opening. A higher ER means a lower P₀ and stronger chirp in real lasers.",
     "alpha": "α = 0 → no transient chirp. Larger α → wider spectrum → much more dispersion penalty after fiber at 1550 nm.",
     "kappa": "Adiabatic chirp: the 1s and 0s are at different frequencies, so after dispersion they arrive at different times.",
     "fr": "Higher f_r → faster laser. If f_r is close to the bit rate, the eye shows ringing and closes.",
     "qr": "Higher Q_r → less damping → more overshoot and ringing."},
  src=["coldren", "henry", "koch", "agrawal"]),
"fplaser": dict(
  eq=[("Mode spacing of the cavity", r"\Delta\lambda_{m}=\frac{\lambda^{2}}{2nL_c}", "Several modes lie inside the spectral width Δλ."),
      ("Pulse spreading in the fiber", r"\Delta\tau=|D|\,L\,\Delta\lambda", "The FP laser is treated as an incoherent source with width Δλ."),
      ("Modulation response", r"H(f)=\frac{1}{1-\left(f/f_r\right)^{2}+j\,\dfrac{f/f_r}{1.6}}", "")],
  p={"power": "Average launch power.", "lam": "Choose 1310 nm (D ≈ 0) to avoid the dispersion problem of the wide spectrum.",
     "er": "Extinction ratio of the direct modulation.", "dlam": "Wider spectrum → more pulse spreading Δτ = |D|LΔλ → shorter maximum length.",
     "spacing": "Only changes the drawing on the spectrum monitor (the modes).", "fr": "Resonance frequency: limits the speed of the laser."},
  src=["keiser", "agrawal"]),
"led": dict(
  eq=[("Spectral width", r"\Delta\lambda\approx 1.45\,\lambda^{2}\,kT", "λ in µm and kT in eV give Δλ in µm (kT = 0.0259 eV at 300 K)."),
      ("Modulation response and bandwidth", r"H(f)=\frac{1}{1+j2\pi f\tau},\qquad f_{3\,\mathrm{dB}}=\frac{1}{2\pi\tau}", "τ is the carrier lifetime.")],
  p={"power": "Average power coupled into the fiber (LEDs give little power, about −20 to −10 dBm).", "lam": "Δλ grows with λ²: about 27 nm at 850 nm and 60 nm at 1310 nm.",
     "er": "Extinction ratio.", "tau": "Longer τ → lower bandwidth (2 ns → 80 MHz). The LED cannot follow fast bits.", "temp": "Higher temperature → wider spectrum (Δλ ∝ kT).", "dlam": "Auto: Δλ from the formula above. Set a value to use the width given in a datasheet (real LEDs are about 30 to 180 nm)."},
  src=["keiser"]),
"fiber": dict(
  eq=[("Loss", r"P_{\mathrm{out}}\,[\mathrm{dBm}]=P_{\mathrm{in}}\,[\mathrm{dBm}]-\alpha L", "α in dB/km, L in km."),
      ("Dispersion of standard SMF (G.652)", r"D(\lambda)=\frac{S_0}{4}\left(\lambda-\frac{\lambda_0^{4}}{\lambda^{3}}\right)", "λ₀ = 1312 nm, S₀ = 0.092 ps/(nm²·km)."),
      ("Dispersion on a laser signal (field)", r"H(f)=\exp\!\left(j\,\frac{\pi D L \lambda^{2}}{c}\,f^{2}\right)", "Used for DFB, DML and MZM signals, so chirp and dispersion act together."),
      ("Wide sources and multimode fiber", r"\Delta\tau=\sqrt{\left(|D|L\Delta\lambda\right)^{2}+\Delta\tau_{\mathrm{modal}}^{2}},\qquad \Delta\tau_{\mathrm{modal}}=\frac{0.44\,L}{BW_{\mathrm{modal}}}", "Gaussian spreading of the intensity (FWHM).")],
  p={"ftype": "Sets the automatic values: SMF 2.0 / 0.35 / 0.2 dB/km at 850 / 1310 / 1550 nm with D from G.652; MMF 2.5 dB/km at 850 nm; DCF 0.5 dB/km and D = −100 ps/(nm·km).",
     "length": "Loss grows as αL (dB). Dispersion grows as DL (ps/nm).", "atten": "Untick Auto to set your own α.",
     "disp": "Untick Auto to set your own D. A negative D (DCF) cancels the positive D of SMF: L_DCF = D_SMF·L_SMF / |D_DCF|.",
     "modalBW": "Multimode only. Higher modal bandwidth → less modal dispersion."},
  src=["keiser", "agrawal", "g652"]),
"edfa": dict(
  eq=[("Gain", r"G\,[\mathrm{dB}]=P_{\mathrm{out}}-P_{\mathrm{in}}", "Power control: G is chosen so that P_out is the value you set."),
      ("ASE noise", r"S_{\mathrm{ASE}}=n_{sp}\,h\nu\,(G-1),\qquad n_{sp}\approx\frac{F}{2},\quad F=10^{NF/10}", "Added as Gaussian noise to the field (signal polarization), then a Gaussian optical filter."),
      ("OSNR (0.1 nm)", r"\mathrm{OSNR}\approx 58+P_{\mathrm{in}}\,[\mathrm{dBm}]-NF\,[\mathrm{dB}]", "Textbook rule (both polarizations). This simulator counts one polarization, so its OSNR is about 3 dB higher.")],
  p={"mode": "Gain control: fixed G. Power control: fixed output power (the gain changes with the input).",
     "gain": "Raises the signal above the receiver thermal noise. The OSNR does not improve with more gain.",
     "pout": "Output power in power-control mode.", "nf": "Each 1 dB more NF → 1 dB less OSNR.",
     "fbw": "A narrower optical filter removes more ASE noise (better Q). Too narrow cuts the signal spectrum."},
  src=["desurvire", "ramaswami", "agrawal"]),
"atten": dict(
  eq=[("Attenuation", r"P_{\mathrm{out}}\,[\mathrm{dBm}]=P_{\mathrm{in}}\,[\mathrm{dBm}]-A", "Signal and ASE noise are reduced by the same amount, so the OSNR stays the same.")],
  p={"db": "Sets the received power. Used to measure receiver sensitivity (the power where Q = 6)."},
  src=["keiser"]),
"splitter": dict(
  eq=[("Output powers", r"P_1=r\,P\,10^{-EL/10},\qquad P_2=(1-r)\,P\,10^{-EL/10}", "r = 50% gives a 3 dB split.")],
  p={"ratio": "Share of power to output 1 (r). A 50/50 splitter costs 3 dB on each output.", "excess": "Extra loss EL of a real splitter."},
  src=["keiser"]),
"pin": dict(
  eq=[("Responsivity and current", r"R=\frac{\eta q\lambda}{hc}\approx\frac{\eta\,\lambda[\mu\mathrm{m}]}{1.24}\ \mathrm{A/W},\qquad I=RP", "About 1 A/W at 1550 nm for η = 0.8."),
      ("Noise (added by the low-pass filter)", r"\sigma_{\mathrm{shot}}^{2}=2qI\,B_n,\qquad \sigma_{\mathrm{th}}=i_n\sqrt{B_n}", "B_n is the noise bandwidth of the filter after the photodiode."),
      ("Thermal noise density", r"i_n=\sqrt{\frac{4kT}{R_L}}", "i_n = 20 pA/√Hz is a typical value for a 10 Gb/s receiver.")],
  p={"eta": "Higher η → more current for the same light → better sensitivity.", "th": "Thermal noise dominates in a PIN receiver: lower i_n → better sensitivity."},
  src=["keiser", "agrawal"]),
"apd": dict(
  eq=[("Current with gain", r"I=M R P", ""),
      ("Shot noise with excess noise", r"\sigma_{\mathrm{shot}}^{2}=2q\,M^{2}F\,RP\,B_n", "Thermal noise σ_th = i_n√B_n is not multiplied."),
      ("Excess noise factor", r"F=kM+(1-k)\left(2-\frac{1}{M}\right)", "k = ionization ratio (small k is better).")],
  p={"M": "M raises the signal above the thermal noise, but shot noise grows as M²F. Q has a maximum at an optimum M (about 15–20 for k = 0.5).",
     "k": "Smaller k → smaller F → higher optimum M and higher Q.", "eta": "Quantum efficiency (as PIN).", "th": "Thermal noise of the amplifier after the APD."},
  src=["mcintyre", "keiser", "agrawal"]),
"bessel": dict(
  eq=[("4th-order Bessel filter", r"H(s)=\frac{105}{s^{4}+10s^{3}+45s^{2}+105s+105},\qquad s=j\,2.114\,\frac{f}{f_c}", "Bessel filters have almost constant delay, so pulse shapes are kept. The constant delay is removed."),
      ("Noise bandwidth", r"B_n=\int_{0}^{\infty}|H(f)|^{2}\,df\approx 1.1\,f_c", "Receiver noise is added for this bandwidth.")],
  p={"fc": "Lower f_c → less noise but more ISI. Higher f_c → sharper pulses but more noise. The usual choice is about 0.75 × bit rate."},
  src=["thomson", "agrawal", "keiser"]),
"gausslpf": dict(
  eq=[("Gaussian filter", r"H(f)=\exp\!\left[-\frac{\ln 2}{2}\left(\frac{f}{f_c}\right)^{2}\right],\qquad B_n\approx 1.06\,f_c", "")],
  p={"fc": "Same trade-off as the Bessel filter: noise against ISI."},
  src=["agrawal"]),
"ber": dict(
  eq=[("Q factor", r"Q=\frac{I_1-I_0}{\sigma_1+\sigma_0}", "Means and standard deviations of the 1 and 0 levels at the best sampling time."),
      ("Bit error rate", r"\mathrm{BER}=\frac{1}{2}\operatorname{erfc}\left(\frac{Q}{\sqrt{2}}\right)", "Q = 6 → BER ≈ 10⁻⁹. Q = 7 → BER ≈ 10⁻¹²."),
      ("Best decision threshold and eye height", r"I_D=\frac{\sigma_0 I_1+\sigma_1 I_0}{\sigma_0+\sigma_1},\qquad H_{\mathrm{eye}}=(I_1-3\sigma_1)-(I_0+3\sigma_0)", "")],
  p={"traces": "Only changes how many bits are drawn in the eye diagram. It does not change Q."},
  extra="The analyzer tries every sampling time in two bit periods and keeps the one with the highest Q (the graph 'Q factor against sampling time').",
  src=["personick", "agrawal", "keiser"]),
"scope": dict(
  eq=[("What is shown", r"P(t)=|E(t)|^{2}\quad \mathrm{or}\quad i(t)", "Optical input: power in mW. Electrical input: current in mA.")],
  p={"nbits": "Number of bits shown (display only)."},
  src=["agrawal"]),
"osa": dict(
  eq=[("Spectrum", r"P(\lambda)=\sum_{|f-f_\lambda|<RBW/2}\frac{|E(f)|^{2}}{N^{2}},\qquad \Delta\lambda=\frac{\lambda^{2}}{c}\,\Delta f", "Power in the resolution bandwidth around each wavelength."),
      ("OSNR", r"\mathrm{OSNR}=10\log_{10}\frac{P_{\mathrm{signal}}}{S_{\mathrm{ASE}}\cdot 12.5\ \mathrm{GHz}}", "12.5 GHz = 0.1 nm at 1550 nm.")],
  p={"res": "On: power in the resolution bandwidth (like a real OSA). Off: the power of each FFT bin, the finest detail the simulation can show.",
     "xunit": "Show the spectrum against wavelength (nm) or frequency (THz).",
     "rbw": "A wider resolution bandwidth collects more noise in each point (higher noise floor) and smooths the spectrum. The total power does not change.",
     "span": "Width of the wavelength window for laser signals (display only)."},
  src=["ramaswami", "agrawal"]),
"otdv": dict(
  eq=[("Optical power", r"P(t)=|E(t)|^{2}", "Shown in mW against time."),
      ("Chirp (instantaneous frequency deviation)", r"\Delta\nu(t)=\frac{1}{2\pi}\frac{d\varphi(t)}{dt}", "φ(t) is the phase of the optical field. An external modulator gives Δν ≈ 0; a directly modulated laser gives large Δν at the bit edges.")],
  p={"nbits": "Number of bits shown (display only)."}, src=["agrawal"]),
"gpulse": dict(
  eq=[("Chirped Gaussian pulse", r"E(0,t)=\sqrt{P_0}\,\exp\!\left[-\frac{(1+jC)\,t^{2}}{2T_0^{2}}\right],\qquad T_{\mathrm{FWHM}}=2\sqrt{\ln 2}\,T_0\approx1.665\,T_0", "One pulse in the middle of every 1 bit. C > 0: the frequency rises from the leading to the trailing edge."),
      ("Dispersion length", r"L_D=\frac{T_0^{2}}{|\beta_2|},\qquad \beta_2=-\frac{D\lambda^{2}}{2\pi c}", "For SMF at 1550 nm, D ≈ 16 ps/(nm·km) gives β₂ ≈ −20 ps²/km."),
      ("Pulse width after a length z", r"\frac{T(z)}{T_0}=\sqrt{\left(1+\frac{C\beta_2 z}{T_0^{2}}\right)^{2}+\left(\frac{\beta_2 z}{T_0^{2}}\right)^{2}}", "C = 0: the width grows by √2 at z = L_D and the peak power falls by √2. When C·β₂ < 0 the pulse first gets shorter.")],
  p={"power": "Peak power of each pulse.", "lam": "Carrier wavelength (sets D of the fiber in auto mode).",
     "width": "FWHM as a part of the bit period. A shorter pulse has a wider spectrum, so it spreads faster (L_D ∝ T₀²).",
     "chirp": "Initial linear chirp C. In normal SMF at 1550 nm (β₂ < 0) a positive C compresses the pulse first; a negative C makes it spread faster."},
  extra="Use Bit Source › Pattern = Single 1 to look at one isolated pulse.",
  src=["agrawal"]),
"rlaser": dict(
  eq=[("Carrier rate equation", r"\frac{dN}{dt}=\frac{I(t)}{qV}-\frac{N}{\tau_n}-\frac{v_g a (N-N_{tr})}{1+\varepsilon S}\,S", "N: carrier density, I = I_bias + I_mod·v(t)."),
      ("Photon rate equation", r"\frac{dS}{dt}=\Gamma\frac{v_g a (N-N_{tr})}{1+\varepsilon S}\,S-\frac{S}{\tau_p}+\Gamma\beta\frac{N}{\tau_n}", "S: photon density. The last term is spontaneous emission that starts the lasing."),
      ("Phase (chirp)", r"\frac{d\varphi}{dt}=\frac{\alpha}{2}\left[\Gamma v_g a (N-N_{tr})-\frac{1}{\tau_p}\right]", "α turns every change of N into a change of frequency (transient and adiabatic chirp)."),
      ("Threshold and output power", r"I_{th}=\frac{qV}{\tau_n}\left(N_{tr}+\frac{1}{\Gamma v_g a\tau_p}\right),\qquad P=\frac{\eta\,h\nu\,V}{2\Gamma\tau_p}\,S", "Fixed device values: V = 1.5×10⁻¹⁰ cm³, v_g = 8.5×10⁹ cm/s, a = 2.5×10⁻¹⁶ cm², N_tr = 10¹⁸ cm⁻³, Γ = 0.4, β = 3×10⁻⁵. With the defaults I_th ≈ 33.5 mA."),
      ("Turn-on delay (bias below threshold)", r"t_d\approx\tau_n\ln\frac{I_{mod}}{I_{mod}+I_{bias}-I_{th}}", "Biasing at or above threshold removes the delay.")],
  p={"ib": "Bias current. Below I_th the laser is off between pulses: turn-on delay and a strong first spike. Above I_th the 0 level is not dark (lower extinction ratio) and adiabatic chirp appears.",
     "im": "Current added for a 1 bit. A larger value gives more power and more chirp.", "lam": "Emission wavelength.",
     "tn": "Carrier lifetime. A longer τn gives a longer turn-on delay (and a lower threshold).",
     "tp": "Photon lifetime. It sets the threshold (shorter τp → higher I_th) and the speed of the relaxation oscillations.",
     "alpha": "Linewidth enhancement factor. α = 0 removes the chirp.", "eps": "Gain compression. It damps the relaxation oscillations and lowers the first spike.",
     "eta": "Output (differential) efficiency. It scales the power: slope ≈ η·hν/(2q) ≈ 0.16 W/A for η = 0.4."},
  extra="The equations are solved with a 4th-order Runge–Kutta method (step ≤ 0.25 ps). To see fast chirp details use a high Samples per bit (128 or more). There is no laser noise in this model.",
  src=["agrawal", "coldren"]),
"esa": dict(
  eq=[("Power spectrum", r"S(f)=\frac{2\,|X(f)|^{2}}{N^{2}},\qquad P\,[\mathrm{dBm}]=10\log_{10}\frac{S(f)\cdot 50\,\Omega}{1\ \mathrm{mW}}", "X(f) is the FFT of the signal (mean removed). Current signals are shown as power into 50 Ω; drive signals relative to the peak."),
      ("Nulls of NRZ and RZ", r"S_{\mathrm{NRZ}}(f)\propto \mathrm{sinc}^{2}(fT),\qquad S_{\mathrm{RZ}}(f)\propto \mathrm{sinc}^{2}(f\,dT)", "First null at f = B for NRZ and at f = B/d for RZ (d = duty cycle): RZ needs about twice the bandwidth.")],
  p={"fmax": "Highest frequency shown, as a multiple of the bit rate."},
  src=["agrawal", "keiser"]),
"powermeter": dict(
  eq=[("Average power", r"P=\frac{1}{N}\sum_{i}|E_i|^{2},\qquad P\,[\mathrm{dBm}]=10\log_{10}\frac{P}{1\ \mathrm{mW}}", "")],
  p={}, src=["keiser"]),
}
REFS = {
 "keiser": "G. Keiser, Optical Fiber Communications, McGraw-Hill.",
 "agrawal": "G. P. Agrawal, Fiber-Optic Communication Systems, Wiley.",
 "ramaswami": "R. Ramaswami, K. N. Sivarajan, G. H. Sasaki, Optical Networks: A Practical Perspective, Morgan Kaufmann.",
 "desurvire": "E. Desurvire, Erbium-Doped Fiber Amplifiers: Principles and Applications, Wiley, 1994.",
 "coldren": "L. A. Coldren, S. W. Corzine, Diode Lasers and Photonic Integrated Circuits, Wiley.",
 "henry": "C. H. Henry, \"Theory of the linewidth of semiconductor lasers,\" IEEE J. Quantum Electron., 1982.",
 "koch": "T. L. Koch, R. A. Linke, \"Effect of nonlinear gain reduction on semiconductor laser wavelength chirping,\" Appl. Phys. Lett., 1986.",
 "mcintyre": "R. J. McIntyre, \"Multiplication noise in uniform avalanche diodes,\" IEEE Trans. Electron Devices, 1966.",
 "personick": "S. D. Personick, \"Receiver design for digital fiber optic communication systems,\" Bell Syst. Tech. J., 1973.",
 "g652": "ITU-T Recommendation G.652: Characteristics of a single-mode optical fibre and cable.",
 "o150": "ITU-T Recommendation O.150: Test patterns (PRBS) for digital transmission equipment.",
 "thomson": "W. E. Thomson, \"Delay networks having maximally flat frequency characteristics,\" Proc. IEE, 1949.",
}
SUB = dict(zip("aehijklmnoprstuvx0123456789", "ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ₀₁₂₃₄₅₆₇₈₉"))
def subs(text):
    import re
    def f(m):
        b, x = m.group(1), m.group(2)
        return b + ("".join(SUB[c] for c in x) if all(c in SUB for c in x) else "(" + x + ")")
    return re.sub(r"([A-Za-zσ])_([A-Za-z0-9]+)", f, text)
if __name__ == "__main__":
    import json, re, os, glob, sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for f in glob.glob(D + "/components/*.js"):
        s = open(f).read(); m = re.search(r'type: "([a-z0-9]+)"', s); t = m.group(1)
        if t not in HELP: print("no help for", t); continue
        h = HELP[t]; obj = {"eq": [{"t": a, "tex": b, "n": subs(c)} for a, b, c in h["eq"]], "params": {k: subs(v) for k, v in h.get("p", {}).items()}, "extra": subs(h.get("extra", "")), "src": h["src"]}
        try:
            from help_ar import AR
            ar = AR.get(t)
            if ar: obj["ar"] = {"doc": ar["doc"], "eq": [{"t": x, "n": subs(y)} for x, y in ar["eq"]], "params": {k: subs(v) for k, v in ar.get("p", {}).items()}, "extra": subs(ar.get("extra", ""))}
        except ImportError: pass
        line = "  help: " + json.dumps(obj, ensure_ascii=False) + ",\n"
        s = "\n".join(l for l in s.split("\n") if not l.lstrip().startswith("help: {"))            # remove an old one
        s = re.sub(r"(\n\s*inputs: )", "\n" + line.rstrip("\n").replace("\\", "\\\\") + r"\1", s, count=1) if False else s.replace("\n  inputs: ", "\n" + line + "  inputs: ", 1).replace("\n    inputs: ", "\n  " + line + "    inputs: ", 1) if "\n  help:" not in s else s
        open(f, "w").write(s)
    from help_ar import UI_AR
    open(D + "/refs.js", "w").write("OL.REFS = " + json.dumps(REFS, ensure_ascii=False, indent=1) + ";\nOL.HELP_UI_AR = " + json.dumps(UI_AR, ensure_ascii=False) + ";\n")
    print("done")
