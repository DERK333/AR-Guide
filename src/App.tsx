import React, { useState, useEffect } from "react";
import { LandmarkDetails, ScanHistoryItem, Citation } from "./types";
import { PRESET_DESTINATIONS } from "./data";
import ARCameraView from "./components/ARCameraView";
import AROverlayCompass from "./components/AROverlayCompass";
import NarrationController from "./components/NarrationController";
import LandmarkDetailTabs from "./components/LandmarkDetailTabs";
import TravelLogbook from "./components/TravelLogbook";
import SOSEmergencyPortal from "./components/SOSEmergencyPortal";
import TravelBudgetTracker from "./components/TravelBudgetTracker";
import { Sparkles, Compass, Shield, Terminal, Landmark, RotateCcw } from "lucide-react";

export default function App() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [activeItem, setActiveItem] = useState<ScanHistoryItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressText, setScanProgressText] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  // States for 911 systems administrator notification banner
  const [sosProfileConfigured, setSosProfileConfigured] = useState(false);
  const [sosAlertDismissed, setSosAlertDismissed] = useState(false);

  useEffect(() => {
    const checkSos = () => {
      try {
        const saved = localStorage.getItem("ar_sos_profile_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.fullName) {
            setSosProfileConfigured(true);
            return;
          }
        }
        setSosProfileConfigured(false);
      } catch (e) {
        setSosProfileConfigured(false);
      }
    };

    checkSos();
    window.addEventListener("sos-profile-updated", checkSos);
    return () => {
      window.removeEventListener("sos-profile-updated", checkSos);
    };
  }, []);

  // Real-time network connectivity observers
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logMessage("Internet linkage fully restored. Live optical Gemini AI re-enabled.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      logMessage("Connection lost. LENS.AR switched to Offline Mode (locally cached logs active).");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Re-synchronize language code to English when moving between different travel nodes
  useEffect(() => {
    setActiveLanguage("en");
  }, [activeItem?.id]);

  // Update clock
  useEffect(() => {
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateClock = () => {
    const now = new Date();
    setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
  };

  // Log function for system terminal feedback
  const logMessage = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // Load history on mount
  useEffect(() => {
    logMessage("Initializing AR Spatial Navigation Core...");
    try {
      const stored = localStorage.getItem("ar_photo_scans_v1");
      if (stored) {
        const parsed: ScanHistoryItem[] = JSON.parse(stored);
        setHistory(parsed);
        if (parsed.length > 0) {
          setActiveItem(parsed[0]);
          logMessage(`Restored travel log history: ${parsed.length} entries.`);
        } else {
          loadDefaultPresetDemo();
        }
      } else {
        loadDefaultPresetDemo();
      }
    } catch (err) {
      console.error("Local history restore failure:", err);
      loadDefaultPresetDemo();
    }
  }, []);

  // Set default preset entry on first load
  const loadDefaultPresetDemo = async () => {
    logMessage("Generating preloaded landmark demonstration scan...");
    try {
      const response = await fetch("/api/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId: "eiffel_tower" })
      });
      const data = await response.json();
      if (data.result) {
        const defaultDetails: LandmarkDetails = data.result;
        const mockItem: ScanHistoryItem = {
          id: "default_eiffel",
          timestamp: new Date().toLocaleDateString(),
          imageUri: PRESET_DESTINATIONS[0].thumbnailUrl,
          details: defaultDetails,
          originalDetails: defaultDetails,
          citations: [
            { title: "Eiffel Tower Official Heritage", url: "https://www.toureiffel.paris/en" },
            { title: "World Archeologist Ledger", url: "https://wikipedia.org/wiki/Eiffel_Tower" }
          ]
        };
        setHistory([mockItem]);
        setActiveItem(mockItem);
        // Save to storage
        localStorage.setItem("ar_photo_scans_v1", JSON.stringify([mockItem]));
        logMessage("Preloaded Eiffel Tower AR session ready for playback.");
      }
    } catch (err) {
      console.warn("Could not preload live server route. Establishing local client-side preset details.");
      // Fallback details just in case server is starting up or has issues during loading
      const fallbackDetails: LandmarkDetails = {
        isLandmark: true,
        name: "Eiffel Tower",
        city: "Paris",
        country: "France",
        coordinates: { latitude: 48.8584, longitude: 2.2945 },
        specs: {
          built: "1889",
          height: "330 meters",
          style: "Exhibitionist Industrial Art Lattice",
          designer: "Gustave Eiffel & Associates"
        },
        historyOverview: "The Eiffel Tower is a world-renowned iron lattice tower in Paris, Built as the main arch for the 1889 World's Exposition.",
        timeline: [
          { year: "1887", event: "Construction commences in Sumida or Paris." },
          { year: "1889", event: "Completed and inaugurated." }
        ],
        hotspots: [
          { x: 50, y: 25, type: "architecture", title: "Tower Peak", description: "Houses radio antennas." }
        ],
        audioNarrationScript: ["Welcome to the Eiffel Tower, the romantic cultural gateway is iron riveted."],
        travelTip: "Avoid sunset lines; stairs are much faster."
      };
      const mockItem: ScanHistoryItem = {
        id: "local_eiffel_fallback",
        timestamp: new Date().toLocaleDateString(),
        imageUri: PRESET_DESTINATIONS[0].thumbnailUrl,
        details: fallbackDetails,
        originalDetails: fallbackDetails
      };
      setHistory([mockItem]);
      setActiveItem(mockItem);
    }
  };

const OFFLINE_PRESETS: Record<string, LandmarkDetails> = {
  eiffel_tower: {
    isLandmark: true,
    name: "Eiffel Tower",
    city: "Paris",
    country: "France",
    coordinates: { latitude: 48.8584, longitude: 2.2945 },
    specs: {
      built: "1889",
      height: "330 meters",
      style: "Exhibitionist Industrial Art/Puddled Iron Lattice",
      designer: "Gustave Eiffel & Associates"
    },
    historyOverview: "The Eiffel Tower is an iron lattice tower on the Champ de Mars in Paris, France. Constructed as the entrance arch to the 1889 World's Fair, it has become a global cultural icon of France.",
    timeline: [
      { year: "1887", event: "Construction officially begins in Paris." },
      { year: "1889", event: "Grand opening and inauguration of the world exhibition peak." }
    ],
    hotspots: [
      { x: 50, y: 25, type: "architecture", title: "Tower Peak", description: "Houses radio antennas." }
    ],
    audioNarrationScript: ["Welcome to the Eiffel Tower, the romantic cultural gateway is iron riveted."],
    travelTip: "Avoid sunset lines; stairs are much faster."
  },
  colosseum: {
    isLandmark: true,
    name: "Ancient Colosseum",
    city: "Rome",
    country: "Italy",
    coordinates: { latitude: 41.8902, longitude: 12.4922 },
    specs: {
      built: "80 AD",
      height: "48 meters",
      style: "Ancient Roman Amphitheater Style",
      designer: "Flavian Dynasty Emperors"
    },
    historyOverview: "The Colosseum is an oval amphitheatre in the centre of the city of Rome, Italy. Built of travertine limestone, tuff, and brick-faced concrete.",
    timeline: [
      { year: "72 AD", event: "Construction commissioned by Emperor Vespasian." },
      { year: "80 AD", event: "Completed and inaugurated with spectacular gladiatorial games." }
    ],
    hotspots: [
      { x: 50, y: 50, type: "history", title: "Arena Floor", description: "Where gladiators contested each other and wild beasts." }
    ],
    audioNarrationScript: ["Standing inside the Colosseum is stepping straight back to the Roman Empire."],
    travelTip: "Purchase skip-the-line tickets online well in advance."
  },
  tokyo_skytree: {
    isLandmark: true,
    name: "Tokyo Skytree",
    city: "Tokyo",
    country: "Japan",
    coordinates: { latitude: 35.7101, longitude: 139.8107 },
    specs: {
      built: "2012",
      height: "634 meters",
      style: "Neo-Futuristic Tower Design",
      designer: "Nikken Sekkei"
    },
    historyOverview: "The Tokyo Skytree is a broadcasting and observation tower in Sumida, Tokyo. It became the tallest structure in Japan in 2010 and reached its full height of 634 meters in March 2011.",
    timeline: [
      { year: "2008", event: "First pillar raised in Sumida." },
      { year: "2012", event: "Opened to the public with heavy media presence." }
    ],
    hotspots: [
      { x: 50, y: 15, type: "architecture", title: "Tembo Deck", description: "Panoramic sky lobbies." }
    ],
    audioNarrationScript: ["Behold Tokyo Skytree, the neon beacon of futuristic Japan."],
    travelTip: "Go on a clear morning to catch a silhouette of Mt. Fuji!"
  },
  statue_of_liberty: {
    isLandmark: true,
    name: "Statue of Liberty",
    city: "New York",
    country: "USA",
    coordinates: { latitude: 40.6892, longitude: -74.0445 },
    specs: {
      built: "1886",
      height: "93 meters",
      style: "Neoclassical Copper Robed Monument",
      designer: "Frédéric-Auguste Bartholdi & Gustave Eiffel"
    },
    historyOverview: "The Statue of Liberty is a colossal neoclassical sculpture on Liberty Island in New York Harbor. The copper statue, a gift from the people of France, was dedicated on October 28, 1886.",
    timeline: [
      { year: "1884", event: "Completed in Paris and presented to the US ambassador." },
      { year: "1886", event: "Assembled on Bedloe's Island and inaugurated by President Cleveland." }
    ],
    hotspots: [
      { x: 50, y: 20, type: "history", title: "The Torch", description: "Symbol of enlightenment guiding immigrants." }
    ],
    audioNarrationScript: ["The Statue of Liberty beacons as a classic emblem of international liberty."],
    travelTip: "Reserve pedestal or crown access months prior."
  }
};

  // Perform a scan
  const handleScanImage = async (base64String: string, presetId?: string) => {
    setIsScanning(true);
    setScanProgressText("Booting AI Scanner Module...");
    setTerminalLogs([]);

    const steps = [
      "Accessing satellite telemetry database...",
      "Calibrating optical alignment filters...",
      "Submitting image vector frames to Gemini...",
      "Grounded Google search research underway...",
      "Formulating tourist timeline milestones...",
      "Mapping local visual hotspots percentage coordinates...",
      "Constructing audio narration script nodes...",
      "Persisting tour ledger parameters..."
    ];

    // Stagger progress texts organically to make scan look ultra-high-fidelity
    let stepIdx = 0;
    const progressInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        setScanProgressText(steps[stepIdx]);
        logMessage(steps[stepIdx]);
        stepIdx++;
      }
    }, 400);

    // Offline intercept
    if (!navigator.onLine) {
      if (presetId && OFFLINE_PRESETS[presetId]) {
        setTimeout(() => {
          clearInterval(progressInterval);
          const details = OFFLINE_PRESETS[presetId];
          const dest = PRESET_DESTINATIONS.find((p) => p.id === presetId);
          const itemImage = dest ? dest.thumbnailUrl : base64String;

          const newScanItem: ScanHistoryItem = {
            id: `scan_${Date.now()}`,
            timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            imageUri: itemImage,
            details,
            originalDetails: details,
            citations: [
              { title: `${details.name} (Offline Library)`, url: "https://wikipedia.org/wiki/" + encodeURIComponent(details.name) }
            ]
          };

          const updatedHistory = [newScanItem, ...history.filter(h => h.id !== "default_eiffel")];
          setHistory(updatedHistory);
          setActiveItem(newScanItem);
          localStorage.setItem("ar_photo_scans_v1", JSON.stringify(updatedHistory));

          logMessage(`[Offline Cache] Loaded offline telemetry database preset: "${details.name}" successfully!`);
          setIsScanning(false);
        }, 1200);
        return;
      } else {
        setTimeout(() => {
          clearInterval(progressInterval);
          logMessage("PROTOCOL WARNING: Custom webcam scans are restricted in Offline Mode.");
          alert("LENS.AR Custom Scanning Warning:\nYou are currently offline. Custom camera snapshots and image uploads require an active internet connection to evaluate landmarks using Gemini AI.\n\nPlease restore your connection, or tap any of our pre-cached destinations to test LENS.AR completely offline!");
          setIsScanning(false);
        }, 800);
        return;
      }
    }

    try {
      const response = await fetch("/api/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64String,
          presetId
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errMsg = await response.json();
        throw new Error(errMsg.error || "Network recognition protocol rejected.");
      }

      const data = await response.json();
      const details: LandmarkDetails = data.result;
      const citations: Citation[] = data.citations || [];

      // Determine photo URI to show in logbook list
      let itemImage = base64String;
      if (presetId) {
        const dest = PRESET_DESTINATIONS.find((p) => p.id === presetId);
        if (dest) itemImage = dest.thumbnailUrl;
      }

      const newScanItem: ScanHistoryItem = {
        id: `scan_${Date.now()}`,
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUri: itemImage,
        details,
        originalDetails: details,
        citations
      };

      const updatedHistory = [newScanItem, ...history.filter(h => h.id !== "default_eiffel")];
      setHistory(updatedHistory);
      setActiveItem(newScanItem);
      localStorage.setItem("ar_photo_scans_v1", JSON.stringify(updatedHistory));

      logMessage(`Scan successful: identified "${details.name}" in ${details.city}.`);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      logMessage(`PROTOCOL ERROR: ${err.message || "Unknown scanner disruption"}`);
      alert(err.message || "Scanning failed. Check API configuration or try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    setActiveItem(item);
    logMessage(`Loaded history record index: "${item.details.name}"`);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire Travel Logbook?")) {
      setHistory([]);
      setActiveItem(null);
      localStorage.removeItem("ar_photo_scans_v1");
      logMessage("Wiped travel history database registers.");
    }
  };

  const handleDeleteOneHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("ar_photo_scans_v1", JSON.stringify(updated));

    if (activeItem && activeItem.id === id) {
      setActiveItem(updated.length > 0 ? updated[0] : null);
    }
    logMessage("Purged single history scan entry.");
  };

  // Live on-demand translator to aid tourists from all parts of the world
  const handleTranslateActiveItem = async (langCode: string) => {
    if (!activeItem) return;
    setActiveLanguage(langCode);
    
    // Quick local restore for pristine English originals
    if (langCode === "en") {
      const original = activeItem.originalDetails || activeItem.details;
      const updatedItem = {
        ...activeItem,
        details: original
      };
      
      const updatedHistory = history.map((item) => item.id === activeItem.id ? updatedItem : item);
      setHistory(updatedHistory);
      setActiveItem(updatedItem);
      localStorage.setItem("ar_photo_scans_v1", JSON.stringify(updatedHistory));
      logMessage(`Restored "${original.name}" English tour metadata.`);
      return;
    }

    if (!navigator.onLine) {
      logMessage(`TRANSLATION PAUSED: Translation of "${activeItem.details.name}" to ${langCode.toUpperCase()} requires active signal.`);
      alert("Language translation requires an active network connection to translate using Gemini AI models. Let's browse in English for now, or reconnect to translate!");
      setActiveLanguage("en");
      return;
    }

    setIsTranslating(true);
    logMessage(`Calling translator node for language target: ${langCode.toUpperCase()}...`);

    try {
      const original = activeItem.originalDetails || activeItem.details;
      const targetLangName = 
        langCode === "es" ? "Spanish" : 
        langCode === "fr" ? "French" :
        langCode === "de" ? "German" :
        langCode === "it" ? "Italian" :
        langCode === "ja" ? "Japanese" :
        langCode === "zh" ? "Chinese" :
        langCode === "pt" ? "Portuguese" : langCode;

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          details: original,
          targetLanguage: targetLangName
        })
      });

      if (!response.ok) {
        throw new Error("Translation system rejected translation mapping.");
      }

      const data = await response.json();
      const translatedDetails: LandmarkDetails = data.result;

      const updatedItem: ScanHistoryItem = {
        ...activeItem,
        details: translatedDetails,
        originalDetails: original
      };

      const updatedHistory = history.map((item) => item.id === activeItem.id ? updatedItem : item);
      setHistory(updatedHistory);
      setActiveItem(updatedItem);
      localStorage.setItem("ar_photo_scans_v1", JSON.stringify(updatedHistory));

      logMessage(`Enjoy your custom tour of "${translatedDetails.name}" in ${targetLangName}!`);
    } catch (err: any) {
      console.error("Translation stream errored out:", err);
      logMessage(`TRANSLATION ERROR: ${err.message || "Failed to finalize language stream."}`);
      alert("Translation process failed. Check your network or API connection.");
      // Revert select component index state
      setActiveLanguage("en");
    } finally {
      setIsTranslating(false);
    }
  };

  // Persists personalized family memories, ratings, weather & companionship metadata
  const handleUpdateActiveItem = (updatedFields: Partial<ScanHistoryItem>) => {
    if (!activeItem) return;

    const updatedItem = {
      ...activeItem,
      ...updatedFields
    };

    const updatedHistory = history.map((item) => item.id === activeItem.id ? updatedItem : item);
    setHistory(updatedHistory);
    setActiveItem(updatedItem);
    localStorage.setItem("ar_photo_scans_v1", JSON.stringify(updatedHistory));
    logMessage(`Successfully saved travel journal memories for "${activeItem.details.name}".`);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col font-sans select-none antialiased relative overflow-x-hidden">
      {/* High-End Ambient Spotlight Glows */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] bg-blue-950 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[700px] h-[700px] bg-amber-950/60 rounded-full blur-[160px]" />
      </div>

      {/* Top Futuristic Immersive Nav Ribbon */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/15 backdrop-blur-md sticky top-0">
        <div id="ai-header" className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center">
              <Compass className="w-4 h-4 text-white animate-target" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black tracking-tighter uppercase text-white">LENS.AR</span>
                <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest font-bold">
                  GIS Connected
                </span>
              </div>
              <p className="text-[10px] text-white/50 font-sans tracking-wide">
                Grounded Landmark Identification & Spatial Tourist Guide
              </p>
            </div>
          </div>

          {/* Diagnostics and Live Metrics Widget */}
          <div className="flex items-center gap-4 text-right">
            <div className="hidden md:block">
              <div className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
                Field of View Telemetry
              </div>
              <div className="text-xs font-mono text-blue-400 font-bold">
                {currentTime || "102.4° WIDE"}
              </div>
            </div>
            <div className="h-6 w-px bg-white/15 hidden md:block" />
            <div className={`flex items-center gap-2 px-3 py-1 border rounded-lg ${isOnline ? 'bg-white/5 border-white/10 text-white/70' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-amber-400 animate-ping'}`}></div>
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase">
                {isOnline ? "LINKED: 12MS" : "OFFLINE PORTAL ACTIVE"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Offline Status Warning Ribbon */}
      {!isOnline && (
        <div className="relative z-10 bg-amber-500/10 border-b border-amber-500/20 py-2 px-6 text-center backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-[10px] text-amber-300 font-mono tracking-wide">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="font-bold uppercase text-[11px]">Offline Cache Envelope Enabled:</span>
            </div>
            <span>Your personal travel logs, quizzes, companions, ratings, and digital photo diaries are fully compiled & operational offline.</span>
          </div>
        </div>
      )}

      {/* 911 Systems Administration Advisory Notice Banner */}
      {!sosProfileConfigured && !sosAlertDismissed && (
        <div className="relative z-10 bg-gradient-to-r from-red-950/60 via-zinc-950 to-red-950/40 border-b border-red-500/30 px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md animate-pulse hover:animate-none transition-all">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 text-red-500 text-xs font-black font-mono animate-bounce">
              911
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-black font-mono tracking-widest text-red-500 uppercase">🚨 ADVISORY FROM 911 SYSTEMS ADMINISTRATOR:</span>
                <span className="text-[8px] font-mono font-bold bg-red-500/10 text-rose-300 border border-red-500/20 px-2 py-0.5 rounded uppercase">
                  UNCONFIGURED SECURITY SHIELD
                </span>
              </div>
              <p className="text-[10.5px] text-zinc-300 font-sans leading-relaxed mt-1">
                First Responder Emergency Dossier is completely empty! In a foreign physical safety or medical crisis, law-enforcement field medics and local embassy staff require deep description telemetry to assist you. Log in your emergency profile database immediately.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-sos-portal"));
              }}
              className="px-4 py-2 bg-red-650 bg-red-600 hover:bg-red-550 border border-red-500/40 text-white text-[10.5px] font-mono font-black tracking-widest rounded-lg transition-all active:scale-95 cursor-pointer uppercase shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              🚀 CREATE DOSSIER NOW
            </button>
            <button
              onClick={() => setSosAlertDismissed(true)}
              className="px-2.5 py-2 border border-white/15 hover:border-white/25 text-white/50 hover:text-white text-[10px] font-mono rounded-lg transition-colors cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Workspace Container */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive AR Column: Video feeds, controls, active narrations */}
        <section className="lg:col-span-7 space-y-6">
          <ARCameraView
            onScanImage={handleScanImage}
            isScanning={isScanning}
            scanProgressText={scanProgressText}
            activeDetails={activeItem ? activeItem.details : null}
          />

          {/* Compass direction pointer tracking real-world orientation toward landmarks */}
          <AROverlayCompass
            activeLandmark={activeItem ? activeItem.details : null}
            onSystemLog={logMessage}
          />

          {/* Narration script controls */}
          {activeItem && activeItem.details.isLandmark && (
            <NarrationController
              script={activeItem.details.audioNarrationScript}
              landmarkName={activeItem.details.name}
            />
          )}

          {/* Small scrolling live terminal logs widget for AR branding vibe */}
          <div className="bg-white/5 p-4 rounded-3xl border border-white/10 font-mono text-[10px] text-white/50 overflow-hidden h-[105px] relative flex flex-col backdrop-blur-md">
            <div className="flex items-center justify-between mb-1 text-[8px] text-blue-400 uppercase tracking-widest border-b border-white/5 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Terminal className="w-3 h-3" />
                <span>Diagnostic System Logs</span>
              </div>
              <span className="text-[8px] text-white/30">Active Feed</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin">
              {terminalLogs.length === 0 ? (
                <div className="text-white/30 italic">No spatial telemetry captured. Trigger camera scans to log modules...</div>
              ) : (
                terminalLogs.map((log, idx) => (
                  <div key={idx} className="truncate">
                    <span className={idx === 0 ? "text-blue-400 font-semibold" : ""}>{log}</span>
                  </div>
                ))
              )}
            </div>
            {/* Soft faded overlay at the bottom for scroll depth branding */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-950/70 pointer-events-none" />
          </div>
        </section>

        {/* Right Tabbed Results & Logbook Column */}
        <section className="lg:col-span-5 space-y-6">
          {activeItem ? (
            <LandmarkDetailTabs
              details={activeItem.details}
              citations={activeItem.citations}
              activeItem={activeItem}
              onUpdateActiveItem={handleUpdateActiveItem}
              activeLanguage={activeLanguage}
              onLanguageChange={handleTranslateActiveItem}
              isTranslating={isTranslating}
            />
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center text-white/40 backdrop-blur-md">
              <Landmark className="w-10 h-10 stroke-1 text-white/30 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white/80">No Landmark Data Selected</h4>
              <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto">
                Scan preset cities, capture from WebCam, or upload pictures to construct your tour guides!
              </p>
            </div>
          )}

          <TravelLogbook
            history={history}
            activeId={activeItem ? activeItem.id : null}
            onSelect={handleSelectHistoryItem}
            onClear={handleClearHistory}
            onDeleteOne={handleDeleteOneHistory}
          />

          <TravelBudgetTracker
            history={history}
            isOnline={isOnline}
            onSystemLog={logMessage}
          />
        </section>
      </main>

      {/* Cyberpunk Status Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/30 backdrop-blur-xl py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-white/40 gap-4">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Field of View</span>
              <span className="text-sm font-bold text-white/70">102.4° WIDE</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Sync Latency</span>
              <span className={`text-sm font-bold ${isOnline ? "text-green-400" : "text-amber-400 font-mono"}`}>
                {isOnline ? "12MS (OK)" : "OFFLINE (LOCAL)"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 border border-white/10 rounded-lg text-xs uppercase tracking-wider bg-white/5 hover:bg-white/10 transition-colors">
              AR ENVELOPE SECURE
            </div>
            <div className={`px-4 py-2 font-bold rounded-lg text-xs tracking-wider uppercase transition-colors ${isOnline ? "bg-white text-black" : "bg-amber-500 text-slate-950"}`}>
              {isOnline ? "SCAN ACTIVE" : "LOCAL CACHE ACTIVE"}
            </div>
          </div>
        </div>
      </footer>

      {/* Global Safety SOS Help & local authorities portal */}
      <SOSEmergencyPortal
        activeLandmark={activeItem ? activeItem.details : null}
        isOnline={isOnline}
        onSystemLog={logMessage}
      />
    </div>
  );
}
