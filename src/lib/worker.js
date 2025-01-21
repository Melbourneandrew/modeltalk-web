import {
    AutoTokenizer,
    AutoModelForCausalLM,
    TextStreamer,
    InterruptableStoppingCriteria
} from '@huggingface/transformers';

export const DEFAULT_MODEL = 'HuggingFaceTB/SmolLM2-1.7B-Instruct';
export const DEFAULT_DTYPE = 'q4f16';

let modelInstance = null;
let tokenizerInstance = null;
let pastKeyValuesCache = null;
const stoppingCriteria = new InterruptableStoppingCriteria();

export async function getInstance(model = DEFAULT_MODEL, dtype = DEFAULT_DTYPE, progress_callback = undefined) {
    if (modelInstance === null || model !== model || dtype !== dtype) {
        console.log("Creating new model instance for: ", model);
        tokenizerInstance = await AutoTokenizer.from_pretrained(model, {
            progress_callback
        });
        modelInstance = await AutoModelForCausalLM.from_pretrained(model, {
            dtype: dtype,
            device: 'webgpu',
            progress_callback,
        });
    }
    return { model: modelInstance, tokenizer: tokenizerInstance };
}

function sendError(error, context = '') {
    const errorMessage = context ? `${context}: ${error.message}` : error.message;
    console.error(errorMessage, error);
    self.postMessage({
        status: 'error',
        error: errorMessage,
        stack: error.stack
    });
}

export async function load(progress_callback = undefined) {
    try {
        self.postMessage({
            status: "loading",
            data: "Loading model..."
        });

        const { model, tokenizer } = await getInstance(DEFAULT_MODEL, DEFAULT_DTYPE, progress_callback);

        self.postMessage({
            status: "loading",
            data: "Compiling shaders and warming up model..."
        });

        // Run model with dummy input to compile shaders
        const inputs = tokenizer.apply_chat_template([{ role: "user", content: "Hello" }], {
            add_generation_prompt: true,
            return_dict: true,
        });
        await model.generate({
            ...inputs,
            max_new_tokens: 1
        });

        self.postMessage({ status: "ready" });
        return { model, tokenizer };
    } catch (error) {
        sendError(error, 'Model not supported in browser');
        throw error;
    }
}

export function reset() {
    modelInstance = null;
    tokenizerInstance = null;
    pastKeyValuesCache = null;
    stoppingCriteria.reset();
}

export async function generate(messages, params = {}) {
    try {
        console.log("Generating response for messages: ", messages);
        const { model, tokenizer } = await getInstance();
        if (!model || !tokenizer) {
            throw new Error('Failed to get model or tokenizer instance');
        }

        const inputs = tokenizer.apply_chat_template(messages, {
            add_generation_prompt: true,
            return_dict: true,
        });

        let startTime;
        let numTokens = 0;
        let tps;

        const token_callback_function = () => {
            startTime ??= performance.now();
            if (numTokens++ > 0) {
                tps = (numTokens / (performance.now() - startTime)) * 1000;
            }
        };

        const callback_function = (output) => {
            self.postMessage({
                status: 'update',
                output: output,
                tps,
                numTokens
            });
        };

        const streamer = new TextStreamer(tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
            callback_function,
            token_callback_function,
        });

        self.postMessage({ status: 'start' });

        const { past_key_values, sequences } = await model.generate({
            ...inputs,
            max_new_tokens: 50,
            streamer,
            stopping_criteria: stoppingCriteria,
            return_dict_in_generate: true,
            temperature: 0.2,
            top_p: 0.9,
            do_sample: true,
            ...params
        });

        pastKeyValuesCache = past_key_values;

        const decoded = tokenizer.batch_decode(sequences, {
            skip_special_tokens: true,
        });

        return decoded;
    } catch (error) {
        sendError(error, 'Error during generation');
        throw error;
    }
}

export function handleProgress(progress) {
    self.postMessage(progress);
}

// Main worker message handler
self.addEventListener('message', async (event) => {
    console.log('Worker received message: ', event.data);
    try {
        if (!event.data) {
            throw new Error('No event data received');
        }

        const { type, data } = event.data;

        switch (type) {
            case 'init':
                console.log('Initializing pipeline...');
                await load(handleProgress);
                break;

            case 'generate':
                stoppingCriteria.reset();
                console.log('Starting generation with data:', data);
                try {
                    const response = await generate(data);
                    console.log('Generation completed with response:', response);
                    self.postMessage({
                        status: 'complete',
                        output: response
                    });
                } catch (error) {
                    console.error('Generation error:', error);
                    throw error;
                }
                break;

            case 'interrupt':
                stoppingCriteria.interrupt();
                break;

            case 'reset':
                reset();
                break;
        }

    } catch (error) {
        sendError(error, 'Worker error');
    }
});
