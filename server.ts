import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up substantial JSON limits because user captures base64 images from webcam or files
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for Google GenAI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("⚠️ GEMINI_API_KEY is not configured or uses default template string. Running in simulated mock mode for tourist presets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_NOT_USED",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Built-in tourist presets for high-fidelity scanning simulations (great for demo speed and fallbacks)
const PRESET_MOCKS: Record<string, any> = {
  eiffel_tower: {
    isLandmark: true,
    name: "Eiffel Tower",
    city: "Paris",
    country: "France",
    coordinates: { latitude: 48.8584, longitude: 2.2945 },
    specs: {
      built: "1889",
      height: "330 meters (incorporating radio antennas)",
      style: "Exhibitionist Industrial Art / Puddled Iron Lattice",
      designer: "Gustave Eiffel & Associates (Maurice Koechlin, Émile Nouguier)"
    },
    historyOverview: "The Eiffel Tower was constructed as the magnificent entrance arch for the 1889 World's Fair, celebrating the centennial of the French Revolution. Initially heavily criticized by France's artistic elite, it was saved from demolition because of its invaluable use as a giant radiotelegraph transmitter. Today, it stands as the ultimate romantic global cultural icon of Paris.",
    timeline: [
      { year: "1887", event: "Construction officially begins on January 28, exciting and alarming Parisian observers." },
      { year: "1889", event: "Completed in record time (2 years, 2 months) and inaugurated with high acclaim on March 31." },
      { year: "1909", event: "The 20-year permit expires; it is preserved solely for its strategic military radio transmission capabilities." }
    ],
    hotspots: [
      {
        x: 50,
        y: 20,
        type: "architecture",
        title: "The Summit Spire",
        description: "The peak houses Gustave Eiffel's private apartment room where he hosted guests like Thomas Edison, as well as modern broadcast antennas that added 6m in 2022."
      },
      {
        x: 48,
        y: 55,
        type: "history",
        title: "Radio Rescue Point",
        description: "Military radio applications in 1903 saved the tower from destruction. French soldiers successfully intercepted German radiotelegraph messages here during WWI."
      },
      {
        x: 58,
        y: 78,
        type: "trivia",
        title: "Riveted Puddled Iron",
        description: "Built using 2.5 million rivets and 7,300 tonnes of high-purity puddled iron, which shrinks and expands up to 15 cm depending on winter or summer temperatures."
      }
    ],
    audioNarrationScript: [
      "Welcome to the Champ de Mars. Before you stands the Iron Lady, built in 1889 by Gustave Eiffel's brilliant engineering firm.",
      "Look closely at the intricately woven iron frame. It is composed of hand-riveted puddled iron plates, designed specifically to bend rather than break in strong winds.",
      "Initially labeled a 'useless monster' by famous artists, it quickly proved its value to military communications, becoming the beloved gateway of Paris."
    ],
    travelTip: "Avoid standard midday lines. Grab a warm croissant and head to the stairs at the South Pillar for stunning open-air shots, or enjoy the glowing champagne sparkle show on the hour at midnight from the Trocadéro steps!"
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
      style: "Imperial Roman (Composite, Corinthian, Ionic layers)",
      designer: "Commissioned by Emperor Vespasian, completed by Emperor Titus"
    },
    historyOverview: "The Flavian Amphitheatre, famously known as the Colosseum, is the largest ancient amphitheatre ever constructed. Used for gladiator contests, public spectacles, and tactical mock sea battles, it could accommodate over 50,000 shouting spectators. Its construction symbolized the wealth, logistical mastery, and raw engineering dominance of the Roman Empire.",
    timeline: [
      { year: "72 AD", event: "Emperor Vespasian finances construction using gold looted from the Siege of Jerusalem." },
      { year: "80 AD", event: "Inaugurated by Emperor Titus with 100 consecutive days of lavish imperial gladiator games." },
      { year: "1349", event: "A devastating earthquake collapses the outer south side, turning the landmark into a medieval quarry." }
    ],
    hotspots: [
      {
        x: 50,
        y: 30,
        type: "architecture",
        title: "Arcaded Façade",
        description: "Exhibits three tiers of distinct Greek columns: Doric at the bottom, Ionic in the middle, and Corinthian on the top, representing Rome’s artistic syntheses."
      },
      {
        x: 48,
        y: 70,
        type: "history",
        title: "The Hypogeum Engine",
        description: "The subterranean labyrinth of tunnels and elevators used to lift lions, gladiators, and theatrical scenery directly into the sandy arena floor."
      },
      {
        x: 70,
        y: 40,
        type: "trivia",
        title: "Velarium Canopy Rings",
        description: "Look at the top console brackets. Roman sailors were stationed here to operate the Velarium, a giant retractable canopy protecting guests from the hot Roman sun."
      }
    ],
    audioNarrationScript: [
      "Step onto the historic stone pathways of the Flavian Amphitheatre. Completed in 80 AD, this arena served as the heart of Roman civic entertainment.",
      "Beneath the sandy arena floor lay the Hypogeum, a complex system of wooden pulleys and cages used to surprise the audience with wild beasts.",
      "Though damaged by earthquakes and stone looters over the centuries, it remains a monumental tribute to ancient building logistics."
    ],
    travelTip: "Book the late-night guided underground tour. It takes you into the hypogeum, avoiding the daytime Mediterranean heat and looking magical under modern lighting."
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
      style: "Neo-Futuristic and Pagoda Seismic-control Synthesis",
      designer: "Nikken Sekkei (Architect: Tadao Ando and Kihei Toyoshima)"
    },
    historyOverview: "Tokyo Skytree is the tallest self-supporting broadcasting tower in the world. It was designed to merge iconic futuristic technology with deep Japanese temple traditions. The structure’s lattice exterior is painted in 'Skytree White', a subtle custom light-bluish tint mirroring classical Japanese indigo dyeing techniques, acting as the primary television broadcast hub for the Kanto region.",
    timeline: [
      { year: "2008", event: "Construction commences in Sumida, Tokyo, utilizing advanced slip-form concrete columns." },
      { year: "2011", event: "The tower reaches its full height of 634 meters precisely on March 18, unaffected by the major Tohoku earthquake." },
      { year: "2012", event: "Opens to the public on May 22, immediately drawing millions of tourists to its observation decks." }
    ],
    hotspots: [
      {
        x: 50,
        y: 10,
        type: "architecture",
        title: "High Spire Antenna",
        description: "The exact height of 634m was chosen because '6-3-4' sounds like 'Mu-sa-shi', naming the historic province Tokyo lies in."
      },
      {
        x: 48,
        y: 45,
        type: "trivia",
        title: "Shinto Pagoda Pillar",
        description: "Employs a central concrete vibration-damping column disconnected from the outer frame, inspired by multi-story medieval wooden pagodas, which have never collapsed in an earthquake."
      },
      {
        x: 52,
        y: 65,
        type: "vibe",
        title: "Tembo Galleria Arc",
        description: "A glass-floored air-walk spiral ramp that takes visitors up to the absolute highest panoramic observation point at 451 meters."
      }
    ],
    audioNarrationScript: [
      "Here is the Tokyo Skytree, soaring six hundred and thirty-four meters over the dense metropolis of Tokyo.",
      "The architectural silhouette shifts seamlessly from a triangular tripod base to a perfect circle at the top to withstand heavy typhoons.",
      "Inside, a modern concrete core acts as a seismic shock absorber, a technique borrowed from ancient wooden Shinto pagodas."
    ],
    travelTip: "Head up on a crisp, cold winter morning! The clear air gives you a jaw-dropping look at Mount Fuji's snowcap framing the endless cityscape."
  },
  statue_of_liberty: {
    isLandmark: true,
    name: "Statue of Liberty",
    city: "New York",
    country: "USA",
    coordinates: { latitude: 40.6892, longitude: -74.0445 },
    specs: {
      built: "1886",
      height: "93 meters (from pedestal base to torch)",
      style: "Neoclassical repoussé copper sheets over steel framework",
      designer: "Frédéric-Auguste Bartholdi (copper) & Gustave Eiffel (supports)"
    },
    historyOverview: "A gift of international friendship from the people of France to the United States, Liberty Enlightening the World is an iconic monument in New York Harbor. Made of hand-beaten copper coins and sheets, its distinctive green color is the natural result of atmospheric oxidation. It welcomed millions of hopeful immigrants arriving at nearby Ellis Island seeking a new life.",
    timeline: [
      { year: "1884", event: "The complete statue is finished and assembled in Paris, then carefully disassembled into 350 shipping crates." },
      { year: "1886", event: "The monumental pedestal is completed in NY, and President Cleveland dedicates the statue on October 28." },
      { year: "1986", event: "Extensive centennial restoration replaces Bartholdi’s rusting iron frame with high-grade stainless steel." }
    ],
    hotspots: [
      {
        x: 50,
        y: 12,
        type: "architecture",
        title: "The Golden Torch",
        description: "The original copper light torch leaked rainwater and was replaced in 1986 with a spectacular 24-karat gold-gilded flame reflecting sunlight."
      },
      {
        x: 49,
        y: 35,
        type: "history",
        title: "Eiffel's Steel truss",
        description: "Gustave Eiffel designed the inner flexible steel tower skeleton. This allows Lady Liberty's outer copper skin to flex up to 3 inches in heavy harbor winds."
      },
      {
        x: 53,
        y: 65,
        type: "trivia",
        title: "Broken Chains",
        description: "Look closely at her feet. She stands among broken shackles and heavy chains, symbolizing the abolition of slavery and the triumph of liberty."
      }
    ],
    audioNarrationScript: [
      "You are looking at Liberty Enlightening the World, dedicated in 1886 as a majestic neoclassical symbol of democracy.",
      "Her outer shell consists of extremely thin hand-hammered copper sheets, which turned from a shiny brown penny color to rich green over thirty years.",
      "The inner skeletal tower is a masterpiece of flexible engineering created by Gustave Eiffel shortly before he built his famous Paris tower."
    ],
    travelTip: "Take the Staten Island Ferry for a wonderful, free, open-water viewing experience! It avoids crowds and passes directly by the island for picture-perfect shots."
  }
};

