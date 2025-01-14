import { useState, useEffect, useRef } from 'react';
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
  const [selectedModel, setSelectedModel] = useState<string>('HuggingFaceTB/SmolLM2-135M-Instruct');
  const [selectedQuantization, setSelectedQuantization] = useState<string>('q4');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [ready, setReady] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

  const workerRef = useRef<Worker>();


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

  useEffect(() => {
    const onMessageReceived = (e: any) => {
      switch (e.data.status) {
        case 'initiate':
          console.log("initiate: ", e.data);
          // Model file start load: add a new progress item to the list.
          setReady(false);
          setProgressItems(prev => [...prev, e.data]);
          break;

        case 'progress':
          console.log("progress: ", e.data);
          // Model file progress: update one of the progress items.
          setProgressItems(
            prev => prev.map(item => {
              if (item.file === e.data.file) {
                return { ...item, ...e.data }
              }
              return item;
            })
          );
          break;

        case 'done':
          // Model file loaded: remove the progress item from the list.
          console.log("done: ", e.data);
          setProgressItems(
            prev => prev.filter(item => item.file !== e.data.file)
          );
          break;

        case 'ready':
          // Pipeline ready: the worker is ready to accept messages.
          console.log("ready: ", e.data);
          setReady(true);
          break;

        case 'update':
          console.log("update: ", e.data);
          // Generation update: update the output text.
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: e.data.output,
            timestamp: new Date().toLocaleTimeString(),
          }]);
          break;

        case 'complete':
          // Generation complete: re-enable the "Translate" button
          console.log("complete: ", e.data);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: e.data.output,
            timestamp: new Date().toLocaleTimeString(),
          }]);
          setDisabled(false);
          break;

        case 'error':
          console.error("error: ", e.data);
          setDisabled(false);
          break;
      }
    };

    const worker = new Worker(new URL('./lib/worker.js', import.meta.url), {
      type: 'module',
      name: 'chat-pipeline',
    });

    workerRef.current = worker;
    worker.addEventListener('message', onMessageReceived);

    initializeModel();

    return () => {
      worker.removeEventListener('message', onMessageReceived);
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    initializeModel();
  }, [selectedModel, selectedQuantization]);

  const handleNewUserMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim() || !ready || disabled) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setDisabled(true);

    if (workerRef.current) {
      // Format the conversation history for the model
      const conversationHistory = messages.concat(userMessage)
        .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const prompt = `${conversationHistory}\nAssistant:`;

      workerRef.current.postMessage({
        text: prompt,
        model: selectedModel
      });
    }

    setNewMessage(''); // Clear input after sending
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
          <h1 className="text-3xl font-bold text-center">SmolTalk 😃</h1>
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