import Link from 'next/link';

export default function BookPromo() {
  return (
    <div className="w-full flex flex-col items-center justify-end h-full pb-2">
      <Link href="/book.html" className="group flex flex-col items-center transition-transform hover:-translate-y-2 duration-300 relative z-10">
        <div className="relative shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] rounded-md overflow-hidden group-hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] transition-all border border-zinc-200/50 group-hover:border-blue-200 w-44 mb-6">
          <img 
            src="/cover.png" 
            alt="Simple AI Ebook" 
            className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[11px] font-black tracking-[0.2em] uppercase text-zinc-500 group-hover:text-blue-600 transition-colors bg-white/80 backdrop-blur px-5 py-2.5 rounded-full shadow-sm border border-zinc-100">
            Read The Manifesto
          </p>
        </div>
      </Link>
    </div>
  );
}