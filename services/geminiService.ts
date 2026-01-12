import { GoogleGenAI, Type } from "@google/genai";
import { SleepSession, ChatMessage, UserProfile } from "../types";

const getAIClient = () => {
  let apiKey = '';
  try {
    // Check if we are in a Node-like environment with process defined
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || '';
    }
  } catch (e) {
    console.error("Error accessing process.env:", e);
  }

  if (!apiKey) {
    console.warn("API Key is missing. AI features will be disabled.");
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeUserProfile = async (profile: UserProfile): Promise<string> => {
  try {
    const ai = getAIClient();

    const prompt = `
      You are an expert Sleep Scientist. Review the following user profile assessment and provide a personalized sleep solution plan.
      
      User Profile:
      - Age/Gender: ${profile.age}, ${profile.gender}
      - Daily Caffeine: ${profile.dailyCaffeine}
      - Screen Time Before Bed: ${profile.screenTime}
      - Typical Routine: ${profile.typicalBedtimeRoutine.join(', ')}
      - Average Sleep: ${profile.averageSleepDuration}
      - Reported Issues: ${profile.sleepIssues.join(', ')}

      Task:
      Provide a "Sleep Hygiene Prescription" in 3 concise bullet points.
      1. Address their specific caffeine or screen time habits if negative.
      2. Suggest a modification to their routine based on their reported issues.
      3. Provide one long-term habit change recommendation.
      
      Keep the tone professional, encouraging, and medical but accessible.
      IMPORTANT: Do not use asterisks (*) or markdown bolding in your response. Use plain text only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        responseMimeType: 'text/plain'
      },
      contents: { parts: [{ text: prompt }] },
    });

    let text = response.text || "Unable to generate profile analysis.";
    return text.replace(/\*/g, '');
  } catch (error: any) {
    console.error("Error analyzing profile:", error);
    
    const errorMessage = error?.message || JSON.stringify(error);
    
    if (errorMessage.includes("API_KEY_MISSING")) {
      return "Configuration Error: API Key is missing. Please check your environment variables.";
    }
    return "Service Error: The AI service is currently experiencing issues. Please try again later.";
  }
};

export const analyzeSleepSession = async (session: SleepSession, userProfile?: UserProfile): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const profileContext = userProfile 
      ? `User Context:
         - Age: ${userProfile.age}
         - Gender: ${userProfile.gender}
         - Typical Caffeine: ${userProfile.dailyCaffeine}
         - Typical Screen Time: ${userProfile.screenTime}
         - Routine: ${userProfile.typicalBedtimeRoutine.join(', ')}
         - Avg Sleep: ${userProfile.averageSleepDuration}
         - Issues: ${userProfile.sleepIssues.join(', ')}`
      : 'User Profile: Unknown';

    const sessionContext = `
      Today's Session:
      - Caffeine: ${session.caffeineIntake || "Not recorded"}
      - Before Bed: ${session.preSleepActivity?.join(', ') || "Not recorded"}
    `;

    const prompt = `
      Analyze this sleep session. Provide a concise, 3-sentence summary: 
      1. Evaluation of quality based on duration/score.
      2. How their daily factors (caffeine/activity) likely impacted it.
      3. One personalized actionable tip based on their chronic issues (${userProfile?.sleepIssues.join(',') || 'none'}).
      
      ${profileContext}
      
      Session Data:
      - Duration: ${Math.floor(session.durationMinutes / 60)}h ${session.durationMinutes % 60}m
      - Quality Score: ${session.quality}/100
      - Dream Notes: ${session.dreamNotes || "None"}
      ${sessionContext}

      IMPORTANT: Do not use asterisks (*) or markdown bolding in your response. Use plain text only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
    });

    let text = response.text || "Unable to generate analysis at this time.";
    return text.replace(/\*/g, '');
  } catch (error) {
    console.error("Error analyzing sleep:", error);
    return "Analysis unavailable. Please ensure your API key is valid.";
  }
};

export const getSleepCoachChat = async (history: ChatMessage[], newMessage: string, lastSession?: SleepSession): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const systemInstruction = `
      You are Dr. Somnus, an expert AI Sleep Coach. 
      Your goal is to help the user improve their sleep hygiene using scientific principles (CBT-I).
      Be empathetic, encouraging, and concise.
      Keep your response strictly to 2-3 sentences maximum.
      Do not use asterisks (*) or markdown bolding in your response.
      
      ${lastSession ? `Context - Last night's sleep: ${lastSession.quality}/100 score, ${Math.floor(lastSession.durationMinutes/60)}h duration.` : ''}
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    let text = result.text || "I'm having trouble thinking right now. Try again later.";
    return text.replace(/\*/g, '');
  } catch (error) {
    console.error("Chat error:", error);
    return "I am currently offline due to a connection issue. Please check your API key.";
  }
};

export const interpretDream = async (dreamText: string): Promise<{ interpretation: string; themes: string[] }> => {
  try {
    const ai = getAIClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: `Interpret this dream from a psychological perspective (Jungian/Freudian mix) but keep it light and insightful. Also extract 3 key themes.
      
      Dream: "${dreamText}"` }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interpretation: { type: Type.STRING },
            themes: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["interpretation", "themes"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response text");
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Dream interpretation error:", error);
    return { 
      interpretation: "Could not interpret dream at this moment.", 
      themes: ["Unknown"] 
    };
  }
};
