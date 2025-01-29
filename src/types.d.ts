export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface ProgressItem {
    progress?: number;
    file: string;
    loaded?: number;
    total?: number;
    status: string;
    name?: string;
}

export interface ModelSettings {
    max_tokens: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    do_sample: boolean;
    repetition_penalty: number;
}

interface ProgressData {
    file: string;
    loaded?: number;
    total?: number;
    progress?: number;
    status: string;
    name?: string;
} 