// API Endpoint to identify a captured photo of a landmark
app.post("/api/recognize", async (req, res) => {
  const { image, presetId, userLatLng } = req.body;

  try {
    // 1. Check for Preset Shortcut requested for fast/mock operations
    if (presetId && PRESET_MOCKS[presetId]) {
      console.log(`Serving preset mock data for: ${presetId}`);
      // Simulate brief server delay for organic scan feel
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return res.json({ result: PRESET_MOCKS[presetId] });
    }

    // 2. Validate Image Base64 Data
    if (!image) {
      return res.status(400).json({ error: "Missing image payload or presetId." });
    }

    // Clean base64 string
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    // Initialize Gemini
    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    // Fast Fallback: If no valid API key is present, fallback to a smart simulation
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.log("No valid API Key detected. Performing automated smart fallback prediction.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Pick a random preset or default to eiffel tower for raw uploaded images
      const randomPresets = Object.keys(PRESET_MOCKS);
      const selected = PRESET_MOCKS[randomPresets[Math.floor(Math.random() * randomPresets.length)]];
      return res.json({
        result: {
          ...selected,
          name: `${selected.name} (Demo Simulation)`,
          historyOverview: `[Demo Mode] ${selected.historyOverview}`
        }
      });
    }

    // 3. Setup Gemini Multimodal Payload with Grounded Search
    const prompt = `
      Identify the specific historical or geographical landmark shown in this photo.
      
      Perform comprehensive real-time research using Google Search Grounding to verify its correct history, year built, coordinates, and architectural specifications.
      
      You must respond with a pristine, valid JSON object strictly matching the specified JSON schema.
      If the image does not show a historical, governmental, or cultural landmark (e.g. if it is a selfie, a house pet, a blank screen, or an arbitrary object), set "isLandmark" to false and provide helpful feedback in historyOverview explaining what you see instead.
    `;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: prompt,
    };

    console.log("Calling Gemini API with googleSearch tool enabled...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isLandmark: { type: Type.BOOLEAN, description: "True if a valid tourist/historical landmark was successfully detected and researched." },
            name: { type: Type.STRING, description: "Official name of the landmark." },
            city: { type: Type.STRING, description: "City where the landmark is located." },
            country: { type: Type.STRING, description: "Country where the landmark is located." },
            coordinates: {
              type: Type.OBJECT,
              properties: {
                latitude: { type: Type.NUMBER, description: "Geographic coordinate Latitude." },
                longitude: { type: Type.NUMBER, description: "Geographic coordinate Longitude." }
              },
              required: ["latitude", "longitude"]
            },
            specs: {
              type: Type.OBJECT,
              properties: {
                built: { type: Type.STRING, description: "Year/Century or period built." },
                height: { type: Type.STRING, description: "Official height or diameter of the landmark structure." },
                style: { type: Type.STRING, description: "Architectural style (e.g., Baroque, Neo-Futuristic, Gothic)." },
                designer: { type: Type.STRING, description: "Primary architect, builder, or creative designer." }
              },
              required: ["built", "height", "style", "designer"]
            },
            historyOverview: { type: Type.STRING, description: "A highly engaging 3-sentence historical summary of the landmark." },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.STRING, description: "The year/date of the event." },
                  event: { type: Type.STRING, description: "The important event or milestone." }
                },
                required: ["year", "event"]
              },
              description: "Exactly three major milestone events in its historical timeline."
            },
            hotspots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER, description: "Relative visual horizontal coordinate percentage on the photo itself (value between 10 and 90)." },
                  y: { type: Type.NUMBER, description: "Relative visual vertical coordinate percentage on the photo itself (value between 15 and 85)." },
                  type: { type: Type.STRING, description: "Hotspot categorizer: pick 'architecture', 'history', 'trivia', or 'vibe'." },
                  title: { type: Type.STRING, description: "A 2-4 word interesting title for the specific spot." },
                  description: { type: Type.STRING, description: "1-2 sentence compelling piece of historical context or trivia relating specifically to this hotspot." }
                },
                required: ["x", "y", "type", "title", "description"]
              },
              description: "Exactly 3 distinct landmarks spots to map coordinates percentage for interactive user clicking overlays."
            },
            audioNarrationScript: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly three narrated sentences for a virtual audio tour guide. Make it sound warm and spoken, avoiding formatting marks."
            },
            travelTip: { type: Type.STRING, description: "A practical professional tip for a real tourist visiting the site." }
          },
          required: [
            "isLandmark", "name", "city", "country", "coordinates", "specs", "historyOverview", "timeline", "hotspots", "audioNarrationScript", "travelTip"
          ]
        },
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Failed to receive output text from Gemini.");
    }

    const result = JSON.parse(textOutput.trim());

    // Extract citations to include grounding links for full transparency
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const citations: Array<{ title: string; url: string }> = [];
    if (groundingChunks && Array.isArray(groundingChunks)) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk?.web?.uri && chunk?.web?.title) {
          citations.push({
            title: chunk.web.title,
            url: chunk.web.uri
          });
        }
      });
    }

    // Filter duplicate citation URLs
    const uniqueCitations = citations.filter(
      (value, index, self) => self.findIndex((c) => c.url === value.url) === index
    ).slice(0, 4);

    return res.json({ result, citations: uniqueCitations });

  } catch (err: any) {
    console.error("Gemini API Error in /api/recognize:", err);
    return res.status(500).json({
      error: "Error processing camera scanning. Please try again.",
      details: err?.message || err
    });
  }
});

