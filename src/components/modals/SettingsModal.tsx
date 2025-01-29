import { ModelSettings } from '../../types';
import TooltipButton from '../TooltipButton';
import { useState } from 'react';

const TOOLTIP_INFO = {
    MAX_TOKENS: {
        text: "Maximum number of tokens the model will generate in response. One token is roughly 4 characters.",
        link: "https://www.perplexity.ai/search/explain-the-max-tokens-paramet-_SIKE2.xRSiwE8an_3TBXA"
    },
    TEMPERATURE: {
        text: "Controls randomness in the output. Higher values make the output more diverse but less focused.",
        link: "https://www.perplexity.ai/search/explain-the-temperature-parame-VVGdXYz8RG2DiOnO1.c6Fg"
    },
    TOP_P: {
        text: "Nucleus sampling - considers tokens comprising the top P% of probability mass. Lower values make output more focused.",
        link: "https://www.perplexity.ai/search/explain-the-top-p-parameter-fo-rOYiM.ymQViMq2pUiQ9GDQ"
    },
    TOP_K: {
        text: "Limits the cumulative probability by considering only the top K most likely tokens. Lower values make output more deterministic.",
        link: "https://www.perplexity.ai/search/explain-the-top-k-parameter-fo-fAMNf5PPQfy301IIvSwDQg"
    },
    DO_SAMPLE: {
        text: "When enabled, uses sampling to generate text. When disabled, always picks the most likely next token (greedy decoding).",
        link: "https://www.perplexity.ai/search/what-is-nucleus-sampling-for-l-bfMPPLDmSO6NRWhirvvUQA"
    },
    REPETITION_PENALTY: {
        text: "Reduces the likelihood of the model repeating the same text. Higher values (>1.0) make repetition less likely.",
        link: "https://www.perplexity.ai/search/what-is-repetition-penalty-for-.NJkSrBoRWOSrPYTE6YZrQ"
    }
};

interface SettingsModalProps {
    settings: ModelSettings;
    systemPrompt: string;
    onSettingsChange: (settings: ModelSettings) => void;
    onSystemPromptChange: (prompt: string) => void;
}

