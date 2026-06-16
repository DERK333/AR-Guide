import React, { useState } from "react";
import { LandmarkDetails, Citation, ScanHistoryItem } from "../types";
import { 
  Calendar, 
  Compass, 
  Info, 
  Landmark, 
  ExternalLink, 
  ShieldAlert, 
  Award, 
  Footprints, 
  Heart, 
  Trophy, 
  X, 
  Sparkles, 
  Printer, 
  Globe2, 
  Star,
  Users,
  CloudSun,
  Share2,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandmarkDetailTabsProps {
  details: LandmarkDetails;
  citations?: Citation[];
  activeItem: ScanHistoryItem;
  onUpdateActiveItem: (updated: Partial<ScanHistoryItem>) => void;
  activeLanguage: string;
  onLanguageChange: (langCode: string) => void;
  isTranslating: boolean;
}

type TabType = "overview" | "timeline" | "specs" | "tips" | "memories" | "quiz";

const LANGUAGES = [
  { code: "en", name: "English", label: "🇺🇸 EN" },
  { code: "es", name: "Español", label: "🇪🇸 ES" },
  { code: "fr", name: "Français", label: "🇫🇷 FR" },
  { code: "de", name: "Deutsch", label: "🇩🇪 DE" },
  { code: "it", name: "Italiano", label: "🇮🇹 IT" },
  { code: "ja", name: "日本語", label: "🇯🇵 JA" },
  { code: "zh", name: "中文", label: "🇨🇳 ZH" },
  { code: "pt", name: "Português", label: "🇵🇹 PT" }
];

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

// Generate rich, fun trivia questions for families at the site
function getQuizQuestions(name: string, city: string, details: LandmarkDetails): QuizQuestion[] {
  const norm = name.toLowerCase();
  
  if (norm.includes("eiffel")) {
    return [
      {
        question: "How much can the Eiffel Tower grow or shrink depending on summer or winter temperatures?",
        options: ["Up to 15 centimeters", "It remains exactly identical", "Over 2 meters", "Only 1 millimeter"],
        answerIndex: 0,
        explanation: "Puddled iron expands in hot summer and contracts in winter, changing the tower's height by up to 15 cm!"
      },
      {
        question: "What strategic utility saved the Eiffel Tower from demolition when its permit expired in 1909?",
        options: ["It was bought by a US hotel chain", "It was repurposed as a giant military radio transmission mast", "The artists demanded its preservation", "It was too heavy to deconstruct"],
        answerIndex: 1,
        explanation: "Gustave Eiffel's 20-year permit expired in 1909, but military radiotelegraph antennae proved too strategically critical for France to scrap!"
      },
      {
        question: "What cozy secret is built into the highest summit section of the Eiffel Tower?",
        options: ["A retro coffee bar", "A mini rocket docking station", "Gustave Eiffel's private apartment", "A giant mechanical clock gear"],
        answerIndex: 2,
        explanation: "Gustave Eiffel built a secret high penthouse to conduct scientific research and host celebrated VIP guests like Thomas Edison."
      }
    ];
  } else if (norm.includes("colosseum") || norm.includes("colosseum")) {
    return [
      {
        question: "How many roaring ancient spectators could the Roman Colosseum hold?",
        options: ["Around 5,000", "About 50,000 to 80,000", "Exactly 1,200", "Over half a million"],
        answerIndex: 1,
        explanation: "In its imperial prime, this arcaded architectural icon sat 50,000 to 80,000 spectators organized by Roman class ranks!"
      },
      {
        question: "What was the 'Hypogeum' section of the Colosseum built for?",
        options: ["An underground crane, trapdoor, and tunnel engine to summon wild animals and warriors", "A cozy kitchen for the Emperor's court", "A library of sacred battle records", "An underground natural hot water bath"],
        answerIndex: 0,
        explanation: "The Hypogeum was the elaborate subterranean staging engine room used to lift beasts and scenery directly into the sandy arena floor!"
      },
      {
        question: "How did Roman organizers shade visitors from the scorching Mediterranean sun?",
        options: ["Using heavy bronze parasols", "They only held games at midnight", "A giant retractable fabric awning called the Velarium, operated by sailors", "By misting cooled harbor waters everywhere"],
        answerIndex: 2,
        explanation: "Specially trained imperial sailors operated the 'Velarium' — a colossal canvas awning that could shield spectators from direct sunlight."
      }
    ];
  } else if (norm.includes("skytree")) {
    return [
      {
        question: "How did Skytree designers protect this 634-meter tower from heavy earthquakes?",
        options: ["Wrapping the base in giant rubber wrap", "Using a central concrete damping column modeled after Shinto pagodas", "Building it entirely out of soft carbon blocks", "Suspending the elevators on magnets"],
        answerIndex: 1,
        explanation: "The tower leverages a central concrete pillar structurally isolated from the metal frame, absorbing seismic vibrations similarly to multi-story timber pagodas!"
      },
      {
        question: "What does the maximum height of '634' represent Japanese pronounciation?",
        options: ["'Eternal Summit'", "'Musashi' - commemorating the historical local province of Tokyo", "'Snowcap Peak'", "'Endless Sky'"],
        answerIndex: 1,
        explanation: "In ancient Japanese wordplay, 6-3-4 can be read as 'Mu-sa-shi', mapping the old historical region where Tokyo rises!"
      }
    ];
  } else if (norm.includes("liberty")) {
    return [
      {
        question: "Why is the Statue of Liberty completely green today?",
        options: ["It was painted using French sea-green pigments", "It is made of copper sheets that naturally oxidized in harbor air", "It is completely coated in rich marine moss", "The color was caused by lightning strikes"],
        answerIndex: 1,
        explanation: "The statue consists of extremely thin hand-hammered copper (similar to coins). Over decades, seawater air caused it to oxidize to green patina!"
      },
      {
        question: "What sits on the ground around Lady Liberty's feet?",
        options: ["Broken chains and shackles symbolizing liberty and the end of slavery", "A historical anchor", "A collection of silver French coins", "A foundation of soil from 40 nations"],
        answerIndex: 0,
        explanation: "She stands proudly amidst broken shackles, signifying the global abolition of slavery and the triumph of human freedom!"
      }
    ];
  }

  // Generates smart adaptive questions for newly photographed scenery based on its telemetry
  const yearBuilt = details.specs.built || "historic eras";
  return [
    {
      question: `According to historical records, who is documented as the custom designer or architect of "${details.name}"?`,
      options: [
        details.specs.designer && details.specs.designer !== "Not Documented" ? details.specs.designer : "A regional cooperative of classic artisans",
        "Michelangelo",
        "Christopher Wren (English builder)",
        "Thomas Jefferson"
      ].sort(() => Math.random() - 0.5),
      get answerIndex() {
        return this.options.indexOf(details.specs.designer && details.specs.designer !== "Not Documented" ? details.specs.designer : "A regional cooperative of classic artisans");
      },
      explanation: `Archival ledgers verify that ${details.name} was outstandingly structuralized by: ${details.specs.designer || 'regional pioneers of architectural heritage.'}`
    },
    {
      question: `In what global destination can you travel to visit "${details.name}"?`,
      options: [
        `${details.city}, ${details.country}`,
        "Kyoto, Japan",
        "London, United Kingdom",
        "Rome, Italy"
      ].filter((value, index, self) => self.indexOf(value) === index).slice(0, 4),
      get answerIndex() {
        return this.options.indexOf(`${details.city}, ${details.country}`);
      },
      explanation: `You successfully scanned it! This masterpiece resides in ${details.city}, ${details.country} mapping coordinates: ${details.coordinates.latitude.toFixed(2)}°N, ${details.coordinates.longitude.toFixed(2)}°W.`
    },
    {
      question: `What is the estimated historical timeline associated with the creation of ${details.name}?`,
      options: [
        `Constructed / Inaugurated around: ${yearBuilt}`,
        "Recently built in the post-2020 era",
        "Dating back prehistoric BC epochs"
      ],
      answerIndex: 0,
      explanation: `Correct! Historical archives verify the active building timeline dates directly around: ${yearBuilt}.`
    }
  ];
}

export default function LandmarkDetailTabs({ 
  details, 
  citations,
  activeItem,
  onUpdateActiveItem,
  activeLanguage,
  onLanguageChange,
  isTranslating
}: LandmarkDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  
  // Memories and Keepsake states
  const [diaryNotes, setDiaryNotes] = useState(activeItem.familyMemoryNotes || "");
  const [stars, setStars] = useState(activeItem.userRating || 5);
  const [companions, setCompanions] = useState(activeItem.companions || "Family");
  const [weatherValue, setWeatherValue] = useState(activeItem.weather || "Sunny");
  const [showPostcardModal, setShowPostcardModal] = useState(false);
  const [copiedState, setCopiedState] = useState(false);

  const handleCopyDigitalPostcard = () => {
    const starsEmoji = "⭐".repeat(stars);
    const historySnippet = details.historyOverview 
      ? details.historyOverview.length > 200 
        ? `${details.historyOverview.slice(0, 197)}...` 
        : details.historyOverview
      : "A historical landmark scanned with AR.";

    const journalContent = diaryNotes 
      ? `"${diaryNotes}"`
      : "Exploring beautiful sights & unlocking rich histories.";

    const photoUrl = activeItem.imageUri || "";
    const cleanPhotoUrl = photoUrl.startsWith("data:") 
      ? "📸 [AR Scan captured via webcam]"
      : `🌐 Photo URL: ${photoUrl}`;

    const textToCopy = `✨ LENS.AR TRAVEL DIGITAL POSTCARD ✨

📍 LANDMARK: ${details.name}
🌍 LOCATION: ${details.city}, ${details.country}
📅 SCANNED: ${activeItem.timestamp}

📜 LANDMARK LEGACY:
"${historySnippet}"

✍️ FAMILY DIARY KEEPSAKE:
${journalContent}

⛅ WEATHER: ${weatherValue}
👥 TRAVEL MEMBERS: ${companions}
⭐ RATING: ${starsEmoji}

${cleanPhotoUrl}

🗺️ Scanned with LENS.AR Travel Companion! ✨`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedState(true);
    setTimeout(() => {
      setCopiedState(false);
    }, 2500);
  };

  // Trivia Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Interactive Custom AI Chat companion states
  const [chatInquiry, setChatInquiry] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; citations?: Citation[] }>>([]);
  const [isAskingAI, setIsAskingAI] = useState(false);

  // Synchronize diary states when active item shifts
  React.useEffect(() => {
    setDiaryNotes(activeItem.familyMemoryNotes || "");
    setStars(activeItem.userRating || 5);
    setCompanions(activeItem.companions || "Family");
    setWeatherValue(activeItem.weather || "Sunny");
    
    // Clear chat companion thread on scenic landmark shift
    setChatMessages([]);
    setChatInquiry("");
    setIsAskingAI(false);

    // Reset quiz
    setQuizIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
  }, [activeItem.id]);

  const handleAskAICompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = chatInquiry.trim();
    if (!query) return;

    setChatInquiry("");
    const newMsg = { sender: "user" as const, text: query };
    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    setIsAskingAI(true);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `📡 Live Satellite Connection Offline: I am operating in high-speed local mode at ${details.name}! Your diary logs, quiz modules, and digital postcard generated layouts remain fully active offline. Interactive companion answers and Google Search grounding require active signal. Reconnect to resume chat!`
          }
        ]);
        setIsAskingAI(false);
      }, 700);
      return;
    }

    try {
      const response = await fetch("/api/chat-landmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landmarkName: details.name,
          city: details.city,
          country: details.country,
          question: query,
          messages: chatMessages
        })
      });

      if (!response.ok) {
        throw new Error("AI Companion network stream disrupted.");
      }

      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.answer,
          citations: data.citations
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I apologize, but my satellite linkage timed out. Please try requesting detail insights again!"
        }
      ]);
    } finally {
      setIsAskingAI(false);
    }
  };

  const quizQuestions = getQuizQuestions(details.name, details.city, details);

  const handleSaveMemories = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateActiveItem({
      familyMemoryNotes: diaryNotes,
      userRating: stars,
      companions,
      weather: weatherValue
    });
  };

  const handleAnswerClick = (optIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optIdx);
    if (optIdx === quizQuestions[quizIndex].answerIndex) {
      setScore((curr) => curr + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
  };

  if (!details.isLandmark) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Scenic Scan Completed</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {details.historyOverview || "No prominent historical or geographical landmarks were identified in this photo. Try scanning a scenic frame with a clear view of an architectural structure, or use one of our preset landmarks!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Immersive Detail Card panel */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
        
        {/* Multilingual Globalizer Header Strip */}
        <div className="flex items-center justify-between px-6 py-3 bg-black/50 border-b border-white/5 text-[10px] font-mono text-white/70">
          <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Regional Guide Language</span>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={activeLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              disabled={isTranslating}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded-md text-[10px] font-mono focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.label} ({lang.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-white/10 bg-black/40 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: Info },
            { id: "timeline", label: "Timeline", icon: Calendar },
            { id: "specs", label: "Specs", icon: Compass },
            { id: "tips", label: "Tips", icon: Footprints },
            { id: "memories", label: "Journal & Keepsakes", icon: Heart },
            { id: "quiz", label: "Family Quiz", icon: Trophy }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                id={`tab-btn-${t.id}`}
                onClick={() => setActiveTab(t.id as TabType)}
                className={`flex-1 min-w-[70px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 py-3 px-2 text-[8px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest uppercase border-b-2 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "border-blue-500 text-blue-400 bg-blue-500/[0.02] font-bold"
                    : "border-transparent text-white/40 hover:text-white/70 hover:bg-black/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="p-6">
          {isTranslating ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <div className="text-xs font-mono text-blue-400 animate-pulse uppercase tracking-wider">
                Recalibrating Regional Vocabulary...
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                {/* OVERVIEW PANEL */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded text-[9px] font-mono font-bold uppercase">
                          AI Inspected
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          Coordinates: {details.coordinates.latitude.toFixed(4)}°N, {details.coordinates.longitude.toFixed(4)}°W
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-blue-400" />
                        {details.name}
                      </h3>
                      <p className="text-xs text-white/50 font-mono mt-0.5">
                        Situated in {details.city}, {details.country}
                      </p>
                    </div>

                    <p className="text-sm text-white/85 leading-relaxed font-sans">
                      {details.historyOverview}
                    </p>

                    {/* Google Search Grounding Citations */}
                    {citations && citations.length > 0 && (
                      <div className="pt-4 border-t border-white/10">
                        <h4 className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2.5">
                          Verified Grounding Citations
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {citations.map((cite, idx) => (
                            <a
                              key={idx}
                              href={cite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2.5 rounded-xl bg-black/45 hover:bg-black border border-white/10 hover:border-blue-500/30 transition-all font-mono text-[10px] text-white/80 group"
                            >
                              <span className="truncate max-w-[85%] font-medium">
                                {idx + 1}. {cite.title}
                              </span>
                              <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-blue-400 transition-colors" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ask AI Travel Companion Chat Thread */}
                    <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                          </div>
                          <h4 className="text-xs font-mono text-blue-400 font-bold uppercase tracking-widest">
                            Ask LENS.AR AI Companion
                          </h4>
                        </div>
                        <span className="text-[8px] font-mono text-white/30 tracking-wider">
                          REAL-TIME SEARCH GROUNDING
                        </span>
                      </div>

                      {/* Messages log */}
                      {chatMessages.length > 0 && (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                          {chatMessages.map((msg, index) => (
                            <div
                              key={index}
                              className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                                msg.sender === "user"
                                  ? "ml-auto bg-blue-500/10 text-blue-100 rounded-tr-none border border-blue-500/15"
                                  : "bg-white/5 text-white/95 rounded-tl-none border border-white/5"
                              }`}
                            >
                              <span className="font-sans">{msg.text}</span>
                              {msg.citations && msg.citations.length > 0 && (
                                <div className="mt-2 pt-1.5 border-t border-white/5 flex flex-wrap gap-1.5 items-center">
                                  <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">Sources:</span>
                                  {msg.citations.map((cite, cIdx) => (
                                    <a
                                      key={cIdx}
                                      href={cite.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="py-0.5 px-1.5 bg-black/45 rounded border border-white/10 hover:border-blue-400/30 text-[8px] font-mono text-white/60 hover:text-blue-400 flex items-center gap-1 max-w-[120px]"
                                    >
                                      <span className="truncate">{cite.title}</span>
                                      <ExternalLink className="w-2 h-2 shrink-0 opacity-55" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          {isAskingAI && (
                            <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono p-1">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                              <span className="italic ml-1">LENS.AR is researching satellite telemetry...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {chatMessages.length === 0 && (
                        <p className="text-[10px] text-white/40 italic font-sans animate-fade-in">
                          Curious about ticket prices, opening hours, local secrets, or neighboring food spots here? Ask LENS.AR using Google Search grounding!
                        </p>
                      )}

                      {/* Question input */}
                      <form onSubmit={handleAskAICompanion} className="flex gap-2">
                        <input
                          id="ai-tour-chat-input"
                          type="text"
                          placeholder="Type inquiry about this landmark..."
                          value={chatInquiry}
                          onChange={(e) => setChatInquiry(e.target.value)}
                          disabled={isAskingAI}
                          className="flex-1 bg-black/45 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-slate-950 transition-all font-sans"
                        />
                        <button
                          id="ai-tour-chat-submit"
                          type="submit"
                          disabled={isAskingAI || !chatInquiry.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-mono font-bold text-white rounded-xl shadow-md border border-blue-400/10 cursor-pointer"
                        >
                          {isAskingAI ? "Asking..." : "Ask AI"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* TIMELINE PANEL */}
                {activeTab === "timeline" && (
                  <div className="space-y-6 relative pl-4 before:content-[''] before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                    {details.timeline.map((item, index) => (
                      <div key={index} className="relative pl-6 group">
                        <span className="absolute left-[-1px] top-1 w-3 h-3 rounded-full bg-[#050608] border border-blue-500 group-hover:bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)] transition-all duration-300" />
                        
                        <div className="flex items-baseline gap-2 mb-1.5">
                          <span className="text-xs font-bold font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                            {item.year}
                          </span>
                        </div>
                        <p className="text-sm text-white/80 font-sans leading-relaxed">
                          {item.event}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* SPECS PANEL */}
                {activeTab === "specs" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { label: "Built / Inaugurated", value: details.specs.built },
                      { label: "Dimensional Scope", value: details.specs.height },
                      { label: "Architectural Style", value: details.specs.style },
                      { label: "Designer / Builder", value: details.specs.designer }
                    ].map((spec, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-black/30 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-white/25 transition-all"
                      >
                        <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
                          {spec.label}
                        </div>
                        <div className="text-sm text-white/90 font-semibold font-sans">
                          {spec.value || "Not Documented"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* INSIDER TIPS PANEL */}
                {activeTab === "tips" && (
                  <div className="space-y-4">
                    <div className="p-5 bg-blue-500/5 border border-blue-500/15 rounded-2xl flex items-start gap-3">
                      <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono text-blue-400 font-bold uppercase tracking-widest mb-1">
                          Insider Tourist Tip
                        </h4>
                        <p className="text-sm text-white/90 font-sans leading-relaxed">
                          {details.travelTip}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 bg-[#050608]/40 p-3 rounded-xl border border-white/5">
                      <span className="flex h-2 w-2 rounded-full bg-amber-400" />
                      <span>Recommendations grounded in historical tourist traffic charts</span>
                    </div>
                  </div>
                )}

                {/* FAMILY TRAVEL JOURNAL & POSTCARD GENERATOR */}
                {activeTab === "memories" && (
                  <form onSubmit={handleSaveMemories} className="space-y-4 text-white">
                    <div className="border border-white/10 p-4 rounded-2xl bg-black/25">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-red-400 fill-red-400/20" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          Travel Journal & Keepsake Generator
                        </h4>
                      </div>
                      <p className="text-[10px] text-white/50 mb-4 leading-relaxed">
                        Preserve your beautiful family memories, rate your scenic trip, log your weather, and create printable retro traveler postcards to show friends!
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {/* Rating */}
                        <div>
                          <label className="block text-[9px] font-mono uppercase text-white/50 mb-1">Trip Rating</label>
                          <div className="flex items-center gap-1.5 mt-1">
                            {[1, 2, 3, 4, 5].map((starValue) => (
                              <button
                                type="button"
                                key={starValue}
                                onClick={() => setStars(starValue)}
                                className="cursor-pointer hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    starValue <= stars ? "text-amber-400 fill-[#fbbf24]" : "text-white/20"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Companions select */}
                        <div>
                          <label className="block text-[9px] font-mono uppercase text-white/50 mb-1">Travel Companions</label>
                          <select
                            value={companions}
                            onChange={(e) => setCompanions(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-sans cursor-pointer transition-all mt-1"
                          >
                            <option value="Family" className="bg-slate-950 text-white">Family & Children</option>
                            <option value="Couple" className="bg-slate-950 text-white">Romantic Getaway</option>
                            <option value="Friends" className="bg-slate-950 text-white">With Friends</option>
                            <option value="Solo" className="bg-slate-950 text-white">Solo Exploration</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 mb-4">
                        {/* Weather select */}
                        <div>
                          <label className="block text-[9px] font-mono uppercase text-white/50 mb-1">Travel Weather</label>
                          <select
                            value={weatherValue}
                            onChange={(e) => setWeatherValue(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-sans cursor-pointer transition-all mt-1"
                          >
                            <option value="Sunny" className="bg-slate-950 text-white">☀️ Clear & Glassy Sunny Skies</option>
                            <option value="Cloudy" className="bg-slate-950 text-white">☁️ Soft Breezy & Gray Clouds</option>
                            <option value="Rainy" className="bg-slate-950 text-white">🌧️ Romantic & Cozy Rainfall</option>
                            <option value="Snowy" className="bg-slate-950 text-white">❄️ Magical Scenic Snowy Skies</option>
                            <option value="Windy" className="bg-slate-950 text-white">💨 Atmospheric Harbour Winds</option>
                          </select>
                        </div>

                        {/* Memoir inputs */}
                        <div>
                          <label className="block text-[9px] font-mono uppercase text-white/50 mb-1">Family Memories Story</label>
                          <textarea
                            value={diaryNotes}
                            onChange={(e) => setDiaryNotes(e.target.value)}
                            placeholder="e.g. Kids climbed the south side stairs, we sat and had giant strawberry gelato at sunset! Simply unforgettable."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-s500 transition-all font-sans resize-none mt-1 leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Controls row */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-white hover:bg-slate-100 text-black font-semibold text-xs py-2.5 rounded-xl transition-all font-mono tracking-wide cursor-pointer"
                        >
                          Save Journal Memoir
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Save first
                            onUpdateActiveItem({
                              familyMemoryNotes: diaryNotes,
                              userRating: stars,
                              companions,
                              weather: weatherValue
                            });
                            setShowPostcardModal(true);
                          }}
                          className="flex-1 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-semibold text-xs py-2.5 rounded-xl transition-all font-mono tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Postcard</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Save first
                            onUpdateActiveItem({
                              familyMemoryNotes: diaryNotes,
                              userRating: stars,
                              companions,
                              weather: weatherValue
                            });
                            handleCopyDigitalPostcard();
                          }}
                          className={`flex-1 border transition-all font-mono tracking-wide flex items-center justify-center gap-1.5 cursor-pointer text-xs py-2.5 rounded-xl ${
                            copiedState
                              ? "border-green-500/50 bg-green-500/20 text-green-300 animate-pulse"
                              : "border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          {copiedState ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied Postcard!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Copy Social Card</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* FAMILY INTERACTIVE TRIVIA GAME */}
                {activeTab === "quiz" && (
                  <div className="space-y-4">
                    <div className="border border-white/10 p-5 rounded-2xl bg-black/25">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            Landmark Explorer Quiz
                          </h4>
                        </div>
                        <span className="text-[10px] text-white/40 font-mono">
                          QUESTION {quizIndex + 1} OF {quizQuestions.length}
                        </span>
                      </div>

                      {quizFinished ? (
                        <div className="text-center py-6 space-y-4">
                          <div className="w-14 h-14 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                            <Trophy className="w-7 h-7" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white">Quiz Completed successfully!</h5>
                            <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto">
                              Your family unlocked a tour score of <span className="text-blue-400 font-bold">{score}/{quizQuestions.length}</span>! Keep exploring scenery to unlock new trophies.
                            </p>
                          </div>
                          <button
                            onClick={handleRestartQuiz}
                            className="bg-white text-black font-semibold font-mono text-xs px-5 py-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            Play Again
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Question text */}
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-white/90 leading-relaxed font-sans font-semibold">
                            {quizQuestions[quizIndex].question}
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 gap-2">
                            {quizQuestions[quizIndex].options.map((option, optIdx) => {
                              const isSelected = selectedAnswer === optIdx;
                              const isCorrectAnswer = optIdx === quizQuestions[quizIndex].answerIndex;
                              const isWrongAnswer = isSelected && !isCorrectAnswer;

                              let btnStyle = "bg-white/5 text-white/80 border-white/10 hover:border-white/20 hover:bg-white/10";
                              if (selectedAnswer !== null) {
                                if (isCorrectAnswer) btnStyle = "bg-green-500/15 text-green-300 border-green-500/40";
                                else if (isWrongAnswer) btnStyle = "bg-red-500/15 text-red-300 border-red-500/40";
                                else btnStyle = "bg-white/5 text-white/30 border-white/5 cursor-not-allowed";
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleAnswerClick(optIdx)}
                                  className={`w-full p-2.5 text-left rounded-xl border text-xs cursor-pointer transition-all font-sans leading-relaxed flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{option}</span>
                                  {selectedAnswer !== null && isCorrectAnswer && (
                                    <span className="text-green-400 font-bold font-mono text-[10px] uppercase">✓ Correct</span>
                                  )}
                                  {selectedAnswer !== null && isWrongAnswer && (
                                    <span className="text-red-400 font-bold font-mono text-[10px] uppercase">✗ Incorrect</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation and next button */}
                          {selectedAnswer !== null && (
                            <div className="pt-2">
                              <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-[10px] text-blue-300 leading-relaxed max-w-full font-sans mb-3.5">
                                <span className="font-mono font-bold uppercase block mb-0.5 text-blue-400">Archival Context:</span>
                                {quizQuestions[quizIndex].explanation}
                              </div>
                              <button
                                onClick={handleNextQuiz}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold font-mono text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>{quizIndex === quizQuestions.length - 1 ? "Finish Family Trivia" : "Next Trivia Question"}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* IMMERSIVE COMPACT PHYSICAL POSTCARD GENERATOR MODAL */}
      <AnimatePresence>
        {showPostcardModal && (
          <div className="fixed inset-0 bg-[#050608]/90 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1115] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold font-mono uppercase tracking-widest text-white">Your Immersive AR Travel Postcard</h4>
                </div>
                <button
                  onClick={() => setShowPostcardModal(false)}
                  className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Body Card */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="max-w-xl mx-auto">
                  <div 
                    id="postcard-artifact" 
                    className="aspect-[1.5/1] bg-[#f8f9fa] border-4 border-white shadow-2xl p-6 text-black flex flex-col justify-between relative overflow-hidden rounded-sm select-text scale-100 origin-center"
                    style={{ fontFamily: "'Space Grotesk', 'Courier New', monospace" }}
                  >
                    {/* Gritty retro card pattern overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />

                    {/* Passport Stamp (Circle ink sticker) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[15deg] w-28 h-28 rounded-full border-2 border-dashed border-blue-500/40 text-blue-500/40 font-mono text-[9px] font-bold flex flex-col items-center justify-center text-center p-2 leading-none uppercase select-none pointer-events-none">
                      <div className="border-b border-blue-500/40 pb-0.5 mb-1">{details.city}</div>
                      <div>AR INSPIRED</div>
                      <div className="text-[7px] text-slate-500/50 font-sans mt-0.5">{activeItem.timestamp.split(" ")[0]}</div>
                      <div className="border-t border-blue-500/40 pt-1 mt-1 text-[7px]">TRAVEL SECURED</div>
                    </div>

                    <div className="grid grid-cols-12 gap-6 h-full items-stretch">
                      
                      {/* Left: Scenery preview picture container */}
                      <div className="col-span-5 flex flex-col justify-between h-full bg-black/5 p-1.5 border border-black/10 rounded">
                        <div className="w-full aspect-[4/3] rounded-sm overflow-hidden border border-black/10 relative">
                          <img
                            src={activeItem.imageUri}
                            alt={details.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-[8px] font-mono text-black/60 text-center uppercase tracking-wider mt-1.5 leading-tight">
                          <span className="font-bold text-black">{details.name}</span>
                          <br />
                          {details.city}, {details.country}
                        </div>
                      </div>

                      {/* Right: Writeup and mock address stamps */}
                      <div className="col-span-7 flex flex-col justify-between pl-4 border-l border-black/15">
                        
                        {/* Stamp place */}
                        <div className="flex justify-between items-start">
                          <div className="text-[9px] font-mono font-bold text-slate-400 italic">
                            POSTAGE PRE-SECURED • AIR MAIL
                          </div>
                          {/* Simulated postage stamp stamp */}
                          <div className="w-10 h-12 border-2 border-black/20 p-0.5 flex flex-col items-center justify-between bg-amber-50 rounded-sm">
                            <div className="text-[5px] font-bold text-center border-b border-black/15 w-full pb-0.5">POST</div>
                            <div className="w-full h-5 rounded-sm overflow-hidden bg-white">
                              <img src={activeItem.imageUri} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                            </div>
                            <div className="text-[5px] font-mono font-bold mt-0.5">USA AR</div>
                          </div>
                        </div>

                        {/* Story writer text */}
                        <div className="flex-1 py-3 text-xs leading-relaxed italic text-slate-800 font-serif">
                          {diaryNotes ? `"${diaryNotes}"` : `"Capturing moments, locking scenery, and unlocking detailed travel narratives with my family. Loving our trip exploration here!"`}
                        </div>

                        {/* Metadata stats */}
                        <div className="border-t border-black/15 pt-2 flex flex-wrap gap-x-3 gap-y-1 text-[7px] font-mono text-black">
                          <div>
                            <span className="font-bold text-slate-500">DATE: </span>
                            {activeItem.timestamp}
                          </div>
                          <div>
                            <span className="font-bold text-slate-500">ATMOSPHERE: </span>
                            {weatherValue.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-500">GROUP: </span>
                            {companions.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-500">RATING: </span>
                            {"⭐".repeat(stars)}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action operations footer */}
              <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/40">
                  Tip: Right-click the postcard card above to save, print, or take a screenshot!
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        const content = document.getElementById("postcard-artifact")?.outerHTML || "";
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>LENS.AR Travel Keepsake Postcard - ${details.name}</title>
                              <style>
                                body { margin: 20px; display: flex; justify-center: center; align-items: center; background: #fafafa; }
                                #postcard-artifact {
                                  width: 600px;
                                  aspect-ratio: 1.5/1;
                                  background: #f8f9fa;
                                  border: 4px solid #fff;
                                  padding: 24px;
                                  color: #000;
                                  display: flex;
                                  flex-direction: column;
                                  justify-content: space-between;
                                  position: relative;
                                  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                                  font-family: monospace;
                                }
                                .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px; height: 100%; }
                                .col-span-5 { grid-column: span 5; display: flex; flex-direction: column; justify-content: space-between; }
                                .col-span-7 { grid-column: span 7; display: flex; flex-direction: column; justify-content: space-between; padding-left: 24px; border-left: 1px solid #ddd; }
                                img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 2px; }
                                .flex { display: flex; justify-content: space-between; }
                                .flex-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
                                .font-serif { font-family: Georgia, serif; font-style: italic; }
                              </style>
                            </head>
                            <body>
                              ${content}
                              <script>window.print();</script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-mono text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Postcard</span>
                  </button>
                  <button
                    onClick={handleCopyDigitalPostcard}
                    className={`border transition-all font-mono text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer ${
                      copiedState
                        ? "border-green-500/50 bg-green-500/20 text-green-300 animate-pulse"
                        : "border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    {copiedState ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied Summary!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Digital Postcard</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPostcardModal(false)}
                    className="bg-white text-black font-semibold font-mono text-xs px-5 py-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