// API Endpoint to ask custom questions with Google Search Grounding to an expert AI travel guide
app.post("/api/chat-landmark", async (req, res) => {
  const { landmarkName, city, country, question, messages } = req.body;

  if (!landmarkName || !question) {
    return res.status(400).json({ error: "Missing landmarkName or question parameter." });
  }

  try {
    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no active Gemini API key is present
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.log("No valid API Key. Performing simulated expert travel chat response.");
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return res.json({
        answer: `Standing at ${landmarkName} is truly a special experience! To explore your question "${question}" with live Google Search results, please configure your GEMINI_API_KEY in the Secrets tab. For now, enjoy exploring its historical corridors and snapping creative angles!`,
        citations: [
          { title: `${landmarkName} Official Guide`, url: "https://www.google.com/search?q=" + encodeURIComponent(landmarkName) }
        ]
      });
    }

    console.log(`Calling Gemini 3.5 Flash for grounded travel companion chat: ${question}`);
    
    const systemInstruction = `You are LENS.AR, an elite, charming, and extremely helpful AI tour guide companion.
The user is currently visiting "${landmarkName}" in ${city}, ${country} and has asked you a follow-up question.
Use your real-time Google Search grounding tool to find up-to-date, accurate answers (e.g. entry ticket prices, hours, best photo spots, local cafes, history).
Write a beautiful, engaging, and friendly response of 2-4 sentences. Do NOT use markdown bold stars or headers. Speak with human warmth.`;

    const chatHistory = (messages || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    chatHistory.push({
      role: "user",
      parts: [{ text: question }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatHistory,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });

    const answer = response.text || "I apologize, but my satellite communications could not retrieve a perfect answer. Please try asking again.";

    // Parse grounding web results
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const citations: Array<{ title: string; url: string }> = [];
    if (groundingChunks && Array.isArray(groundingChunks)) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk?.web?.uri && chunk?.web?.title) {
          citations.push({
            title: chunk.web.title,
            url: chunk.web.uri
          });
        }
      });
    }

    const uniqueCitations = citations.filter(
      (value, index, self) => self.findIndex((c) => c.url === value.url) === index
    ).slice(0, 3);

    return res.json({ answer, citations: uniqueCitations });

  } catch (err: any) {
    console.error("Gemini API Error in /api/chat-landmark:", err);
    return res.status(500).json({
      error: "Error processing tourist inquiry. Please try again.",
      details: err?.message || err
    });
  }
});

