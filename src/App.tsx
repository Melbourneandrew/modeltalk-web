import { useState, useEffect, useRef, useCallback } from 'react';
import SendIcon from './components/icons/SendIcon';
import ModelDownloadProgress from './components/ModelDownloadProgress';
import { AVAILABLE_MODELS, QUANTIZATION_OPTIONS } from './lib/model-options';
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

export default function App() {
  const [selectedModel, setSelectedModel] = useState<string>('HuggingFaceTB/SmolLM2-1.7B-Instruct');
  const [selectedQuantization, setSelectedQuantization] = useState<string>('q4f16');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [ready, setReady] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

  const workerRef = useRef<Worker>();
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');

  const initializeModel = () => {
    if (!workerRef.current) return;

    setReady(false);
    setProgressItems([]);

    workerRef.current.postMessage({
      type: 'init',
      model: selectedModel,
      dtype: selectedQuantization
    });
  };

  const onMessageReceived = (e: any) => {
    switch (e.data.status) {
      case 'initiate': // Start loading model file
        console.log("initiate: ", e.data);
        setReady(false);
        setProgressItems(prev => [...prev, e.data]);
        break;

      case 'progress': // Model Download Progress
        setProgressItems(
          prev => prev.map(item => {
            if (item.file === e.data.file) {
              return { ...item, ...e.data }
            }
            return item;
          })
        );
        break;

      case 'done': // Model file loaded: remove the progress item from the list.
        console.log("done: ", e.data);
        setProgressItems(
          prev => prev.filter(item => item.file !== e.data.file)
        );
        break;

      case 'ready': // Pipeline ready: the worker is ready to accept messages.
        console.log("ready: ", e.data);
        setReady(true);
        break;

      case 'start': // Start streaming response
        setCurrentStreamingMessage('');
        break;

      case 'update': // Update streaming response
        console.log("update: ", e.data);
        setMessages(prev => {
          const cloned = [...prev];
          const last = cloned.at(-1);
          if (last && last.role === 'assistant') {
            cloned[cloned.length - 1] = {
              ...last,
              content: last.content + e.data.output
            };
            return cloned;
          }
          return [...prev, {
            role: 'assistant',
            content: e.data.output,
            timestamp: new Date().toLocaleTimeString(),
          }];
        });
        setCurrentStreamingMessage('');
        break;

      case 'complete': // Streaming response complete: add the response to the messages list.
        console.log("complete: ", e.data);
        setDisabled(false);
        break;

      case 'error': // Error: stop streaming and disable the input field.
        console.error("error: ", e.data);
        setDisabled(false);
        break;
    }
  };

  useEffect(() => {
    console.log('Worker setup effect running');
    const worker = new Worker(new URL('./lib/worker.js', import.meta.url), {
      type: 'module',
      name: 'chat-pipeline',
    });

    workerRef.current = worker;
    worker.addEventListener('message', onMessageReceived);

    // Initial model load
    // initializeModel();

    return () => {
      worker.removeEventListener('message', onMessageReceived);
      worker.terminate();
    };
  }, []);

  // Model/quantization changes
  useEffect(() => {
    console.log('Model/quantization change detected');
    console.log("Initializing model with: ", selectedModel, selectedQuantization);
    initializeModel();
    setMessages([]);
  }, [selectedModel, selectedQuantization]);

  const handleNewUserMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim() || !ready || disabled) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setDisabled(true);

    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'generate',
        data: updatedMessages.map(message => ({
          role: message.role,
          content: message.content
        })),
      });
    }

    setNewMessage('');
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    if (message.role === 'system') return null;

    const isUser = message.role === 'user';
    return (
      <div key={index} className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>
        <div className="chat-header text-gray-700">
          {isUser ? 'You' : selectedModel}
          <time className="text-xs opacity-50 ml-2">{message.timestamp}</time>
        </div>
        <div className={`chat-bubble ${isUser ? 'bg-amber-200' : 'bg-white'} !opacity-100 text-black`}>
          {message.content}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      {/* Header bar with model selection controls */}
      <div className="fixed top-0 left-0 right-0 p-4 bg-amber-50 z-10">
        <div className="flex flex-col sm:flex-row items-center w-full max-w-4xl mx-auto gap-4">
          <h1 className="text-3xl font-bold text-center">Small Talk 😃</h1>
          <div className="flex flex-col sm:flex-row items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <label htmlFor="model-select" className="text-sm font-medium whitespace-nowrap">Model:</label>
              <select
                id="model-select"
                className="select select-bordered w-[300px] border-amber-300 bg-transparent text-sm"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {AVAILABLE_MODELS.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="quantization-select" className="text-sm font-medium whitespace-nowrap">Quantization:</label>
              <select
                id="quantization-select"
                className="select select-bordered w-[100px] border-amber-300 bg-transparent text-sm"
                value={selectedQuantization}
                onChange={(e) => setSelectedQuantization(e.target.value)}
              >
                {QUANTIZATION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicators for model file downloads */}
      <ModelDownloadProgress
        progressItems={progressItems}
      />

      {/* Main chat container with top padding to account for fixed header */}
      <div className="w-full max-w-4xl mx-auto space-y-4 pt-20">
        {/* Message history */}
        <div className="space-y-4 pb-24">
          {messages.map(renderMessage)}
          {currentStreamingMessage && (
            <div className="chat chat-start">
              <div className="chat-header text-gray-700">
                {selectedModel}
                <time className="text-xs opacity-50 ml-2">
                  {new Date().toLocaleTimeString()}
                </time>
              </div>
              <div className="chat-bubble bg-white !opacity-100 text-black">
                {currentStreamingMessage}
              </div>
            </div>
          )}
        </div>

        {/* Message input form fixed to bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-amber-50">
          <div className="w-full max-w-4xl mx-auto">
            <form onSubmit={handleNewUserMessage} autoComplete="off">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  className="input input-bordered flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!ready || disabled}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="btn bg-amber-200"
                  disabled={!ready || disabled}
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}