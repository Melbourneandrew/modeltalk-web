import { useId } from 'react';

interface ProgressData {
    file: string;
    loaded?: number;
    total?: number;
    progress?: number;
    status: string;
    name?: string;
}

interface Props {
    progressItems: ProgressData[];
}

export default function ModelDownloadProgress({ progressItems }: Props) {
    const baseId = useId(); // Generate a unique base ID for this instance

    if (progressItems.length === 0) return null;

    return (
        <div className="fixed bottom-24 left-0 right-0 p-4">
            <div className="w-full max-w-4xl mx-auto space-y-2">
                {progressItems.map((item, index) => {
                    // Create a unique key combining the base ID, index, and file name
                    const uniqueKey = `${baseId}-${index}-${item.file}`;

                    // Calculate progress percentage
                    const progressPercentage = item.loaded && item.total
                        ? Math.min((item.loaded / item.total) * 100, 100)
                        : Math.min((item.progress || 0) * 100, 100);

                    // Format file size in MB
                    const totalSize = item.total
                        ? `(${(item.total / 1024 / 1024).toFixed(1)} MB)`
                        : '';

                    return (
                        <div
                            key={uniqueKey}
                            className="bg-white rounded-lg p-4 shadow-lg"
                        >
                            <div className="text-sm mb-2">
                                {item.name || item.file} {totalSize}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-amber-400 h-2.5 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${progressPercentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