// API Endpoint to translate landmark information into any target global language
app.post("/api/translate", async (req, res) => {
  const { details, targetLanguage } = req.body;

  if (!details || !targetLanguage) {
    return res.status(400).json({ error: "Missing details or targetLanguage parameter." });
  }

  try {
    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback: if no active Gemini API key is present, simulate translated strings with prefix
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.log(`Simulator Translation active. Target: ${targetLanguage}`);
      
      const simulateTranslate = (str: string) => `[${targetLanguage}] ${str}`;
      
      const copy = JSON.parse(JSON.stringify(details));
      copy.name = simulateTranslate(copy.name);
      copy.city = simulateTranslate(copy.city);
      copy.country = simulateTranslate(copy.country);
      copy.historyOverview = simulateTranslate(copy.historyOverview);
      copy.travelTip = simulateTranslate(copy.travelTip);
      
      if (copy.specs) {
        copy.specs.style = simulateTranslate(copy.specs.style);
        copy.specs.designer = simulateTranslate(copy.specs.designer);
      }
      if (copy.timeline) {
        copy.timeline = copy.timeline.map((item: any) => ({
          ...item,
          event: simulateTranslate(item.event)
        }));
      }
      if (copy.hotspots) {
        copy.hotspots = copy.hotspots.map((item: any) => ({
          ...item,
          title: simulateTranslate(item.title),
          description: simulateTranslate(item.description)
        }));
      }
      if (copy.audioNarrationScript) {
        copy.audioNarrationScript = copy.audioNarrationScript.map((sentence: string) => simulateTranslate(sentence));
      }

      return res.json({ result: copy });
    }

    const prompt = `
      You are an expert multilingual tourism translator. 
      Translate all user-facing content in the provided LandmarkDetails object into the target language "${targetLanguage}" with high fidelity, cultural warmth, and natural flow perfect for travelers and families on trip vacations.
      
      Remember: 
      - Do NOT translate or change JSON key names (such as "isLandmark", "coordinates", "latitude", "longitude", "x", "y", "type", "specs", "built", "height", "style", "designer", "timeline", "hotspots", "audioNarrationScript", "travelTip").
      - Only translate the values for "name", "city", "country", specs values, "historyOverview", timeline events, hotspot titles & descriptions, audioNarrationScript arrays, and the "travelTip".
      - Preserve all coordinates values and structural integrity perfectly.
      - Respond strictly with a single JSON object.
    `;

    console.log(`Calling Gemini to translate to language: ${targetLanguage}...`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: prompt },
        { text: JSON.stringify(details) }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedTranslation = JSON.parse(response.text.trim());
    return res.json({ result: parsedTranslation });

  } catch (err: any) {
    console.error("Gemini translation processing failed:", err);
    return res.status(500).json({ error: "Translation mapping failed", details: err?.message || err });
  }
});

