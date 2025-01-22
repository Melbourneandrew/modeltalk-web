
interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export default function ErrorModal({ isOpen, onClose, message }: ErrorModalProps) {
    if (!isOpen) return null;

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
