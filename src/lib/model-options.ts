import { ModelSettings } from "../types";

export const AVAILABLE_MODELS = [
    'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX',
    'HuggingFaceTB/SmolLM2-1.7B-Instruct'];

export const QUANTIZATION_OPTIONS = [
    { value: 'fp32', label: 'Full Precision (FP32)' },
    { value: 'fp16', label: 'Half Precision (FP16)' },
    { value: 'q8', label: '8-bit Quantization (Q8)' },
    { value: 'int8', label: '8-bit Integer (INT8)' },
    { value: 'uint8', label: '8-bit Unsigned Integer (UINT8)' },
    { value: 'q4', label: '4-bit Quantization (Q4)' },
    { value: 'bnb4', label: '4-bit BitsAndBytes (BNB4)' },
    { value: 'q4f16', label: '4-bit Float16 (Q4F16)' },
];

export const DEFAULT_SETTINGS: ModelSettings = {
    max_tokens: 1024,
    temperature: 0.7,
    top_p: 0.95,
    top_k: 40,
    do_sample: true,
    repetition_penalty: 1.1,
    selected_methods: []
};

export interface ModelProfile {
    id: string;
    name: string;
    description: string;
    suggested_quantization: string;
    default_settings: ModelSettings;
    system_prompt: string;
    suggested_prompts: string[];
}

export const MODEL_PROFILES: ModelProfile[] = [
    {
        id: 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX',
        name: 'DeepSeek R1 Distill Qwen 1.5B',
        description: 'A distilled version of Qwen optimized for ONNX runtime',
        suggested_quantization: 'q8',
        default_settings: {
            max_tokens: 2048,
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            do_sample: true,
            repetition_penalty: 1.1,
            selected_methods: []
        },
        system_prompt: "You are a helpful AI assistant that provides accurate and concise responses.",
        suggested_prompts: [
            "How far away is the sun?",
            "What is the capital of France?",
            "Tell me about John Von Neumann.",
            "Write a short story.",
            "What is the meaning of life?"
        ]
    },
    {
        id: 'HuggingFaceTB/SmolLM2-1.7B-Instruct',
        name: 'SmolLM2 1.7B Instruct',
        description: 'A lightweight instruction-tuned language model',
        suggested_quantization: 'q4',
        default_settings: {
            max_tokens: 1024,
            temperature: 0.8,
            top_p: 0.9,
            top_k: 50,
            do_sample: true,
            repetition_penalty: 1.2,
            selected_methods: []
        },
        system_prompt: "You are a helpful assistant focused on providing concise and accurate information.",
        suggested_prompts: [
            "How far away is the sun?",
            "What is the capital of France?",
            "Tell me about John Von Neumann.",
            "Write a short story.",
            "What is the meaning of life?"
        ]
    }
];