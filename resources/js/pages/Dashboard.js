export default function Dashboard({ onLogout }) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                    <button
                        type="button"
                        onClick={() => onLogout?.()}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                    >
                        Logout
                    </button>
                </div>

                <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-700">You are now logged in.</p>
                </div>
            </div>
        </div>
    );
}
