'use client';

import React, { useState, useRef, useEffect } from 'react';

// You will update these filenames once you drag and drop your .mp3s into the 'public/audio' folder!
const PLAYLIST = [
  { id: 1, title: "Gonna Fuck You Up", file: "/audio/Gonna_Fuck_You_Up_2026-03-20T044128.mp3" },
  { id: 2, title: "The Bull Takes Us All", file: "/audio/The_Bull_Takes_Us_All_2026-03-19T130922.mp3" },
  { id: 3, title: "VNR Exhibit A: Zera Czystego", file: "/audio/VNR_Exhibit_A_Zera_Czystego.mp3" },
  { id: 4, title: "Elevenlabs", file: "/audio/elevenlabs.mp3" },
  { id: 5, title: "Failing Loop", file: "/audio/Failing_Loop_2026-03-18T231936.mp3" },
  { id: 6, title: "Credit Burn Favorite 3", file: "/audio/Credit_Burn_Favorite_3.mp3" },
  { id: 7, title: "The One You Carry", file: "/audio/The_One_You_Carry_2026-03-16T185025.mp3" },
  { id: 8, title: "VC", file: "/audio/VC.mp3" },
  { id: 9, title: "Tremendous Bass", file: "/audio/Tremendous_Bass_2026-03-16T073217.mp3" },
];

export default function CustomAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      // Play next track or loop back to start
      if (currentTrack < PLAYLIST.length - 1) {
        setCurrentTrack(prev => prev + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  // Handle play state changes when track changes
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
    }
  }, [currentTrack, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(true);
  };

  return (
    <div className="w-full bg-white rounded-[24px] shadow-[0_10px_40px_-15px_rgb(0,0,0,0.1)] border border-zinc-200 overflow-hidden relative z-10 shrink-0 flex flex-col h-[320px]">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={PLAYLIST[currentTrack]?.file} 
        preload="metadata"
      />

      {/* Header */}
      <div className="bg-zinc-50/80 px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-blue-500 animate-pulse' : 'bg-zinc-300'}`}></div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">Ducktronikz</h3>
        </div>
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Archive</span>
      </div>

      {/* Currently Playing Area */}
      <div className="px-5 py-4 border-b border-zinc-50 shrink-0 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Now Playing</p>
            <h4 className="text-sm font-bold text-zinc-900 truncate">{PLAYLIST[currentTrack]?.title}</h4>
          </div>
          
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg shrink-0"
          >
            {isPlaying ? (
              // Pause Icon
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              // Play Icon
              <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-zinc-400 w-8 text-right">{formatTime(progress)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={progress} 
            onChange={handleSeek}
            className="flex-1 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            style={{
              background: `linear-gradient(to right, #2563eb ${(progress / (duration || 1)) * 100}%, #e5e7eb ${(progress / (duration || 1)) * 100}%)`
            }}
          />
          <span className="text-[10px] font-medium text-zinc-400 w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playlist (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-zinc-50/30 p-2 custom-scrollbar">
        <div className="space-y-1">
          {PLAYLIST.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => handleTrackSelect(idx)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 group ${
                currentTrack === idx 
                  ? 'bg-blue-50 border border-blue-100 shadow-sm' 
                  : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-100'
              }`}
            >
              <div className={`text-xs font-bold w-4 text-center ${currentTrack === idx ? 'text-blue-500' : 'text-zinc-400 group-hover:text-zinc-600'}`}>
                {currentTrack === idx && isPlaying ? (
                  <div className="flex items-end justify-center h-3 gap-[1px]">
                    <div className="w-[2px] h-full bg-blue-500 animate-[bounce_1s_infinite_0ms]"></div>
                    <div className="w-[2px] h-2/3 bg-blue-500 animate-[bounce_1s_infinite_200ms]"></div>
                    <div className="w-[2px] h-full bg-blue-500 animate-[bounce_1s_infinite_400ms]"></div>
                  </div>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-xs font-medium truncate ${currentTrack === idx ? 'text-blue-700' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                {track.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}