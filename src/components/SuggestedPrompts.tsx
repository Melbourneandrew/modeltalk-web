interface SuggestedPromptsProps {
    onPromptClick: (prompt: string) => void;
    suggestedPrompts: { title: string; prompt: string; }[];
}

const defaultPrompts = [
    { title: "How far away is the sun?", prompt: "How far away is the sun?" },
    { title: "Tell me about John Von Neumann", prompt: "Tell me about John Von Neumann." },
    { title: "Write a short story", prompt: "Write a short story." },
    { title: "What is the meaning of life?", prompt: "What is the meaning of life?" }
];

export default function SuggestedPrompts({
    onPromptClick,
    suggestedPrompts = defaultPrompts
}: SuggestedPromptsProps) {
    return (
        <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto my-4">
            <h4 className="text-gray-400">Suggested Prompts</h4>
            <div className="flex flex-wrap justify-center gap-2 w-full">
                {suggestedPrompts.map((promptItem, index) => (
                    <button
                        key={index}
                        onClick={() => onPromptClick(promptItem.prompt)}
                        className="px-4 py-2 rounded-full border-2 border-amber-300 hover:border-amber-500 
                         hover:bg-amber-500/10 transition-colors duration-200 text-sm"
                    >
                        {promptItem.title}
                    </button>
                ))}
            </div>
        </div>
    );
};
