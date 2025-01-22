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