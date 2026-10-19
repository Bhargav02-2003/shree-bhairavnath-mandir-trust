import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

// In-memory high performance translation cache
const translationCache = new Map<string, string>();

// Pre-seeded static dictionary for Instant Mandir Domain Translations
const staticDictionary: Record<string, string> = {
  "Food": "अन्न दान",
  "General Donation": "साधारण देणगी",
  "Renovation Scheme": "जीर्णोद्धार योजना",
  "Abhishek Pooja": "अभिषेक पूजा",
  "Rituals & Poojas": "धार्मिक विधी आणि पूजा",
  "Rituals & Pooja": "धार्मिक विधी आणि पूजा",
  "Pooja & Vidhi": "पूजा आणि विधी",
  "Temple Maintenance": "मंदिर व्यवस्थापन व निगा",
  "Maintenance": "मंदिर व्यवस्थापन व निगा",
  "Kitchen (Mahaprasad)": "महाप्रसाद स्वयंपाकघर",
  "Salaries & Dakshina": "वेतन आणि मानधन",
  "Electricity & Utilities": "वीज आणि इतर पाणी देयके",
  "Prasad / Flowers": "प्रसाद आणि फुले",
  "Festival Celebrations": "उत्सव सोहळे",
  "Decoration & Lighting": "सजावट आणि रोषणाई",
  "Construction & Repairs": "बांधकाम आणि दुरुस्ती",
  "Administrative Expenses": "प्रशासकीय खर्च",
  "Charity & Social Work": "देणगी आणि समाजकार्य",
  "Office & Stationeries": "कार्यालय आणि स्टेशनरी",
  "Cash": "रोख",
  "Check": "चेक",
  "UPI": "युपीआय",
  "Wheat": "गहू",
  "Rice": "तांदूळ",
  "Dal": "डाळ",
  "Sugar": "साखर",
  "Other": "इतर",
  "Shree Bhairavnath Annual Palkhi Sohala": "श्री भैरवनाथ वार्षिक पालखी सोहळा",
  "Maha Shivratri Grand Abhishek": "महाशिवरात्री भव्य अभिषेक",
  "Kaalbhairav Ashtami Havan": "काळभैरव अष्टमी हवन",
  "Monthly Mahaprasad Distribution": "मासिक महाप्रसाद वाटप",
  "Mandir Main Precincts to Village Square": "मंदिर परिसर ते गावचा चावडी चौक",
  "Garbhgruha (Inner Sanctum)": "गाभारा (गर्भगृह)",
  "Yajna Shala": "यज्ञ शाळा",
  "Annachhatra Hall": "अन्नछत्र हॉल",
  "Active": "सक्रिय",
  "Inactive": "निष्क्रिय",
  "active": "सक्रिय",
  "inactive": "निष्क्रिय",
  "upcoming": "आगामी",
  "completed": "पूर्ण झाले",
  "cancelled": "रद्द झाले",
  "Super Admin": "सुपर ॲडमिन",
  "Trustee": "विश्वस्त",
  "Mandir Priest": "मंदिर पुजारी",
  "admin": "प्रशासक",
  "priest": "पुजारी",
  "President": "अध्यक्ष",
  "Secretary": "सचिव",
  "Treasurer": "खजिनदार",
  "Member": "सदस्य",
  "Purchase of Havan Samagri": "हवन सामग्री खरेदी",
  "Mandir Outer Painting Touchup": "मंदिर बाह्य रंगकाम दुरुस्ती",
  "Rajesh Ramchandra Patil": "राजेश रामचंद्र पाटील",
  "Sunita Kishor Deshmukh": "सुनिता किशोर देशमुख",
  "Abhay Dinkar Joshi": "अभय दिनकर जोशी",
  "bhargav panchal": "भार्गव पांचाळ",
  "prashant singh": "प्रशांत सिंग",
  "ajay": "अजय",
  "Abhishek Pooja Sewa": "अभिषेक पूजा सेवा",
  "Basmati Rice": "बासमती तांदूळ",
  "shera": "शीरा",
  "Mahashivratri Mahotsav 2026": "महाशिवरात्री महोत्सव २०२६",
  "Join us for the grand Mahashivratri celebration. Special pooja will start at 4:00 AM. Maha Prasad will be distributed from 12:00 PM.": "भव्य महाशिवरात्री उत्सवात सहभागी व्हा. पहाटे ४:०० वाजता विशेष पूजा सुरू होईल. दुपारी १२:०० वाजेपासून महाप्रसाद वाटप करण्यात येईल.",
  "Daily Bhakti Aarti Schedule": "दैनिक भक्ति आरती वेळापत्रक",
  "Donation For Temple Renovation Scheme": "मंदिर जीर्णोद्धार योजनेसाठी देणगी"
};

// Seed static dictionary into cache
Object.entries(staticDictionary).forEach(([en, mr]) => {
  translationCache.set(en.trim().toLowerCase(), mr);
});

// Configure IndicTrans2 Service URL
const INDICTRANS2_URL = process.env.INDICTRANS2_URL || "http://localhost:8000/translate";

// Initialize Gemini Client if key present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch {
    aiClient = null;
  }
}

/**
 * Batch translation function using IndicTrans2 -> Gemini -> Fallback
 */
