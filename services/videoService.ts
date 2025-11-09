import { GoogleGenAI } from "@google/genai";
import { loadApiKey } from "./storageService";


export const startVideoGeneration = async (script: string) => {
    const apiKey = await loadApiKey();
    if (!apiKey) {
        throw new Error("API Key not found. Please set it in Settings.");
    }
    // Re-instantiate the client for every call to ensure the latest key is used,
    // especially after a user might have selected one in the Veo flow.
    const localAi = new GoogleGenAI({ apiKey });
    try {
        const operation = await localAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: script,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
        return operation;
    } catch (error) {
        console.error("Error starting video generation:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
            throw new Error("API_KEY_INVALID");
        }
        throw error;
    }
};

export const checkVideoOperationStatus = async (operation: any) => {
    const apiKey = await loadApiKey();
    if (!apiKey) {
        throw new Error("API Key not found. Please set it in Settings.");
    }
    const localAi = new GoogleGenAI({ apiKey });
    return await localAi.operations.getVideosOperation({ operation });
};

export const fetchAndCreateVideoUrl = async (uri: string): Promise<string | null> => {
    try {
        const apiKey = await loadApiKey();
        if (!apiKey) {
            throw new Error("API Key not found. Please set it in Settings.");
        }
        const response = await fetch(`${uri}&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch video file: ${response.statusText}`);
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Error fetching video from URI:", error);
        return null;
    }
};