// Plaid Integration Endpoints (Supports both real Plaid developer credentials and high-fidelity Sandbox simulation)
app.post("/api/plaid/create-link-token", async (req, res) => {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const plEnv = process.env.PLAID_ENV || "sandbox";

  // Check if credentials are properly configured
  if (!clientId || !secret || clientId === "" || secret === "") {
    console.log("Plaid credentials missing in secrets. Returning sandbox simulation token...");
    return res.json({
      isMock: true,
      linkToken: "mock-link-token_" + Math.random().toString(36).substr(2, 9),
      message: "Credentials missing. Initiating client-side Sandbox Plaid wizard."
    });
  }

  try {
    const plaidUrl = `https://${plEnv}.plaid.com/link/token/create`;
    console.log(`Connecting to Plaid (${plEnv}) Link Token endpoint...`);
    
    const response = await fetch(plaidUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        client_name: "LENS.AR Travel Companion",
        language: "en",
        country_codes: ["US"],
        user: {
          client_user_id: "lens_ar_user_unique_12"
        },
        products: ["auth", "transactions"]
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`Plaid Server Error: ${response.status} - ${JSON.stringify(errBody)}`);
    }

    const data = await response.json();
    return res.json({
      isMock: false,
      linkToken: data.link_token
    });
  } catch (err: any) {
    console.error("Plaid token generation failed:", err);
    return res.status(500).json({
      error: "Could not create Plaid secure link token.",
      details: err.message,
      isMock: true
    });
  }
});