export async function translateTextsToMarathi(texts: string[]): Promise<string[]> {
  if (!texts || texts.length === 0) return [];

  const results: string[] = new Array(texts.length);
  const missingIndices: number[] = [];
  const missingTexts: string[] = [];

  // Check cache first
  texts.forEach((text, idx) => {
    if (!text || typeof text !== "string" || text.trim() === "") {
      results[idx] = text;
      return;
    }

    const trimmed = text.trim();
    // Don't translate pure numbers, dates, emails, URLs or UUIDs
    if (/^[\d\s.,\/#-]+$/.test(trimmed) || /^[0-9a-fA-F-]{36}$/.test(trimmed) || trimmed.includes("@") || trimmed.startsWith("http") || trimmed.startsWith("/uploads")) {
      results[idx] = text;
      return;
    }

    const lowerKey = trimmed.toLowerCase();
    if (translationCache.has(lowerKey)) {
      results[idx] = translationCache.get(lowerKey)!;
    } else {
      missingIndices.push(idx);
      missingTexts.push(trimmed);
    }
  });

  if (missingTexts.length === 0) {
    return results;
  }

  // 1. Try IndicTrans2 Microservice
  try {
    const response = await axios.post(INDICTRANS2_URL, {
      input: missingTexts,
      src_lang: "eng_Latn",
      tgt_lang: "mar_Deva"
    }, { timeout: 2000 });

    if (response.data && Array.isArray(response.data.translations) && response.data.translations.length === missingTexts.length) {
      const translatedBatch = response.data.translations;
      missingIndices.forEach((origIdx, i) => {
        const tr = translatedBatch[i];
        results[origIdx] = tr;
        translationCache.set(missingTexts[i].toLowerCase(), tr);
      });
      return results;
    }
  } catch {
    // IndicTrans2 microservice not running locally or timed out
  }

  // 2. Try Gemini API if key is set
  if (aiClient) {
    try {
      const prompt = `Translate the following English strings into natural Devanagari Marathi suitable for a Temple Trust portal. Return ONLY a JSON array of translated strings matching the exact input order.\nInput: ${JSON.stringify(missingTexts)}`;
      
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const responseText = response.text || "";
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        const parsedArray = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsedArray) && parsedArray.length === missingTexts.length) {
          missingIndices.forEach((origIdx, i) => {
            const tr = parsedArray[i];
            results[origIdx] = tr;
            translationCache.set(missingTexts[i].toLowerCase(), tr);
          });
          return results;
        }
      }
    } catch {
      // Ignore AI failure
    }
  }

  // 3. Fallback: If no translation service reachable, return original text unchanged
  missingIndices.forEach((origIdx, i) => {
    results[origIdx] = missingTexts[i];
  });

  return results;
}

// Fields in API responses that should be translated when client requests Marathi
const TRANSLATABLE_FIELDS = new Set([
  "name",
  "reason",
  "description",
  "title",
  "foodName",
  "category",
  "location",
  "venue",
  "details",
  "designation",
  "action",
  "eventStatus",
  "fullName",
  "createdBy",
  "paymentMode"
]);

/**
 * Recursively inspect and translate object fields
 */
export async function translateApiResponseObject(rawInput: any): Promise<any> {
  if (!rawInput) return rawInput;

  // Convert Mongoose document or Sequelize model to plain JS object if applicable
  let data = rawInput;
  if (typeof data.toObject === "function") {
    data = data.toObject({ virtuals: true });
  } else if (data._doc && typeof data._doc === "object") {
    data = { ...data._doc };
  } else if (typeof data.toJSON === "function" && typeof data.save === "function") {
    data = data.toJSON();
  }

  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return Promise.all(data.map(item => translateApiResponseObject(item)));
  }

  // Collect strings to batch translate for performance
  const keysToTranslate: string[] = [];
  const textValuesToTranslate: string[] = [];

  for (const key of Object.keys(data)) {
    if (TRANSLATABLE_FIELDS.has(key) && typeof data[key] === "string" && data[key].trim() !== "") {
      keysToTranslate.push(key);
      textValuesToTranslate.push(data[key]);
    }
  }

  const translatedValues = await translateTextsToMarathi(textValuesToTranslate);

  const result = { ...data };
  keysToTranslate.forEach((key, idx) => {
    result[key] = translatedValues[idx];
  });

  // Handle nested objects or data properties
  for (const key of Object.keys(result)) {
    if (key === "data" && Array.isArray(result.data)) {
      result.data = await Promise.all(result.data.map((item: any) => translateApiResponseObject(item)));
    } else if (
      typeof result[key] === "object" &&
      result[key] !== null &&
      key !== "trusteePermissions" &&
      key !== "permissions"
    ) {
      result[key] = await translateApiResponseObject(result[key]);
    }
  }

  return result;
}

/**
 * Express Middleware: Automatically translates JSON API responses into Marathi
 * when header `Accept-Language: mr` or query `lang=mr` is received.
 */
export const responseTranslationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const rawLangHeader = (req.headers["accept-language"] || req.query.lang || "mr").toString().toLowerCase();
  const isMarathiRequested = !rawLangHeader.includes("en") || rawLangHeader.includes("mr") || rawLangHeader.includes("marathi");

  if (isMarathiRequested) {
    const originalJson = res.json.bind(res);

    res.json = function (body: any): Response {
      // Don't modify auth/login responses or error statuses
      if (res.statusCode >= 400 || req.path.endsWith("/login") || req.path.endsWith("/upload")) {
        return originalJson(body);
      }

      translateApiResponseObject(body)
        .then((translatedBody) => originalJson(translatedBody))
        .catch((err) => {
          console.error("Translation middleware error:", err);
          originalJson(body);
        });

      return res;
    };
  }

  next();
};
