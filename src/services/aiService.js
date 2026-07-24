import { clamp, toNumber } from '../utils/format.js';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Updated default model name to ensure compatibility with the API
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

const MATERIAL_PROFILES = {
  'Nylon 12': { moldTemp: 86, preheatTemp: 106, stretchSpeed: 15, pressureFactor: 0.48, notes: 'Bon compromis rigidité/flexibilité.' },
  Pebax: { moldTemp: 76, preheatTemp: 92, stretchSpeed: 18, pressureFactor: 0.42, notes: 'Flexible; montée en pression progressive.' },
  PET: { moldTemp: 96, preheatTemp: 124, stretchSpeed: 12, pressureFactor: 0.58, notes: 'Demande plus de chaleur et contrôle de refroidissement.' },
  Polyurethane: { moldTemp: 68, preheatTemp: 82, stretchSpeed: 20, pressureFactor: 0.38, notes: 'Limiter surchauffe; risque de tackiness.' },
  Silicone: { moldTemp: 62, preheatTemp: 74, stretchSpeed: 16, pressureFactor: 0.34, notes: 'Pression basse; maintien plus long.' },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPrompt(order) {
  return `Tu es un ingénieur process expert en balloon forming médical.\n\nCommande client:\n${JSON.stringify(order, null, 2)}\n\nRetourne uniquement un JSON valide sans markdown avec cette structure:\n{\n  "summary": "résumé court",\n  "confidence": 0.0,\n  "parameters": {\n    "parisonCutMm": 0,\n    "moldTemperatureC": 0,\n    "preheatTemperatureC": 0,\n    "preheatTimeSec": 0,\n    "stretchDistanceMm": 0,\n    "stretchSpeedMmSec": 0,\n    "blowPressureBar": 0,\n    "blowTimeSec": 0,\n    "coolingTimeSec": 0,\n    "gripperForceN": 0,\n    "airJacketPressureBar": 0,\n    "waterJacketFlowLMin": 0,\n    "estimatedCycleTimeSec": 0\n  },\n  "qualityChecks": ["..."],\n  "riskFlags": ["..."],\n  "bfmScript": "script texte pour injecter les paramètres dans une machine BFM Windows"\n}\nLes valeurs doivent rester plausibles et devront être validées par un ingénieur avant injection machine.`;
}

function parseGeminiJson(text) {
  const cleaned = text
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  }
  return JSON.parse(cleaned);
}

