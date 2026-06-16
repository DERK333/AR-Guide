import React, { useState, useRef, useEffect } from "react";
import { Camera, ImageUp, Sparkles, Navigation, Layers, Compass, Loader2 } from "lucide-react";
import { LandmarkDetails, LandmarkHotspot, PresetTouristDestination } from "../types";
import { PRESET_DESTINATIONS } from "../data";

interface ARCameraViewProps {
  onScanImage: (base64String: string, presetId?: string) => void;
  isScanning: boolean;
  scanProgressText: string;
  activeDetails: LandmarkDetails | null;
}

export default function ARCameraView({
  onScanImage,
  isScanning,
  scanProgressText,
  activeDetails
}: ARCameraViewProps) {
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(PRESET_DESTINATIONS[0].thumbnailUrl);
  const [activePreset, setActivePreset] = useState<string>("eiffel_tower");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<LandmarkHotspot | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Monitor webcam toggle
  useEffect(() => {
    if (useWebcam) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [useWebcam]);

  // Clean hotspot on landmark change
  useEffect(() => {
    setSelectedHotspot(null);
  }, [activeDetails]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
      }
    } catch (err: any) {
      console.warn("Camera block or unsupported:", err);
      setCameraError("Camera access blocked or unsupported. Use a preset landmark or upload a file!");
      setUseWebcam(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setWebcamActive(false);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // Draw video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        setUseWebcam(false);
        setActivePreset(""); // cleared
        onScanImage(dataUrl);
      }
    } catch (err) {
      console.error("Capture failure:", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCapturedImage(reader.result);
        setUseWebcam(false);
        setActivePreset("");
        onScanImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const selectPreset = (preset: PresetTouristDestination) => {
    setUseWebcam(false);
    setCapturedImage(preset.thumbnailUrl);
    setActivePreset(preset.id);
    onScanImage("", preset.id); // Triggers mock or server call by ID
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Viewport Frame with AR Reticle Grid */}
      <div
        id="camera-viewfinder-container"
        ref={containerRef}
        className="relative w-full aspect-[4/3] bg-[#050608] rounded-3xl overflow-hidden border border-white/15 shadow-2xl flex items-center justify-center group"
      >
        {/* Futuristic Grid Overlay always visible in background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* HUD Diagnostics Margin indicators */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10 text-[9px] font-mono select-none px-2.5 py-1 bg-black/80 border border-white/10 rounded-lg text-white/70">
          <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span>SYS_LAT_LON: SCANNER_FEED_ACTIVE</span>
        </div>
        
        {/* Preset indicator */}
        {activePreset && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 text-[9px] font-mono select-none px-2.5 py-1 bg-blue-500/10 border border-blue-400/30 rounded-lg text-blue-300 font-bold">
            <span className="animate-pulse text-blue-400">●</span> PRESET SOURCE_ID: {activePreset.toUpperCase()}
          </div>
        )}

        {/* Target alignment crosshairs (Center Reticle) */}
        <div className="absolute w-24 h-24 border border-dashed border-white/15 rounded-full pointer-events-none flex items-center justify-center animate-target">
          <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]" />
        </div>

        {/* 4 Corner AR brackets - Sleek wide design */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-500 pointer-events-none" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-500 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-500 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500 pointer-events-none" />

        {/* Actual Video feed OR Image Viewfinder */}
        {useWebcam ? (
          <video
            id="camera-video-node"
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : capturedImage ? (
          <img
            id="camera-preview-img"
            src={capturedImage}
            alt="Scenic view to scan"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-500"
          />
        ) : (
          <div className="text-center p-6 text-white/40 font-mono">
            <Camera className="w-12 h-12 stroke-1 mx-auto mb-2 text-white/30" />
            <p className="text-xs">Select a preset below or load camera</p>
          </div>
        )}

        {/* Scanning Laser sweeping Line & progress overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 overflow-hidden backdrop-blur-sm">
            {/* Blue Laser Scan Sweep */}
            <div className="absolute left-0 right-0 h-[2px] bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-laser z-30 opacity-90" />
            
            {/* Holographic matrix lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:100%_4px] animate-pulse pointer-events-none" />

            <div className="text-center space-y-3.5 p-6 max-w-sm z-10 relative">
              <div className="relative inline-flex">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1.5 -right-1.5 animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <h5 className="text-sm font-semibold text-white font-mono tracking-wider uppercase">
                  AR Telemetry Scanner
                </h5>
                <p className="text-[11px] text-white/60 font-mono italic">
                  {scanProgressText || "Calibrating optical telemetry..."}
                </p>
              </div>

              {/* Progress Bar placeholder */}
              <div className="w-48 h-[3px] bg-white/10 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full animate-[shimmer_1.5s_infinite] w-2/3 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
              </div>
            </div>
          </div>
        )}

        {/* Interactive Holographic overlay Hotspots overlayed on activeDetails */}
        {!isScanning && activeDetails && activeDetails.isLandmark && activeDetails.hotspots && (
          <div className="absolute inset-0 z-15 pointer-events-none select-none">
            {/* Bounding box enclosing the landmark simulated centered */}
            <div className="absolute top-[18%] left-[25%] right-[25%] bottom-[20%] border border-dashed border-blue-400/35 rounded-2xl bg-blue-500/[0.015]">
              <span className="absolute -top-2.5 left-3.5 bg-blue-500/20 text-blue-300 border border-blue-500/25 font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-md">
                Match Confirmed 98.4%
              </span>
            </div>

            {activeDetails.hotspots.map((h, index) => {
              const isSelected = selectedHotspot?.title === h.title;
              return (
                <div
                  key={index}
                  className="absolute pointer-events-auto"
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                >
                  {/* Glowing hotspot point */}
                  <button
                    id={`hotspot-btn-${index}`}
                    onClick={() => setSelectedHotspot(isSelected ? null : h)}
                    className="relative flex items-center justify-center w-6 h-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/btn"
                    title={h.title}
                  >
                    <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-blue-400 flex-shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                    
                    {/* Tiny visual line anchor */}
                    <span className="absolute left-1/2 top-1/2 w-[1px] h-4 bg-blue-400/60 origin-top rotate-45 pointer-events-none" />
                  </button>

                  {/* Hotspot details dialog */}
                  {isSelected && (
                    <div className="absolute left-6 top-0 -translate-y-1/2 w-48 sm:w-56 p-4 bg-[#0a0c10]/95 border border-white/15 rounded-2xl text-left shadow-2xl shadow-black/90 z-25 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8px] font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/10">
                          {h.type} context
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHotspot(null);
                          }}
                          className="text-[9px] text-white/40 hover:text-white/80 font-mono"
                        >
                          [x]
                        </button>
                      </div>
                      <h4 className="text-[11px] font-mono font-bold text-white uppercase tracking-wide leading-tight">
                        {h.title}
                      </h4>
                      <p className="text-[10px] text-white/70 font-sans mt-1 leading-relaxed">
                        {h.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Camera block warning error state */}
        {cameraError && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-500/30 p-3.5 rounded-2xl text-center backdrop-blur-md z-10">
            <p className="text-xs text-red-300 font-mono">{cameraError}</p>
          </div>
        )}
      </div>

      {/* Control row for image capture */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Preset destinations selector popup/trigger */}
        <button
          id="btn-use-live-cam"
          onClick={() => setUseWebcam(!useWebcam)}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-mono text-xs cursor-pointer transition-all ${
            useWebcam
              ? "bg-red-500/10 border-red-400/40 text-red-300 font-medium"
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          }`}
        >
          <Camera className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>{useWebcam ? "Close Feed" : "Live Camera"}</span>
        </button>

        {/* Trigger snap button when camera active, otherwise file upload mock */}
        {useWebcam ? (
          <button
            id="btn-snap-photo"
            onClick={handleCapture}
            disabled={!webcamActive}
            className="col-span-1 bg-white hover:bg-white/95 text-black px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-widest shadow-lg shadow-white/5 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Capture Frame</span>
          </button>
        ) : (
          <button
            id="btn-upload-file"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-mono text-xs cursor-pointer transition-all"
          >
            <ImageUp className="w-4 h-4 text-blue-400" />
            <span>Upload Photo</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Informative text */}
        <div className="col-span-2 hidden sm:flex items-center justify-end pr-2 text-[10px] font-mono text-white/40 text-right leading-tight">
          <span>DRAG IMAGES ONTO CONSOLE <br />OR STREAM LIVE FEED</span>
        </div>
      </div>

      {/* Preset Landmark Picker Carousel */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest leading-none">
            Simulate Scan Presets
          </span>
          <span className="h-px bg-white/10 flex-1" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {PRESET_DESTINATIONS.map((preset) => {
            const isPresetSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                id={`preset-picker-${preset.id}`}
                onClick={() => selectPreset(preset)}
                className={`relative group h-16 rounded-xl overflow-hidden border text-left cursor-pointer transition-all ${
                  isPresetSelected
                    ? "border-blue-500 ring-1 ring-blue-500/30 shadow-md"
                    : "border-white/10 hover:border-white/20 hover:shadow-md"
                }`}
              >
                {/* Image underlay */}
                <img
                  src={preset.thumbnailUrl}
                  alt={preset.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Holographic dark fade overlay */}
                <div className={`absolute inset-0 bg-[#050608]/80 group-hover:bg-[#050608]/70 transition-colors ${
                  isPresetSelected ? "bg-[#050608]/65" : ""
                }`} />

                {/* Content Overlay */}
                <div className="relative h-full flex flex-col justify-between p-2">
                  <span className="text-[8px] font-mono text-white/40 uppercase tracking-tight">
                    {preset.city}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {preset.name}
                  </span>
                </div>

                {isPresetSelected && (
                  <div className="absolute right-2 top-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