app.post("/api/plaid/exchange-token", async (req, res) => {
  const { publicToken } = req.body;
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const plEnv = process.env.PLAID_ENV || "sandbox";

  if (!publicToken) {
    return res.status(400).json({ error: "Missing Plaid public_token parameter." });
  }

  // If executing in mock environment
  if (!clientId || !secret || publicToken.startsWith("mock-")) {
    console.log("Exchanging simulated public token for mock bank records...");
    // Return mock bank balance and real-looking transactions to display automatically
    return res.json({
      isMock: true,
      accessToken: "mock-access-token_" + Math.random().toString(36).substr(2, 9),
      institutionName: "Chase Bank (Plaid Sandbox)",
      accounts: [
        { name: "Chase Sapphire Travel Visa", type: "credit", balance: 8520.40, currency: "USD", mask: "4112" },
        { name: "Global Explorer Checking", type: "depository", balance: 14205.10, currency: "USD", mask: "8890" }
      ],
      transactions: [
        { merchant: "Eiffel Tower Tickets", amount: 30.00, date: "2026-06-08", category: "Activities" },
        { merchant: "SNCF Train Rail Paris-Lyon", amount: 95.50, date: "2026-06-09", category: "Transport" },
        { merchant: "Colosseum Fast Pass", amount: 25.00, date: "2026-06-09", category: "Activities" },
        { merchant: "Shibuya Sky Observation Tower", amount: 22.00, date: "2026-06-10", category: "Activities" },
        { merchant: "Grand Imperial Hotel Tokyo", amount: 245.00, date: "2026-06-10", category: "Lodging" }
      ]
    });
  }

  try {
    const exchangeUrl = `https://${plEnv}.plaid.com/item/public_token/exchange`;
    console.log(`Exchanging token with Plaid (${plEnv})...`);

    const exchangeRes = await fetch(exchangeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        public_token: publicToken
      })
    });

    if (!exchangeRes.ok) {
      const errBody = await exchangeRes.json().catch(() => ({}));
      throw new Error(`Plaid Exchange Error: ${exchangeRes.status} - ${JSON.stringify(errBody)}`);
    }

    const exchangeData = await exchangeRes.json();
    const accessToken = exchangeData.access_token;

    // Fetch accounts metadata & live balances with the new token
    const balanceUrl = `https://${plEnv}.plaid.com/accounts/balance/get`;
    const balanceRes = await fetch(balanceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        access_token: accessToken
      })
    });

    let accountsList: any[] = [];
    if (balanceRes.ok) {
      const balData = await balanceRes.json();
      accountsList = balData.accounts.map((acc: any) => ({
        name: acc.name,
        type: acc.type,
        balance: acc.balances.available || acc.balances.current,
        currency: acc.balances.iso_currency_code || "USD",
        mask: acc.mask
      }));
    }

    // Try fetching recent transactions
    const txUrl = `https://${plEnv}.plaid.com/transactions/get`;
    const today = new Date().toISOString().split("T")[0];
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    const startDate = pastDate.toISOString().split("T")[0];

    const txRes = await fetch(txUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        access_token: accessToken,
        start_date: startDate,
        end_date: today
      })
    });

    let transactionList: any[] = [];
    if (txRes.ok) {
      const txData = await txRes.json();
      transactionList = txData.transactions.slice(0, 8).map((tx: any) => ({
        merchant: tx.merchant_name || tx.name,
        amount: tx.amount,
        date: tx.date,
        category: tx.category?.[0] || "Travel"
      }));
    }

    return res.json({
      isMock: false,
      accessToken,
      institutionName: "Live Linked Institution via Plaid",
      accounts: accountsList,
      transactions: transactionList
    });

  } catch (err: any) {
    console.error("Plaid token exchange exception:", err);
    return res.status(500).json({
      error: "Failed to exchange public token or acquire real account balances.",
      details: err.message
    });
  }
});

