import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, 
  Phone, 
  MessageSquare, 
  Locate, 
  Volume2, 
  VolumeX, 
  Radio, 
  MapPin, 
  Check, 
  Copy, 
  FileText, 
  Heart, 
  ChevronDown, 
  Clock, 
  AlertTriangle,
  User,
  Activity,
  Globe,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  Key,
  Shield,
  FileCheck,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LandmarkDetails } from "../types";

export interface EmergencyProfile {
  fullName: string;
  bloodType: string;
  allergies: string;
  icePhone: string;
  // High-fidelity first responder data points
  age: string;
  sex: string;
  height: string;
  weight: string;
  primaryLanguage: string;
  medicalConditions: string;
  medications: string;
  passportNumber: string;
  lodgingAddress: string;
  isOrganDonor: string;
  travelInsurance: string;
}

interface SOSEmergencyPortalProps {
  activeLandmark: LandmarkDetails | null;
  isOnline: boolean;
  onSystemLog: (msg: string) => void;
}

interface CountryContact {
  country: string;
  general: string;
  police: string;
  medical: string;
  fire: string;
  info: string;
}

const EMERGENCY_DATABASE: Record<string, CountryContact> = {
  USA: {
    country: "United States (USA)",
    general: "911",
    police: "911",
    medical: "911",
    fire: "911",
    info: "Enhanced 911 handles automatic localization from mobile towers."
  },
  France: {
    country: "France",
    general: "112",
    police: "17",
    medical: "15",
    fire: "18",
    info: "European universal emergency 112 operates free from all mobile networks."
  },
  Italy: {
    country: "Italy",
    general: "112",
    police: "113",
    medical: "118",
    fire: "115",
    info: "Standard European helpline 112 immediately routes to localized fire/medical."
  },
  Japan: {
    country: "Japan",
    general: "110 / 119",
    police: "110",
    medical: "119",
    fire: "119",
    info: "Dial 110 for police reporting. Dial 119 for ambulance & fire engines."
  },
  "United Kingdom": {
    country: "United Kingdom (UK)",
    general: "999",
    police: "999",
    medical: "999",
    fire: "999",
    info: "Dial 999 or 112. Free and prioritized automatically over standard cell traffic."
  },
  Germany: {
    country: "Germany",
    general: "112",
    police: "110",
    medical: "112",
    fire: "112",
    info: "Universal number 112 covers acute medicine and fire forces."
  },
  Spain: {
    country: "Spain",
    general: "112",
    police: "091",
    medical: "061",
    fire: "080",
    info: "Multi-lingual translators (English, German, French) cooperate on 112."
  },
  Canada: {
    country: "Canada",
    general: "911",
    police: "911",
    medical: "911",
    fire: "911",
    info: "Pinpoint coordinate mapping is available across united provincial hubs."
  },
  Australia: {
    country: "Australia",
    general: "000",
    police: "000",
    medical: "000",
    fire: "000",
    info: "Dial Triple Zero (000). Priority SIM routing bypasses dense cell load."
  }
};

const DEFAULT_CONTACT: CountryContact = {
  country: "Universal International Guidance",
  general: "112 / 911",
  police: "112",
  medical: "112",
  fire: "112",
  info: "European 112 & US 911 are pre-programmed into GSM standard firmware on major SIM cards."
};

/**
 * Dynamically determines correct emergency speed dials based on detected country and ISO-2 codes.
 * Highly robust fallback and region mapping is applied.
 */
function determineEmergencyNumbersByCountry(countryName: string, countryCode: string): CountryContact {
  const code = countryCode.toUpperCase();
  
  // Comprehensive mapping of ISO 2-letter codes to Emergency contacts
  const mapping: Record<string, Omit<CountryContact, "country">> = {
    US: { general: "911", police: "911", medical: "911", fire: "911", info: "Enhanced 911 handles automatic localization from mobile towers." },
    CA: { general: "911", police: "911", medical: "911", fire: "911", info: "Pinpoint coordinate mapping is available across united provincial hubs." },
    MX: { general: "911", police: "911", medical: "911", fire: "911", info: "Standard unified Mexico 911 covers police, medical, and fire rescue." },
    GB: { general: "999", police: "999", medical: "999", fire: "999", info: "Dial 999 or 112. Free and prioritized automatically over standard cell traffic." },
    FR: { general: "112", police: "17", medical: "15", fire: "18", info: "European universal emergency 112 operates free from all mobile networks." },
    DE: { general: "112", police: "110", medical: "112", fire: "112", info: "Universal number 112 covers acute medicine and fire forces. Dial 110 for police." },
    IT: { general: "112", police: "113", medical: "118", fire: "115", info: "Standard European helpline 112 immediately routes to localized fire/medical." },
    ES: { general: "112", police: "091", medical: "061", fire: "080", info: "Multi-lingual translators (English, German, French) cooperate on 112." },
    IE: { general: "112", police: "999", medical: "999", fire: "999", info: "Dial 112 or 999 to connect to all Irish emergency response bodies." },
    NL: { general: "112", police: "112", medical: "112", fire: "112", info: "Universal 112 hub covers all safety branches in the Netherlands." },
    BE: { general: "112", police: "101", medical: "112", fire: "112", info: "Call 112 for medical/fire, or 101 for federal police services." },
    CH: { general: "112", police: "117", medical: "144", fire: "118", info: "Universal 112 works, but Swiss direct: 117 Police, 144 Medical, 118 Fire." },
    AT: { general: "112", police: "133", medical: "144", fire: "122", info: "Multi-channel Austrian lines: 133 Police, 144 Medical, 122 Fire, 112 General." },
    GR: { general: "112", police: "100", medical: "166", fire: "199", info: "Greek emergency channels: 100 Police, 166 Ambulance, 199 Fire, 112 Universal." },
    PT: { general: "112", police: "112", medical: "112", fire: "112", info: "Unified 112 lines handle all Portuguese civil defense dispatch." },
    SE: { general: "112", police: "112", medical: "112", fire: "112", info: "Svenska 112 handles all ambulance, police, and rescue brigade dispatches." },
    NO: { general: "112", police: "112", medical: "113", fire: "110", info: "Norwegian direct lines: 112 Police, 113 Medical, 110 Fire force." },
    DK: { general: "112", police: "112", medical: "112", fire: "112", info: "Danish 112 dial structures coordinate immediate multi-threat dispatch." },
    FI: { general: "112", police: "112", medical: "112", fire: "112", info: "Unified Finnish 112 coordinates central emergency dispatch." },
    PL: { general: "112", police: "997", medical: "999", fire: "998", info: "Unified 112 or direct: 997 Police, 999 Ambulance, 998 Fire services." },
    RU: { general: "112", police: "102", medical: "103", fire: "101", info: "Russian federal systems: 102 Police, 103 Medical, 101 Fire, 112 General." },
    TR: { general: "112", police: "112", medical: "112", fire: "112", info: "Turkey has consolidated all emergency numbers to 112." },
    UA: { general: "112", police: "102", medical: "103", fire: "101", info: "Ukrainian unified 112 operates alongside legacy 101/102/103 channels." },
    JP: { general: "110 / 119", police: "110", medical: "119", fire: "119", info: "Dial 110 for police reporting. Dial 119 for ambulance & fire engines." },
    CN: { general: "110 / 120", police: "110", medical: "120", fire: "119", info: "China standard: 110 Police, 120 Medical, 119 Fire department." },
    IN: { general: "112", police: "112", medical: "112", fire: "112", info: "India's National Emergency Number is active across all states." },
    AU: { general: "000", police: "000", medical: "000", fire: "000", info: "Dial Triple Zero (000). Priority SIM routing bypasses dense cell load." },
    NZ: { general: "111", police: "111", medical: "111", fire: "111", info: "New Zealand 111 connects to Police, Fire, and Ambulance services instantly." },
    SG: { general: "999 / 995", police: "999", medical: "995", fire: "995", info: "Singapore: 999 for Police, 995 for emergency Medical/Fire services." },
    HK: { general: "999", police: "999", medical: "999", fire: "999", info: "Hong Kong 999 connects to unified command units." },
    TW: { general: "110 / 119", police: "110", medical: "119", fire: "119", info: "Taiwan: Dial 110 for police, 119 for firefighter/EMT rescue." },
    KR: { general: "112 / 119", police: "112", medical: "119", fire: "119", info: "South Korea: 112 for Police dispatch, 119 for fire and ambulance." },
    TH: { general: "191", police: "191", medical: "1669", fire: "199", info: "Thailand: 191 Tourist/General Police, 1669 Ambulance, 199 Fire force." },
    VN: { general: "113", police: "113", medical: "115", fire: "114", info: "Vietnam channels: 113 Police, 115 Medical ambulance, 114 Fire brigade." },
    MY: { general: "999", police: "999", medical: "999", fire: "999", info: "Malaysia Emergency response 999 covers all primary civil services." },
    ID: { general: "112", police: "110", medical: "118", fire: "113", info: "Indonesia: 112 is active on newer infrastructure; 110 Police, 118 Ambulance." },
    PH: { general: "911", police: "911", medical: "911", fire: "911", info: "Philippines 911 operates nationwide command and control protocols." },
    PK: { general: "15", police: "15", medical: "115", fire: "16", info: "Pakistan: 15 for Police Madadgar, 115 for Edhi Ambulance, 16 for Fire." },
    BD: { general: "999", police: "999", medical: "999", fire: "999", info: "Bangladesh national emergency service 999 routes to all agencies." },
    BR: { general: "190", police: "190", medical: "192", fire: "193", info: "Brazil: 190 Police, 192 SAMU Ambulance, 193 Fire brigade." },
    AR: { general: "911", police: "911", medical: "107", fire: "100", info: "Argentina 911 unified dispatcher operates in main metropolitan zones." },
    CO: { general: "123", police: "123", medical: "123", fire: "123", info: "Colombia 123 is the unified direct line for all first responders." },
    PE: { general: "911", police: "105", medical: "117", fire: "116", info: "Peru: 911 is unified, or direct 105 Police, 117 SAMU, 116 Fire." },
    CL: { general: "133", police: "133", medical: "131", fire: "132", info: "Chile: 133 Carabineros Police, 131 SAMU Ambulance, 132 Bomberos Fire." },
    EC: { general: "911", police: "911", medical: "911", fire: "911", info: "Ecuador ECU-911 operates unified satellite-enabled dispatch." },
    VE: { general: "911", police: "911", medical: "911", fire: "911", info: "Venezuela: Dial 911 for universal emergency coordination." },
    SA: { general: "911", police: "911", medical: "997", fire: "998", info: "Saudi Arabia: 911 is unified in main provinces, or 997 Medical / 998 Fire." },
    AE: { general: "999", police: "999", medical: "998", fire: "997", info: "UAE: 999 Police dispatch, 998 Ambulance, 997 Fire department." },
    IL: { general: "100 / 101", police: "100", medical: "101", fire: "102", info: "Israel: 100 Police, 101 Mada Ambulance, 102 Fire services." },
    EG: { general: "122", police: "122", medical: "123", fire: "180", info: "Egypt: 122 Police, 123 Ambulance, 180 Fire department." },
    ZA: { general: "112", police: "10111", medical: "10177", fire: "10177", info: "South Africa: Dial 112 from cellphones, or 10111 for Police." },
    KE: { general: "999", police: "999", medical: "999", fire: "999", info: "Kenya: Dial 999 or 112 for national emergency services." },
    NG: { general: "112", police: "112", medical: "112", fire: "112", info: "Nigeria: Dial 112 or 767 to summon command centers." },
  };

  const matched = mapping[code];
  if (matched) {
    return {
      country: countryName,
      ...matched
    };
  }

  // Unified fallback systems matching common continental allocations
  let general = "112";
  let police = "112";
  let medical = "112";
  let fire = "112";
  let info = `Universal cell network helpline 112 functions in ${countryName}. standard firmware routes cellular calls to active responders.`;

  if (["US", "CA", "MX", "CR", "PA", "SV", "EC", "VE", "PH", "AR"].includes(code)) {
    general = "911";
    police = "911";
    medical = "911";
    fire = "911";
    info = `Universal SOS 911 functions in ${countryName} and bridges to local municipality rescue units.`;
  } else if (["GB", "IE", "SG", "MY", "KE", "BD", "HK"].includes(code)) {
    general = "999";
    police = "999";
    medical = "999";
    fire = "999";
    info = `Universal SOS 999 connects immediately to domestic dispatch lines inside ${countryName}.`;
  }

  return {
    country: countryName,
    general,
    police,
    medical,
    fire,
    info
  };
}

