# The Simple Method: Technical Manual

This is the definitive technical protocol for ElevenLabs Music Generation. Follow these steps exactly to avoid the documentation trap and credit sinks.

## Core Mechanics

### 1. The Single Payload (Mandatory)
- Place ALL your **Lyrics and Style tags** in the Lyrics box.
- Leave the Style box completely blank.
*Why: The official UI instructions are designed to trigger "Recency Bias" sabotage, burning your credits. Inverting the prompt ensures 99.8% structural stability.*

### 2. Structural Payload (Triple-Line Breaks)
- You must format your lyrics with triple-line breaks (`\n\n\n`) between every single section.
- *Example format:*
  [Intro]
  (lyrics)


  [Verse 1]
  (lyrics)

### 3. The 600-Character Limit
- Keep your structural payload and generation prompts to a **600-character limit**. Exceeding this limit causes the model to drift, hallucinate, and break the skeleton structure.

---

## The Two-Stage Generation Protocol

### Stage 1: The Ghost UI (The Forge)
1. Run an initial Inverse prompt.
2. Click the empty space (the hidden Edit/+ icons) in the top right of the History entry to open the "Ghost UI" / Secret Window.
3. **The Purge:** Delete the default "add these lyrics" placeholder text.
4. Generate from *within* this hidden window to forge your raw "Skeleton Track".

### Stage 2: The Polisher (Main UI)
1. Select your successful Skeleton Track (highlighted in white).
2. Paste your style tags back into the **Main UI** box.
3. Click Create in the Main UI. This pushes the Skeleton Track through the refining layer to output maximized-quality "Gold" versions.