export default function SettingsModal({ settings, systemPrompt, onSettingsChange, onSystemPromptChange }: SettingsModalProps) {
    const [selectedMethods, setSelectedMethods] = useState<string[]>(['temperature', 'top_p', 'top_k']);

    const handleMethodToggle = (method: string) => {
        if (selectedMethods.includes(method)) {
            setSelectedMethods(selectedMethods.filter(m => m !== method));
            onSettingsChange({ ...settings, [method]: undefined });
        } else {
            setSelectedMethods([...selectedMethods, method]);
        }
    };

    const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.type === 'range' ?
            (parseInt(e.target.value) / 100).toFixed(2) :
            Math.min(1, Math.max(0, Number(e.target.value))));
        onSettingsChange({
            ...settings,
            temperature: selectedMethods.includes('temperature') ? value : undefined
        });
    };

    const handleTopPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.type === 'range' ?
            (parseInt(e.target.value) / 100).toFixed(2) :
            Math.min(1, Math.max(0, Number(e.target.value))));
        onSettingsChange({
            ...settings,
            top_p: selectedMethods.includes('top_p') ? value : undefined
        });
    };

    const handleTopKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'range' ?
            parseInt(e.target.value) :
            Math.min(100, Math.max(0, Math.floor(Number(e.target.value))));
        onSettingsChange({
            ...settings,
            top_k: selectedMethods.includes('top_k') ? value : undefined
        });
    };

    const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(1, Math.min(32000, parseInt(e.target.value) || 1));
        onSettingsChange({ ...settings, max_tokens: value });
    };

    const handleRepetitionPenaltyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(1, Math.min(2, Number(parseFloat(e.target.value).toFixed(2))));
        onSettingsChange({ ...settings, repetition_penalty: value });
    };

    const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onSystemPromptChange(e.target.value);
    };

    return (
        <dialog id="settings_modal" className="modal">
            <div className="modal-box border-2 border-amber-300 overflow-visible">
                <h3 className="font-bold text-lg">Settings</h3>

                <div className="form-control">
                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="label">
                                    <span className="label-text text-lg flex items-center gap-1">
                                        System Prompt
                                        <TooltipButton
                                            tooltipText="Instructions given to the model that define its behavior and role."
                                            link="https://platform.openai.com/docs/guides/gpt/system-message"
                                        />
                                    </span>
                                </label>
                                <textarea
                                    value={systemPrompt}
                                    onChange={handleSystemPromptChange}
                                    className="textarea textarea-bordered border-amber-300 w-full resize-none h-24"
                                    placeholder="Enter system instructions for the AI..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="label">
                                    <span className="label-text text-lg flex items-center gap-1">
                                        Max New Tokens
                                        <TooltipButton
                                            tooltipText={TOOLTIP_INFO.MAX_TOKENS.text}
                                            link={TOOLTIP_INFO.MAX_TOKENS.link}
                                        />
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="32000"
                                    value={settings.max_tokens}
                                    className="input input-bordered border-amber-300 w-full"
                                    onChange={handleMaxTokensChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                className={`checkbox ${selectedMethods.includes('temperature') ? 'checkbox-primary' : 'checkbox-ghost'}`}
                                checked={selectedMethods.includes('temperature')}
                                onChange={() => handleMethodToggle('temperature')}
                            />
                            <div className="flex-1">
                                <label className={`label ${selectedMethods.includes('temperature') ? '' : 'text-gray-300'}`}>
                                    <span className={`label-text-alt text-lg flex items-center gap-1 ${selectedMethods.includes('temperature') ? '' : 'text-gray-300'}`}>
                                        Temperature
                                        <TooltipButton
                                            tooltipText={TOOLTIP_INFO.TEMPERATURE.text}
                                            link={TOOLTIP_INFO.TEMPERATURE.link}
                                        />
                                    </span>
                                    <span className="label-text-alt flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={settings.temperature}
                                            className="input input-xs input-bordered w-20"
                                            disabled={!selectedMethods.includes('temperature')}
                                            onChange={handleTemperatureChange}
                                        />
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max="100"
                                    value={settings.temperature! * 100}
                                    className={`range ${selectedMethods.includes('temperature')
                                        ? '[--range-shdw:theme(colors.amber.300)]'
                                        : '[--range-shdw:theme(colors.gray.300)]'
                                        }`}
                                    disabled={!selectedMethods.includes('temperature')}
                                    onChange={handleTemperatureChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                className={`checkbox ${selectedMethods.includes('top_p') ? 'checkbox-primary' : 'checkbox-ghost'}`}
                                checked={selectedMethods.includes('top_p')}
                                onChange={() => handleMethodToggle('top_p')}
                            />
                            <div className="flex-1">
                                <label className={`label ${selectedMethods.includes('top_p') ? '' : 'text-gray-300'}`}>
                                    <span className={`label-text-alt text-lg flex items-center gap-1 ${selectedMethods.includes('top_p') ? '' : 'text-gray-300'}`}>
                                        Top P
                                        <TooltipButton
                                            tooltipText={TOOLTIP_INFO.TOP_P.text}
                                            link={TOOLTIP_INFO.TOP_P.link}
                                        />
                                    </span>
                                    <span className="label-text-alt flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={settings.top_p}
                                            className="input input-xs input-bordered w-20"
                                            disabled={!selectedMethods.includes('top_p')}
                                            onChange={handleTopPChange}
                                        />
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max="100"
                                    value={settings.top_p! * 100}
                                    className={`range ${selectedMethods.includes('top_p')
                                        ? '[--range-shdw:theme(colors.amber.300)]'
                                        : '[--range-shdw:theme(colors.gray.300)]'
                                        }`}
                                    disabled={!selectedMethods.includes('top_p')}
                                    onChange={handleTopPChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                className={`checkbox ${selectedMethods.includes('top_k') ? 'checkbox-primary' : 'checkbox-ghost'}`}
                                checked={selectedMethods.includes('top_k')}
                                onChange={() => handleMethodToggle('top_k')}
                            />
                            <div className="flex-1">
                                <label className={`label ${selectedMethods.includes('top_k') ? '' : 'text-gray-300'}`}>
                                    <span className={`label-text-alt text-lg flex items-center gap-1 ${selectedMethods.includes('top_k') ? '' : 'text-gray-300'}`}>
                                        Top K
                                        <TooltipButton
                                            tooltipText={TOOLTIP_INFO.TOP_K.text}
                                            link={TOOLTIP_INFO.TOP_K.link}
                                        />
                                    </span>
                                    <span className="label-text-alt flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={settings.top_k}
                                            className="input input-xs input-bordered w-20"
                                            disabled={!selectedMethods.includes('top_k')}
                                            onChange={handleTopKChange}
                                        />
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max="100"
                                    value={settings.top_k ?? 0 * 100}
                                    className={`range ${selectedMethods.includes('top_k')
                                        ? '[--range-shdw:theme(colors.amber.300)]'
                                        : '[--range-shdw:theme(colors.gray.300)]'
                                        }`}
                                    disabled={!selectedMethods.includes('top_k')}
                                    onChange={handleTopKChange}
                                />
                            </div>
                        </div>

                        <div className="flex gap-8 mt-4">
                            <div className="flex-1 flex items-center">
                                <div className="flex items-center gap-4">
                                    <span className="text-lg flex items-center gap-1">
                                        Do Sample
                                        <TooltipButton
                                            tooltipText={TOOLTIP_INFO.DO_SAMPLE.text}
                                            link={TOOLTIP_INFO.DO_SAMPLE.link}
                                        />
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-lg border-amber-300 bg-amber-300 [--tglbg:theme(colors.white)] hover:bg-amber-400"
                                        checked={settings.do_sample}
                                        onChange={(e) => onSettingsChange({ ...settings, do_sample: e.target.checked })}
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className="text-lg block mb-2 flex items-center gap-1">
                                    Repetition Penalty
                                    <TooltipButton
                                        tooltipText={TOOLTIP_INFO.REPETITION_PENALTY.text}
                                        link={TOOLTIP_INFO.REPETITION_PENALTY.link}
                                    />
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    max="2"
                                    step="0.01"
                                    value={settings.repetition_penalty}
                                    className="input input-bordered border-amber-300 w-full"
                                    onChange={handleRepetitionPenaltyChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-action">
                    <form method="dialog">
                        <div className="flex gap-2">
                            <button className="btn btn-outline hover:bg-gray-600 text-gray-400 hover:text-white">Close</button>
                            <button className="btn bg-amber-300 hover:bg-amber-400 text-black border-none">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    );
}