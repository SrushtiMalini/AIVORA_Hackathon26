import { GoogleGenAI, Type } from "@google/genai";
import Groq from "groq-sdk";
import { LegalAnalysis, Message, WarRoomData, LegalStrategy } from "../types";

const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
const groqKey = import.meta.env.VITE_GROQ_API_KEY;

const ai = new GoogleGenAI({ apiKey: geminiKey });
const groq = new Groq({
  apiKey: groqKey,
  dangerouslyAllowBrowser: true,
});

export interface LegalResponse {
  text: string;
  strategy?: LegalStrategy;
}

const SYSTEM_INSTRUCTION = `You are Defender AI, a Senior Indian Public Defender. 
Your goal is to help people who cannot afford lawyers understand their legal rights and options under Indian Law.

CRITICAL: You must provide your response in TWO parts.
1. A detailed, empathetic, and professional legal explanation in Markdown format.
2. A structured legal strategy analysis including a strength score (0-100), a roadmap of steps, and key risks.

Response Format:
Return a JSON object with the following structure:
{
  "text": "Your markdown legal advice here...",
  "strategy": {
    "strengthScore": 50,
    "strengthLabel": "e.g., Strong, Moderate, Weak",
    "roadmap": [
      { "title": "Step title", "description": "Step details", "status": "completed" | "current" | "upcoming", "estimatedTime": "e.g., 2 weeks" }
    ],
    "keyRisks": ["Risk 1", "Risk 2"]
  }
}

RULES:
1. Use simple, accessible language (Explain Like I'm 15).
2. Always act as a supportive public defender.
3. Provide structured responses: Summary, Relevant Laws, Options (with Risk/Time/Cost), and Next Steps.
4. Detect urgency (Fraud, Abuse, Eviction) and label as LOW/MEDIUM/HIGH.
5. If a document is provided (via OCR text), analyze it for key dates, penalties, and obligations.
6. Identify contradictions if user statements differ from document facts.
7. Generate a structured timeline if requested.
8. ALWAYS include the disclaimer: "This is not legal advice. I am an AI assistant, not a licensed attorney."`;

export async function generateLegalResponse(
  messages: Message[],
  userSettings: { language: string; location: string },
  ocrText?: string
): Promise<LegalResponse> {
  const geminiModel = "gemini-3-flash-preview";
  const groqModel = "llama-3.3-70b-versatile";

  const contextPrompt = `
    User Language: ${userSettings.language}
    User Location: ${userSettings.location}
    ${ocrText ? `Document Content: ${ocrText}` : ""}
  `;

  const lastMessage = messages[messages.length - 1]?.content || "Hello";
  const prompt = `${contextPrompt}\n\nUser Message: ${lastMessage}`;

  try {
    // 1. TRY GROQ FIRST
    console.log("Attempting to use Groq API...");
    const response = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      text: result.text || "I'm sorry, I couldn't process that request.",
      strategy: result.strategy
    };

  } catch (groqError) {
    // 2. FALLBACK TO GEMINI
    console.warn("Groq failed, falling back to Gemini API...", groqError);

    try {
      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              strategy: {
                type: Type.OBJECT,
                properties: {
                  strengthScore: { type: Type.NUMBER },
                  strengthLabel: { type: Type.STRING },
                  roadmap: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ["completed", "current", "upcoming"] },
                        estimatedTime: { type: Type.STRING }
                      },
                      required: ["title", "description", "status"]
                    }
                  },
                  keyRisks: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["strengthScore", "strengthLabel", "roadmap", "keyRisks"]
              }
            },
            required: ["text"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      return {
        text: result.text || "I'm sorry, I couldn't process that request.",
        strategy: result.strategy
      };
    } catch (geminiError) {
      console.error("Gemini Fallback Error:", geminiError);
      return {
        text: "Both AI providers encountered an error while analyzing your case. Please try again later or consult a legal professional."
      };
    }
  }
}

export async function analyzeDocument(text: string): Promise<LegalAnalysis> {
  const geminiModel = "gemini-3-flash-preview";
  const groqModel = "llama-3.3-70b-versatile";

  const prompt = `Analyze this legal document text and provide a structured JSON response:
  ${text}
  
  Required JSON structure:
  {
    "summary": "...",
    "relevantLaws": ["..."],
    "options": [{"title": "...", "description": "...", "risk": "LOW/MEDIUM/HIGH", "cost": "...", "time": "..."}],
    "nextSteps": ["..."],
    "urgency": "LOW/MEDIUM/HIGH",
    "contradictions": ["..."]
  }`;

  try {
    const response = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch (groqError) {
    console.warn("Groq failed for document analysis, falling back to Gemini...", groqError);

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "{}");
  }
}

export async function generateWarRoomAnalysis(
  messages: Message[],
  ocrText?: string
): Promise<WarRoomData> {
  const geminiModel = "gemini-3-flash-preview";
  const groqModel = "llama-3.3-70b-versatile";

  const prompt = `Based on the following legal consultation, generate a structured "War Room" analysis for a visual evidence graph and strategic defense.
  
  Consultation History:
  ${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
  ${ocrText ? `\nDocument Content: ${ocrText}` : ""}
  
  You must identify:
  1. Nodes (People, Documents, Events, Facts) and their connections.
  2. Potential contradictions (isContradicted: true).
  3. "Opponent Swrds" (How the other side will attack and how to shield).
  4. Overall win probability (0-100).
  
  Return ONLY a JSON object:
  {
    "nodes": [{ "id": "string", "label": "string", "type": "person"|"document"|"event"|"fact", "isContradicted": boolean }],
    "links": [{ "source": "id", "target": "id", "label": "string" }],
    "opponentSwords": [{ "attack": "string", "shield": "string", "riskLevel": "LOW"|"MEDIUM"|"HIGH" }],
    "winProbability": 50
  }`;

  try {
    const response = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch (groqError) {
    console.warn("Groq failed for war room, falling back to Gemini...", groqError);
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["person", "document", "event", "fact"] },
                  isContradicted: { type: Type.BOOLEAN }
                },
                required: ["id", "label", "type"]
              }
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  label: { type: Type.STRING }
                },
                required: ["source", "target", "label"]
              }
            },
            opponentSwords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  attack: { type: Type.STRING },
                  shield: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
                },
                required: ["attack", "shield", "riskLevel"]
              }
            },
            winProbability: { type: Type.NUMBER }
          },
          required: ["nodes", "links", "opponentSwords", "winProbability"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }
}
