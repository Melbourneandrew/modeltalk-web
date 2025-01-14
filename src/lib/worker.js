import { pipeline } from '@huggingface/transformers';

export class ChatPipeline {
    static model = 'HuggingFaceTB/SmolLM2-135M-Instruct';
    static dtype = 'fp32';
    static instance = null;

    static async getInstance(model = this.model, dtype = this.dtype, progress_callback = undefined) {
        if (this.instance === null || this.model !== model || this.dtype !== dtype) {
            console.log("Creating new pipeline instance for model: ", model, " with dtype: ", dtype);
            this.instance = await pipeline('text-generation', model, {
                progress_callback,
                dtype: dtype
            });
        }

        return this.instance;
    }

    static reset() {
        this.instance = null;
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

        if (!event.data.text) {
            throw new Error('No text property in message data');
        }

        const textGenerationPipeline = await ChatPipeline.getInstance();
        console.log("Pipeline instance: ", textGenerationPipeline);
        if (!textGenerationPipeline) {
            throw new Error('Failed to get pipeline instance');
        }

        const response = await textGenerationPipeline(event.data.text, {
            max_new_tokens: 256,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.95,
        });

        // Extract just the new assistant response by removing the input prompt
        const generatedText = response[0].generated_text;
        const assistantResponse = generatedText.slice(event.data.text.length).trim();

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
