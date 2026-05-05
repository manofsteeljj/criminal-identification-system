import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import LoadingScreen from './pages/LoadingScreen';
import Dashboard from './pages/Dashboard';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (username, password) => {
        setIsLoading(true);

        // Simulate authentication delay
        setTimeout(() => {
            setIsLoggedIn(true);
            setIsLoading(false);
        }, 3000);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
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
    return <Dashboard onLogout={handleLogout} />;
}
