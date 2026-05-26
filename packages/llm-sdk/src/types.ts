export interface GenerateAIInput {
    messages: {
        role: string;
        content: string;
    }[];
}

export interface GenerateAIResponse {
    text: string;
    latencyMs: number;
    requestId: string;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
}