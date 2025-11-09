
import { GoogleGenAI, Type, GenerateContentResponse, Chat, Modality } from "@google/genai";
import { SimpleExplainer } from '../types';
import { loadApiKey, loadModel, saveModel } from './storageService';

let ai: GoogleGenAI | null = null;

export const initializeAiFromStorage = async () => {
    const apiKey = await loadApiKey();
    initAi(apiKey);
};

export const initAi = (apiKey: string | null) => {
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    } else {
        ai = null;
    }
};

export const reinitializeAi = (apiKey: string) => {
    initAi(apiKey);
};

export const getAiInstance = () => {
    if (!ai) {
        throw new Error("API Key not set. Please go to Settings to add your Google Gemini API key.");
    }
    return ai;
};

const getModel = async () => {
    const savedModel = await loadModel();
    // This is a migration step. If a user has the old, now-invalid model name stored
    // in their local storage, we detect it, update it to the new default, and save
    // the new default for future sessions. This prevents the app from breaking
    // for existing users after the model name change.
    if (savedModel && (savedModel.includes('1.5') || savedModel === 'gemini-pro')) {
        const newModel = 'gemini-2.5-flash';
        await saveModel(newModel); // Correct the stored model for next time
        return newModel;      // Use the new model for the current session
    }
    return savedModel || 'gemini-2.5-flash'; // Otherwise, use the saved model or the default
};

// --- OpenRouter Fallback Configuration ---
const OPENROUTER_API_KEY = "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";
const OPENROUTER_CHAT_URL = `https://openrouter.ai/api/v1/chat/completions`;
const OPENROUTER_IMAGE_URL = `https://openrouter.ai/api/v1/images/generations`;
const OPENROUTER_TTS_URL = `https://openrouter.ai/api/v1/audio/speech`;

const getOpenRouterHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://halomind.app', // Placeholder, required by OpenRouter
    'X-Title': 'Halomind', // Placeholder, required by OpenRouter
});

// A mock response type that mimics GenerateContentResponse for consistency
type FallbackResponse = {
    text: string;
    candidates?: any[];
    functionCalls?: any[]; // for function calling if needed
    // Add other properties from GenerateContentResponse if they are used elsewhere
};

const modelMapping: { [key: string]: string } = {
    'gemini-2.5-flash-lite': 'google/gemini-flash-2.5',
    'gemini-2.5-flash': 'google/gemini-flash-2.5',
    'gemini-2.5-pro': 'google/gemini-pro-2.5',
    'imagen-3.0-generate': 'stabilityai/stable-diffusion-3',
    'gemini-2.5-flash-preview-tts': 'elevenlabs/eleven-mono',
};

// --- OpenRouter Fallback Functions ---

const callOpenRouter = async (params: {
    model: string;
    contents?: any;
    config?: any;
}): Promise<FallbackResponse> => {
    const openRouterModel = modelMapping[params.model] || 'google/gemini-flash-2.5';

    let messages: any[] = [];
    if (params.config?.systemInstruction) {
        messages.push({ role: 'system', content: params.config.systemInstruction });
    }

    let userContent: any;
    if (typeof params.contents === 'string') {
        userContent = params.contents;
    } else if (params.contents?.parts) {
        const contentParts: any[] = [];
        params.contents.parts.forEach((part: any) => {
            if (part.text) {
                contentParts.push({ type: 'text', text: part.text });
            } else if (part.inlineData) {
                const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                contentParts.push({ type: 'image_url', image_url: { url: dataUrl } });
            }
        });
        userContent = contentParts;
    }
    messages.push({ role: 'user', content: userContent });
    
    const body: any = { model: openRouterModel, messages };
    if (params.config?.responseMimeType === "application/json") {
        body.response_format = { type: 'json_object' };
    }
    
    const response = await fetch(OPENROUTER_CHAT_URL, {
        method: 'POST',
        headers: getOpenRouterHeaders(),
        body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`OpenRouter fallback failed: ${await response.text()}`);
    const data = await response.json();
    return { text: data.choices[0]?.message?.content || '' };
};

async function* callOpenRouterStream(params: { model: string; contents?: any; config?: any; }): AsyncIterable<FallbackResponse> {
    const openRouterModel = modelMapping[params.model] || 'google/gemini-flash-2.5';
    const body: any = { model: openRouterModel, stream: true };
    
    let messages: any[] = [];
    if (params.config?.systemInstruction) messages.push({ role: 'system', content: params.config.systemInstruction });
    if (params.contents) messages.push({ role: 'user', content: params.contents });
    body.messages = messages;

    const response = await fetch(OPENROUTER_CHAT_URL, {
        method: 'POST',
        headers: getOpenRouterHeaders(),
        body: JSON.stringify(body),
    });

    if (!response.body) throw new Error("No response body for streaming from OpenRouter");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const jsonStr = line.substring(6);
                if (jsonStr === '[DONE]') return;
                try {
                    const chunk = JSON.parse(jsonStr);
                    const text = chunk.choices[0]?.delta?.content || '';
                    if (text) yield { text };
                } catch (e) { /* Ignore partial JSON */ }
            }
        }
    }
}

