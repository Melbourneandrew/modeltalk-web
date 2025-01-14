import { pipeline } from '@huggingface/transformers';

export class ChatPipeline {
    static model = 'HuggingFaceTB/SmolLM2-135M-Instruct';
    static instance = null;

    static async getInstance(progress_callback = undefined) {
        if (this.instance === null) {
            this.instance = await pipeline('text-generation', this.model, {
                progress_callback,
                dtype: 'fp32',
                device: 'webgpu'
            });
        }

        return this.instance;
    }

    static reset() {
        this.instance = null;
    }
}


export async function respondToMessage(messages) {
    let textGenerationPipeline = await ChatPipeline.getInstance();
    let response = await textGenerationPipeline(messages);
    console.log("Response from pipeline: ", response);

    return {
        status: 'complete',
        output: response[0]
    };
}

export function handleProgress(progress) {
    self.postMessage(progress);
}

// Main worker message handler
self.addEventListener('message', async (event) => {
    console.log('Worker received message:', event.data);

    if (event.data.type === 'init') {
        console.log('Starting pipeline initialization...');
        try {
            await ChatPipeline.getInstance(handleProgress);
            console.log('Pipeline initialized successfully');
            self.postMessage({ status: 'ready' });
        } catch (error) {
            console.error('Pipeline initialization failed:', error);
            self.postMessage({ status: 'error', error: error.message });
        }
        return;
    }

    // Process chat messages
    try {
        const response = await respondToMessage(event.data.text);
        console.log('Message processed successfully:', response);
        self.postMessage(response);
    } catch (error) {
        console.error('Error processing message:', error);
        self.postMessage({ status: 'error', error: error.message });
    }
});