async function callGemini(order) {
  if (!GEMINI_API_KEY) return null;

  const response = await fetch(
    `[https://generativelanguage.googleapis.com/v1beta/models/$](https://generativelanguage.googleapis.com/v1beta/models/$){GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(order) }],
          },
        ],
        generationConfig: {
          temperature: 0.25,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n');
  if (!text) throw new Error('Gemini response empty');
  return parseGeminiJson(text);
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function deterministicRecipe(order) {
  const material = order.material || 'Pebax';
  const profile = MATERIAL_PROFILES[material] ?? MATERIAL_PROFILES.Pebax;

  const diameter = toNumber(order.balloonDiameterMm, 4);
  const length = toNumber(order.balloonLengthMm, 30);
  const width = toNumber(order.balloonWidthMm, diameter);
  const thickness = toNumber(order.wallThicknessMm, 0.06);
  const tubeOd = toNumber(order.tubeOuterDiameterMm, Math.max(1.2, diameter * 0.38));
  const targetPressure = toNumber(order.targetPressureBar, 10);

  const parisonCutMm = clamp(length * 1.14 + diameter * 2.6 + width * 0.5 + thickness * 90, 18, 260);
  const stretchDistanceMm = clamp(length * 0.88 + diameter * 1.4, 12, 230);
  const blowPressureBar = clamp(targetPressure * 0.62 + diameter * profile.pressureFactor + thickness * 45, 4.5, 22);
  const preheatTimeSec = clamp(12 + length / 7.5 + thickness * 85 + tubeOd * 1.3, 14, 95);
  const blowTimeSec = clamp(6 + diameter * 0.65 + thickness * 38, 7, 42);
  const coolingTimeSec = clamp(9 + thickness * 70 + diameter * 0.45, 10, 60);
  const estimatedCycleTimeSec = preheatTimeSec + blowTimeSec + coolingTimeSec + 9.5;
  const gripperForceN = clamp(18 + tubeOd * 7 + thickness * 120, 18, 85);

  const parameters = {
    parisonCutMm: round(parisonCutMm, 1),
    moldTemperatureC: round(profile.moldTemp + diameter * 0.15, 1),
    preheatTemperatureC: round(profile.preheatTemp + thickness * 35, 1),
    preheatTimeSec: round(preheatTimeSec, 1),
    stretchDistanceMm: round(stretchDistanceMm, 1),
    stretchSpeedMmSec: round(profile.stretchSpeed, 1),
    blowPressureBar: round(blowPressureBar, 2),
    blowTimeSec: round(blowTimeSec, 1),
    coolingTimeSec: round(coolingTimeSec, 1),
    gripperForceN: round(gripperForceN, 1),
    airJacketPressureBar: round(clamp(blowPressureBar * 0.18, 1.1, 3.8), 2),
    waterJacketFlowLMin: round(clamp(1.8 + diameter * 0.11 + thickness * 8, 2, 7), 2),
    estimatedCycleTimeSec: round(estimatedCycleTimeSec, 1),
  };

  return {
    source: 'Quadracure AI simulator',
    summary: `Paramètres initiaux proposés pour ${material}, ballon Ø${diameter} mm × ${length} mm. Validation ingénieur requise avant injection BFM.`,
    confidence: 0.84,
    parameters,
    qualityChecks: [
      'Vérifier OD/ID tube vs diamètre ballon cible.',
      'Confirmer absence de neck thinning après les 10 premiers ballons.',
      'Mesurer diamètre, longueur utile, burst pressure et visuel shoulder.',
      'Lancer un mini-DOE si yield < 95% sur les 30 premières pièces.',
    ],
    riskFlags: [
      thickness > 0.12 ? 'Paroi épaisse: risque de cycle thermique plus long.' : 'Risque standard de variation d’épaisseur.',
      targetPressure > 14 ? 'Burst pressure élevé: valider par test destructif renforcé.' : 'Pression cible dans plage standard demo.',
      profile.notes,
    ],
    bfmScript: buildBfmScript(order, parameters),
  };
}

export function buildBfmScript(order, parameters) {
  const lines = [
    '# Quadracure Innovators — Auto-generated BFM recipe',
    `# Order: ${order.id}`,
    `# Client: ${order.organization || order.clientName || 'N/A'}`,
    `SET ORDER_ID "${order.id}"`,
    `SET MATERIAL "${order.material || 'N/A'}"`,
    `SET PARISON_CUT_MM ${parameters.parisonCutMm}`,
    `SET MOLD_TEMP_C ${parameters.moldTemperatureC}`,
    `SET PREHEAT_TEMP_C ${parameters.preheatTemperatureC}`,
    `SET PREHEAT_TIME_SEC ${parameters.preheatTimeSec}`,
    `SET STRETCH_DISTANCE_MM ${parameters.stretchDistanceMm}`,
    `SET STRETCH_SPEED_MM_SEC ${parameters.stretchSpeedMmSec}`,
    `SET BLOW_PRESSURE_BAR ${parameters.blowPressureBar}`,
    `SET BLOW_TIME_SEC ${parameters.blowTimeSec}`,
    `SET COOLING_TIME_SEC ${parameters.coolingTimeSec}`,
    `SET GRIPPER_FORCE_N ${parameters.gripperForceN}`,
    `SET AIR_JACKET_PRESSURE_BAR ${parameters.airJacketPressureBar}`,
    `SET WATER_JACKET_FLOW_L_MIN ${parameters.waterJacketFlowLMin}`,
    'VERIFY SAFETY_INTERLOCKS',
    'UPLOAD_RECIPE_TO_BFM',
    'READY_FOR_OPERATOR_CONFIRMATION',
  ];
  return lines.join('\n');
}

export async function generateBFMRecipe(order) {
  await sleep(3000);

  try {
    const geminiRecipe = await callGemini(order);
    if (geminiRecipe?.parameters) {
      return {
        source: `Gemini (${GEMINI_MODEL})`,
        ...geminiRecipe,
        bfmScript: geminiRecipe.bfmScript || buildBfmScript(order, geminiRecipe.parameters),
      };
    }
  } catch (error) {
    console.warn('Gemini failed, falling back to deterministic recipe', error);
  }

  return deterministicRecipe(order);
}