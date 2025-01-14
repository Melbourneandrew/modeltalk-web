interface ProgressItem {
    progress: number;
    file: string;
}

interface Props {
    progressItems: ProgressItem[];
}

export default function ModelDownloadProgress({ progressItems }: Props) {
    if (progressItems.length === 0) return null;

    return (
        <div className="fixed bottom-24 left-0 right-0 p-4">
            <div className="w-full max-w-4xl mx-auto space-y-2">
                {progressItems.map(item => (
                    <div key={item.file} className="bg-white rounded-lg p-4 shadow-lg">
                        <div className="text-sm mb-2">{item.file}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-amber-400 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${item.progress * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
