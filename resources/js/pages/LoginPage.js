import { useState } from 'react';

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        onLogin?.(username, password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
                <h1 className="text-xl font-semibold text-gray-900">Login</h1>
                <p className="mt-2 text-sm text-gray-600">Enter your username and password.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Username</span>
                        <input
                            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring focus:ring-gray-300"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Password</span>
                        <input
                            type="password"
                            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring focus:ring-gray-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full rounded-md border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}
