import { ProgressItem } from '../types';

interface Props {
    item: ProgressItem;
}

export default function ModelDownloadProgress({ item }: Props) {
    const formatBytes = (size: number) => {
        const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return (
            +(size / Math.pow(1024, i)).toFixed(2) +
            [" B", " KB", " MB", " GB", " TB"][i]
        );
    };

    // Use progress value directly as percentage
    const progressPercentage = item.progress || 0;

    return (
        <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="text-sm mb-2 flex items-center">
                {item.name} <span className="text-gray-400 text-xs ml-2 mr-2">{item.file.split('/').pop()}</span> {item.total ? `(${formatBytes(item.total)})` : ''}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-amber-400 h-2.5 rounded-full transition-all duration-300"
                    style={{
                        width: `${progressPercentage}%`,
                    }}
                />
            </div>
            <div className="text-xs text-gray-500 mt-1">
                {progressPercentage.toFixed(1)}%
            </div>
        </div>
    );
}