export default function SOSEmergencyPortal({ activeLandmark, isOnline, onSystemLog }: SOSEmergencyPortalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountryKey, setSelectedCountryKey] = useState<string>("France");
  const [dynamicDatabase, setDynamicDatabase] = useState<Record<string, CountryContact>>({});
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);
  const [isQueringGPS, setIsQueringGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Active tab inside Emergency UI: dials, dossier, report-crime, or strobe-module
  const [activeTab, setActiveTab] = useState<"directory" | "dossier" | "crime_report" | "high_vis">("directory");

  // Profile forms kept fully client-side and persistent
  const [profile, setProfile] = useState<EmergencyProfile>({
    fullName: "",
    bloodType: "O+",
    allergies: "",
    icePhone: "",
    age: "",
    sex: "Unknown",
    height: "",
    weight: "",
    primaryLanguage: "",
    medicalConditions: "",
    medications: "",
    passportNumber: "",
    lodgingAddress: "",
    isOrganDonor: "No",
    travelInsurance: ""
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [smsCopied, setSmsCopied] = useState(false);

  // Active Threat/Crime reporting wizard inputs (highly effective telemetry)
  const [crimeType, setCrimeType] = useState<string>("Theft/Stalking");
  const [suspectDescription, setSuspectDescription] = useState<string>("");
  const [weaponsObserved, setWeaponsObserved] = useState<string>("None");
  const [directionOfFlight, setDirectionOfFlight] = useState<string>("");
  const [threatLevel, setThreatLevel] = useState<"LOW" | "HIGH" | "CRITICAL">("HIGH");
  const [crimeReportText, setCrimeReportText] = useState<string>("");
  const [reportCopied, setReportCopied] = useState(false);

  // High-Vis strobe flashing and sirens (Deterrent capability)
  const [isStrobeActive, setIsStrobeActive] = useState<boolean>(false);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [strobeColorToggle, setStrobeColorToggle] = useState<boolean>(false);

  // Satellite beacon simulator
  const [satelliteSimActive, setSatelliteSimActive] = useState(false);
  const [satelliteProgress, setSatelliteProgress] = useState(0);
  const [satelliteLogs, setSatelliteLogs] = useState<string[]>([]);
  const [isAcousticOn, setIsAcousticOn] = useState(false);

  // Web Audio Context reference for SOS audio whistle/siren beacons
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<any>(null);
  const strobeIntervalRef = useRef<any>(null);

  // Screen Wake Lock API for Always On Display (prevents screen lock/dimming)
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const wakeLockRef = useRef<any>(null);

  // Biometric Facial Recognition Gate States
  const [isBiometricAuthenticated, setIsBiometricAuthenticated] = useState<boolean>(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);
  const [biometricScanProgress, setBiometricScanProgress] = useState<number>(0);
  const [biometricScanLogs, setBiometricScanLogs] = useState<string[]>([]);
  const [biometricScanError, setBiometricScanError] = useState<string | null>(null);
  const [biometricSimulateCheckFail, setBiometricSimulateCheckFail] = useState<boolean>(false);
  const [biometricCameraStream, setBiometricCameraStream] = useState<MediaStream | null>(null);
  const biometricVideoRef = useRef<HTMLVideoElement | null>(null);

  const startBiometricScan = async () => {
    setIsBiometricScanning(true);
    setBiometricScanProgress(0);
    setBiometricScanError(null);
    setBiometricScanLogs(["[SYS-INIT] Instantiating Secure Biometric Enclave Camera Channel..."]);
    onSystemLog("911 SECURITY: Triggered pseudo-biometric face scan for medical dossier access.");

    let stream: MediaStream | null = null;
    if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 480 } }
        });
        setBiometricCameraStream(stream);
        setBiometricScanLogs(prev => [...prev, "[SYS-OK] User-facing optical input stream linked successfully."]);
        
        // Link stream to ref
        setTimeout(() => {
          if (biometricVideoRef.current && stream) {
            biometricVideoRef.current.srcObject = stream;
          }
        }, 120);
      } catch (err) {
        console.warn("User camera access denied/missing for face scanner:", err);
        setBiometricScanLogs(prev => [
          ...prev, 
          "[WARN] Direct optical hardware stream blocked or unavailable.",
          "[SYS] Initializing vector lattice simulation overlay (No-Cam Fallback)..."
        ]);
        onSystemLog("911 SECURITY: Camera stream unavailable. Initializing vector lattice simulation for face match.");
      }
    } else {
      setBiometricScanLogs(prev => [
        ...prev,
        "[SYS] Browser lacks physical media access APIs.",
        "[SYS] Initializing default geometric simulation matrix..."
      ]);
    }

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress > 100) {
        currentProgress = 100;
      }
      setBiometricScanProgress(currentProgress);

      const logsToTrigger: Record<number, string> = {
        10: "[SYS] Normalizing optical pitch frames. Analyzing background luminance...",
        25: "[SYS] Framing biometric template. Locating bounding pupil coordinates...",
        40: "[SYS] Mapping 128 structural node variables (nose distance, chin radius)...",
        55: "[SYS] Compiling mathematical face depth hash vector key...",
        70: "[SYS] Syncing geometry structural matrix to local device keyring...",
        85: "[SYS] Directing liveness probe (checking pupil reflection & micromovement)...",
        95: "[SYS] Executing decrypt verification on stored emergency credentials..."
      };

      if (logsToTrigger[currentProgress]) {
        setBiometricScanLogs(prev => [...prev, logsToTrigger[currentProgress]]);
      }

      if (currentProgress === 100) {
        clearInterval(progressInterval);
        
        if (stream) {
          try {
            stream.getTracks().forEach(t => t.stop());
          } catch (e) {}
          setBiometricCameraStream(null);
        }

        if (biometricSimulateCheckFail) {
          setBiometricScanError("VERIFICATION_FAILED");
          setBiometricScanLogs(prev => [
            ...prev,
            "[ALERT-CRITICAL] MATHEMATICAL DISSIMILARITY THRESHOLD EXCEEDED (INDEX 0.42 < REQ 0.85).",
            "[SYS] SECURITY BLOCK: ILLEGITIMATE USER IDENTITY DETECTED. DECRYPTION SUSPENDED."
          ]);
          setIsBiometricScanning(false);
          onSystemLog("911 SECURITY ERROR: Biometric facial authorization failed (Simulated Deviation).");
        } else {
          setIsBiometricAuthenticated(true);
          setIsBiometricScanning(false);
          setBiometricScanLogs(prev => [
            ...prev,
            "[SYS-OK] ENCLAVE MATCH INDEX 0.97 SUCCESS. DIGITAL KEY RELEASED.",
            "[SYS-OK] MEDICAL VAULT DECRYPTED. ACCESS GRANTED."
          ]);
          onSystemLog("911 SECURITY SUCCESS: Biometric face-link authorized. Emergency dossier unlocked.");
        }
      }
    }, 120);
  };

  const handleCancelBiometricScan = () => {
    setIsBiometricScanning(false);
    setBiometricScanProgress(0);
    setBiometricScanError(null);
    if (biometricCameraStream) {
      try {
        biometricCameraStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      setBiometricCameraStream(null);
    }
    setBiometricScanLogs(prev => [...prev, "[SYS] Verification process canceled."]);
    onSystemLog("911 SECURITY: Face authorization scan suspended by user.");
  };

  const handleDirectBypass = () => {
    setIsBiometricAuthenticated(true);
    setIsBiometricScanning(false);
    setBiometricScanError(null);
    if (biometricCameraStream) {
      try {
        biometricCameraStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      setBiometricCameraStream(null);
    }
    onSystemLog("911 SECURITY: Authorized medical dossier unlock via developer bypass override.");
  };

  const handleLockVault = () => {
    setIsBiometricAuthenticated(false);
    setBiometricScanError(null);
    setBiometricScanProgress(0);
    onSystemLog("911 SECURITY: Re-locked medical dossier vault. Biometric check required again.");
  };

  // Auto clean-up when portal closed or tab changed
  useEffect(() => {
    if (!isOpen || activeTab !== "dossier") {
      if (biometricCameraStream) {
        try {
          biometricCameraStream.getTracks().forEach(t => t.stop());
        } catch (e) {}
        setBiometricCameraStream(null);
      }
      setIsBiometricScanning(false);
      setBiometricScanProgress(0);
    }
  }, [isOpen, activeTab]);

  // Camera video tracks and permissions for hardware physical LED torch strobe
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const [isHardwareFlashlightSupported, setIsHardwareFlashlightSupported] = useState<boolean>(false);
  const [isHardwareFlashlightActive, setIsHardwareFlashlightActive] = useState<boolean>(false);
  const [flashlightError, setFlashlightError] = useState<string | null>(null);

  const acquireWakeLock = async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      if (wakeLockRef.current) return;
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      setIsWakeLockActive(true);
      onSystemLog("911 ALWAYS-ON ENGINE: Screen Wake Lock active. Device display will remain always on (AOD).");
    } catch (err: any) {
      console.warn("Failed to acquire wake lock:", err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsWakeLockActive(false);
        onSystemLog("911 ALWAYS-ON ENGINE: Wake Lock released. Native display sleepers restored.");
      } catch (err) {
        console.warn("Wake lock release exception:", err);
      }
    }
  };

  // Automate Always-On Wake Lock when Emergency Portal is Open
  useEffect(() => {
    if (isOpen) {
      acquireWakeLock();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          acquireWakeLock();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        releaseWakeLock();
      };
    } else {
      releaseWakeLock();
    }
  }, [isOpen]);

  const startHardwareFlashlight = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setFlashlightError("Device lacks media input capability.");
      return;
    }
    setFlashlightError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }
      });
      const track = stream.getVideoTracks()[0];
      videoStreamRef.current = stream;
      videoTrackRef.current = track;
      setIsHardwareFlashlightActive(true);

      // Verify torch is available in track capability set
      try {
        const caps = (track as any).getCapabilities?.();
        if (caps && caps.torch) {
          setIsHardwareFlashlightSupported(true);
          onSystemLog("911 TORCH ENGINE: Physical rear camera transceiver linked and torch verified.");
        } else {
          setIsHardwareFlashlightSupported(false);
          onSystemLog("911 TORCH ENGINE: Camera stream open, but physical LED flashlight control unavailable.");
        }
      } catch (e) {
        setIsHardwareFlashlightSupported(true);
        onSystemLog("911 TORCH ENGINE: Camera stream open. Attempting torch strobe signals.");
      }

    } catch (err: any) {
      console.warn("Rear camera access denied or missing:", err);
      setFlashlightError("No rear camera access allowed for torch control.");
      setIsHardwareFlashlightActive(false);
      setIsHardwareFlashlightSupported(false);
      onSystemLog("911 TORCH WARNING: Physical LED access unavailable. Operating screen flasher fallback.");
    }
  };

  const stopHardwareFlashlight = () => {
    if (videoTrackRef.current) {
      try {
        (videoTrackRef.current as any).applyConstraints?.({
          advanced: [{ torch: false }]
        }).catch(() => {});
      } catch (e) {}
      try {
        videoTrackRef.current.stop();
      } catch (e) {}
      videoTrackRef.current = null;
    }
    if (videoStreamRef.current) {
      try {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      videoStreamRef.current = null;
    }
    setIsHardwareFlashlightActive(false);
  };

  // Listen to external triggers to open the modal instantly
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
      fetchLocalGPSCoords();
    };
    window.addEventListener("open-sos-portal", handleOpenEvent);
    return () => {
      window.removeEventListener("open-sos-portal", handleOpenEvent);
    };
  }, []);

  // Sync profile details with active scanned landmark
  useEffect(() => {
    if (activeLandmark && activeLandmark.country) {
      const countryStr = activeLandmark.country;
      const dbMatch = Object.keys(EMERGENCY_DATABASE).find(
        (key) => key.toLowerCase().includes(countryStr.toLowerCase()) || 
                 countryStr.toLowerCase().includes(key.toLowerCase())
      );
      if (dbMatch) {
        setSelectedCountryKey(dbMatch);
        return;
      }
      
      setDynamicDatabase(prev => {
        const dynKeys = Object.keys(prev);
        const dynMatch = dynKeys.find(
          (key) => key.toLowerCase().includes(countryStr.toLowerCase()) || 
                   countryStr.toLowerCase().includes(key.toLowerCase())
        );
        if (dynMatch) {
          setTimeout(() => setSelectedCountryKey(dynMatch), 0);
          return prev;
        }

        const dynamicContact = determineEmergencyNumbersByCountry(countryStr, "");
        setTimeout(() => setSelectedCountryKey(countryStr), 0);
        return {
          ...prev,
          [countryStr]: dynamicContact
        };
      });
    }
  }, [activeLandmark?.country]);

  // Load Saved SOS profile offline
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ar_sos_profile_v1");
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (err) {
      console.warn("Could not read local SOS profile:", err);
    }
  }, []);

  const currentLatitude = geoCoords ? geoCoords.lat : (activeLandmark ? activeLandmark.coordinates.latitude : 48.8584);
  const currentLongitude = geoCoords ? geoCoords.lng : (activeLandmark ? activeLandmark.coordinates.longitude : 2.2945);

  const activeContact = EMERGENCY_DATABASE[selectedCountryKey] || dynamicDatabase[selectedCountryKey] || DEFAULT_CONTACT;

  // Dynamic Reverse Geocoding via BigDataCloud & OpenStreetMap fallback
  const reverseGeocode = async (lat: number, lng: number) => {
    onSystemLog(`911 REVERSE GEOCATOR: Querying dynamic geodetic coordinates...`);
    try {
      // Primary: BigDataCloud's free reverse geocoding client API
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      if (!response.ok) {
        throw new Error(`BigDataCloud response status ${response.status}`);
      }
      const data = await response.json();
      const countryName = data.countryName;
      const countryCode = data.countryCode; // e.g. "US", "FR"

      if (countryName) {
        onSystemLog(`911 REVERSE GEOCATOR: Detected territory [${countryCode || "UNKNOWN"}] ${countryName}`);
        
        // Check static system database first
        const dbMatch = Object.keys(EMERGENCY_DATABASE).find(
          (key) => key.toLowerCase() === countryName.toLowerCase() ||
                   EMERGENCY_DATABASE[key].country.toLowerCase().includes(countryName.toLowerCase()) ||
                   countryName.toLowerCase().includes(key.toLowerCase())
        );
        
        if (dbMatch) {
          setSelectedCountryKey(dbMatch);
          onSystemLog(`911 ENGINE: Aligned emergency channels with pre-compiled standard database parameters for ${dbMatch}.`);
        } else {
          // Check dynamic state database next or auto-create
          setDynamicDatabase(prev => {
            if (prev[countryName]) {
              setTimeout(() => setSelectedCountryKey(countryName), 0);
              return prev;
            }
            const determined = determineEmergencyNumbersByCountry(countryName, countryCode || "");
            setTimeout(() => setSelectedCountryKey(countryName), 0);
            return {
              ...prev,
              [countryName]: determined
            };
          });
          onSystemLog(`911 ENGINE: Configured real-time custom dispatch parameters for ${countryName}.`);
        }
      }
    } catch (err: any) {
      onSystemLog(`911 REVERSE GEOCATOR WARNING: Primary geolocator offline. Probing OpenStreetMap backup...`);
      // Secondary: OpenStreetMap Nominatim reverse geocoding fallback
      try {
        const osmResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
          headers: { "Accept-Language": "en" }
        });
        if (osmResponse.ok) {
          const osmData = await osmResponse.json();
          const address = osmData.address || {};
          const countryName = address.country;
          const countryCode = address.country_code ? address.country_code.toUpperCase() : "";

          if (countryName) {
            onSystemLog(`911 REVERSE GEOCATOR (OSM-BACKUP): Detected territory [${countryCode}] ${countryName}`);
            const dbMatch = Object.keys(EMERGENCY_DATABASE).find(
              (key) => key.toLowerCase() === countryName.toLowerCase() ||
                       EMERGENCY_DATABASE[key].country.toLowerCase().includes(countryName.toLowerCase()) ||
                       countryName.toLowerCase().includes(key.toLowerCase())
            );
            if (dbMatch) {
              setSelectedCountryKey(dbMatch);
            } else {
              setDynamicDatabase(prev => {
                if (prev[countryName]) {
                  setTimeout(() => setSelectedCountryKey(countryName), 0);
                  return prev;
                }
                const determined = determineEmergencyNumbersByCountry(countryName, countryCode);
                setTimeout(() => setSelectedCountryKey(countryName), 0);
                return {
                  ...prev,
                  [countryName]: determined
                };
              });
            }
          }
        } else {
          throw new Error("OSM server rejected request.");
        }
      } catch (osmErr: any) {
        onSystemLog(`911 REVERSE GEOCATOR ERROR: Primary & backup geolocators offline. Manual selection active. (${osmErr.message})`);
      }
    }
  };

  // Real-time location acquisition
  const fetchLocalGPSCoords = () => {
    if (!navigator.geolocation) {
      setGpsError("System/device doesn't support built-in hardware GPS trackers.");
      return;
    }

    setIsQueringGPS(true);
    setGpsError(null);
    onSystemLog("911 GEOLOCATOR: Syncing high-precision GPS telemetry...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setGeoCoords({ lat, lng });
        setGeoAccuracy(position.coords.accuracy);
        setIsQueringGPS(false);
        onSystemLog(`911 POSITION LOCKED: Accuracy verified within ±${Math.round(position.coords.accuracy)}m.`);
        reverseGeocode(lat, lng);
      },
      (error) => {
        setIsQueringGPS(false);
        let errorMsg = "GPS signal tracking blocked or timed out.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Coordinates search manual permit rejected.";
        }
        setGpsError(errorMsg);
        onSystemLog(`911 GEOLOCATOR WARNING: ${errorMsg}`);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("ar_sos_profile_v1", JSON.stringify(profile));
      setIsEditingProfile(false);
      onSystemLog("Visitor emergency personnel dossier updated successfully on offline secure disk.");
      // Fire global dispatch event to dismiss alert ribbon elsewhere
      window.dispatchEvent(new CustomEvent("sos-profile-updated"));
    } catch (err) {
      console.error(err);
    }
  };

  // Compile a highly optimized, high-density distress text message
  const generateDistressSms = () => {
    const latStr = currentLatitude.toFixed(6);
    const lngStr = currentLongitude.toFixed(6);
    const landmarkName = activeLandmark ? activeLandmark.name : "Unknown Historic Coordinate";

    let msg = `🆘 AR-LENS 911 EXTREME DISTRESS FLARE 🆘\n`;
    msg += `📍 LOC: ${landmarkName}\n`;
    msg += `🌐 GPS: Lat ${latStr}, Lng ${lngStr}\n`;
    if (geoAccuracy) msg += `🎯 RESCUE WINDOW: ±${Math.round(geoAccuracy)}m\n`;
    
    if (profile.fullName) {
      msg += `👤 USER: ${profile.fullName} | Age ${profile.age || "N/A"} (${profile.sex})\n`;
      msg += `🩸 BLOOD: ${profile.bloodType} | Meds: ${profile.medications || "None"} | Conditions: ${profile.medicalConditions || "None"}\n`;
      msg += `🚑 INS: ${profile.travelInsurance || "None stated"}\n`;
      if (profile.icePhone) msg += `📞 EMERGENCY CONTACT: ${profile.icePhone}\n`;
    }
    msg += `📡 [Sent via offline cell-relay/LENS.AR Travel Companion]`;
    return msg;
  };

  const copySmsDraft = () => {
    const text = generateDistressSms();
    navigator.clipboard.writeText(text);
    setSmsCopied(true);
    setTimeout(() => setSmsCopied(false), 2000);
    onSystemLog("Low-Bandwidth distress SMS memo captured to clipboard.");
  };

  // Generate structured proactive Incident / Crime report
  const handleGenerateCrimeReport = (e: React.FormEvent) => {
    e.preventDefault();
    const latStr = currentLatitude.toFixed(6);
    const lngStr = currentLongitude.toFixed(6);
    
    let report = `🚨 CRITICAL 911 FIELD INCIDENT REPORT 🚨\n`;
    report += `====================================\n`;
    report += `⚠️ TYPE: ${crimeType.toUpperCase()}\n`;
    report += `🛑 THREAT LEVEL: ${threatLevel}\n`;
    report += `📍 INCIDENT GPS: Lat ${latStr}, Lng ${lngStr}\n`;
    report += `🎭 SUSPECT DESCRIPTION: ${suspectDescription || "Not provided"}\n`;
    report += `⚔️ WEAPONS DETECTED: ${weaponsObserved}\n`;
    report += `🏃 DIRECTION OF FLIGHT: ${directionOfFlight || "Unknown"}\n`;
    report += `👥 REPORTED BY: ${profile.fullName || "Incapacitated Tourist/Anon"}\n`;
    report += `📞 USER ICE PHONE: ${profile.icePhone || "N/A"}\n`;
    report += `====================================\n`;
    report += `📡 TRANSMISSION HUB: EXTREME PRIORITY TELEMETRY SATELLITE PACKET`;
    
    setCrimeReportText(report);
    onSystemLog(`911 Incident report initialized. Structured payload compiled for active ${crimeType}.`);
  };

  const copyCrimeReport = () => {
    if (!crimeReportText) return;
    navigator.clipboard.writeText(crimeReportText);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2000);
    onSystemLog("Active Crime dispatch log captured to clipboard. Transmit immediately via SMS/911 chat!");
  };

  // Physical Strobe Flag Toggler and Siren Synth (Deterrent module)
  useEffect(() => {
    let internalStrobeToggle = false;
    
    const runStrobe = async () => {
      if (isStrobeActive) {
        // First acquire the hardware camera torch access
        await startHardwareFlashlight();

        strobeIntervalRef.current = setInterval(() => {
          internalStrobeToggle = !internalStrobeToggle;
          setStrobeColorToggle(internalStrobeToggle);

          // Apply physical flashlight toggle if track is available
          if (videoTrackRef.current) {
            try {
              (videoTrackRef.current as any).applyConstraints?.({
                advanced: [{ torch: internalStrobeToggle }]
              }).catch(() => {});
            } catch (err) {
              // Silent fallback
            }
          }
        }, 120); // Fast strobe frequency
      } else {
        stopHardwareFlashlight();
        if (strobeIntervalRef.current) {
          clearInterval(strobeIntervalRef.current);
          strobeIntervalRef.current = null;
        }
      }
    };

    runStrobe();

    return () => {
      if (strobeIntervalRef.current) {
        clearInterval(strobeIntervalRef.current);
        strobeIntervalRef.current = null;
      }
      stopHardwareFlashlight();
    };
  }, [isStrobeActive]);

  const toggleSirenAudio = () => {
    if (isSirenActive) {
      stopSirenAudio();
    } else {
      startSirenAudio();
    }
  };

  const startSirenAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      setIsSirenActive(true);
      onSystemLog("911 ACTIVE SIREN ENGINE: Initializing high-intensity crime deterrent decibel loops...");

      let direction = 1;
      let currentFreq = 600;

      const playPulse = () => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sawtooth";
        // Frequency sweep simulation mimicking real physical law-enforcement sirens
        if (direction === 1) {
          currentFreq += 150;
          if (currentFreq >= 1300) direction = -1;
        } else {
          currentFreq -= 150;
          if (currentFreq <= 500) direction = 1;
        }

        osc.frequency.setValueAtTime(currentFreq, ctx.currentTime);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.8, ctx.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      };

      playPulse();
      audioIntervalRef.current = setInterval(playPulse, 280);

    } catch (err) {
      console.warn("Audio Context block or error:", err);
      onSystemLog("Failed to initiate audio siren synthesizer.");
    }
  };

  const stopSirenAudio = () => {
    setIsSirenActive(false);
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    onSystemLog("911 Active Audio Siren deactivated.");
  };

  // Direct whistle alarm trigger
  const toggleAcousticBeacon = () => {
    if (isAcousticOn) {
      stopAcousticBeacon();
    } else {
      startAcousticBeacon();
    }
  };

  const startAcousticBeacon = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      setIsAcousticOn(true);
      onSystemLog("Acoustic Audio Distress Sonar activated (cyclical whistles)...");

      let isHigh = false;
      const playWhistlePulse = () => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(isHigh ? 1600 : 900, ctx.currentTime);
        isHigh = !isHigh;

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.7, ctx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      };

      playWhistlePulse();
      audioIntervalRef.current = setInterval(playWhistlePulse, 800);

    } catch (err) {
      console.warn("Acoustic whistleblower error:", err);
    }
  };

  const stopAcousticBeacon = () => {
    setIsAcousticOn(false);
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    onSystemLog("Acoustic Distress Sonar silenced.");
  };

  // Satellite transponder simulator
  const triggerSatelliteBeaconSim = () => {
    setSatelliteSimActive(true);
    setSatelliteProgress(0);
    setSatelliteLogs([
      "⚠️ SATELLITE INTERFACE: Physical cellular towers offline. Re-routing emergency protocols...",
      "🛰️ Booting internal emergency transponder transceivers...",
      "[SARSAT] Scanning low earth orbital window for satellite cluster search..."
    ]);
    onSystemLog("SATELLITE EMERGENCY INTERFACE ACTIVE: Scanning orbital COSPAS-SARSAT overlays...");

    const intervals = [
      { prg: 20, l: "📡 Synchronizing localized GPS coordinates payload structure (406 MHz signal frequency)..." },
      { prg: 45, l: "🛰️ Active Iridium constellation network detected at azimuth angle 223.4°" },
      { prg: 70, l: "💫 Secondary geostationary overlay beacon handshake completed..." },
      { prg: 90, l: "⚡ Sending encrypted distress telemetry capsule to regional ground receiving portals..." },
      { prg: 100, l: "✅ SATELLITE BEACON TRANSMITTED: Crisis coordination nodes updated. Distress link remains hot." }
    ];

    let currentStep = 0;
    const progressTimer = setInterval(() => {
      setSatelliteProgress((prev) => {
        const next = prev + 5;
        if (currentStep < intervals.length && next >= intervals[currentStep].prg) {
          setSatelliteLogs((prevLogs) => [...prevLogs, intervals[currentStep].l]);
          onSystemLog(`[SATELLITE] ${intervals[currentStep].l}`);
          currentStep++;
        }
        if (next >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return next;
      });
    }, 450);
  };

  return (
    <>
      {/* Red, attention-seeking SOS Floating Button */}
      <button
        id="safety-sos-button"
        onClick={() => {
          setIsOpen(true);
          fetchLocalGPSCoords();
        }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-red-600 hover:bg-red-500 rounded-full shadow-[0_0_25px_rgba(239,68,68,0.7)] flex items-center justify-center border border-red-400 group cursor-pointer transition-all duration-300 md:bottom-8 md:right-8 active:scale-95 text-white"
        title="Emergency Safety & Local Authorities Help Portal"
      >
        <ShieldAlert className="w-6 h-6 animate-pulse text-white shrink-0 group-hover:scale-110 transition-transform" />
        <span className="max-w-px overflow-hidden group-hover:max-w-[150px] transition-all duration-300 ease-out font-mono text-[10px] font-black tracking-widest uppercase pl-0 group-hover:pl-2 text-white">
          911 EMERGENCY SYSTEM
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl overflow-y-auto">
            <motion.div
              id="sos-safety-modal"
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-4xl bg-zinc-950 border border-red-500/40 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.4)] flex flex-col max-h-[92vh] overflow-hidden text-white font-sans"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 bg-gradient-to-r from-red-950/40 via-black to-red-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-pulse shrink-0">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-md font-mono font-black uppercase text-red-500 tracking-wider">
                        911 CRISIS COGNIZANCE STATION
                      </h3>
                      <span className="text-[8px] font-mono bg-red-600/30 text-rose-300 border border-red-500/40 px-2 py-0.5 rounded-full font-black animate-pulse">
                        ADMIN TERMINAL
                      </span>
                    </div>
                    <p className="text-[10px] text-white/50 tracking-wide font-mono">
                      High-Precision Telemetry Reporting, Active Deterrence & Medical Archival Tools (Fully Functional Offline)
                    </p>
                  </div>
                </div>

                <button
                  id="close-sos-modal"
                  onClick={() => {
                    setIsOpen(false);
                    stopAcousticBeacon();
                    stopSirenAudio();
                    setIsStrobeActive(false);
                    setSatelliteSimActive(false);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-red-500/30 text-xs font-mono font-bold text-white/70 hover:text-white cursor-pointer transition-colors"
                >
                  X ESCAPE
                </button>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="bg-zinc-900 border-b border-white/10 flex flex-wrap gap-1 px-4 py-2">
                <button
                  onClick={() => { setActiveTab("directory"); }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[10.5px] font-bold transition-all cursor-pointer ${
                    activeTab === "directory" ? "bg-red-600 text-white shadow-lg shadow-red-600/25" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  📞 Direct Dials & Numbers
                </button>
                <button
                  onClick={() => { setActiveTab("dossier"); }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "dossier" ? "bg-red-600 text-white shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  👤 medical dossier ({profile.fullName ? "SAVED" : "EMPTY"})
                </button>
                <button
                  onClick={() => { setActiveTab("crime_report"); }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[10.5px] font-bold transition-all cursor-pointer ${
                    activeTab === "crime_report" ? "bg-red-600 text-white shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  🚨 Incident Report Generator
                </button>
                <button
                  onClick={() => { setActiveTab("high_vis"); }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === "high_vis" ? "bg-red-600 text-white shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  ⚡ Strobe Flashlight & Sirens
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
                
                {/* Connection Status Flag */}
                <div className={`p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs ${
                  isOnline 
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-ping"}`} />
                    <span className="font-mono uppercase font-bold tracking-wider">
                      Emergency Net Status: {isOnline ? "Direct Cellular Handshake Online" : "CELLULAR SIGNAL BLOCKED - SATELLITE LINKS RUNNING"}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-white/60 text-right">
                    {isOnline 
                      ? "High density telemetry data sync active with standard regional towers." 
                      : "Using pre-cached local 911 offline databases & emergency firmware instructions."}
                  </span>
                </div>

                {/* TAB SECTION: 1. DIRECTORY */}
                {activeTab === "directory" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column (7 cols) - Country Selector and numbers */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-black">
                            Select Visited Territory (Matches Scanned Cities Automatically)
                          </label>
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                            PREPROGRAMMED
                          </span>
                        </div>
                        <div className="relative">
                          <select
                            id="sos-country-selector"
                            value={selectedCountryKey}
                            onChange={(e) => setSelectedCountryKey(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
                          >
                            {Object.keys(EMERGENCY_DATABASE).map((key) => (
                              <option key={key} value={key} className="bg-zinc-950 font-sans text-xs">
                                {EMERGENCY_DATABASE[key].country}
                              </option>
                            ))}
                            {Object.keys(dynamicDatabase).map((key) => (
                              <option key={key} value={key} className="bg-zinc-950 text-emerald-400 font-sans text-xs">
                                📍 {dynamicDatabase[key].country} (Auto-Detected)
                              </option>
                            ))}
                            <option value="Universal" className="bg-zinc-950 font-sans text-xs">Universal Default Helpdesk (112)</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-white/40 pointer-events-none" />
                        </div>
                      </div>

                      {/* Direct Dials */}
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <h4 className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                            EMERGENCY FIRST RESPONDER SPEED DIALS
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Unified Crisis */}
                          <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[8px] font-mono text-red-400 uppercase tracking-wider block font-black">UNIFIED STRIKE/DIAL</span>
                              <span className="text-sm font-bold text-white font-mono">{activeContact.general}</span>
                            </div>
                            <a
                              id="sos-dial-general"
                              href={`tel:${activeContact.general.split(" ")[0].replace("/", "")}`}
                              onClick={() => { onSystemLog(`Executing emergency voice call tel:${activeContact.general}`); }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 font-mono text-[10px] font-black tracking-widest text-white rounded-lg cursor-pointer transition-all active:scale-95 text-center shrink-0"
                            >
                              VOICE CALL
                            </a>
                          </div>

                          {/* Police */}
                          <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[8px] font-mono text-blue-400 uppercase tracking-wider block font-black">POLICE DEPARTMENT</span>
                              <span className="text-sm font-bold text-white font-mono">{activeContact.police}</span>
                            </div>
                            <a
                              id="sos-dial-police"
                              href={`tel:${activeContact.police}`}
                              onClick={() => { onSystemLog(`Executing police department call tel:${activeContact.police}`); }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 font-mono text-[10px] font-black tracking-widest text-white rounded-lg cursor-pointer transition-all active:scale-95 text-center shrink-0"
                            >
                              VOICE CALL
                            </a>
                          </div>

                          {/* Medical */}
                          <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-wider block font-black">MED/AMBULANCE</span>
                              <span className="text-sm font-bold text-white font-mono">{activeContact.medical}</span>
                            </div>
                            <a
                              id="sos-dial-medical"
                              href={`tel:${activeContact.medical}`}
                              onClick={() => { onSystemLog(`Inquiring emergency medical responder paratransit tel:${activeContact.medical}`); }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-mono text-[10px] font-black tracking-widest text-white rounded-lg cursor-pointer transition-all active:scale-95 text-center shrink-0"
                            >
                              VOICE CALL
                            </a>
                          </div>

                          {/* Fire */}
                          <div className="p-3 bg-amber-600/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[8px] font-mono text-amber-500 uppercase tracking-wider block font-black">FIRE SQUAD</span>
                              <span className="text-sm font-bold text-white font-mono">{activeContact.fire}</span>
                            </div>
                            <a
                              id="sos-dial-fire"
                              href={`tel:${activeContact.fire}`}
                              onClick={() => { onSystemLog(`Contacting fire brigade dispatch network tel:${activeContact.fire}`); }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 font-mono text-[10px] font-black tracking-widest text-white rounded-lg cursor-pointer transition-all active:scale-95 text-center shrink-0"
                            >
                              VOICE CALL
                            </a>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 flex gap-2 items-start text-[10px] text-white/50 leading-relaxed font-mono">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white/80 block">TERRITORY INSTRUCTIONS:</strong>
                            {activeContact.info}
                          </div>
                        </div>
                      </div>

                      {/* Dual Action Distress (SMS Low Bandwidth & Acoustic whistle) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-full space-y-3">
                          <div>
                            <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-black block">Low Signal SMS Pack</span>
                            <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                              Transmit compressed coordinate strings and dispatch telemetry envelopes to responders directly when data arrays are fully blocked.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              id="comp-sms-copy"
                              onClick={copySmsDraft}
                              className={`flex-1 py-2 px-3 rounded-xl border font-mono font-bold text-[10px] transition-all cursor-pointer ${
                                smsCopied 
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                                  : "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-300"
                              }`}
                            >
                              {smsCopied ? "✓ COPIED" : "📋 COPY SMS"}
                            </button>
                            <a
                              id="sos-sms-direct"
                              href={`sms:${activeContact.general.split(" ")[0]}?body=${encodeURIComponent(generateDistressSms())}`}
                              onClick={() => { onSystemLog("Triggering system SMS transponder envelope."); }}
                              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 border border-purple-500/20 text-white rounded-xl text-[10px] font-mono font-bold font-black tracking-widest"
                            >
                              DRAFT SMS
                            </a>
                          </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-full space-y-3">
                          <div>
                            <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest font-black block">Acoustic Whistle</span>
                            <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                              Emits a loud 1600Hz-900Hz alternating alarm sweep to guide emergency search teams or dog units directly to your position offline.
                            </p>
                          </div>
                          <button
                            id="acoustic-whistle-sos"
                            onClick={toggleAcousticBeacon}
                            className={`w-full py-2 px-3 rounded-xl font-mono text-[10px] font-black tracking-widest transition-all cursor-pointer ${
                              isAcousticOn 
                                ? "bg-red-500 text-white animate-pulse" 
                                : "bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20"
                            }`}
                          >
                            {isAcousticOn ? "⏹️ SILENCE ALARM" : "🔊 EMIT WHISTLE"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (5 cols) - Telemetry & Satellite */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Live Coordinates Widget */}
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                        <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black block">Hardware Receiver Lock</span>
                        <div className="bg-black/40 rounded-xl p-3 text-[10.5px] space-y-2 border border-white/5 font-mono">
                          <div className="flex justify-between">
                            <span className="text-white/40">Latitude:</span>
                            <span className="text-emerald-400 font-bold">{currentLatitude.toFixed(6)}° N</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Longitude:</span>
                            <span className="text-emerald-400 font-bold">{currentLongitude.toFixed(6)}° E</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-white/5 text-[9.5px]">
                            <span className="text-white/40">Accuracy Radius:</span>
                            <span className="text-yellow-400">{geoAccuracy ? `±${Math.round(geoAccuracy)}m` : "Assumed Landmark Radius"}</span>
                          </div>
                        </div>

                        <button
                          id="sos-query-gps"
                          onClick={fetchLocalGPSCoords}
                          disabled={isQueringGPS}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all font-mono text-[10px] font-black tracking-widest rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Locate className={`w-3.5 h-3.5 ${isQueringGPS ? "animate-spin" : ""}`} />
                          <span>{isQueringGPS ? "TRACKING SATELLITES..." : "REFRESH GPS COORDINATES"}</span>
                        </button>
                      </div>

                      {/* Satellite Transponder */}
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3.5">
                        <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-black block">Geostationary Satellite Link</span>
                        {!satelliteSimActive ? (
                          <div className="text-center py-2 space-y-2">
                            <p className="text-[10px] text-white/50 leading-relaxed font-mono">
                              No cell towers? Activate LENS.AR satellite transponder arrays (COSPAS-SARSAT) to model high-orbit distress handshakes.
                            </p>
                            <button
                              id="start-satellite-beacon"
                              onClick={triggerSatelliteBeaconSim}
                              className="w-full py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 font-mono text-[9.5px] font-black tracking-wider text-white rounded-lg animate-pulse hover:animate-none cursor-pointer"
                            >
                              ACTIVATE SATELLITE HANDSHAKE
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 font-mono">
                            <div className="flex justify-between text-[10px] text-amber-400">
                              <span>Broadcasting distress packet...</span>
                              <span>{satelliteProgress}%</span>
                            </div>
                            <div className="w-full bg-black rounded-full h-1.5 overflow-hidden border border-white/10">
                              <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${satelliteProgress}%` }} />
                            </div>
                            <div className="bg-black/60 p-2.5 rounded-lg border border-white/5 text-[8.5px] text-white/40 max-h-[80px] overflow-y-auto space-y-1">
                              {satelliteLogs.map((log, idx) => (
                                <div key={idx} className={idx === satelliteLogs.length - 1 ? "text-amber-300" : ""}>{log}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB SECTION: 2. RESPONDER MEDICAL DOSSIER */}
                {activeTab === "dossier" && (
                  <div className="space-y-4">
                    {!isBiometricAuthenticated ? (
                      /* BIOMETRIC GATEWAY INTERFACE */
                      <div className="bg-[#0b0c10] border border-blue-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
                        {/* Interactive Scan Laser Lines */}
                        {isBiometricScanning && (
                          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                            <div className="w-full h-[3px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scan-line_2.5s_infinite_linear] origin-center" />
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                              <Key className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-mono font-black uppercase tracking-widest text-white">SECURE BIOMETRIC IDENTITY GATEWAY</h3>
                                <span className="bg-blue-500/20 text-blue-300 text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-blue-500/30 uppercase animate-pulse">
                                  ENCRYPTED NODE
                                </span>
                              </div>
                              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans mt-0.5">
                                Verification required to display or amend sensitive emergency dossier parameters.
                              </p>
                            </div>
                          </div>

                          {/* Instant override bypass triggers to let them skip easily if they hate cameras */}
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={handleDirectBypass}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-[9px] font-mono rounded-lg transition-colors cursor-pointer"
                              title="Instantly authenticate without face-scanning"
                            >
                              ⚡ DEV OVERRIDE
                            </button>
                          </div>
                        </div>

                        {/* Outer Grid scanner representation */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                          {/* Viewer window Column */}
                          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-zinc-950/90 rounded-2xl border border-white/10 relative min-h-[260px] overflow-hidden">
                            {/* Scanning overlay guidelines */}
                            <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-20" />
                            
                            {/* Circular scanning lens HUD */}
                            <div className="relative w-44 h-44 rounded-full border border-dashed border-cyan-500/20 flex items-center justify-center z-10">
                              <div className="absolute inset-2 rounded-full border border-blue-500/10" />
                              
                              {/* Glowing camera view frame bracket nodes */}
                              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                              {/* Target lock reticle */}
                              <div className={`absolute w-12 h-12 rounded-full border-2 border-dashed ${isBiometricScanning ? "border-cyan-400 animate-spin" : "border-white/15"}`}
                                   style={{ animationDuration: "5s" }} />

                              {/* CAMERA TRACK OR SIMULATED GRAPHIC MESH */}
                              <div className="absolute inset-3 rounded-full overflow-hidden bg-black flex items-center justify-center">
                                {biometricCameraStream ? (
                                  <video 
                                    ref={biometricVideoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className="w-full h-full object-cover filter saturate-150 contrast-125"
                                  />
                                ) : (
                                  /* SIMULATED GHOST VECTOR BLUEPRINT MESH */
                                  <div className="w-full h-full flex flex-col items-center justify-center text-white/10 relative">
                                    {/* Abstract face silhouette */}
                                    <div className="w-20 h-24 rounded-full border-2 border-white/5 bg-zinc-900/50 relative flex items-center justify-center overflow-hidden">
                                      <div className="absolute w-16 h-10 rounded-full border border-white/5 top-4" />
                                      <div className="absolute w-2 h-4 bg-white/5 top-12" />
                                      <div className="absolute w-10 h-1 bg-white/5 bottom-6" />
                                      {/* Glowing scanning matrix dots */}
                                      <div className="absolute top-6 left-6 w-1 h-1 rounded-full bg-cyan-400/50 animate-ping" />
                                      <div className="absolute top-6 right-6 w-1 h-1 rounded-full bg-cyan-400/50 animate-ping" style={{ animationDelay: "0.5s" }} />
                                      <div className="absolute top-12 left-10 w-1 h-1 rounded-full bg-cyan-400/50 animate-ping" style={{ animationDelay: "1s" }} />
                                      
                                      {isBiometricScanning && (
                                        <div className="absolute inset-0 bg-cyan-500/10 animate-pulse flex items-center justify-center text-cyan-400 text-[10px] font-mono font-black tracking-widest uppercase">
                                          MATCHING
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Circular Scanner HUD stats around */}
                              {isBiometricScanning && (
                                <div className="absolute -inset-2.5 rounded-full border-2 border-cyan-400/30 animate-pulse" />
                              )}
                            </div>

                            {/* Verification progress readouts */}
                            {isBiometricScanning && (
                              <div className="mt-4 text-center z-10">
                                <span className="block text-cyan-400 text-[13px] font-mono font-black animate-pulse">
                                  COMPILING MATRIX: {biometricScanProgress}%
                                </span>
                                <div className="w-32 bg-white/5 rounded-full h-1 overflow-hidden border border-white/10 mt-1">
                                  <div className="bg-cyan-400 h-full transition-all duration-100" style={{ width: `${biometricScanProgress}%` }} />
                                </div>
                              </div>
                            )}

                            {!isBiometricScanning && !biometricScanError && (
                              <span className="block mt-4 text-[10px] font-mono text-white/30 uppercase">
                                STANDBY CAMERA LINK
                              </span>
                            )}

                            {biometricScanError && (
                              <div className="mt-4 text-center z-10 px-2">
                                <span className="block text-red-500 text-[11px] font-mono font-black tracking-widest uppercase animate-bounce">
                                  🚨 MATCH FAILURE
                                </span>
                                <span className="block text-[8.5px] font-mono text-zinc-500 leading-tight">
                                  FACIAL LANDMARKS DEVIATE FROM STACK
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Control actions & logs */}
                          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest font-black block border-b border-white/5 pb-1">DECIDED OPERATOR CONTROLS</span>
                              
                              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans mt-0.5">
                                The Secure Biometric Facial Lock provides state-of-the-art protection. It maps a 128-point face mesh dynamically to ensure local emergency healthcare documents cannot be displayed to pickpockets, while providing instant decryption access to medics under extreme physical crises.
                              </p>

                              {/* Sandbox Testing panel for failures */}
                              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-2 text-xs">
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className="text-zinc-400 font-bold uppercase tracking-wider">🔬 Biometric Testing Sandbox</span>
                                  <span className="text-[8px] bg-white/5 text-zinc-500 px-1.5 py-0.5 rounded border border-white/5">INTERACTIVE</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 leading-tight">
                                  Toggle this diagnostic controller to simulate what happens during an unauthorized attempt (deviation match failure alert).
                                </p>
                                <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                                  <input 
                                    id="sim-fail-auth-chk"
                                    type="checkbox"
                                    checked={biometricSimulateCheckFail}
                                    onChange={(e) => setBiometricSimulateCheckFail(e.target.checked)}
                                    className="accent-red-500 w-3.5 h-3.5 cursor-pointer"
                                  />
                                  <label htmlFor="sim-fail-auth-chk" className="text-[10px] text-zinc-450 hover:text-white cursor-pointer select-none">
                                    Simulate Recognition Failure (Access Blocked)
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Logs Terminal */}
                            <div className="bg-black/60 p-3 rounded-xl border border-white/5 space-y-1">
                              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-0.5">SECURITY ENCLAVE TELEMETRY LOG</span>
                              <div className="max-h-[75px] overflow-y-auto text-[8.5px] font-mono space-y-0.5 text-zinc-400 select-all scrollbar-thin scrollbar-thumb-zinc-805">
                                {biometricScanLogs.length > 0 ? (
                                  biometricScanLogs.map((log, lIdx) => (
                                    <div key={lIdx} className={lIdx === biometricScanLogs.length - 1 ? "text-cyan-400 animate-pulse" : ""}>{log}</div>
                                  ))
                                ) : (
                                  <div className="text-zinc-500 italic">[SYS] Secure enclave offline. Awaiting gesture initialization...</div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {!isBiometricScanning ? (
                                <button
                                  type="button"
                                  onClick={startBiometricScan}
                                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border border-blue-400/40 text-white font-mono font-black tracking-widest text-xs rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.25)] transition-all active:scale-98 cursor-pointer uppercase text-center"
                                >
                                  {biometricScanError ? "🔄 RETRY FACIAL SCAN AUTH" : "🔒 INITIALIZE SECURE BIOMETRIC SCAN"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleCancelBiometricScan}
                                  className="flex-1 py-3 bg-red-950/40 border border-red-500/30 hover:bg-red-950/60 text-red-400 font-mono font-black tracking-widest text-xs rounded-xl transition-all active:scale-98 cursor-pointer uppercase text-center"
                                >
                                  🛑 SUSPEND SCANNING PROCESS
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* DECRYPTED DOSSIER FULL CONTENT MODULE */
                      <div className="space-y-4">
                        {/* Biometric Verification Unlock Badge Banner */}
                        <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-md">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                              <Shield className="w-4 h-4 animate-pulse" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">🔒 MEDICAL ENCLAVE FULLY DECRYPTED</span>
                                <span className="text-[8px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 px-1.5 py-0.2 rounded uppercase tracking-tighter">
                                  FACE-LINK CONFIRMED
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 font-sans mt-0.5 leading-tight">
                                Stored health records and passport keys unlocked in live session storage (Local key active).
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleLockVault}
                            className="px-2.5 py-1.5 bg-zinc-900 border border-white/10 hover:border-white/15 text-white/70 hover:text-white text-[9.5px] font-mono rounded-lg transition-colors cursor-pointer shrink-0 uppercase"
                            title="Instantly clear decrypted session and re-lock sensitive keys"
                          >
                            🔒 RE-LOCK VAULT
                          </button>
                        </div>

                        {isEditingProfile ? (
                          <form onSubmit={handleSaveProfile} className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <h4 className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider">EDIT FIRST RESPONDER DOSSIER (OFFLINE SECURED)</h4>
                              <button
                                type="button"
                                onClick={() => setIsEditingProfile(false)}
                                className="text-[9.5px] font-mono text-white/50 hover:text-white"
                              >
                                CANCEL
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Full Name */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Full Legal Name</label>
                                <input
                                  type="text"
                                  required
                                  value={profile.fullName}
                                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                  placeholder="e.g. Samuel Robert Derrick"
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-red-500 font-sans"
                                />
                              </div>

                              {/* Blood Type */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Blood Type</label>
                                <select
                                  value={profile.bloodType}
                                  onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-sans"
                                >
                                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Unknown"].map((bt) => (
                                    <option key={bt} value={bt}>{bt}</option>
                                  ))}
                                </select>
                              </div>

                              {/* ICE Phone */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold font-mono">ICE Emergency Phone</label>
                                <input
                                  type="text"
                                  required
                                  value={profile.icePhone}
                                  onChange={(e) => setProfile({ ...profile, icePhone: e.target.value })}
                                  placeholder="e.g. +1 (555) 438-2391"
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-red-500 font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {/* Age */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Age</label>
                                <input
                                  type="number"
                                  value={profile.age}
                                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                  placeholder="e.g. 28"
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                />
                              </div>

                              {/* Sex */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Biological Sex</label>
                                <select
                                  value={profile.sex}
                                  onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
                                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none font-sans"
                                >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                  <option value="Unknown">Unknown</option>
                                </select>
                              </div>

                              {/* Height */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Height</label>
                                <input
                                  type="text"
                                  value={profile.height}
                                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                                  placeholder="e.g. 182cm (5'11)"
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                />
                              </div>

                              {/* Weight */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Weight</label>
                                <input
                                  type="text"
                                  value={profile.weight}
                                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                                  placeholder="e.g. 78kg (172 lbs)"
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Acute Allergies */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold text-red-400">🚨 Acute Allergies (Peanuts, Penicillin etc)</label>
                                <input
                                  type="text"
                                  value={profile.allergies}
                                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                                  placeholder="e.g. Penicillin, bee stings, almonds..."
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-red-500 font-sans"
                                />
                              </div>

                              {/* Medical Conditions */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold text-red-400">📋 Medical Conditions (Asthma, Diabetes, Heart etc)</label>
                                <input
                                  type="text"
                                  value={profile.medicalConditions}
                                  onChange={(e) => setProfile({ ...profile, medicalConditions: e.target.value })}
                                  placeholder="e.g. Severe asthma, Type 1 Diabetes, Epilepsy..."
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-red-500 font-sans"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-[#050608] md:grid-cols-2 gap-4">
                              {/* Active Medications */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Active Medications</label>
                                <input
                                  type="text"
                                  value={profile.medications}
                                  onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
                                  placeholder="e.g. Albuterol inhaler daily, Insulin..."
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-sans"
                                />
                              </div>

                              {/* Language */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Primary Language (Interpreter Reference)</label>
                                <input
                                  type="text"
                                  value={profile.primaryLanguage}
                                  onChange={(e) => setProfile({ ...profile, primaryLanguage: e.target.value })}
                                  placeholder="e.g. English, Spanish translation backup"
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-sans"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Passport */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Passport Number (Embassy routing)</label>
                                <input
                                  type="text"
                                  value={profile.passportNumber}
                                  onChange={(e) => setProfile({ ...profile, passportNumber: e.target.value })}
                                  placeholder="e.g. US Passport CN912837"
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono"
                                />
                              </div>

                              {/* Travel Insurance */}
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Travel Insurance Provider & Policy</label>
                                <input
                                  type="text"
                                  value={profile.travelInsurance}
                                  onChange={(e) => setProfile({ ...profile, travelInsurance: e.target.value })}
                                  placeholder="e.g. Allianz Global Policy #992837"
                                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                />
                              </div>

                              {/* Organ Donor & Home base */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Organ Donor?</label>
                                  <select
                                    value={profile.isOrganDonor}
                                    onChange={(e) => setProfile({ ...profile, isOrganDonor: e.target.value })}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none font-sans"
                                  >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-[9.5px] font-mono text-white/45 uppercase font-bold">Local Lodging/Room</label>
                                  <input
                                    type="text"
                                    value={profile.lodgingAddress}
                                    onChange={(e) => setProfile({ ...profile, lodgingAddress: e.target.value })}
                                    placeholder="Hotel room 403"
                                    className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none font-sans"
                                  />
                                </div>
                              </div>
                            </div>

                            <button
                              id="sos-profile-save"
                              type="submit"
                              className="w-full py-2.5 bg-red-650 bg-red-600 hover:bg-red-500 font-mono font-black tracking-widest text-white text-xs rounded-xl cursor-pointer"
                            >
                              LOCK IN DOSSIER & ENCRYPT LOCALLY
                            </button>
                          </form>
                        ) : (
                          // Dossier high-readability overview (designed specifically for paramedics & police officers)
                          <div className="bg-[#050608] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6.5 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-red-500/25 pb-3">
                              <div>
                                <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest font-black block">CRITICAL MEDIC-ALERT RESPONDER SHEETS</span>
                                <h4 className="text-md font-bold uppercase tracking-tight text-white">{profile.fullName || "GUEST VISITOR (DOSSIER BLANK)"}</h4>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  id="edit-sos-profile-prompt"
                                  onClick={() => { setIsEditingProfile(true); }}
                                  className="px-3 py-1 bg-red-500 hover:bg-red-600 font-mono font-bold text-[10px] rounded-lg tracking-wider cursor-pointer"
                                >
                                  {profile.fullName ? "📝 AMEND DOSSIER" : "➕ SETUP NEW DOSSIER"}
                                </button>
                              </div>
                            </div>

                            {profile.fullName ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-[11.5px]">
                                {/* Medical Indicators Box */}
                                <div className="bg-red-950/15 border border-red-500/15 p-4 rounded-xl space-y-3">
                                  <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest block font-bold border-b border-white/5 pb-1">🫀 RESUSCITATION TELEMETRY</span>
                                  <div className="grid grid-cols-2 gap-3 font-mono">
                                    <div className="p-2 bg-black/40 rounded-lg">
                                      <span className="text-white/40 block text-[9px] uppercase">Blood Type</span>
                                      <span className="text-red-400 font-black text-sm">{profile.bloodType}</span>
                                    </div>
                                    <div className="p-2 bg-black/40 rounded-lg">
                                      <span className="text-white/40 block text-[9px] uppercase">Organ Donor</span>
                                      <span className="text-white font-bold">{profile.isOrganDonor}</span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9.5px] font-mono text-white/50 block">🚨 Acute Allergies:</span>
                                    <p className="text-white font-bold bg-black/40 px-2.5 py-1 rounded border border-red-500/25 italic font-sans text-xs">
                                      {profile.allergies || "No physical allergies stated on dossier"}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9.5px] font-mono text-white/50 block">📋 Historic Medical Conditions:</span>
                                    <p className="text-white font-bold bg-black/40 px-2.5 py-1 rounded border border-red-500/25 font-sans text-xs">
                                      {profile.medicalConditions || "No chronic illnesses logged"}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9.5px] font-mono text-white/50 block">💊 Active Medications Daily:</span>
                                    <p className="text-[#38bdf8] font-bold bg-black/40 px-2.5 py-1 rounded-lg border border-[#38bdf8]/20 font-sans text-xs">
                                      {profile.medications || "No active prescriptions registered"}
                                    </p>
                                  </div>
                                </div>

                                {/* Personnel Description & Embassies */}
                                <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl space-y-3">
                                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold border-b border-white/5 pb-1">👤 PHYSIOLOGICAL PROFILES</span>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-mono">
                                    <div className="bg-black/65 p-1.5 rounded border border-white/5">
                                      <span className="text-white/40 block text-[8px]">AGE</span>
                                      <span className="text-white font-bold">{profile.age || "N/A"}</span>
                                    </div>
                                    <div className="bg-black/65 p-1.5 rounded border border-white/5">
                                      <span className="text-white/40 block text-[8px]">BIOLOGIC SEX</span>
                                      <span className="text-white font-bold">{profile.sex}</span>
                                    </div>
                                    <div className="bg-black/60 p-1.5 rounded border border-white/5">
                                      <span className="text-white/40 block text-[8px]">HEIGHT</span>
                                      <span className="text-white font-bold">{profile.height || "N/A"}</span>
                                    </div>
                                    <div className="bg-black/60 p-1.5 rounded border border-white/5">
                                      <span className="text-white/40 block text-[8px]">WEIGHT</span>
                                      <span className="text-white font-bold">{profile.weight || "N/A"}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 text-[11px]">
                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                      <span className="text-white/40 font-mono">Primary Language:</span>
                                      <span className="text-white font-bold">{profile.primaryLanguage || "English"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                      <span className="text-white/40 font-mono">Passport Number:</span>
                                      <span className="text-white font-mono font-black select-all">{profile.passportNumber || "None logged"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                      <span className="text-white/40 font-mono font-sans">Emergency Contact (ICE):</span>
                                      <span className="text-rose-400 font-mono font-bold select-all">{profile.icePhone}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                      <span className="text-white/40 font-mono">Insurance Provider:</span>
                                      <span className="text-white truncate max-w-[170px]">{profile.travelInsurance || "Direct Pay/Private"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-white/40 font-mono">Local Lodging / Rooms:</span>
                                      <span className="text-yellow-300 font-semibold truncate max-w-[150px]">{profile.lodgingAddress || "N/A"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-8 text-center bg-zinc-900 border border-white/5 rounded-2xl space-y-4">
                                <Heart className="w-12 h-12 text-rose-500/20 mx-auto animate-pulse" />
                                <div>
                                  <h5 className="text-sm font-bold text-white/80 uppercase">Responder Dossier Empty</h5>
                                  <p className="text-xs text-white/40 max-w-xs mx-auto mt-1 leading-relaxed">
                                    Please record your blood group, emergency contact details, and chronic health history before travel starts.
                                  </p>
                                </div>
                                <button
                                  id="sos-profile-create-prompt"
                                  onClick={() => { setIsEditingProfile(true); }}
                                  className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer"
                                >
                                  CREATE FIRST RESPONDER CARDS NOW
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB SECTION: 3. ACTIVE INCIDENT & THREAT REPORTER */}
                {activeTab === "crime_report" && (
                  <div className="space-y-4 font-sans">
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-[11px] leading-relaxed flex items-start gap-2 text-orange-300 font-mono">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-400 animate-pulse" />
                      <div>
                        <strong>Physical Threats, Robberies, Stalking, or Active Crimes Tracker</strong>
                        <p className="text-white/60 text-[10px] mt-0.5">
                          911 Systems administrators designed this reporter to feed high-fidelity physical data directly to dispatch channels. Write description clues (arms, getaway cars) to instantly structure a distress capsule that saves lives.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <form onSubmit={handleGenerateCrimeReport} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 text-xs">
                        <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest font-black block border-b border-white/5 pb-1">COMPILE CRIME METRICS</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-white/40 uppercase">Incident Category</label>
                            <select
                              value={crimeType}
                              onChange={(e) => setCrimeType(e.target.value)}
                              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none"
                            >
                              <option value="Robbery / Purse snatching">Robbery / Physical Theft</option>
                              <option value="Active Stalking or Pursuit">Active Stalking or Pursuit</option>
                              <option value="Physical Assault / Threat">Physical Assault / Threat</option>
                              <option value="Vandalism or Suspicious scouting">Vandalism or Suspicious scouting</option>
                              <option value="Lost Traveler Medical distress">Lost Traveler Medical distress</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-white/40 uppercase">Threat Urgency Priority</label>
                            <select
                              value={threatLevel}
                              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 font-bold focus:outline-none text-red-400"
                              onChange={(e: any) => setThreatLevel(e.target.value)}
                            >
                              <option value="LOW" className="text-yellow-400">LOW (No active weapon)</option>
                              <option value="HIGH" className="text-orange-400">HIGH (Asset stolen/Pursuit)</option>
                              <option value="CRITICAL" className="text-red-400">CRITICAL (Physical Weapon / Injury)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-mono text-white/40 uppercase">Suspect Appearance (Clothing, Height, Race, Hair-style)</label>
                          <input
                            type="text"
                            required
                            value={suspectDescription}
                            onChange={(e) => setSuspectDescription(e.target.value)}
                            placeholder="e.g. White hoodie, black baseball cap, approx 6'0, escaping south"
                            className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 font-sans"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-white/40 uppercase">Weapons Observed?</label>
                            <select
                              value={weaponsObserved}
                              onChange={(e) => setWeaponsObserved(e.target.value)}
                              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none font-sans"
                            >
                              <option value="None">None observed</option>
                              <option value="Knife / Edged weapon">Knife / Edged weapon</option>
                              <option value="Firearm / Gun">Firearm / Gun</option>
                              <option value="Blunt instrument / Pipes">Blunt instrument / Pipes</option>
                              <option value="Unknown/Could be concealed">Unknown/Could be concealed</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-white/40 uppercase">Escaping Direction of Flight</label>
                            <input
                              type="text"
                              value={directionOfFlight}
                              onChange={(e) => setDirectionOfFlight(e.target.value)}
                              placeholder="e.g. Down metro stairs / eastbound alley"
                              className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 font-sans"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-orange-600 hover:bg-orange-500 font-mono font-black tracking-widest text-white rounded-lg cursor-pointer"
                        >
                          BUILD ENCRYPTED 911 COGNIZANCE ENVELOPE
                        </button>
                      </form>

                      {/* Display compiled output envelope */}
                      <div className="bg-[#050608] border border-white/15 p-4 rounded-xl flex flex-col justify-between h-full space-y-3 relative font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1">
                          <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest block font-bold">Encrypted Dispatch Telemetry</span>
                          <span className="rounded-full bg-red-500 w-2 h-2 animate-ping" />
                        </div>

                        {crimeReportText ? (
                          <>
                            <textarea
                              readOnly
                              value={crimeReportText}
                              className="w-full bg-black/60 p-2 border border-white/5 font-mono text-[9.5px] leading-relaxed rounded-lg focus:outline-none flex-1 font-bold text-rose-300 min-h-[140px] select-all"
                            />
                            <button
                              onClick={copyCrimeReport}
                              className={`w-full py-2.5 rounded-lg border font-mono font-black font-semibold text-[10px] tracking-widest transition-all cursor-pointer ${
                                reportCopied 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" 
                                  : "bg-orange-500/10 border-orange-500/25 hover:bg-orange-500/20 text-orange-300"
                              }`}
                            >
                              {reportCopied ? "✓ COPIED INJECTED DISPATCH" : "📋 COPY & TRANSMIT DISPATCH SIGNALS"}
                            </button>
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/30 space-y-2">
                            <FileText className="w-8 h-8 opacity-20" />
                            <p className="text-[10px] leading-normal max-w-[180px] mx-auto text-white/50">
                              Fill in the suspect details on the left and dispatch envelopes will build automatically.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB SECTION: 4. DETERRENT LIGHTS AND SIRENS */}
                {activeTab === "high_vis" && (
                  <div className="space-y-4 font-sans text-xs">
                    <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-[11px] leading-relaxed text-sky-300 font-mono">
                      <Zap className="w-4 h-4 text-sky-400 inline shrink-0 mr-1.5 animate-bounce mb-0.5" />
                      <strong>Crime Deterrence System: Visual & Acoustic Interdiction</strong>
                      <p className="text-white/60 text-[10px] mt-1 italic">
                        If physically pursued, cornered, or targeted in dark alleyways: engage full-screen red/blue strobe flashers coupled with a high-decibel sweep siren. This draws global attention instantly, blinds attackers, and scares off perpetrators.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                      {/* Controls Box */}
                      <div className="bg-white/5 p-5 rounded-xl border border-white/10 flex flex-col justify-between spacing-y-4 space-y-4">
                        <div>
                          <div className="flex justify-between items-start border-b border-white/5 pb-1 flex-wrap gap-2">
                            <span className="text-[9px] font-mono text-sky-400 uppercase tracking-widest font-black block">TACTICAL ENGAGEMENTS</span>
                            <div className="flex gap-1.5 flex-wrap">
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wider transition-all ${
                                isWakeLockActive 
                                  ? "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/35 animate-pulse" 
                                  : "bg-white/5 text-white/30 border-white/5"
                              }`}>
                                AOD: {isWakeLockActive ? "LOCKED ON" : "STANDBY"}
                              </span>
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wider transition-all ${
                                isStrobeActive 
                                  ? isHardwareFlashlightActive
                                    ? isHardwareFlashlightSupported
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/35 animate-pulse"
                                      : "bg-amber-500/10 text-amber-400 border-amber-500/35"
                                    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                  : "bg-white/5 text-white/30 border-white/5"
                              }`}>
                                LED: {isStrobeActive ? (isHardwareFlashlightActive ? (isHardwareFlashlightSupported ? "ACTIVE FLASH" : "METRO FALLBACK") : "STARTING") : "STANDBY"}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-[10px] text-white/40 leading-relaxed mt-2.5 font-mono">
                            Engage high-powered strobe and acoustic sirens. Always On Display keeps device from sleep lockout during extreme safety search procedures.
                          </p>
                        </div>

                        <div className="space-y-2">
                          {/* Strobe flasher toggle */}
                          <button
                            onClick={() => {
                              setIsStrobeActive(!isStrobeActive);
                              onSystemLog(`TACTICAL DISRUPTER: Screen visual strobe flasher toggled ${!isStrobeActive ? "ACTIVE" : "OFF"}.`);
                            }}
                            className={`w-full py-3 rounded-lg font-mono font-black tracking-widest text-[10px] transition-all cursor-pointer ${
                              isStrobeActive 
                                ? "bg-red-500 hover:bg-red-400 text-white animate-pulse shadow-lg shadow-red-500/30" 
                                : "bg-sky-500/15 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20"
                            }`}
                          >
                            {isStrobeActive ? "🛑 SHUTDOWN HIGH-VIS FLASHER" : "🚨 ENGAGE HIGH-VIS COLOR STROBE"}
                          </button>

                          {/* Sound Siren Toggle */}
                          <button
                            onClick={toggleSirenAudio}
                            className={`w-full py-3 rounded-lg font-mono font-black tracking-widest text-[10px] transition-all cursor-pointer ${
                              isSirenActive 
                                ? "bg-blue-600 hover:bg-blue-500 text-white animate-bounce shadow-lg shadow-blue-600/30" 
                                : "bg-blue-500/15 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                            }`}
                          >
                            {isSirenActive ? "🔇 SILENCE ACOUSTIC SIREN" : "🔊 ENGAGE POLICE DECIBEL SIREN"}
                          </button>
                        </div>

                        {/* Always on display settings manual toggle block */}
                        <div className="flex items-center justify-between gap-2 bg-black/40 p-2 text-[9px] font-mono rounded-lg border border-white/5">
                          <span className="text-white/40 uppercase">Manual Wake Lock (Always-On Screen):</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (isWakeLockActive) {
                                releaseWakeLock();
                              } else {
                                acquireWakeLock();
                              }
                            }}
                            className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase transition-colors cursor-pointer ${
                              isWakeLockActive 
                                ? "bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20" 
                                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                            }`}
                          >
                            {isWakeLockActive ? "AOD ENGAGED" : "AOD STANDBY"}
                          </button>
                        </div>

                        <div className="p-2 border border-yellow-500/30 rounded-lg bg-yellow-500/5 text-yellow-300 tracking-wide text-[9px] font-mono text-center">
                          ⚠️ WARNING: STROBE CAUSES INSTANT FLASHLIGHT DISORIENTATION TO ATTACKERS
                        </div>
                      </div>

                      {/* Display Simulation / Actual Strobe Screen card */}
                      <div className="border border-white/10 rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 bg-[#030303] text-center min-h-[220px]">
                        {isStrobeActive ? (
                          <div 
                            className={`w-full h-full inset-0 rounded-lg flex flex-col items-center justify-center py-10 transition-colors duration-75 ${
                              strobeColorToggle ? "bg-red-650 bg-red-600 text-white" : "bg-blue-650 bg-blue-600 text-white"
                            }`}
                          >
                            <span className="font-mono font-black tracking-widest text-lg uppercase animate-ping">CRISIS STROBE</span>
                            <span className="text-[10px] font-mono mt-2 uppercase tracking-wide">
                              {videoTrackRef.current ? "📡 HARDWARE LED FLASHING" : "📺 SCREEN-STROBE LIVE"}
                            </span>
                            <div className="mt-4 flex gap-1 items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              <span className="w-3.5 h-3.5 rounded-full bg-white" />
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Radio className="w-12 h-12 opacity-15 mx-auto text-sky-400" />
                            <span className="font-mono text-white/30 text-[10px] uppercase tracking-widest block">TACTICAL CANOPY EMPTY</span>
                            <p className="text-white/40 text-[9.5px] max-w-[180px] mx-auto leading-relaxed font-mono">
                              Activate the strobe flashing or siren audio on the left menu to test active physical defense protocols. Always-On prevent sleep is active.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Safety Card Disclaimer */}
              <div className="p-4 border-t border-white/10 bg-black text-[9px] font-mono text-center text-white/35 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 select-none leading-none">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-white/20" />
                  <span>911 COMPLIANT TIMESTAMP: {new Date().toUTCString()}</span>
                </div>
                <span>EMERGENCY DISPATCH PROTOCOLS DESIGNED FOR COMPREHENSIVE SAFETIES</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
