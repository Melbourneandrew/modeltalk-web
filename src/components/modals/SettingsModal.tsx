export default function SettingsModal() {
    return (
        <dialog id="settings_modal" className="modal">
            <div className="modal-box border-2 border-amber-300">
                <h3 className="font-bold text-lg">Settings</h3>
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn">Close</button>
                    </form>
                </div>
            </div>
        </dialog>
    );
}