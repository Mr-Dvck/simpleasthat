import React from 'react';

export default function SidebarManual() {
  return (
    <aside className="w-[320px] bg-white text-zinc-800 max-h-[80vh] overflow-y-auto border border-zinc-100 p-7 rounded-[28px] shadow-[0_10px_40px_-15px_rgb(0,0,0,0.1)] flex flex-col z-10 shrink-0 relative">
      <div className="mb-8 pb-5 border-b border-zinc-100">
        <h2 className="text-[22px] font-black tracking-[-1px] text-zinc-900 leading-tight uppercase">ElevenLabs Music</h2>
        <h3 className="text-[14px] font-bold text-blue-600 mt-0.5 tracking-tight uppercase">The Simple Method</h3>
        <p className="text-[10px] text-zinc-400 mt-1.5 uppercase tracking-widest font-bold">Definitive Technical Protocol</p>
      </div>

      <div className="space-y-8 text-sm flex-grow">
        <section>
          <h3 className="text-zinc-900 font-bold uppercase mb-2 flex items-center gap-2 tracking-tight">
            The Single-Payload Architecture
          </h3>
          <p className="text-zinc-600 leading-relaxed mb-3">
            <strong className="text-zinc-800">Mandatory:</strong> Leave the 'Style' box 100% empty.<br/>
            <strong className="text-zinc-800">Action:</strong> Paste BOTH Lyrics and Style Tags into the Lyrics section only.
          </p>
          <div className="text-[11px] text-zinc-500 italic border-l-[3px] border-blue-100 pl-3 py-1 bg-blue-50/30 rounded-r-md mb-4">
            <strong className="text-blue-600 font-bold not-italic">Anchor:</strong> Style tags must be at the absolute bottom of the text.
          </div>
        </section>

        <section>
          <h3 className="text-zinc-900 font-bold uppercase mb-2 flex items-center gap-2 tracking-tight">
            Structural Payload
          </h3>
          <p className="text-zinc-600 leading-relaxed">
            Use triple-line breaks (<code className="bg-zinc-50 text-blue-600 px-1.5 py-0.5 rounded font-mono text-[11px] border border-zinc-200">\n\n\n</code>) between every section (Intro, Verse, Chorus) to prevent model drifting.
          </p>
        </section>

        <section>
          <h3 className="text-zinc-900 font-bold uppercase mb-2 flex items-center gap-2 tracking-tight">
            600-Char Limit
          </h3>
          <p className="text-zinc-600 leading-relaxed">
            Keep payload & prompts under 600 characters to prevent hallucination and maintain control.
          </p>
        </section>
      </div>
      
      <div className="mt-8 pt-4 border-t border-zinc-100 text-center flex-none">
        <p className="text-[9px] text-zinc-300 tracking-widest uppercase font-semibold">System: Simple AI</p>
      </div>
    </aside>
  );
}