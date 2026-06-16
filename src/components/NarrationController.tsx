import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, Sparkles, ChevronRight, PlayCircle } from "lucide-react";

interface NarrationControllerProps {
  script: string[];
  landmarkName: string;
}

type VoicePersonality = "kore" | "zephyr" | "puck" | "system";

export default function NarrationController({ script, landmarkName }: NarrationControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [personality, setPersonality] = useState<VoicePersonality>("kore");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop any ongoing speech when the landmark changes
  useEffect(() => {
    stopCurrentSpeech();
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [script, landmarkName]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopCurrentSpeech();
    };
  }, []);

  const stopCurrentSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const playSentence = (index: number) => {
    if (!window.speechSynthesis) return;

    stopCurrentSpeech();

    const textToSpeak = script[index];
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Pitch & Rate tuning based on user personality choice
    if (personality === "kore") {
      // Warm Sage
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
    } else if (personality === "zephyr") {
      // Futuristic / Techno wanderer
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
    } else if (personality === "puck") {
      // High energy historian
      utterance.rate = 1.15;
      utterance.pitch = 1.2;
    } else {
      // Robotic system synth
      utterance.rate = 0.85;
      utterance.pitch = 0.7;
    }

    utterance.onstart = () => {
      setIsSynthesizing(true);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsSynthesizing(false);
      // Auto advance to next sentence if available
      if (index + 1 < script.length) {
        setCurrentIndex(index + 1);
        playSentence(index + 1);
      } else {
        setIsPlaying(false);
        setCurrentIndex(0);
      }
    };

    utterance.onerror = () => {
      setIsSynthesizing(false);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this environment.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        playSentence(currentIndex);
      }
    }
  };

  const handleRestart = () => {
    stopCurrentSpeech();
    setCurrentIndex(0);
    setIsPlaying(false);
    setTimeout(() => {
      playSentence(0);
    }, 100);
  };

  const handleNextSentence = () => {
    if (currentIndex + 1 < script.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      playSentence(nextIdx);
    } else {
      handleRestart();
    }
  };

  const selectPersonality = (p: VoicePersonality) => {
    setPersonality(p);
    stopCurrentSpeech();
    setIsPlaying(false);
    // Restart active sentence with new voice personality
    setTimeout(() => {
      playSentence(currentIndex);
    }, 150);
  };

  return (
    <div id="narration-hub" className="p-6 bg-white/5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
      {/* Target Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? "bg-blue-400" : "bg-white/20"}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? "bg-blue-500" : "bg-white/30"}`}></span>
          </span>
          <h4 className="text-xs font-mono text-blue-400 font-bold uppercase tracking-widest">
            Audio Tour Narration
          </h4>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-white/60 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Synthetic AR voice</span>
        </div>
      </div>

      {/* Subtitle / Script Box */}
      <div className="bg-black/45 p-5 rounded-2xl border border-white/10 mb-4 min-h-[96px] flex flex-col justify-between relative overflow-hidden">
        {/* Holographic lines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.015] to-transparent pointer-events-none" />
        
        <p className="text-sm text-white/90 font-sans leading-relaxed transition-all duration-300 italic">
          "{script[currentIndex] || "Select play to begin narration..."}"
        </p>

        {/* Caption Progress */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-white/40">
          <span>SEGMENT {currentIndex + 1} OF {script.length}</span>
          <span className="text-blue-400 font-semibold">{landmarkName} GUIDE</span>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { id: "kore", label: "Sage Male", desc: "Warm & Wise" },
          { id: "zephyr", label: "Neon Fem", desc: "Clear Tech" },
          { id: "puck", label: "Scholar", desc: "High Energy" },
          { id: "system", label: "Synth", desc: "Holo Robot" }
        ].map((v) => (
          <button
            key={v.id}
            id={`voice-btn-${v.id}`}
            onClick={() => selectPersonality(v.id as VoicePersonality)}
            className={`px-1 py-2 rounded-xl border text-center transition-all duration-200 ${
              personality === v.id
                ? "bg-blue-500/10 border-blue-400 text-blue-300 shadow-lg font-semibold"
                : "bg-black/20 border-white/10 text-white/40 hover:border-white/20 hover:text-white/70"
            }`}
          >
            <div className="text-[10px] font-bold font-mono tracking-wide uppercase">{v.label}</div>
            <div className="text-[8px] opacity-50 mt-0.5">{v.desc}</div>
          </button>
        ))}
      </div>

      {/* Playback Controls & Waveform animation */}
      <div className="flex items-center gap-4">
        {/* Playback Button */}
        <button
          id="btn-play-narration"
          onClick={handleTogglePlay}
          className="flex items-center justify-center w-12 h-12 rounded-full cursor-pointer bg-white text-black hover:bg-slate-100 active:scale-95 transition-all shadow-lg shadow-white/15"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
        </button>

        {/* Restart Button */}
        <button
          id="btn-restart-narration"
          onClick={handleRestart}
          title="Restart Narration"
          className="p-3 rounded-xl bg-white/5 text-white/60 hover:text-blue-400 hover:border-blue-400/30 border border-white/10 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>

        {/* Skip Seg */}
        <button
          id="btn-skip-narration"
          onClick={handleNextSentence}
          title="Next Segment"
          className="px-3.5 py-3 rounded-xl bg-white/5 text-white/60 hover:text-blue-400 hover:border-blue-400/30 border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Animated equalizer sound wave */}
        <div className="flex-1 flex items-center justify-end gap-[3px] h-9 px-2.5 overflow-hidden bg-black/35 rounded-xl border border-white/5">
          {[...Array(12)].map((_, idx) => {
            // Random duration to make wave look natural
            const randomDuration = 0.5 + Math.random() * 0.8;
            return (
              <span
                key={idx}
                className="w-[3px] bg-blue-400 rounded-full"
                style={{
                  height: "4px",
                  animation: isPlaying ? `sound-wave ${randomDuration}s ease-in-out infinite` : "none",
                  opacity: isPlaying ? 1 : 0.4
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