const callOpenRouterImageGeneration = async (prompt: string): Promise<string | null> => {
    const response = await fetch(OPENROUTER_IMAGE_URL, {
        method: 'POST',
        headers: getOpenRouterHeaders(),
        body: JSON.stringify({ model: modelMapping['imagen-3.0-generate'], prompt, n: 1, response_format: 'b64_json' }),
    });
    if (!response.ok) throw new Error(`OpenRouter image fallback failed: ${await response.text()}`);
    const data = await response.json();
    const b64_json = data.data[0]?.b64_json;
    return b64_json ? `data:image/png;base64,${b64_json}` : null;
};

const callOpenRouterTTS = async (text: string): Promise<string | null> => {
    const response = await fetch(OPENROUTER_TTS_URL, {
        method: 'POST',
        headers: getOpenRouterHeaders(),
        body: JSON.stringify({ model: modelMapping['gemini-2.5-flash-preview-tts'], input: text }),
    });
    if (!response.ok) throw new Error(`OpenRouter TTS fallback failed: ${await response.text()}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const parseJsonResponse = <T,>(text: string): T | null => {
    try {
        const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Failed to parse JSON response:", error);
        console.error("Original text:", text);
        return null;
    }
};

const withRetry = async <T,>(apiCall: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
    let attempt = 0;
    while (true) {
        try {
            return await apiCall();
        } catch (error: any) {
            attempt++;
            const isRateLimitError = error.toString().includes('429') || error.toString().includes('RESOURCE_EXHAUSTED');
            const isServerError = error.toString().match(/5\d{2}/);

            if ((isRateLimitError || isServerError) && attempt < maxRetries) {
                const delay = initialDelay * (2 ** (attempt - 1));
                const jitter = delay * 0.2 * Math.random();
                const waitTime = delay + jitter;
                console.warn(`Primary API failed, retrying in ${Math.round(waitTime)}ms... (Attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                throw error;
            }
        }
    }
};

const callApiWithFallback = async <T,>(
    primaryApiCall: () => Promise<T>,
    fallbackApiCall: () => Promise<T>
): Promise<T> => {
    try {
        return await withRetry(primaryApiCall);
    } catch (primaryError) {
        console.warn("Primary API failed after all retries. Attempting fallback.", primaryError);
        try {
            const fallbackResult = await fallbackApiCall();
            console.log("Fallback API call successful.");
            return fallbackResult;
        } catch (fallbackError) {
            console.error("Fallback API also failed.", fallbackError);
            throw primaryError; // Re-throw original error to the UI
        }
    }
};

// --- Refactored Service Functions ---

export const generateNotesStream = async (sectionTitle: string, context: string): Promise<AsyncIterable<GenerateContentResponse>> => {
    const localAi = getAiInstance();
    const model = await getModel();
    const prompt = `Generate structured, easy-to-read notes in Markdown format for the section titled "${sectionTitle}". The notes should be based on the provided context. Use headings, bullet points, and bold text to organize the information clearly.\n\nContext:\n---\n${context.substring(0, 30000)}\n---`;
    
    const primaryCall = () => localAi.models.generateContentStream({ model, contents: prompt });
    const fallbackCall = () => Promise.resolve(callOpenRouterStream({ model, contents: prompt })) as unknown as Promise<AsyncIterable<GenerateContentResponse>>;

    return callApiWithFallback(primaryCall, fallbackCall);
};

