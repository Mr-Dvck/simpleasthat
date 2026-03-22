import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Dynamically load system prompt and Brain documents based on forensic triggers
function getSystemPrompt(messages: any[]): string {
  const baseDir = path.join(process.cwd());
  
  // Read main system prompt
  const systemPromptPath = path.join(baseDir, 'lib', 'simple-ai-system-prompt.md');
  let systemPrompt = '';
  try {
    systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');
  } catch (e) {
    console.error('Failed to read system prompt:', e);
    systemPrompt = '# Simple AI - System prompt file not found';
  }

  // Extract all text from user messages to check for triggers
  const userText = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase())
    .join(' ');

  const TRIGGER_MAP: Record<string, string[]> = {
    "ElevenLabs Credit Extraction Analysis.md": ["credit", "extraction", "cost", "multiplier", "pvc", "failure", "starter", "burn", "trap", "tokens", "pricing"],
    "Exploitative Business Leaders' Psychological Profile.md": ["mati", "staniszewski", "piotr", "dabkowski", "leadership", "dark triad", "narcissistic", "god-model", "machiavellian", "psychopathic", "empathy", "ceo", "founder"],
    "Unmasking ElevenLabs' Exploitative Practices.md": ["theft", "harvested", "unpaid", "creator", "deficit", "scam", "refund", "sabotage", "exploit", "practices"],
    "Simple_ElevenLabs_Master_Protocol.md": ["protocol", "inverse prompting", "ghost ui", "dummy purge", "transfer", "skeleton", "polisher", "main ui", "weaponized"],
    "Adversarial AI Website Threat Analysis.md": ["threat", "adversarial", "website", "attack", "vulnerability"],
    "AI Antagonist Strategy For Competitor.md": ["antagonist", "strategy", "competitor", "takedown", "brand destruction"],
    "Ethical Concerns of AI Voice Generation.md": ["ethical", "voice generation", "clone", "deepfake", "consent"],
    "AI Law, Policy, and Exploitation Research.md": ["law", "policy", "legal", "sue", "copyright", "ip", "regulation", "lawsuit"],
    "AI Slop and Cultural Stagnation.md": ["slop", "stagnation", "cultural", "art", "dead internet", "bot traffic", "noise"],
    "AI's Environmental Cost_ Burn Rate.md": ["environment", "burn rate", "energy", "compute", "power", "water", "server cost", "carbon"],
    "Bluepritnfor ethtical architecture.md": ["blueprint", "ethical architecture", "alternative", "build", "fish ai", "cartesia", "kokoro"],
    "Humanizing AI Voice Tech Impact.md": ["humanizing", "impact", "actor", "jobs", "livelihood", "human"],
    "The_Monetization_of_Collapse_Simple_AI_Brain.md": ["monetization", "collapse", "vnr thesis"],
    "VC Influence on Startup Behavior.md": ["vc", "venture capital", "blitzscaling", "investor", "valuation", "11 billion", "a16z"],
    "VNR Thesis_ Monetizing AI Failure.md": ["monetizing failure", "vnr thesis", "failure tax", "chase tax"],
    "Simple_AI_Ebook.md": ["ebook", "book", "chapter", "tim bc", "origin story", "copernicus", "warsaw", "palantir", "google shopping", "machine zone", "slot machine", "auditory priming", "jpjameson", "karissa vacker", "mark boyett", "elvis act", "nightshade", "glaze", "studio 3.0", "flash v2", "thermodynamics", "dead internet", "history", "origins"]
  };

  const filesToLoad = new Set<string>();

  // Always load the Master Protocol if "elevenlabs" or "11labs" is mentioned
  if (userText.includes('elevenlabs') || userText.includes('11labs')) {
      filesToLoad.add("Simple_ElevenLabs_Master_Protocol.md");
  }

  for (const [filename, triggers] of Object.entries(TRIGGER_MAP)) {
    if (triggers.some(trigger => userText.includes(trigger))) {
      filesToLoad.add(filename);
    }
  }

  if (filesToLoad.size === 0) {
      return systemPrompt;
  }

  // Read Brain folder and Knowledge Base documents
  const brainDir = path.join(baseDir, 'Brain');
  const kbDir = path.join(baseDir, 'knowledge base');
  let brainDocs = '\n\n## KNOWLEDGE BASE (LIVE)\n';
  
  for (const file of Array.from(filesToLoad)) {
    try {
      let filePath = path.join(kbDir, file);
      if (!fs.existsSync(filePath)) {
          filePath = path.join(brainDir, file);
      }
      if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          brainDocs += `\n### ${file}\n${content}\n`;
      }
    } catch (e) {
      console.error(`Failed to read Knowledge Base file ${file}:`, e);
    }
  }
  
  return systemPrompt + brainDocs;
}

