import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <div className="h-full w-full flex flex-col bg-transparent relative">
      {/* Top Header */}
      <div className="pt-6 pb-6 flex-none text-center">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1a1c20] drop-shadow-sm">
          SIMPLE AS THAT
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">
          Clinical Forensic Auditor of ElevenLabs
        </p>
      </div>

      {/* Main Chat Area - Clean SaaS layout with floating depth */}
      <div className="flex-1 flex flex-col px-0 pb-4 min-h-0 relative z-10">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-200/60 overflow-hidden flex-1 flex flex-col">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}