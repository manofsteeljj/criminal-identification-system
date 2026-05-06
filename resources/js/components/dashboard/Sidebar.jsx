import {
    Shield,
    User,
    Settings,
    ScanFace,
    Fingerprint,
    FolderOpen,
    Search,
    FileText,
} from 'lucide-react';

export default function Sidebar({ activeNav, onNavChange, onSettingsClick }) {
    const navItems = [
        { id: 'face-recognition', icon: ScanFace, label: 'Face Recognition' },
        { id: 'fingerprint', icon: Fingerprint, label: 'Fingerprint Matching' },
        { id: 'records', icon: FolderOpen, label: 'Criminal Records' },
        { id: 'case-search', icon: Search, label: 'Case Search' },
        { id: 'incidents', icon: FileText, label: 'Incident Reports' },
    ];

    return (
        <div className="w-64 bg-gray-900/50 backdrop-blur-xl border-r border-red-900/20 flex flex-col shadow-2xl">
            <div className="p-6 border-b border-red-900/20">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50 ring-2 ring-red-500/20">
                        <Shield size={24} className="text-red-100" />
                    </div>
                    <div>
                        <h1 className="font-bold text-red-500 text-xl tracking-tight">RFD</h1>
                        <p className="text-[10px] text-gray-500 -mt-1 tracking-widest">REAPER FORENSIC</p>
                    </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
                    <p className="text-xs text-gray-400">Identification System</p>
                    <p className="text-xs text-red-500 font-mono">v3.2.1</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            activeNav === item.id
                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/50 scale-[1.02]'
                                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 hover:translate-x-1'
                        }`}
                    >
                        <item.icon size={20} className={activeNav === item.id ? 'drop-shadow-lg' : ''} />
                        <span className="text-sm font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-red-900/20">
                <button
                    onClick={onSettingsClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 transition-all hover:translate-x-1"
                >
                    <Settings size={20} />
                    <span className="text-sm font-medium">Settings</span>
                </button>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-red-900/20 shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center ring-2 ring-red-500/30 shadow-lg shadow-red-900/50">
                        <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Officer J. Martinez</p>
                        <p className="text-xs text-gray-400">Badge #4521</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