export const generateQuizContent = async (sectionTitle: string, context: string) => {
    const localAi = getAiInstance();
    const model = await getModel();
    const prompt = `Create a quiz with 5 multiple-choice questions for the section "${sectionTitle}", based on the provided context. For each question, provide 4 options, indicate the correct answer's index, and give a brief explanation. Respond ONLY with a JSON object.\n\nContext:\n---\n${context.substring(0, 30000)}\n---`;
    const config = { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctIndex: { type: Type.INTEGER }, explanation: { type: Type.STRING } }, required: ['prompt', 'options', 'correctIndex', 'explanation'] } } }, required: ['questions'] } };

    const primaryCall = () => localAi.models.generateContent({ model, contents: prompt, config });
    const fallbackCall = () => callOpenRouter({ model, contents: prompt, config }) as Promise<GenerateContentResponse>;

    const response = await callApiWithFallback(primaryCall, fallbackCall);
    return parseJsonResponse<{ questions: any[] }>(response.text);
};

export const generateFlashcardsContent = async (sectionTitle: string, context: string) => {
    const localAi = getAiInstance();
    const model = await getModel();
    const prompt = `Generate a set of 10-15 flashcards for the section "${sectionTitle}" based on the provided context. Each flashcard should be a concise question-answer pair. Respond ONLY with a JSON object.\n\nContext:\n---\n${context.substring(0, 30000)}\n---`;
    const config = { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { flashcards: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } }, required: ['question', 'answer'] } } }, required: ['flashcards'] } };

    const primaryCall = () => localAi.models.generateContent({ model, contents: prompt, config });
    const fallbackCall = () => callOpenRouter({ model, contents: prompt, config }) as Promise<GenerateContentResponse>;

    const response = await callApiWithFallback(primaryCall, fallbackCall);
    return parseJsonResponse<{ flashcards: any[] }>(response.text);
};

export const generateAdaptiveQuiz = async (weakTopics: string[], context: string) => {
    const localAi = getAiInstance();
    const model = await getModel();
    const prompt = `Based on the provided context, generate a new quiz with 5 multiple-choice questions. These questions should specifically test the user's understanding of topics they previously struggled with. Topics the user answered incorrectly on previous questions about:\n- ${weakTopics.join('\n- ')}\n\nFor each new question, provide 4 options, indicate the correct answer's index, and give a brief explanation. Respond ONLY with a JSON object.\n\nContext:\n---\n${context.substring(0, 30000)}\n---`;
    const config = { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctIndex: { type: Type.INTEGER }, explanation: { type: Type.STRING } }, required: ['prompt', 'options', 'correctIndex', 'explanation'] } } }, required: ['questions'] } };
    
    const primaryCall = () => localAi.models.generateContent({ model, contents: prompt, config });
    const fallbackCall = () => callOpenRouter({ model, contents: prompt, config }) as Promise<GenerateContentResponse>;

    const response = await callApiWithFallback(primaryCall, fallbackCall);
    return parseJsonResponse<{ questions: any[] }>(response.text);
};

