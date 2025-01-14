import { useState, useEffect, useRef } from 'react';
import SendIcon from './components/icons/SendIcon';
import ModelDownloadProgress from './components/ModelDownloadProgress';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ProgressItem {
  progress: number;
  file: string;
}

const initialMessages: ChatMessage[] = [
  {
    role: 'system',
    content: 'You are a helpful AI assistant.',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    role: 'user',
    content: 'Hello! How can you help me today?',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    role: 'assistant',
    content: `Hi! I'm Claude. I'm here to assist you with any questions you might have!`,
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    role: 'user',
    content: 'Can you explain quantum computing?',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    role: 'assistant',
    content: 'Quantum computing is a type of computing that uses quantum phenomena such as superposition and entanglement. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or qubits that can exist in multiple states simultaneously.',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    role: 'user',
    content: 'That sounds complex! Can you give me a simpler example?',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    role: 'assistant',
    content: 'Think of it like this: while a classical bit is like a coin showing either heads or tails, a qubit is like a spinning coin that\'s simultaneously in both states until you stop it and look at it.This property allows quantum computers to perform certain calculations much faster than classical computers.',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    role: 'user',
    content: 'What are some practical applications?',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    role: 'assistant',
    content: 'Quantum computers could revolutionize fields like cryptography, drug discovery, climate modeling, and optimization problems. For example, they could help design better batteries, create more effective medications, or solve complex logistics challenges much faster than current computers.',
    timestamp: new Date().toLocaleTimeString(),
  },
];

const AVAILABLE_MODELS = ['HuggingFaceTB/SmolLM2-135M-Instruct', 'GPT-4', 'Llama'];

export default function App() {
  const [selectedModel, setSelectedModel] = useState<string>('HuggingFaceTB/SmolLM2-135M-Instruct');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [ready, setReady] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

  // Create worker reference
  const workerRef = useRef<Worker>();

  useEffect(() => {
    // if (messages.length === 0) {
    //   setMessages(initialMessages);
    // }
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
                return { ...item, progress: e.data.progress }
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

    // Add this line to trigger model loading immediately
    worker.postMessage({ type: 'init', model: selectedModel });

    return () => {
      worker.removeEventListener('message', onMessageReceived);
      worker.terminate();
    };
  }, []); // Only runs once on mount

  const handleNewMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim() || !ready || disabled) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Disable input while processing
    setDisabled(true);
    // Send message to worker
    if (workerRef.current) {
      workerRef.current.postMessage({
        text: newMessage.trim(),
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
      {/* Model Selector - Now fixed to top */}
      <div className="fixed top-0 left-0 right-0 p-4 bg-amber-50 z-10">
        <div className="flex items-center w-full max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mr-auto">SmolTalk 😃</h1>
          <div className="flex items-center justify-end gap-2 w-[500px]">
            <label htmlFor="model-select" className="text-sm font-medium">Select Model:</label>
            <select
              id="model-select"
              className="select select-bordered w-full max-w-xs border-amber-300 bg-transparent"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat Container - Added padding-top to account for fixed header */}
      <div className="w-full max-w-4xl mx-auto space-y-4 pt-20">
        {/* Chat Messages */}
        <div className="space-y-4 pb-24">
          {messages.map(renderMessage)}
        </div>

        {/* Input Area - Now fixed to bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-amber-50">
          <div className="w-full max-w-4xl mx-auto">
            <form onSubmit={handleNewMessage} autoComplete="off">
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

      {/* Model Download Progress */}
      <ModelDownloadProgress
        progressItems={progressItems}
      />
    </div>
  );
}