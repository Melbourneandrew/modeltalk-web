import { ModelSettings } from "../types";


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
};

export interface ModelProfile {
    id: string;
    name: string;
    description: string;
    suggested_quantization: string;
    default_settings: ModelSettings;
    system_prompt: string;
    suggested_prompts: { title: string; prompt: string; }[];
}

export const MODEL_PROFILES: ModelProfile[] = [
    {
        id: 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX',
        name: 'DeepSeek R1 Distill Qwen 1.5B',
        description: 'A distilled version of Qwen optimized for ONNX runtime',
        suggested_quantization: 'q4f16',
        default_settings: {
            max_tokens: 4096,
            temperature: 0.3,
            top_p: 0.5,
            top_k: 20,
            do_sample: true,
            repetition_penalty: 1.2,
        },
        system_prompt: "You are a helpful AI assistant that provides accurate and concise responses.",
        suggested_prompts: [
            { title: "Reasoning Test (Basic)", prompt: "A sailor needs to transport a wolf, a sheep, and a cabbage across a river in a small boat. The boat can only carry the sailor and one item at a time. If left unattended, the wolf will eat the sheep, and the sheep will eat the cabbage. How can the sailor transport everything safely to the other side?" },
            { title: "Reasoning Test (Advanced)", prompt: "A group of 100 people are standing in a circle. Every 10th person is killed, starting with the 10th person. How many people are left alive after 100 rounds?" },
            { title: "Tell me about John Von Neumann.", prompt: "Tell me about John Von Neumann." },
            { title: "Write a short story.", prompt: "Write a short story." },
            { title: "What is the meaning of life?", prompt: "What is the meaning of life?" }
        ]
    },
    {
        id: 'HuggingFaceTB/SmolLM2-1.7B-Instruct',
        name: 'SmolLM2 1.7B Instruct',
        description: 'A lightweight instruction-tuned language model',
        suggested_quantization: 'q4f16',
        default_settings: {
            max_tokens: 2048,
            temperature: 0.3,
            top_p: 0.5,
            top_k: 20,
            do_sample: true,
            repetition_penalty: 1.4,
        },
        system_prompt: "You are a helpful assistant focused on providing concise and accurate information.",
        suggested_prompts: [
            { title: "How far away is the sun?", prompt: "How far away is the sun?" },
            { title: "What is the capital of France?", prompt: "What is the capital of France?" },
            { title: "Tell me about John Von Neumann.", prompt: "Tell me about John Von Neumann." },
            { title: "Write a short story.", prompt: "Write a short story." },
            { title: "What is the meaning of life?", prompt: "What is the meaning of life?" }
        ]
    },
    // {
    //     id: 'onnx-community/DeepSeek-Coder-Qwen-2.5B-ONNX',
    //     name: 'DeepSeek Coder Qwen 2.5B',
    //     description: 'A large-scale language model with 2.5B parameters',
    //     suggested_quantization: 'q4f16',
    //     default_settings: {
    //         max_tokens: 4096,
    //         temperature: 0.7,
    //         top_p: 0.95,
    //         top_k: 40,
    //         do_sample: true,
    //         repetition_penalty: 1.2,
    //     },
    //     system_prompt: "You are a helpful assistant focused on providing concise and accurate information.",
    //     suggested_prompts: [
    //         "How far away is the sun?",
    //         "What is the capital of France?",
    //         "Tell me about John Von Neumann.",
    //         "Write a short story.",
    //         "What is the meaning of life?"
    //     ]
    // },
    // {
    //     id: 'onnx-community/Qwen2.5-1.5B-Instruct',
    //     name: 'Qwen 2.5B Instruct',
    //     description: 'A large-scale language model with 1.5B parameters',
    //     suggested_quantization: 'q4f16',
    //     default_settings: {
    //         max_tokens: 4096,
    //         temperature: 0.7,
    //         top_p: 0.95,
    //         top_k: 40,
    //         do_sample: true,
    //         repetition_penalty: 1.2,
    //     },
    //     system_prompt: "You are a helpful assistant focused on providing concise and accurate information.",
    //     suggested_prompts: [
    //         "How far away is the sun?",
    //         "What is the capital of France?",
    //         "Tell me about John Von Neumann.",
    //         "Write a short story.",
    //         "What is the meaning of life?"
    //     ]
    // }
];

export const AVAILABLE_MODELS = MODEL_PROFILES.map(profile => profile.id);