import { useState, useEffect, useRef } from 'react';
import SendIcon from './components/icons/SendIcon';
import ModelDownloadProgress from './components/ModelDownloadProgress';
import { AVAILABLE_MODELS, MODEL_PROFILES } from './lib/model-options';
import SettingsIcon from './components/icons/SettingsIcon';
import SettingsModal from './components/modals/SettingsModal';
import { ModelSettings } from './types';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, ProgressItem } from './types';
import SuggestedPrompts from './components/SuggestedPrompts';
import WebgpuProgress from './components/WebgpuProgress';
import ErrorModal from './components/modals/ErrorModal';
import DeviceNotSupportedView from './components/DeviceNotSupportedView';

export default function App() {
  const [selectedModel, setSelectedModel] = useState<string>('onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX');
  const [selectedQuantization, setSelectedQuantization] = useState<string>('q4f16');
  const [suggestedPrompts, setSuggestedPrompts] = useState<{ title: string; prompt: string; }[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [ready, setReady] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

  const workerRef = useRef<Worker>();
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    max_tokens: 1024,
    do_sample: true,
    repetition_penalty: 1.1,
  });

  const [systemPrompt, setSystemPrompt] = useState<string>("");

  const [isInitializingWebgpu, setIsInitializingWebgpu] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const [_, setActiveDownloads] = useState<Set<string>>(new Set());

  const [isMobile, setIsMobile] = useState(false);

  const initializeModel = () => {
    if (!workerRef.current) return;

    setReady(false);
    setProgressItems([]);

    workerRef.current.postMessage({
      type: 'init',
      data: {
        model: selectedModel,
        dtype: selectedQuantization
      }
    });
  };

  const loadModelProfile = (modelId: string) => {
    const profile = MODEL_PROFILES.find(profile => profile.id === modelId);

    if (profile) {
      setModelSettings(profile.default_settings);
      setSystemPrompt(profile.system_prompt);

      if (selectedQuantization !== profile.suggested_quantization) {
        setSelectedQuantization(profile.suggested_quantization);
      }

      setSuggestedPrompts(profile.suggested_prompts);

    }
  };

  const onMessageReceived = (e: any) => {
    switch (e.data.status) {
      case 'initiate':
        setReady(false);
        setIsInitializingWebgpu(false);
        setProgressItems(prev => [...prev, e.data]);
        setActiveDownloads(prev => new Set(prev).add(e.data.file));
        break;

      case 'progress': // Model file download progress
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
        setProgressItems([]);
        setActiveDownloads(prev => {
          const updated = new Set(prev);
          updated.delete(e.data.file);
          if (updated.size === 0) {
            setIsInitializingWebgpu(true);
          }
          return updated;
        });
        break;

      case 'ready':
        setReady(true);
        setIsInitializingWebgpu(false);
        break;

      case 'start':
        setCurrentStreamingMessage('');
        break;

      case 'update':
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

      case 'complete':
        setDisabled(false);
        break;

      case 'error':
        setDisabled(false);
        setErrorMessage(e.data.error || 'An unknown error occurred');
        setIsErrorModalOpen(true);
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

    initializeModel();

    return () => {
      worker.removeEventListener('message', onMessageReceived);
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      loadModelProfile(selectedModel);
      initializeModel();
    }
    setMessages([]);
  }, [selectedModel, selectedQuantization]);

  useEffect(() => {
    if (!disabled && ready && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, ready]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 450); // 768px is a common breakpoint for mobile
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        data: {
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...updatedMessages.map(message => ({
              role: message.role,
              content: message.content
            }))
          ],
          params: {
            max_new_tokens: modelSettings.max_tokens,
            temperature: modelSettings.temperature,
            top_p: modelSettings.top_p,
            top_k: modelSettings.top_k,
            repetition_penalty: modelSettings.repetition_penalty,
            do_sample: modelSettings.do_sample,
          }
        }
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
        <div className={`chat-bubble ${isUser ? 'bg-amber-200' : 'bg-white'} !opacity-100 text-black prose max-w-none`}>
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>
      </div>
    );
  };

  const handlePromptSelect = (prompt: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setDisabled(true);

    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'generate',
        data: {
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...updatedMessages.map(message => ({
              role: message.role,
              content: message.content
            }))
          ],
          params: {
            max_new_tokens: modelSettings.max_tokens,
            temperature: modelSettings.temperature,
            top_p: modelSettings.top_p,
            top_k: modelSettings.top_k,
            repetition_penalty: modelSettings.repetition_penalty,
            do_sample: modelSettings.do_sample,
          }
        }
      });
    }
  };

  if (isMobile) {
    return <DeviceNotSupportedView />;
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4">
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
              <button
                className="btn btn-square btn-outline border-amber-300 bg-transparent hover:bg-amber-100 hover:text-amber-500"
                onClick={() => (document.getElementById('settings_modal') as HTMLDialogElement)?.showModal()}
              >
                <SettingsIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {progressItems.length > 0 && (
        <ModelDownloadProgress
          progressItems={progressItems}
        />
      )}

      {isInitializingWebgpu && <WebgpuProgress />}

      <div className="w-full max-w-4xl mx-auto space-y-4 pt-20">
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

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-amber-50">
          {messages.length === 0 && ready && (() => {
            const profile = MODEL_PROFILES.find(p => p.id === selectedModel);
            return profile?.suggested_prompts && profile.suggested_prompts.length > 0 && (
              <div className="mb-[30px]">
                <SuggestedPrompts
                  onPromptClick={handlePromptSelect}
                  suggestedPrompts={suggestedPrompts || []}
                />
              </div>
            );
          })()}
          <div className="w-full max-w-4xl mx-auto">
            <form onSubmit={handleNewUserMessage} autoComplete="off">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
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

      <SettingsModal
        settings={modelSettings}
        systemPrompt={systemPrompt}
        onSettingsChange={setModelSettings}
        onSystemPromptChange={setSystemPrompt}
      />

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorMessage}
      />
    </div>
  );
}