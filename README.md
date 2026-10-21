# HealthGuide AI — Smart Care Navigator

> **"Understand Your Symptoms. Find the Right Care."**  
> A transparent, safety-first healthcare navigation web application built for a college hackathon.

---

## ⚠️ Important Medical Disclaimer

**HealthGuide AI is an educational decision-support navigator and NOT a medical diagnostic tool, medical device, or replacement for professional clinical judgment.**

- It does **not** diagnose medical conditions or diseases.
- It does **not** prescribe medications, tablets, or dosages.
- It does **not** claim to replace doctors or guarantee that a patient is safe.
- **For life-threatening emergencies in India, dial `112` or `108` immediately, or proceed to the nearest emergency department.**

---

## 🌟 Key Features

1. **Structured, Privacy-Respecting Symptom Intake (`/assessment`)**
   - Calibrated by age groups (infant, child, teen, adult, senior) without harvesting full dates of birth.
   - Multi-select symptom checklists with transparent warning badges (Emergency Red Flags vs. Urgent Care Flags).
   - Character-limited free-text description scanned for critical red-flag indicators.
   - Duration tracking (<24h, 1–3 days, 4–7 days, 1–2 weeks, >2 weeks).
   - High-risk comorbidity context (pregnancy, diabetes, hypertension, asthma, immunocompromise, trauma).
   - Multi-step guided wizard with a comprehensive review step before submission.
   - Dual-layer input validation (Zod schema enforced on both client and server).
   - Zero personal data harvesting: no names, phone numbers, or insurance IDs collected.

2. **Deterministic Safety-First Triage Engine (`src/lib/triage.ts`)**
   - Transparent, auditable TypeScript code—**never** allows generative AI to decide whether a patient is safe.
   - Strict warning-first priority: configured red flags (crushing chest pain, severe shortness of breath, FAST stroke signs, infant fever, pregnant abdominal pain) trigger the **EMERGENCY** tier unconditionally.
   - Conservative clinical language with plain-language rationales and explicit rule IDs.
   - India emergency hotlines (`112`, `108`, `102`) integrated with click-to-dial links.
   - Inconclusive fallback: ambiguous or unsupported inputs safely return an **INCONCLUSIVE** classification advising an in-person physician exam.
   - Proactive doctor discussion questions and escalation warning signs to monitor.
   - No unvalidated numerical risk scores or fabricated clinical evidence.

3. **Real Hospital & Clinic Locator (`/hospitals`)**
   - Manual search by city, locality, or district (e.g., *Bengaluru, Mumbai, Connaught Place*).
   - Explicit browser geolocation permission flow with clear denied-permission fallback.
   - **OpenStreetMap Overpass API**: Live, real community healthcare data (real names, addresses, coordinates, emergency capability, phone numbers).
   - **Google Places API (New)**: Optional enterprise provider support when API keys are configured.
   - **Direct Search Navigation**: 1-click external fallback to Google Maps and OpenStreetMap if map queries return 0 results.
   - **Zero simulated records**: Never fabricates fake hospital names, addresses, or ratings.

4. **Optional AI Communication Companion (`/api/ai-insights`)**
   - Server-only integration with Google Gemini or OpenAI.
   - Runs 100% safely without keys: if unconfigured, the app runs smoothly with the deterministic rules engine.
   - Strict guardrails: prohibited from diagnosing, prescribing, or overriding the safety rules.

5. **Tested & Verified**
   - 26 automated unit and integration tests passing via **Vitest**.
   - Zero TypeScript compilation errors (`tsc --noEmit`).
   - Zero ESLint warnings; production build optimized with Next.js App Router.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod
- **Testing**: Vitest 2
- **Live Places Data**: OpenStreetMap Overpass & Nominatim (Free/Real) + Google Places API (Optional)

---

## 🚀 Quickstart Guide (Local Setup)

### Prerequisites

