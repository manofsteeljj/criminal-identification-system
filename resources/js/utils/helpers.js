export function getStatusColor(status) {
    const value = String(status ?? '').toLowerCase();

    // Map common case/incident status terms
    if (['open', 'active', 'in-progress', 'in progress'].includes(value)) {
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
    }
    if (['closed', 'resolved', 'complete', 'completed'].includes(value)) {
        return 'bg-gray-500/20 text-gray-200 border border-gray-500/30';
    }

    // Map common priority/severity/risk terms
    if (['high', 'critical', 'urgent'].includes(value)) {
        return 'bg-red-600/20 text-red-300 border border-red-500/30';
    }
    if (['medium', 'moderate', 'warning'].includes(value)) {
        return 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30';
    }
    if (['low', 'info'].includes(value)) {
        return 'bg-blue-500/20 text-blue-200 border border-blue-500/30';
    }

    return 'bg-gray-700/30 text-gray-200 border border-gray-700/40';
}
