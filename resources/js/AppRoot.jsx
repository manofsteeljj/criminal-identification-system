import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import LoadingScreen from './pages/LoadingScreen';
import Dashboard from './pages/Dashboard';

export default function AppRoot() {
    const [employee, setEmployee] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('employee');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.id) {
                    setEmployee(parsed);
                    setIsLoggedIn(true);
                }
            }
        } catch {
            // ignore malformed localStorage
        }
    }, []);

    const handleLogin = async (email, password) => {
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || 'Login failed');
            }

            if (!data?.employee?.id) {
                throw new Error('Login failed');
            }

            setEmployee(data.employee);
            localStorage.setItem('employee', JSON.stringify(data.employee));
            setIsLoggedIn(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        setIsLoggedIn(false);
        setEmployee(null);
        localStorage.removeItem('employee');
    };

    // Login Page
    if (!isLoggedIn && !isLoading) {
        return <LoginPage onLogin={handleLogin} />;
    }

    // Loading Screen
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Main Dashboard
    return <Dashboard employee={employee} onLogout={handleLogout} />;
}