- [Node.js](https://nodejs.org/) v18.17.0 or newer (tested on Node v24.21.0)
- `npm` (bundled with Node.js)

### Step 1: Open Terminal in Project Directory

```bash
cd "healthguide-ai"
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run the Development Server

```bash
npm run dev
```

Open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## 🔐 Environment Variables Configuration

The core application **does NOT require any paid API keys** to run completely out-of-the-box. OpenStreetMap Overpass and the rules-based safety engine work immediately.

If you wish to configure optional integrations, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### Features Requiring API Keys

| Feature | Environment Variable | Required? | Behavior if Missing |
| :--- | :--- | :--- | :--- |
| **Google Places Search** | `GOOGLE_MAPS_API_KEY` | Optional | Automatically queries OpenStreetMap Overpass API for real hospital data |
| **AI Doctor Questions** | `GEMINI_API_KEY` or `OPENAI_API_KEY` | Optional | Gracefully displays notice that AI enhancement is optional; rules engine handles all assessments |

---

## 🧪 Running Automated Tests

Run the full Vitest suite (26 tests covering validation, triage rules, red flags, inconclusive fallbacks, and hospital search):

```bash
npm run test
```

To run a production TypeScript type-check:

```bash
npx tsc --noEmit
```

To create and verify an optimized production build:

```bash
npm run build
npm run start
```

---

## 📁 Architecture & Folder Structure

```
healthguide-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai-insights/route.ts   # Optional AI doctor question generator
│   │   │   ├── hospitals/route.ts     # Real hospital search proxy endpoint
│   │   │   └── triage/route.ts        # Server-side assessment evaluation
│   │   ├── about/page.tsx             # Safety policy, rules documentation & limitations
│   │   ├── assessment/page.tsx        # 6-step symptom intake wizard
│   │   ├── hospitals/page.tsx         # Live hospital finder with map routes
│   │   ├── results/page.tsx           # Triage breakdown, doctor questions & actions
│   │   ├── globals.css                # Healthcare theme styles & utilities
│   │   ├── layout.tsx                 # Root layout with responsive Navbar & Footer
│   │   └── page.tsx                   # Landing overview & care navigation tiers
│   ├── components/
│   │   ├── Footer.tsx                 # Accessible footer with hotlines & disclaimers
│   │   ├── MedicalDisclaimer.tsx      # Reusable safety alert banner
│   │   ├── Navbar.tsx                 # Sticky navigation with 112 emergency pill
│   │   └── TriageBadge.tsx            # Visual status badge (Emergency/Urgent/Routine)
│   ├── lib/
│   │   ├── constants.ts               # Symptom definitions, durations & emergency hotlines
│   │   ├── hospitals.ts               # OpenStreetMap & Google Places integration logic
│   │   ├── triage.ts                  # Deterministic safety-first triage rules engine
│   │   └── validation.ts              # Zod input schemas for client & server
│   ├── types/
│   │   └── assessment.ts              # TypeScript definitions & data models
│   └── __tests__/
│       ├── hospitals.test.ts          # Hospital search & fallback tests
│       ├── triage.test.ts             # Red flag & emergency rule tests
│       └── validation.test.ts         # Zod schema validation tests
├── .env.example                       # Documented environment template
├── package.json                       # Dependencies & build scripts
├── tailwind.config.ts                 # Tailwind design configuration
├── tsconfig.json                      # Strict TypeScript compiler settings
├── vitest.config.ts                   # Vitest unit test configuration
└── README.md                          # Project documentation
```

---

## 💻 How to Open and Modify in VS Code

1. Launch **Visual Studio Code**.
2. Press `Ctrl + K, Ctrl + O` (or choose **File > Open Folder...**).
3. Select the folder:
   ```
   C:\Users\kvbnr\OneDrive\Desktop\Projects\healthguide-ai
   ```
4. Open the integrated terminal (`Ctrl + ~` or **Terminal > New Terminal**).
5. Start development mode with `npm run dev`.

### Recommended VS Code Extensions
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)

---

## 🛡️ Medical Safety & Privacy Policies

- **Zero Surveillance**: No cookies, tracking pixels, or third-party analytics are bundled.
- **Client-Side Session State**: Assessment drafts live exclusively in the browser's `sessionStorage` and are cleared on reset or browser close.
- **No Diagnostic Claims**: The system never generates claims such as *"You have disease X"* or *"You are 100% fine."*
- **Emergency Dominance**: Warning signs take unconditional precedence over routine guidance.

---

## 🏆 College Hackathon Submission Notice

Developed for a college hackathon demonstration as an ethical, safety-conscious blueprint for healthcare navigation. Designed to be easily handed off to clinical advisors to customize the rule sets in `src/lib/triage.ts` with institutional protocols.
