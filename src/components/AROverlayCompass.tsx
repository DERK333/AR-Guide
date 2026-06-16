import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  MapPin, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  Navigation,
  Globe,
  Sliders,
  Maximize2,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LandmarkDetails, Coordinates } from "../types";

interface AROverlayCompassProps {
  activeLandmark: LandmarkDetails | null;
  onSystemLog?: (msg: string) => void;
}

// Pre-configured default locations in major cities to compute elegant default bearings
const CITY_FALLBACK_COORDS: Record<string, Coordinates> = {
  Paris: { latitude: 48.8566, longitude: 2.3522 },
  Rome: { latitude: 41.9028, longitude: 12.4964 },
  Tokyo: { latitude: 35.6762, longitude: 139.6503 },
  London: { latitude: 51.5074, longitude: -0.1278 }
};

export default function AROverlayCompass({ activeLandmark, onSystemLog }: AROverlayCompassProps) {
  // Navigation / Visibility states
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Geolocation Coordinates
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Sensor Telemetry (Pitch = Accelerometer-X, Roll = Accelerometer-Y, Yaw/Alpha = Magnetometer)
  const [yaw, setYaw] = useState<number>(0); // alpha
  const [pitch, setPitch] = useState<number>(0); // beta
  const [roll, setRoll] = useState<number>(0); // gamma
  const [heading, setHeading] = useState<number>(0); // true heading (alpha or webkitCompassHeading)
  const [sensorStatus, setSensorStatus] = useState<"uninitialized" | "authorized" | "denied" | "simulated">("uninitialized");
  
  // High-fidelity sensor validation details
  const [usingAbsoluteOrientation, setUsingAbsoluteOrientation] = useState<boolean>(false);
  const [isIOSPermissionNeeded, setIsIOSPermissionNeeded] = useState<boolean>(false);

  // Bearing Details
  const [bearingToLandmark, setBearingToLandmark] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);

  // Simulator/Manual override states (for desk check testing)
  const [simulatedHeading, setSimulatedHeading] = useState<number>(45);
  const [simulatedPitch, setSimulatedPitch] = useState<number>(12);
  const [simulatedRoll, setSimulatedRoll] = useState<number>(-5);
  const [useSimulator, setUseSimulator] = useState<boolean>(false);

  // Ref to detect whether any event was fired to switch to native sensor automatically
  const initialEventLoggedRef = useRef<boolean>(false);

  // Check if iOS permissions are required for DeviceOrientation
  useEffect(() => {
    if (typeof window !== "undefined" && typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      setIsIOSPermissionNeeded(true);
    }
  }, []);

  // Sync user location context (if active landmark changed, mock current position very close for high fidelity bearing)
  useEffect(() => {
    if (activeLandmark) {
      // Pull user geolocation to have a real comparison
      fetchUserGPS(true); // silent skip log if pre-filled
    }
  }, [activeLandmark]);

  // Recalculate bearing whenever user coordinate, target coordinate, or activeLandmark changes
  useEffect(() => {
    if (!activeLandmark) return;

    const lat1 = userCoords ? userCoords.latitude : (CITY_FALLBACK_COORDS[activeLandmark.city] || { latitude: 48.8566 }).latitude;
    const lon1 = userCoords ? userCoords.longitude : (CITY_FALLBACK_COORDS[activeLandmark.city] || { longitude: 2.3522 }).longitude;

    const lat2 = activeLandmark.coordinates.latitude;
    const lon2 = activeLandmark.coordinates.longitude;

    // 1. Calculate Harvesine distance
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    setDistanceKm(dist);

    // 2. Calculate true mathematical bearing
    const yFormula = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
    const xFormula =
      Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
      Math.sin((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.cos(dLon);
    
    let brngRad = Math.atan2(yFormula, xFormula);
    let brngDeg = ((brngRad * 180) / Math.PI + 360) % 360;
    setBearingToLandmark(brngDeg);

  }, [userCoords, activeLandmark]);

  // Listen to device orientation sensors (accelerometer & magnetometer values)
  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (useSimulator) return;

      // Mark sensors as active
      if (!initialEventLoggedRef.current) {
        initialEventLoggedRef.current = true;
        setSensorStatus("authorized");
        if (onSystemLog) onSystemLog("911 COMPASS INTEGRATOR: Physical Magnetometer & Accelerometer stream detected.");
      }

      // Check for absolute heading if available
      let currentAlpha = event.alpha || 0;
      let currentBeta = event.beta || 0;  // X axis tilt (accelerometer)
      let currentGamma = event.gamma || 0; // Y axis tilt (accelerometer)

      let currentHeading = currentAlpha;

      // Handle Safari webkit compass heading directly for calibrated true North
      if ((event as any).webkitCompassHeading !== undefined) {
        currentHeading = (event as any).webkitCompassHeading;
      } else if (event.absolute) {
        setUsingAbsoluteOrientation(true);
      }

      setYaw(currentAlpha);
      setPitch(currentBeta);
      setRoll(currentGamma);
      setHeading(currentHeading);
    };

    // Listen on standard event
    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    
    // Some Android devices fire deviceorientationabsolute
    window.addEventListener("deviceorientationabsolute", handleDeviceOrientation as any, true);

    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation, true);
      window.removeEventListener("deviceorientationabsolute", handleDeviceOrientation as any, true);
    };
  }, [useSimulator]);

  const requestOrientationPermission = async () => {
    if (typeof window === "undefined") return;

    const deviceOrientationRequest = (DeviceOrientationEvent as any).requestPermission;
    if (typeof deviceOrientationRequest === "function") {
      try {
        const permissionState = await deviceOrientationRequest();
        if (permissionState === "granted") {
          setSensorStatus("authorized");
          if (onSystemLog) onSystemLog("911 SENSORS: iOS Magnetometer / Accelerometer stream access authorized.");
        } else {
          setSensorStatus("denied");
          setUseSimulator(true);
          if (onSystemLog) onSystemLog("911 SENSORS WARNING: Location orientation access rejected. Sim mode enabled.");
        }
      } catch (err) {
        console.warn("Sensor request permission failure:", err);
        setSensorStatus("denied");
        setUseSimulator(true);
      }
    } else {
      // Non-iOS or older browser, standard events are bound on load
      setSensorStatus("authorized");
    }
  };

  const fetchUserGPS = (isSilent = false) => {
    if (!navigator.geolocation) {
      setGpsError("Browser does not support GPS coordinate acquisition.");
      return;
    }

    if (!isSilent) {
      setIsLocatingGPS(true);
      if (onSystemLog) onSystemLog("AR COMPASS: Polling high accuracy physical GPS receiver coordinates...");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserCoords({ latitude: userLat, longitude: userLng });
        setIsLocatingGPS(false);
        setGpsError(null);
        if (!isSilent && onSystemLog) {
          onSystemLog(`AR COMPASS LOCKED: Computed User Pos: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`);
        }
      },
      (error) => {
        setIsLocatingGPS(false);
        let msg = "GPS Signal blocked. Utilizing fallback proximity offset.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "GPS validation rejected by user.";
        }
        setGpsError(msg);
        
        // Use a smart proximity location matching the landmark's city as fallback
        if (activeLandmark) {
          const fallback = CITY_FALLBACK_COORDS[activeLandmark.city] || { latitude: 48.8566, longitude: 2.3522 };
          // Slightly offset the fallback coordinates so we have a realistic bearing
          setUserCoords({
            latitude: fallback.latitude + 0.0045, 
            longitude: fallback.longitude - 0.0052
          });
        }
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Convert degrees to short compass Rose string (E.g. N, NE, ENE, etc.)
  const degreesToRose = (deg: number) => {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round(((deg % 360) / 22.5)) % 16;
    return directions[index];
  };

  // Get current active heading (either simulator value or computed sensor value)
  const currentHeading = useSimulator ? simulatedHeading : heading;
  const currentPitch = useSimulator ? simulatedPitch : pitch;
  const currentRoll = useSimulator ? simulatedRoll : roll;

  // Calculate the relative angle indicating how many degrees to turn to face the landmark directly
  // 0 means looking directly at the landmark!
  const targetRelativeAngle = (bearingToLandmark - currentHeading + 360) % 360;

  return (
    <div id="ar-compass-overlay" className="bg-zinc-950/90 border border-blue-500/30 rounded-3xl p-5 shadow-2xl relative text-white font-sans overflow-hidden">
      
      {/* Dynamic Laser HUD Line on top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/20 via-blue-400 to-blue-500/20" />

      {/* Header section with HUD telemetry */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: "16s" }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-mono font-black uppercase tracking-wider text-white">
                AR Telemetry Compass
              </h4>
              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border tracking-tight ${
                useSimulator 
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30" 
                  : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 animate-pulse"
              }`}>
                {useSimulator ? "SIMULATOR OVERRIDE" : "LIVE HARDWARE MAGNETOMETER"}
              </span>
            </div>
            <p className="text-[10px] text-white/50 font-mono">
              Orient device towards true landmark coordinates (Pitch & Roll aligned)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Explanation circular icon */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-1 px-2 text-[10px] font-mono border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Read Calibration Formula Explanation"
          >
            {showExplanation ? "CLOSE HELP" : "LEARN FORMULA"}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-white/50 hover:text-white text-xs font-mono rounded border border-white/5 cursor-pointer"
          >
            {isMinimized ? "MAXIMIZE" : "MINIMIZE"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-blue-950/40 rounded-2xl border border-blue-500/20 text-[10.5px] leading-relaxed text-zinc-300 font-mono space-y-2 block"
          >
            <div className="flex items-center gap-1.5 text-blue-400 font-bold border-b border-blue-500/10 pb-1">
              <Info className="w-3.5 h-3.5" />
              <span>Real-Time Bearing Formula (Spherical Trigonometry)</span>
            </div>
            <p>
              To find the orientation from point A <span className="text-white">(Lat₁, Lon₁)</span> to landmark B <span className="text-white">(Lat₂, Lon₂)</span>, we map coordinates to radians and resolve:
            </p>
            <div className="bg-black/60 p-2.5 rounded-lg text-white font-mono text-[9.5px] border border-white/5">
              y = sin(ΔLon) · cos(Lat₂) <br />
              x = cos(Lat₁) · sin(Lat₂) - sin(Lat₁) · cos(Lat₂) · cos(ΔLon) <br />
              θ_bearing = atan2(y, x) · 180 / π
            </div>
            <p>
              The <strong>Magnetometer</strong> (Device Yaw) handles your physical cardinal direction. The <strong>Accelerometer</strong> (Pitch and Roll tilt filters) stabilizes the HUD overlay in 3D frame layouts.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!isMinimized ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Compass Graphic and Pointer dial (Column scale: 5 of 12) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-black/30 rounded-2xl border border-white/5 relative min-h-[220px]">
            {/* Visual Radar sweep background */}
            <div className="absolute inset-0 bg-radial-gradient pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute inset-x-0 top-0 bottom-0 bg-blue-500/2 animate-[radar-sweep] origin-center" />
            </div>

            {/* Circular Compass Frame */}
            <div className="relative w-44 h-44 rounded-full border-2 border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              {/* Outer ticking ticks */}
              <div className="absolute inset-1 rounded-full border border-dashed border-white/5" />
              
              {/* Compass Cardinal Points (N, S, E, W) */}
              <span className="absolute top-1 text-[10px] font-mono font-black text-red-500 tracking-tighter">N</span>
              <span className="absolute bottom-1 text-[10px] font-mono font-bold text-white/50">S</span>
              <span className="absolute right-1 text-[10px] font-mono font-bold text-white/50">E</span>
              <span className="absolute left-1 text-[10px] font-mono font-bold text-white/50">W</span>

              {/* ROTATING COMPASS DIAL (YAW heading) */}
              <div 
                className="absolute inset-4 transition-transform duration-100 ease-out flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${-currentHeading}deg)` }}
              >
                {/* 360 Ticks & labels */}
                <div className="absolute -top-1.5 w-[2px] h-2 bg-blue-400" />
                <span className="absolute top-1 text-[8px] font-mono font-bold text-blue-300">0°</span>

                <div className="absolute -right-1.5 w-2 h-[2px] bg-white/20" />
                <span className="absolute right-1 text-[8px] font-mono font-bold text-white/30 text-right">90°</span>

                <div className="absolute -bottom-1.5 w-[2px] h-2 bg-white/20" />
                <span className="absolute bottom-1 text-[8px] font-mono font-bold text-white/30">180°</span>

                <div className="absolute -left-1.5 w-2 h-[2px] bg-white/20" />
                <span className="absolute left-1 text-[8px] font-mono font-bold text-white/30">270°</span>

                {/* Target Landmark direction marker dot outside */}
                <div 
                  className="absolute w-4 h-4 -top-3.5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-[0_0_10px_#f59e0b]"
                  style={{ 
                    transform: `rotate(${bearingToLandmark}deg) translateY(-64px)`,
                    transformOrigin: "center center"
                  }}
                  title={`Target Landmark bearing: ${bearingToLandmark.toFixed(1)}°`}
                >
                  <MapPin className="w-2.5 h-2.5 text-zinc-950 shrink-0" />
                </div>
              </div>

              {/* TARGET DIRECTIVE RING (Relative Angle representation to lock coordinates) */}
              <div 
                className="absolute inset-10 transition-transform duration-100 flex items-center justify-center"
                style={{ transform: `rotate(${targetRelativeAngle}deg)` }}
              >
                {/* Big direction Pointer Arrow tracking absolute difference */}
                <div className="absolute -top-4 text-yellow-400 flex flex-col items-center">
                  <Navigation className="w-5 h-5 fill-yellow-400 drop-shadow-[0_0_8px_#f59e0b] filter stroke-zinc-950" />
                  <div className="w-[1px] h-8 bg-gradient-to-b from-yellow-400 to-transparent mt-0.5" />
                </div>
              </div>

              {/* Center digital readout readout (Yaw alignment indicator) */}
              <div className="z-10 text-center bg-zinc-950/80 p-2.5 rounded-2xl border border-white/10 max-w-[100px]">
                <span className="block text-[15px] font-mono font-black text-white px-1 leading-none tracking-tight">
                  {Math.round(currentHeading)}°
                </span>
                <span className="block text-[8px] font-mono font-bold text-blue-400 uppercase tracking-widest mt-0.5">
                  {degreesToRose(currentHeading)}
                </span>
              </div>
            </div>

            {/* Turn Directive Ribbon below */}
            <div className="mt-3 text-center space-y-1">
              <div className="flex items-center gap-1.5 justify-center">
                <span className={`w-1.5 h-1.5 rounded-full ${Math.abs(targetRelativeAngle) < 10 || Math.abs(targetRelativeAngle - 360) < 10 ? "bg-emerald-400 animate-pulse" : "bg-yellow-400"}`} />
                <span className="text-[10.5px] font-mono font-bold tracking-tight">
                  {Math.abs(targetRelativeAngle) < 8 || Math.abs(targetRelativeAngle - 360) < 8 ? (
                    <span className="text-emerald-400 font-extrabold uppercase">🎯 ALIGNMENT TARGET LOCKED</span>
                  ) : (
                    <span>TURN <strong className="text-yellow-400">{Math.round(targetRelativeAngle > 180 ? 360 - targetRelativeAngle : targetRelativeAngle)}°</strong> {targetRelativeAngle > 180 ? "LEFT ↺" : "RIGHT ↻"}</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry and Calibration variables (Column scale: 7 of 12) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Targets Summary Info Box */}
            {activeLandmark ? (
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono border-b border-white/5 pb-1.5 mb-1.5">
                  <span className="text-white/40 uppercase">Target Landmark Node</span>
                  <span className="text-yellow-400 font-bold tracking-wider">ACTIVE ROUTING</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{activeLandmark.name}</span>
                  <span className="text-[10px] font-mono text-zinc-400">{activeLandmark.city}, {activeLandmark.country}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono">
                    <span className="text-white/40 block">LANDMARK GPS:</span>
                    <span className="text-white/90 font-bold block mt-0.5 truncate text-[9px]">
                      {activeLandmark.coordinates.latitude.toFixed(5)}°, {activeLandmark.coordinates.longitude.toFixed(5)}°
                    </span>
                  </div>
                  <div className="p-2 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono">
                    <span className="text-white/40 block">CALCULATED BEARING:</span>
                    <span className="text-yellow-400 font-bold block mt-0.5">
                      {bearingToLandmark.toFixed(1)}° ({degreesToRose(bearingToLandmark)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-blue-300">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span>SPHERICAL RESCUE RANGE:</span>
                  </div>
                  <span className="font-mono font-black text-blue-200">
                    {distanceKm > 10 ? `${(distanceKm).toFixed(2)} km` : `${Math.round(distanceKm * 1000)} meters`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center text-white/55 font-mono text-xs">
                No active scanned landmark details detected. Capture a live file or select a simulation preset below to start routing.
              </div>
            )}

            {/* Sensor Permissions / Accel/Magnetometer live Diagnostics */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/40 uppercase">Accelerometer and Gyro Tilt Readout</span>
                <span className="text-xs font-bold text-white/50 italic font-sans">(AOD Stable)</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Accelerometer Lat Long roll parameters */}
                <div className="p-2 bg-black/50 rounded-xl border border-white/5 text-center font-mono">
                  <span className="text-[8px] text-white/35 uppercase block">Yaw / Compass</span>
                  <span className="text-xs font-black text-rose-400 block mt-0.5">{Math.round(yaw)}°</span>
                </div>
                <div className="p-2 bg-black/50 rounded-xl border border-white/5 text-center font-mono">
                  <span className="text-[8px] text-white/35 uppercase block">Pitch (Acc-X)</span>
                  <span className="text-xs font-black text-sky-400 block mt-0.5">{Math.round(currentPitch)}°</span>
                </div>
                <div className="p-2 bg-black/50 rounded-xl border border-white/5 text-center font-mono">
                  <span className="text-[8px] text-white/35 uppercase block">Roll (Acc-Y)</span>
                  <span className="text-xs font-black text-emerald-400 block mt-0.5">{Math.round(currentRoll)}°</span>
                </div>
              </div>

              {/* iOS Browser sensor enablement CTA if applicable */}
              {isIOSPermissionNeeded && sensorStatus === "uninitialized" && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-2.5 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex gap-1.5 items-start">
                    <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-[9.5px] font-mono text-yellow-300 leading-tight">
                      iOS Safari requires a physical gesture permission to read magnetometer sensors.
                    </p>
                  </div>
                  <button
                    onClick={requestOrientationPermission}
                    className="shrink-0 px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-mono text-[9px] font-black rounded-lg transition-colors cursor-pointer"
                  >
                    ALLOW SENSORS
                  </button>
                </div>
              )}

              {/* User Geolocation control block */}
              <div className="flex items-center justify-between gap-2.5 bg-black/40 p-2.5 rounded-xl border border-white/5 flex-wrap">
                <div className="flex items-center gap-1.5 font-mono text-[9.5px] text-white/60">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {userCoords 
                      ? `USER COORDINATES: ${userCoords.latitude.toFixed(4)}°, ${userCoords.longitude.toFixed(4)}°` 
                      : "User Geo Position: Fallback Proximity"}
                  </span>
                </div>

                <button
                  onMouseDown={() => fetchUserGPS(false)}
                  disabled={isLocatingGPS}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 disabled:opacity-30 rounded-lg text-[9px] font-mono cursor-pointer transition-all flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isLocatingGPS ? "animate-spin" : ""}`} />
                  <span>REFRESH GPS</span>
                </button>
              </div>

              {/* Simulated controllers triggers */}
              <div className="border-t border-white/5 pt-2.5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-white/40 uppercase">Hardware Prototyping Sandbox</span>
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="sim-toggle-check" className="text-white/50 text-[9px] uppercase cursor-pointer">Activate Simulation Desk:</label>
                    <input 
                      id="sim-toggle-check"
                      type="checkbox"
                      checked={useSimulator}
                      onChange={(e) => setUseSimulator(e.target.checked)}
                      className="accent-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>
                </div>

                {useSimulator && (
                  <div className="p-3 bg-black/55 rounded-xl border border-white/5 space-y-3 font-mono text-[9.5px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-white/60">
                        <span>Simulated Heading Rotor (Yaw):</span>
                        <span className="text-amber-400 font-bold">{simulatedHeading}°</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="359"
                        value={simulatedHeading}
                        onChange={(e) => setSimulatedHeading(parseInt(e.target.value))}
                        className="w-full bg-zinc-800 accent-amber-500 h-1 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-white/60">
                          <span>Pitch (Acc-X):</span>
                          <span className="text-amber-400">{simulatedPitch}°</span>
                        </div>
                        <input 
                          type="range"
                          min="-90"
                          max="90"
                          value={simulatedPitch}
                          onChange={(e) => setSimulatedPitch(parseInt(e.target.value))}
                          className="w-full bg-zinc-800 accent-sky-500 h-1 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-white/60">
                          <span>Roll (Acc-Y):</span>
                          <span className="text-amber-400">{simulatedRoll}°</span>
                        </div>
                        <input 
                          type="range"
                          min="-90"
                          max="90"
                          value={simulatedRoll}
                          onChange={(e) => setSimulatedRoll(parseInt(e.target.value))}
                          className="w-full bg-zinc-800 accent-emerald-500 h-1 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs font-mono bg-black/30 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-white/70">
            <Compass className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span>Target Bearing: <strong>{bearingToLandmark.toFixed(1)}°</strong></span>
            <span>Relative Dev: <strong className={Math.abs(targetRelativeAngle) < 10 ? "text-emerald-400" : "text-yellow-400"}>
              {Math.round(targetRelativeAngle)}°
            </strong></span>
          </div>

          <span className="text-[9.5px] text-zinc-400">
            {activeLandmark ? activeLandmark.name : "No Target Landmark Selected"} ({Math.round(distanceKm)} km away)
          </span>
        </div>
      )}

    </div>
  );
}
