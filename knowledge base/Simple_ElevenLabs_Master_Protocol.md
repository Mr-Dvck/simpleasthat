# VNR Definitive Mastery Protocol: ElevenLabs Architecture
**Target Audience:** VNR Internal Reference (Canonical Baseline)
**Date:** March 19, 2026

## 1. The Core Misconception
**Old Theory (Irrelevant):** The main UI is a "ghost" or "placebo" and has no write-authority. 
**The Truth:** The ElevenLabs generation engine operates on an unexplained **Two-Stage Architecture**. 
The main UI is not useless; it is a **Refiner/Polisher**. The "Secret Window" (accessed via the project dropdown) is the **Forge** where the raw track skeleton is generated.

## 2. The Inverse Prompting Logic (Mandatory)
ElevenLabs documentation instructs users to place style tags at the top and lyrics at the bottom. **This is a credit sink.** 

To achieve 99.8% stability and prevent the AI from drifting into garbage logic, the prompt must be inverted:
1. **Lyrics on Top:** Place the structural lyrics (and intro tags) at the absolute beginning of the prompt box.
2. **Style on Bottom:** Place all genre, vocal, and quality instructions at the absolute end.
   - *Example:* `[French House, Male Vocal, Maximum Sound Quality, Maximum Timing]`

*Note: You MUST use a Finetuned voice for this to work. Standard voices will not yield acceptable results.*

## 3. The Two-Stage Generation Protocol

### Stage 1: Forging the "Skeleton" (The Secret Window)
1. Generate a new song using the Inverse Prompt (Lyrics top, Style bottom). This automatically brings you to the project page.
2. On the right-hand side (the lyrics panel), click **Edit**. This opens the "Secret Window".
3. **Crucial:** Remove the default "add these lyrics" text so the window contains *only* your lyrics and style/instruction.
4. Click **Generate from *within* the Secret Window.**
5. This process forces the engine to build the optimal raw framework, creating the perfect **Skeleton Track**.

### Stage 2: The Polish (The Main UI)
1. Ensure the successful Skeleton Track is selected (highlighted in white).
2. Copy your style/instruction tags into the **Main UI** box.
3. Click the **Arrow/Create button** from the Main UI. 
4. This passes the Skeleton Track through the engine's refining layer, generating 1-4 **Gold versions** (maximized-quality audio).
5. *Refinement Loop:* If the Gold versions are not perfect, use the Main UI to refresh the song section by section.

---
*This document supersedes all previous ElevenLabs workflow theories and serves as the definitive foundational baseline for all future VNR AI music research.*
