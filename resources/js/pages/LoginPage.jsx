import { useState } from 'react';
import { Shield, User, Lock } from 'lucide-react';

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!email || !password) {
            setLoginError('Please enter both email and password');
            return;
        }

        try {
            await onLogin(email, password);
        } catch (err) {
            setLoginError(err?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="size-full flex items-center justify-center bg-gray-950">
            <div className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-red-600 to-red-800 rounded-full shadow-2xl border-4 border-red-900">
                        <Shield size={48} className="text-red-100" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-red-500">REAPER FORENSIC DIVISION</h1>
                    <p className="text-sm text-gray-400 tracking-widest mb-1">RFD • CRIMINAL INTELLIGENCE</p>
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-4"></div>
                    <h2 className="text-xl text-gray-300">Identification System</h2>
                    <p className="text-xs text-gray-500 mt-2">CLASSIFIED • AUTHORIZED ACCESS ONLY</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-2xl">
                    <div className="mb-6">
                        <label className="block text-xs text-gray-400 mb-2 tracking-wide">EMPLOYEE EMAIL</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="employee@example.com"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs text-gray-400 mb-2 tracking-wide">PASSWORD</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="Enter password"
                            />
                        </div>
                    </div>

                    {loginError && (
                        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
                            {loginError}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-medium tracking-wide transition-all shadow-lg hover:shadow-red-900/50"
                    >
                        AUTHENTICATE & ACCESS SYSTEM
                    </button>

                    <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs text-center text-gray-500">This system is restricted to authorized personnel only.</p>
                        <p className="text-xs text-center text-gray-500 mt-1">
                            Unauthorized access is prohibited and will be prosecuted.
                        </p>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600">© 2026 Reaper Forensic Division • All Rights Reserved</p>
                </div>
            </div>
        </div>
    );
}
