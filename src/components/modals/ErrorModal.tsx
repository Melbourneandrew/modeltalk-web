
interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export default function ErrorModal({ isOpen, onClose, message }: ErrorModalProps) {
    if (!isOpen) return null;

    if (message.includes("Error occurred while loading model: Aborted()")) {
        message = "The model is not supported by transformers.js. Please try a different model.";
    }

    if (message.includes("Unauthorized access to file")) {
        message = "This model is not available for download. Please try a different model.";
    }

    if (message.includes('Unsupported device: "webgpu"')) {
        message = "WebGPU is not supported by your browser. Please try a different browser.";
    }


    return (
        <div className="modal modal-open">
            <div className="modal-box border-2 border-error">
                <h3 className="font-bold text-lg text-error">Error</h3>
                <p className="py-4">{message}</p>
                <div className="modal-action">
                    <button className="btn btn-error" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
