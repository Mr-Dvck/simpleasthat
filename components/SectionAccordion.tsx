'use client';

import { useState } from 'react';

type SectionAccordionProps = {
  title: string;
  icon: string;
  content: string;
  badge: string;
};

export default function SectionAccordion({ title, icon, content, badge }: SectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-soft-md transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl flex-shrink-0">{icon}</div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-xl text-zinc-900 truncate">{title}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs px-3 py-1.5 bg-zinc-100 text-zinc-700 font-semibold rounded-full tracking-wide uppercase">{badge}</span>
              <span className="text-xs text-zinc-500 font-medium">{isOpen ? 'Expanded' : 'Click to read'}</span>
            </div>
          </div>
        </div>
        <div className="text-zinc-400 ml-4">
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          <div className="pt-4 border-t border-zinc-100">
            <p className="text-zinc-800 leading-relaxed text-base mb-6 whitespace-pre-wrap">{content}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {title.includes('Credit') && (
                <>
                  <span className="text-xs px-3 py-1.5 bg-primary-accent/10 text-primary-accent font-medium rounded-full">Failure Tax</span>
                  <span className="text-xs px-3 py-1.5 bg-primary-accent/10 text-primary-accent font-medium rounded-full">2.3× Multiplier</span>
                  <span className="text-xs px-3 py-1.5 bg-primary-accent/10 text-primary-accent font-medium rounded-full">Hidden Forge</span>
                </>
              )}
              {title.includes('Psychological') && (
                <>
                  <span className="text-xs px-3 py-1.5 bg-secondary-accent/10 text-secondary-accent font-medium rounded-full">Narcissism</span>
                  <span className="text-xs px-3 py-1.5 bg-secondary-accent/10 text-secondary-accent font-medium rounded-full">Machiavellianism</span>
                  <span className="text-xs px-3 py-1.5 bg-secondary-accent/10 text-secondary-accent font-medium rounded-full">Psychopathy</span>
                  <span className="text-xs px-3 py-1.5 bg-secondary-accent/10 text-secondary-accent font-medium rounded-full">Moral Disengagement</span>
                </>
              )}
              {title.includes('Payout') && (
                <>
                  <span className="text-xs px-3 py-1.5 bg-primary-accent/10 text-primary-accent font-medium rounded-full">1.72B Stolen</span>
                  <span className="text-xs px-3 py-1.5 bg-primary-accent/10 text-primary-accent font-medium rounded-full">93% Unpaid</span>
                  <span className="text-xs px-3 py-1.5 bg-primary-accent/10 text-primary-accent font-medium rounded-full">IP Exploitation</span>
                </>
              )}
              {title.includes('Technical') && (
                <>
                  <span className="text-xs px-3 py-1.5 bg-secondary-accent/10 text-secondary-accent font-medium rounded-full">Inverse Prompt</span>
                  <span className="text-xs px-3 py-1.5 bg-secondary-accent/10 text-secondary-accent font-medium rounded-full">Secret Forge</span>
                  <span className="text-xs px-3 py-1.5 bg-secondary-accent/10 text-secondary-accent font-medium rounded-full">VNR Protocol</span>
                </>
              )}
              {title.includes('Alternatives') && (
                <>
                  <span className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 font-medium rounded-full">Fish AI</span>
                  <span className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 font-medium rounded-full">Cartesia</span>
                  <span className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 font-medium rounded-full">Ethical</span>
                </>
              )}
            </div>
            <button className="text-sm text-primary-accent hover:text-primary-accent-600 font-semibold flex items-center gap-2 group transition-colors">
              <span>Deep analysis →</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
