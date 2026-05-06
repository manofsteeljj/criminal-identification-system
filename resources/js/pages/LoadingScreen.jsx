import { Shield, Loader2 } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div className="size-full flex items-center justify-center bg-gray-950">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-red-600 to-red-800 rounded-full shadow-2xl animate-pulse border-4 border-red-900">
                    <Shield size={48} className="text-red-100" />
                </div>
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Loader2 size={24} className="text-red-500 animate-spin" />
                    <h2 className="text-xl text-red-500">Authenticating Credentials</h2>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                    <p>Verifying security clearance...</p>
                    <p>Accessing encrypted databases...</p>
                    <p>Initializing identification systems...</p>
                </div>
                <div className="mt-8 w-64 mx-auto">
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-400 animate-[loading_3s_ease-in-out]"
                            style={{
                                animation: 'loading 3s ease-in-out forwards',
                            }}
                        ></div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes loading {
                    0% {
                        width: 0%;
                    }
                    100% {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