export const generateSimpleExplainer = async (sectionTitle: string, context: string): Promise<SimpleExplainer | null> => {
    const localAi = getAiInstance();
    const model = await getModel();
    const prompt = `Create a "Simple Explainer" for the section "${sectionTitle}" using the provided context. The explainer should have a title, 4-6 key bullet points, and a descriptive prompt for generating a relevant diagram. Use Google Search to ensure accuracy and include up-to-date information if relevant. Respond ONLY with a valid JSON object of the format: {"title": string, "points": string[], "diagramPrompt": string}. Do not include any other text or markdown formatting.\n\nContext:\n---\n${context.substring(0, 30000)}\n---`;
    
    const primaryCall = () => localAi.models.generateContent({ model, contents: prompt, config: { tools: [{ googleSearch: {} }] } });
    const fallbackCall = async (): Promise<GenerateContentResponse> => {
        const fallbackPrompt = prompt.replace("Use Google Search to ensure accuracy and include up-to-date information if relevant. ", "");
        const res = await callOpenRouter({ model, contents: fallbackPrompt, config: { responseMimeType: "application/json" } }); // Using JSON mode as a substitute for grounding
        return res as GenerateContentResponse;
    };

    const response = await callApiWithFallback(primaryCall, fallbackCall);
    const parsed = parseJsonResponse<SimpleExplainer>(response.text);
    if (!parsed) return null;

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
        parsed.groundingSources = groundingChunks.map((chunk: any) => chunk.web).filter(Boolean).map((web: any) => ({ title: web.title, uri: web.uri }));
    }
    return parsed;
};

export const generateDiagram = async (prompt: string): Promise<string | null> => {
    const localAi = getAiInstance();
    const model = 'imagen-3.0-generate';
    
    const primaryCall = async () => {
        const response: any = await localAi.models.generateImages({ model, prompt: `Technical diagram, educational illustration: ${prompt}`, config: { numberOfImages: 1, aspectRatio: "16:9", outputMimeType: 'image/jpeg' } });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        return null;
    };

    const fallbackCall = async () => {
        const b64 = await callOpenRouterImageGeneration(`Technical diagram, educational illustration: ${prompt}`);
        return b64;
    };

    return callApiWithFallback(primaryCall, fallbackCall);
};

export const generateDeepExplainerScript = async (sectionTitle: string, context: string) => {
    const localAi = getAiInstance();
    const model = await getModel();
    const prompt = `You are an expert educator. Write a detailed, engaging, and comprehensive script for a 60-90 second educational video about "${sectionTitle}". The script should be based on the provided context, breaking down complex topics into simple, understandable parts. Use your advanced reasoning capabilities to structure the narrative logically.\n\nContext:\n---\n${context.substring(0, 100000)}\n---`;
    
    const primaryCall = () => localAi.models.generateContent({ model, contents: prompt, config: { thinkingConfig: { thinkingBudget: model === 'gemini-2.5-pro' ? 32768 : undefined } } });
    const fallbackCall = () => callOpenRouter({ model, contents: prompt }) as Promise<GenerateContentResponse>;
    
    const response = await callApiWithFallback(primaryCall, fallbackCall);
    return response.text;
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    const localAi = getAiInstance();
    const model = "gemini-2.5-flash-preview-tts";
    const primaryCall = async () => {
        const response = await localAi.models.generateContent({ model, contents: [{ parts: [{ text }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } } });
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return audioData ? `data:audio/webm;base64,${audioData}` : null;
    };
    
    const fallbackCall = () => callOpenRouterTTS(text);

    return callApiWithFallback(primaryCall, fallbackCall);
};

export const analyzeImage = async (imageBase64: string, mimeType: string, prompt: string) => {
    const localAi = getAiInstance();
    const model = await getModel();
    const contents = { parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: prompt }] };

    const primaryCall = () => localAi.models.generateContent({ model, contents });
    const fallbackCall = () => callOpenRouter({ model, contents }) as Promise<GenerateContentResponse>;

    const response = await callApiWithFallback(primaryCall, fallbackCall);
    return response.text;
};

// Video analysis is not supported by the OpenRouter fallback, so it will not have a fallback.
export const analyzeVideo = async (videoBase64: string, mimeType: string, prompt: string) => {
    const localAi = getAiInstance();
    const model = await getModel();
    const response: GenerateContentResponse = await withRetry(() => localAi.models.generateContent({
        model,
        contents: { parts: [{ inlineData: { data: videoBase64, mimeType } }, { text: prompt }] }
    }));
    return response.text;
};

