export default function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="text-center">
                <h1 className="text-xl font-semibold text-gray-900">Loading...</h1>
                <p className="mt-2 text-sm text-gray-600">Signing you in, please wait.</p>
            </div>
        </div>
    );
}
