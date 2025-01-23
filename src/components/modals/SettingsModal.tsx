import React, { useState } from 'react';
import { InformationIcon } from '../icons/InformationIcon';

export default function SettingsModal() {
    const [selectedMethods, setSelectedMethods] = useState<string[]>(['temperature']);
    const [temperatureValue, setTemperatureValue] = useState(0.40);
    const [topPValue, setTopPValue] = useState(0.40);
    const [topKValue, setTopKValue] = useState(0.40);
    const [maxTokens, setMaxTokens] = useState(1000);
    const [doSample, setDoSample] = useState(true);
    const [repetitionPenalty, setRepetitionPenalty] = useState(1.10);

    const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.type === 'range' ?
            (parseInt(e.target.value) / 100).toFixed(2) :
            Math.min(1, Math.max(0, Number(e.target.value))));
        setTemperatureValue(value);
    };

    const handleTopPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.type === 'range' ?
            (parseInt(e.target.value) / 100).toFixed(2) :
            Math.min(1, Math.max(0, Number(e.target.value))));
        setTopPValue(value);
    };

    const handleTopKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.type === 'range' ?
            (parseInt(e.target.value) / 100).toFixed(2) :
            Math.min(1, Math.max(0, Number(e.target.value))));
        setTopKValue(value);
    };

    const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(1, Math.min(32000, parseInt(e.target.value) || 1));
        setMaxTokens(value);
    };

    const handleRepetitionPenaltyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(1, Math.min(2, Number(parseFloat(e.target.value).toFixed(2))));
        setRepetitionPenalty(value);
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
                                        Max New Tokens
                                        <div className="tooltip tooltip-right before:z-50" data-tip="Maximum number of tokens the model will generate in response. One token is roughly 4 characters.">
                                            <InformationIcon />
                                        </div>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="32000"
                                    value={maxTokens}
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
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedMethods([...selectedMethods, 'temperature']);
                                    } else {
                                        setSelectedMethods(selectedMethods.filter(m => m !== 'temperature'));
                                    }
                                }}
                            />
                            <div className="flex-1">
                                <label className={`label ${selectedMethods.includes('temperature') ? '' : 'text-gray-300'}`}>
                                    <span className={`label-text-alt text-lg flex items-center gap-1 ${selectedMethods.includes('temperature') ? '' : 'text-gray-300'}`}>
                                        Temperature
                                        <div className="tooltip tooltip-right before:z-50" data-tip="Controls randomness in the output. Higher values make the output more diverse but less focused.">
                                            <InformationIcon />
                                        </div>
                                    </span>
                                    <span className="label-text-alt flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={temperatureValue}
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
                                    value={temperatureValue * 100}
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
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedMethods([...selectedMethods, 'top_p']);
                                    } else {
                                        setSelectedMethods(selectedMethods.filter(m => m !== 'top_p'));
                                    }
                                }}
                            />
                            <div className="flex-1">
                                <label className={`label ${selectedMethods.includes('top_p') ? '' : 'text-gray-300'}`}>
                                    <span className={`label-text-alt text-lg flex items-center gap-1 ${selectedMethods.includes('top_p') ? '' : 'text-gray-300'}`}>
                                        Top P
                                        <div className="tooltip tooltip-right before:z-50" data-tip="Nucleus sampling - considers tokens comprising the top P% of probability mass. Lower values make output more focused.">
                                            <InformationIcon />
                                        </div>
                                    </span>
                                    <span className="label-text-alt flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={topPValue}
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
                                    value={topPValue * 100}
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
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedMethods([...selectedMethods, 'top_k']);
                                    } else {
                                        setSelectedMethods(selectedMethods.filter(m => m !== 'top_k'));
                                    }
                                }}
                            />
                            <div className="flex-1">
                                <label className={`label ${selectedMethods.includes('top_k') ? '' : 'text-gray-300'}`}>
                                    <span className={`label-text-alt text-lg flex items-center gap-1 ${selectedMethods.includes('top_k') ? '' : 'text-gray-300'}`}>
                                        Top K
                                        <div className="tooltip tooltip-right before:z-50" data-tip="Limits the cumulative probability by considering only the top K most likely tokens. Lower values make output more deterministic.">
                                            <InformationIcon />
                                        </div>
                                    </span>
                                    <span className="label-text-alt flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={topKValue}
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
                                    value={topKValue * 100}
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
                                        <div className="tooltip tooltip-right before:z-50" data-tip="When enabled, uses sampling to generate text. When disabled, always picks the most likely next token (greedy decoding).">
                                            <InformationIcon />
                                        </div>
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-lg border-amber-300 bg-amber-300 [--tglbg:theme(colors.white)] hover:bg-amber-400"
                                        checked={doSample}
                                        onChange={(e) => setDoSample(e.target.checked)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className="text-lg block mb-2 flex items-center gap-1">
                                    Repetition Penalty
                                    <div className="tooltip tooltip-right before:z-50" data-tip="Reduces the likelihood of the model repeating the same text. Higher values (>1.0) make repetition less likely.">
                                        <InformationIcon />
                                    </div>
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    max="2"
                                    step="0.01"
                                    value={repetitionPenalty}
                                    className="input input-bordered border-amber-300 w-full"
                                    onChange={handleRepetitionPenaltyChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn bg-amber-300 hover:bg-amber-400 text-black border-none">Save</button>
                    </form>
                </div>
            </div>
        </dialog>
    );
}