export const extractTextFromHtml = async (html: string): Promise<string | null> => {
    const localAi = getAiInstance();
    const model = await getModel();
    const prompt = `Extract the main article text from the following HTML content. Ignore all scripts, styles, navigation bars, sidebars, ads, and footers. Focus solely on the core content (paragraphs, headings) of the article. Respond ONLY with the clean, extracted text.\n\nHTML:\n---\n${html.substring(0, 100000)}\n---`;
    
    const primaryCall = () => localAi.models.generateContent({ model, contents: prompt });
    const fallbackCall = () => callOpenRouter({ model, contents: prompt }) as Promise<GenerateContentResponse>;
    
    const response = await callApiWithFallback(primaryCall, fallbackCall);
    return response.text;
};

export const generateCourseFromImage = async (imageBase64: string, mimeType: string) => {
    const localAi = getAiInstance();
    const model = await getModel();
    const prompt = `You are an AI assistant that processes images of documents. Extract all text from the provided image. Based on the extracted text, generate a concise and relevant course title, a title for this specific section of the course, and the section notes in Markdown format. Respond ONLY with a single, valid JSON object.\nExample Response:\n{"courseTitle": "Introduction to Photosynthesis","sectionTitle": "The Calvin Cycle","notes": "# The Calvin Cycle\\n\\n- The Calvin Cycle is a set of light-independent reactions..."}`;
    const contents = { parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: prompt }] };
    const config = { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { courseTitle: { type: Type.STRING }, sectionTitle: { type: Type.STRING }, notes: { type: Type.STRING } }, required: ['courseTitle', 'sectionTitle', 'notes'] } };

    const primaryCall = () => localAi.models.generateContent({ model, contents, config });
    const fallbackCall = () => callOpenRouter({ model, contents, config }) as Promise<GenerateContentResponse>;
    
    const response = await callApiWithFallback(primaryCall, fallbackCall);
    return parseJsonResponse<{ courseTitle: string; sectionTitle: string; notes: string }>(response.text);
};

export const generateStudySchedule = async (prompt: string, sectionTitles: string[]): Promise<{ schedule: { sectionTitle: string; date: string }[] } | null> => {
    const localAi = getAiInstance();
    const model = await getModel();
    const today = new Date().toISOString().split('T')[0];
    const systemInstruction = `You are a study planning assistant. Today's date is ${today}. Given a user's goal and a list of course sections, create a study schedule. The dates must be in YYYY-MM-DD format. Respond ONLY with a valid JSON object of the format: {"schedule": [{"sectionTitle": string, "date": string}]}.`;
    const fullPrompt = `User goal: "${prompt}"\n\nCourse sections to schedule:\n- ${sectionTitles.join('\n- ')}`;
    const config = { systemInstruction, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { schedule: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sectionTitle: { type: Type.STRING }, date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" } }, required: ['sectionTitle', 'date'] } } }, required: ['schedule'] } };

    const primaryCall = () => localAi.models.generateContent({ model, contents: fullPrompt, config });
    const fallbackCall = () => callOpenRouter({ model, contents: fullPrompt, config }) as Promise<GenerateContentResponse>;
    
    const response = await callApiWithFallback(primaryCall, fallbackCall);
    return parseJsonResponse<{ schedule: { sectionTitle: string; date: string }[] }>(response.text);
};

export const rephraseTextStream = async (textToRephrase: string): Promise<AsyncIterable<GenerateContentResponse>> => {
    const localAi = getAiInstance();
    const model = await getModel();
    const prompt = `Rephrase the following text to make it simpler, clearer, and easier to understand for a beginner. Maintain the core meaning and accuracy, but use everyday language and analogies where helpful.\n\nOriginal Text:\n---\n${textToRephrase.substring(0, 30000)}\n---\n\nSimplified Version (in Markdown format):`;
    
    const primaryCall = () => localAi.models.generateContentStream({ model, contents: prompt });
    const fallbackCall = () => Promise.resolve(callOpenRouterStream({ model, contents: prompt })) as unknown as Promise<AsyncIterable<GenerateContentResponse>>;

    return callApiWithFallback(primaryCall, fallbackCall);
};

export const getChat = async (systemInstruction: string): Promise<Chat> => {
    const localAi = getAiInstance();
    const model = await getModel();
    return localAi.chats.create({
        model,
        config: { systemInstruction },
    });
};
