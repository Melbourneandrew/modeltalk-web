export default function WebgpuProgress() {
    return (
        <div className="fixed bottom-24 left-0 right-0 p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex items-center bg-white rounded-lg p-4 shadow-lg">
                    <span className="mr-[20px] loading loading-dots loading-lg text-amber-400"></span>

                    <div className="text-sm">
                        Initializing model with WebGPU (This might take a moment)...
                    </div>
                </div>
            </div>
        </div>
    );
}