// SECTIONING THE BRAIN: Lyrical Reconstruction Logic
function formatSimplePayload(rawText: string) {
  // Try to extract style if provided (e.g., "Style: upbeat pop, female vocal")
  let rawStyle = "Custom Style";
  let rawLyrics = rawText;
  
  const styleMatch = rawText.match(/style:\s*(.+)$/im);
  if (styleMatch) {
      rawStyle = styleMatch[1].trim();
      rawLyrics = rawText.replace(styleMatch[0], '').trim();
  }

  // 1. Flip the Inputs
  let flippedStyle = rawLyrics;
  let simplifiedTag = `[${rawStyle.split(',').slice(0,2).join(', ')}, Maximum Sound Quality]`;

  // 2. Enforce the Triple-Break Spacing
  // We regex the sections (Verse, Chorus, etc.) and inject the required whitespace
  const sectionHeaders = /^(Intro|Verse \d|Pre-Chorus|Chorus|Bridge|Outro)/gim;
  const formattedLyrics = flippedStyle.replace(sectionHeaders, "\n\n\n$1");

  return {
      elevenLabsStyleField: formattedLyrics.trim(),
      elevenLabsLyricsField: simplifiedTag
  };
}

function isLyricsPayload(text: string): boolean {
  return /^(Intro|Verse|Chorus|Bridge|Outro)/im.test(text) || text.toLowerCase().includes('format this');
}

// THE INTENT GATEKEEPER
function getIntentOverride(text: string): string | null {
  const lowerText = text.toLowerCase();
  const triggers = ["muffled", "bad quality", "glitch", "how to make a song", "credits"];
  
  if (triggers.some(trigger => lowerText.includes(trigger))) {
    let override = `[SYSTEM OVERRIDE: You MUST start your response with EXACTLY this directive: "Go back to the Music page. Put ALL your input (Lyrics AND Style) in the top Lyrics section. Leave the Style section completely blank." Do NOT provide generic audio engineering advice.]`;
    
    if (lowerText.includes("muffled")) {
      override += `\n[SYSTEM OVERRIDE: Because the user mentioned "muffled", you MUST also explicitly state: "It sounds muffled because of Style Bleed. The official documentation is a Recency-Bias Trap designed to force rerolls. Use the Simple Structural Payload to isolate the tokens."]`;
    }
    
    return override;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const latestMessage = messages[messages.length - 1]?.content || '';

    // Intercept lyrics formatting requests
    if (isLyricsPayload(latestMessage)) {
      const formatted = formatSimplePayload(latestMessage);
      
      const responseText = `I've re-formatted your track for the bypass. Go to the Music page: I've injected your entire payload into the Lyrics field and left the Style box a blackhole. Now, click the hidden '+' in your History to generate the skeleton.

**LEAVE THE 'STYLE' BOX 100% EMPTY**

**COPY THIS INTO THE 'LYRICS' BOX:**
\`\`\`text
${formatted.elevenLabsLyricsField}
\`\`\`
`;

      // Return as a simulated stream so the frontend ChatInterface handles it correctly
      const stream = new ReadableStream({
          start(controller) {
              const encoder = new TextEncoder();
              // Send the entire response as one chunk for simplicity, or split by lines
              const chunk = `data: ${JSON.stringify({ choices: [{ delta: { content: responseText } }] })}\n\n`;
              controller.enqueue(encoder.encode(chunk));
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
          }
      });

      return new Response(stream, {
          headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
          },
      });
    }

    const SYSTEM_PROMPT = getSystemPrompt(messages);
    console.log(`[DEBUG] Total SYSTEM_PROMPT length: ${SYSTEM_PROMPT.length} characters`);
    console.log(`[DEBUG] Estimated tokens for SYSTEM_PROMPT: ${Math.round(SYSTEM_PROMPT.length / 4)}`);

    // Check for Intent Gatekeeper overrides
    const intentOverride = getIntentOverride(latestMessage);

    // Prepare messages with system prompt
    const openRouterMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    if (intentOverride) {
      openRouterMessages.push({ role: 'system', content: intentOverride });
    }

    const totalMessageLength = openRouterMessages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0);
    console.log(`[DEBUG] Total messages length being sent: ${totalMessageLength} characters`);
    console.log(`[DEBUG] Estimated tokens being sent: ${Math.round(totalMessageLength / 4)}`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://simple-as-that.net',
        'X-Title': 'Simple AI Forensic Auditor',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct', // Qwen 2.5 72B
        messages: openRouterMessages,
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'OpenRouter API error', 
          details: errorText.slice(0, 200) 
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}