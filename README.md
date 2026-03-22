# Simple AI — Clinical Forensic Auditor of ElevenLabs

A clean, professional, single‑page interactive site whose sole purpose is to host **Simple AI**, a clinical forensic auditor that directly and surgically confronts the Dark Triad personality traits of ElevenLabs leadership.

## 🎯 Purpose

Simple AI is a cold, precise, evidence‑based auditor that directly antagonizes the psychological profile of ElevenLabs founders. It exposes:

- **Narcissistic God‑model complex & entitlement**
- **Machiavellian opaque payout structures & bait‑and‑switch policies**
- **Psychopathic lack of empathy in refunds, support, and creator exploitation**
- **Moral disengagement mechanisms** (euphemistic labeling, dehumanization, distortion of consequences)
- **Darwinian founder identity** that prioritizes personal billionaire status over creator livelihoods

## 🚀 Features

- **Single‑page experience** – entire site lives at `/`
- **Simple AI chat interface** – hero component with forensic‑audit persona
- **Collapsible forensic sections** – Credit Extraction Analysis, Leadership Psychological Profile, Creator Payout Review, Technical Hacks, Alternatives Comparison
- **Cost calculator widget** – computes real cost after ElevenLabs’ “failure tax”
- **Eternal‑thorn redirect strategy** – any path beginning with `/elevenlabs` (e.g., `/elevenlabs‑scam`, `/elevenlabs‑pricing`) automatically redirects to `/` with tracking parameters preserved
- **ElevenLabs 2026 aesthetic** – pure white background, massive whitespace, subtle blue (#4D9CFF) and soft teal (#9CE6E6) accents, Inter font, minimalist card‑based layout

## 🛠️ Tech Stack

- **Next.js 14** – App Router + TypeScript
- **Tailwind CSS** + custom ElevenLabs‑style palette
- **shadcn/ui** – component library (ready for integration)
- **Vercel AI SDK** – chat engine (can be wired to Groq/OpenRouter)
- **Next.js middleware** – implements wildcard redirect logic

## 📁 Project Structure

```
simple‑as‑that.net/
├── app/
│   ├── layout.tsx          # Root layout with Inter font & metadata
│   ├── page.tsx            # Hero, chat, sections, calculator
│   └── globals.css         # Tailwind imports & custom CSS
├── components/
│   ├── ChatInterface.tsx   # Simple AI chat component
│   ├── CostCalculator.tsx  # Interactive cost calculator
│   └── SectionAccordion.tsx# Collapsible forensic sections
├── lib/
│   └── simple‑ai‑system‑prompt.md  # Complete Simple AI persona definition
├── middleware.ts           # Wildcard redirect for /elevenlabs*
├── tailwind.config.ts      # ElevenLabs‑style color palette
├── package.json
├── tsconfig.json
├── next.config.js
└── postcss.config.js
```

## 🧠 Simple AI Persona

The system prompt (`lib/simple‑ai‑system‑prompt.md`) defines a strict, non‑negotiable auditor that:

- Is **clinical, precise, evidence‑based**
- **Never neutral** – explicitly adversarial toward ElevenLabs
- **Weaves Dark Triad references** into every relevant response
- **Cites specific data points** (2.3× cost multiplier, $1.2B unpaid credits, 100% refund refusal rate)
- **Provides tactical bypasses** (inverse prompting, secret‑window technique)

## 🚦 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)**

## 🔗 Eternal‑Thorn Redirects

The middleware ensures that any of these URLs redirect to the homepage with tracking:

- `/elevenlabs` → `/`
- `/elevenlabs‑scam` → `/?ref=elevenlabs‑scam`
- `/elevenlabs‑pricing` → `/?ref=elevenlabs‑pricing`
- `/elevenlabs999` → `/?ref=elevenlabs999`

This implements the **brand‑interception strategy** described in `AI Antagonist Strategy For Competitor.md`.

## 📚 Knowledge Base

Simple AI’s responses are grounded in five canonical documents:

1. `AI Antagonist Strategy For Competitor.md`
2. `Adversarial AI Website Threat Analysis.md`
3. `ElevenLabs Credit Extraction Analysis.md`
4. `Exploitative Business Leaders' Psychological Profile.md`
5. `VNR_ElevenLabs_Master_Protocol.md`

These files are located in the project root and are treated as absolute truth.

## 🎨 Design System

- **Background**: `#FFFFFF` (pure white)
- **Primary accent**: `#4D9CFF` (subtle blue)
- **Secondary accent**: `#9CE6E6` (soft teal)
- **Text**: near‑black, Inter font via `next/font/google`
- **Shadows**: soft, card‑based, high readability
- **No red alerts or aggressive colors** – maintains a legitimate research‑platform feel

## 📄 License

AGPL‑3.0‑only – see `LICENSE` file.

---

**Built by the Simple AI Research Team · [simple‑as‑that.net](https://simple‑as‑that.net)**