// API Endpoint to generate voice narration using TTS
app.post("/api/narrate", async (req, res) => {
  const { text, voiceName } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided for narration." });
  }

  try {
    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback: If no valid API key is present or TTS fails, we inform client to use local Speech Synthesis
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.log("No valid API Key. Instructing client to run local SpeechSynthesis fallback.");
      return res.json({ fallback: true, message: "Use browser system voice." });
    }

    console.log("Calling Gemini TTS API for voice generation...");
    const selectedVoice = voiceName || "Kore"; // Choice of Kore, Zephyr, Puck, Charon, Kore

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say with a warm, expert tour guide tone: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ base64Audio, mimeType: "audio/pcm" });
    } else {
      throw new Error("No inlineData audio returned from Gemini TTS.");
    }

  } catch (err: any) {
    console.warn("TTS narration model failed or is unavailable. Proceeding with browser-native text-to-speech fallback.", err.message);
    return res.json({ fallback: true, reason: err.message || "TTS Model Limit" });
  }
});

// Route to serve service worker file for offline support
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(path.join(process.cwd(), "src/sw.js"));
});

// Configure Vite and Express serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode using Vite Dev Server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  } else {
    // Production Static Files serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files in production.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully at http://localhost:${PORT}`);
  });
}

bootstrap();
