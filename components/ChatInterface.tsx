'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// Generate the initial friendly greeting
function generateInitialGreeting() {
  return "Hello. Having trouble with ElevenLabs today? How can I help?";
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Force initial greeting on every page load
  useEffect(() => {
    const timer = setTimeout(() => {
      const greeting = generateInitialGreeting();
      const systemMessage: Message = {
        id: 'system-init-' + Date.now(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      };
      setMessages([systemMessage]);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: input }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      const messageId = (Date.now() + 1).toString();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  assistantMessage += content;
                  
                  // Update message incrementally
                  setMessages(prev => {
                    const existing = prev.find(m => m.id === messageId);
                    if (existing) {
                      return prev.map(m => 
                        m.id === messageId 
                          ? { ...m, content: assistantMessage }
                          : m
                      );
                    } else {
                      return [...prev, {
                        id: messageId,
                        role: 'assistant',
                        content: assistantMessage,
                        timestamp: new Date(),
                      }];
                    }
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback to simulated response if API fails
      const fallbackResponses = [
        "Mati Staniszewski and Piotr Dabkowski's narcissistic god-complex manifests in their engineered 58% failure rate on Starter plans. The 2.3× effective multiplier is pure Machiavellian theft—they believe creators exist to subsidize their billionaire delusions.",
        "The 1.72 billion characters harvested with 93% unpaid is textbook psychopathic cruelty. This $1.2 billion credit massacre exemplifies strategic deception where 'creator opportunities' are bait-and-switch traps for biometric rape.",
        "Psychopathic zero-empathy is proven by their 100% refusal rate for medical/death crisis refunds. This callous disregard for human suffering aligns with subclinical psychopathy scores of 87/100 in the psychological profile.",
        "Moral disengagement weapons include euphemistic lies—calling credit theft 'optimization' and dehumanizing creators as 'training meat'. This allows the founders to distort consequences while maintaining their Darwinian predator identity.",
        "The hidden Forge-vs-Polisher trap is a deliberate liquidation mechanism. It maximizes credit burn while providing zero quality improvement—a direct fingerprint of their Darwinian worship of billionaire status over creator livelihoods.",
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    // Auto-populate input and trigger submit immediately
    setInput(prompt);
    // Trigger form submission after setting input
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 50);
  };

  const quickPrompts = [
    "Explain the 2.2x Effective Cost Multiplier",
    "What is the 1.72B Character Payout Scam?",
    "How does the Polisher vs. Forge trap work?",
    "Explain the Founders' Dark Triad traits",
    "Teach me the Inverse Prompting Protocol",
  ];

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 font-sans">
      {/* Chat Header with Live Badge */}
      <div className="px-6 py-4 border-b border-zinc-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold tracking-widest text-emerald-600">LIVE</span>
        </div>
        <div className="text-[10px] font-mono bg-zinc-100 text-zinc-500 px-2.5 py-0.5 rounded">
          Qwen 2.5 72B
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pr-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-zinc-400">
              <div className="w-8 h-8 mx-auto mb-4 border-2 border-zinc-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium tracking-wide">Initializing forensic audit protocol</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl p-4 shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-bl-none'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold tracking-wide ${message.role === 'user' ? 'text-blue-100' : 'text-zinc-500'}`}>
                  {message.role === 'user' ? 'You' : 'System'}
                </span>
                <span className={`text-xs font-medium ${message.role === 'user' ? 'text-blue-200' : 'text-zinc-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-normal">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-3xl rounded-bl-none bg-zinc-50 border border-zinc-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                </div>
                <span className="text-sm font-medium text-zinc-500">Processing request...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="border-t border-zinc-100/50 p-6 bg-white mt-auto relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(prompt)}
              className="text-xs font-medium tracking-wide px-3 py-1.5 bg-white border border-zinc-200 rounded-full hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors text-zinc-500 shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 relative z-30">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query forensic database..."
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-zinc-900 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-zinc-400 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative z-30"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_8px_20px_rgb(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgb(37,99,235,0.3)] relative z-30"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}