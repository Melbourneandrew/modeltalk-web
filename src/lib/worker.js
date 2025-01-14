import { pipeline, AutoTokenizer, AutoModelForCausalLM } from '@huggingface/transformers';

export class ChatPipeline {
    static model = 'HuggingFaceTB/SmolLM2-135M-Instruct';
    static dtype = 'q4';
    static instance = null;
    static tokenizer = null;

    static async getInstance(model = this.model, dtype = this.dtype, progress_callback = undefined) {
        if (this.instance === null || this.model !== model || this.dtype !== dtype) {
            console.log("Creating new model instance for: ", model);
            this.tokenizer = await AutoTokenizer.from_pretrained(model, {
                progress_callback
            });
            this.instance = await AutoModelForCausalLM.from_pretrained(model, {
                progress_callback,
                dtype: dtype,
                device: 'webgpu'
            });
        }
        return { model: this.instance, tokenizer: this.tokenizer };
    }

    static reset() {
        this.instance = null;
        this.tokenizer = null;
    }

    static async generate(messages, params = {}) {
        console.log("Generating response for messages: ", messages);
        const { model, tokenizer } = await this.getInstance();
        if (!model || !tokenizer) {
            throw new Error('Failed to get model or tokenizer instance');
        }

        const input_tokens = tokenizer.apply_chat_template(messages, { tokenize: true });
        console.log("Input tokens: ", input_tokens);

        const outputs = await model.generate(input_tokens, {
            max_new_tokens: 256,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.95,
            ...params
        });

        const generatedText = await tokenizer.decode(outputs[0]);
        console.log("Generated text: ", generatedText);

        return {
            fullResponse: generatedText,
            assistantResponse: generatedText.slice(input_text.length).trim()
        };
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

        if (event.data.type === 'init') {
            console.log('Initializing pipeline...');
            await ChatPipeline.getInstance(
                event.data.model,
                event.data.dtype,
                handleProgress
            );
            self.postMessage({ status: 'ready' });
            return;
        }

        const messages = event.data.messages;
        const { assistantResponse } = await ChatPipeline.generate(messages);

        self.postMessage({
            status: 'complete',
            output: assistantResponse
        });

    } catch (error) {
        console.error('Worker error:', error);
        self.postMessage({
            status: 'error',
            error: error.message,
            stack: error.stack
        });
    }
});
