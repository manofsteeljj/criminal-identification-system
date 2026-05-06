import { Database, Clock, AlertTriangle } from 'lucide-react';

export default function StatsBar({ isScanning, topConfidence }) {
    return (
        <div className="h-20 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-gray-900/80 backdrop-blur-xl border-b border-red-900/20 flex items-center px-6 gap-8 shadow-lg">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-green-900/30">
                <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-xs text-gray-300 font-medium">System Online</span>
            </div>
            <div className="flex gap-8 flex-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg flex items-center justify-center border border-blue-700/30">
                        <Database size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Database Size</p>
                        <p className="text-sm font-semibold text-gray-200">12.4M Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg flex items-center justify-center border border-purple-700/30">
                        <Clock size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Avg Match Time</p>
                        <p className="text-sm font-semibold text-gray-200">{isScanning ? 'Scanning...' : '1.2s'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center border border-red-700/30">
                        <AlertTriangle size={20} className="text-red-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Top Match Confidence</p>
                        <p className="text-sm font-semibold text-red-500">{topConfidence}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
