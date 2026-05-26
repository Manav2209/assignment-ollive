import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

import type {
    GenerateAIInput,
    GenerateAIResponse,
} from "./types";

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY!
);

export async function generateFromGemini(
    input: GenerateAIInput
): Promise<GenerateAIResponse> {

const requestId = crypto.randomUUID();
const start = Date.now();
try {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });
    const prompt = input.messages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const latencyMs = Date.now() - start;

    return {
        text,
        latencyMs,
        requestId,
        usage: {
            promptTokens:
            response.usageMetadata?.promptTokenCount,
            completionTokens:
            response.usageMetadata?.candidatesTokenCount,
            totalTokens:
            response.usageMetadata?.totalTokenCount,
        },
    };

} catch (e) {
    throw e;
    }
}