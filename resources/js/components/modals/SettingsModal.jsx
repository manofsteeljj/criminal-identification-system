import { X, Settings, User, Monitor, Key, Database, LogOut } from 'lucide-react';

export default function SettingsModal({
    isOpen,
    onClose,
    settings,
    onSettingsChange,
    onLogout,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
            <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
                    <div className="flex items-center gap-3">
                        <Settings className="text-red-500" size={24} />
                        <h2 className="text-xl">System Settings</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                            <User size={16} />
                            Account Information
                        </h3>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Officer Name</span>
                                <span className="text-sm">Officer J. Martinez</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Badge Number</span>
                                <span className="text-sm">#4521</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Clearance Level</span>
                                <span className="text-sm text-red-500">Level 3 - Authorized</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Department</span>
                                <span className="text-sm">Forensic Division</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                            <Monitor size={16} />
                            System Preferences
                        </h3>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <p className="text-sm">Enable Notifications</p>
                                    <p className="text-xs text-gray-500">Receive alerts for new matches and cases</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications}
                                    onChange={(e) =>
                                        onSettingsChange({ ...settings, notifications: e.target.checked })
                                    }
                                    className="w-5 h-5 accent-red-600"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <p className="text-sm">Auto-Save Results</p>
                                    <p className="text-xs text-gray-500">Automatically save search results</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.autoSave}
                                    onChange={(e) => onSettingsChange({ ...settings, autoSave: e.target.checked })}
                                    className="w-5 h-5 accent-red-600"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <p className="text-sm">Sound Alerts</p>
                                    <p className="text-xs text-gray-500">Play sound when match is found</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.soundAlerts}
                                    onChange={(e) =>
                                        onSettingsChange({ ...settings, soundAlerts: e.target.checked })
                                    }
                                    className="w-5 h-5 accent-red-600"
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                            <Key size={16} />
                            Security Settings
                        </h3>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <p className="text-sm">Biometric Authentication</p>
                                    <p className="text-xs text-gray-500">Use fingerprint or face ID to login</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.biometricAuth}
                                    onChange={(e) =>
                                        onSettingsChange({ ...settings, biometricAuth: e.target.checked })
                                    }
                                    className="w-5 h-5 accent-red-600"
                                />
                            </label>

                            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors">
                                Change Password
                            </button>

                            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors">
                                View Activity Log
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                            <Database size={16} />
                            Database Settings
                        </h3>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Last Sync</span>
                                <span className="text-sm text-green-500">2 minutes ago</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Database Version</span>
                                <span className="text-sm">v3.2.1</span>
                            </div>
                            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors">
                                Sync Database Now
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                        <button
                            onClick={onLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogOut size={18} />
                            Logout from System
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
