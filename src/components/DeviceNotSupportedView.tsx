export default function DeviceNotSupportedView() {
    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="max-w-md text-center">
                <div className="mb-8">
                    <span className="text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </span>
                </div>
                <h1 className="text-4xl font-bold mb-4">Device Not Supported 😔</h1>
                <p className="text-lg mb-8 text-base-content/70">
                    Sorry, but your device or browser is not currently supported. Please try accessing this application from a modern desktop browser.
                </p>
            </div>
        </div>
    );
}