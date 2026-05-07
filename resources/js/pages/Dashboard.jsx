import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ScanFace,
    Fingerprint,
    FolderOpen,
    Search,
    FileText,
    Upload,
    Camera,
    User,
    ChevronRight,
    ExternalLink,
    X,
    Filter,
    Download,
    RefreshCw,
    Calendar,
    MapPin,
    AlertTriangle,
    Clock,
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import StatsBar from '../components/dashboard/StatsBar';
import SettingsModal from '../components/modals/SettingsModal';
import { getStatusColor } from '../utils/helpers';

async function fetchDb(resource, { perPage = 100 } = {}) {
    const response = await fetch(`/api/db/${resource}?per_page=${perPage}`, {
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        let message = `Failed to load ${resource}`;
        try {
            const body = await response.json();
            if (body?.message) message = body.message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    const body = await response.json();
    return Array.isArray(body?.data) ? body.data : [];
}

export default function Dashboard({ employee, onLogout }) {
    const [activeNav, setActiveNav] = useState('face-recognition');
    const [databases, setDatabases] = useState({
        national: true,
        interpol: true,
        missing: false,
    });
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedImageFile, setUploadedImageFile] = useState(null);
    const [uploadedFingerprint, setUploadedFingerprint] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedFingerprints, setSelectedFingerprints] = useState([6]);
    const [showFullRecord, setShowFullRecord] = useState(false);
    const [selectedSuspect, setSelectedSuspect] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isFingerprintScannerActive, setIsFingerprintScannerActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCase, setSelectedCase] = useState(null);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        notifications: true,
        autoSave: true,
        biometricAuth: false,
        darkMode: true,
        soundAlerts: false,
    });

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const [people, setPeople] = useState([]);
    const [cases, setCases] = useState([]);
    const [casePeople, setCasePeople] = useState([]);
    const [criminalRecords, setCriminalRecords] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [matches, setMatches] = useState([]);

    const fileInputRef = useRef(null);
    const fingerprintInputRef = useRef(null);

    const refreshData = async () => {
        setIsLoadingData(true);
        setLoadError(null);

        try {
            const [peopleData, casesData, casePeopleData, recordsData, incidentsData, matchesData] =
                await Promise.all([
                    fetchDb('people'),
                    fetchDb('cases'),
                    fetchDb('case-person'),
                    fetchDb('criminal-records'),
                    fetchDb('incident-reports'),
                    fetchDb('biometric-matches'),
                ]);

            setPeople(peopleData);
            setCases(casesData);
            setCasePeople(casePeopleData);
            setCriminalRecords(recordsData);
            setIncidents(incidentsData);
            setMatches(matchesData);
        } catch (error) {
            setLoadError(error?.message ?? 'Failed to load data');
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        refreshData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const personById = useMemo(() => {
        const map = new Map();
        for (const person of people) map.set(person.id, person);
        return map;
    }, [people]);

    const suspectsByCaseId = useMemo(() => {
        const map = new Map();
        for (const link of casePeople) {
            if (!map.has(link.case_id)) map.set(link.case_id, []);
            const person = personById.get(link.person_id);
            const fullName = person
                ? [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ')
                : `Person #${link.person_id}`;
            map.get(link.case_id).push({ name: fullName, role: link.role });
        }
        return map;
    }, [casePeople, personById]);

    const criminalRecordView = useMemo(() => {
        return criminalRecords.map((record) => {
            const person = personById.get(record.person_id);
            const fullName = person
                ? [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ')
                : `Person #${record.person_id}`;

            const charges = String(record.charges_summary ?? '')
                .split(';')
                .map((c) => c.trim())
                .filter(Boolean);

            return {
                id: record.id,
                name: fullName,
                dob: person?.date_of_birth ?? '—',
                address: person?.address ?? '—',
                recordNumber: record.record_number,
                status: record.status ?? 'active',
                risk: record.risk_level ?? '—',
                arrests: '—',
                convictions: record.convictions_summary ?? '—',
                lastArrest: record.last_updated_at ?? record.updated_at,
                charges,
                personId: record.person_id,
            };
        });
    }, [criminalRecords, personById]);

    const caseView = useMemo(() => {
        return cases.map((caseItem) => {
            const suspects = suspectsByCaseId.get(caseItem.id) ?? [];
            return {
                id: caseItem.id,
                caseNumber: caseItem.case_number,
                title: caseItem.title,
                status: caseItem.status ?? 'open',
                priority: 'medium',
                description: caseItem.summary ?? '',
                dateOpened: caseItem.opened_at ?? caseItem.created_at,
                assignedTo: caseItem.assigned_officer_user_id
                    ? employee?.id && employee.id === caseItem.assigned_officer_user_id
                        ? employee.name
                        : `Employee #${caseItem.assigned_officer_user_id}`
                    : 'Unassigned',
                location: '—',
                suspects: suspects.map((s) => s.name),
            };
        });
    }, [cases, suspectsByCaseId, employee]);

    const incidentView = useMemo(() => {
        return incidents.map((incident) => {
            const occurredAt = incident.occurred_at ? new Date(incident.occurred_at) : null;
            return {
                id: incident.id,
                incidentNumber: incident.incident_number,
                type: 'Incident',
                severity: incident.severity ?? 'medium',
                status: 'open',
                description: incident.description ?? '',
                dateReported: occurredAt ? occurredAt.toISOString() : incident.created_at,
                timeReported: occurredAt ? occurredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
                reportedBy: incident.reported_by_user_id
                    ? employee?.id && employee.id === incident.reported_by_user_id
                        ? employee.name
                        : `Employee #${incident.reported_by_user_id}`
                    : '—',
                location: incident.location ?? '—',
                caseId: incident.case_id,
            };
        });
    }, [incidents, employee]);

    const currentMatches = useMemo(() => {
        const modality = activeNav === 'face-recognition' ? 'face' : 'fingerprint';
        const sorted = [...matches]
            .filter((m) => String(m.modality ?? '').toLowerCase() === modality)
            .sort((a, b) => Number(b.confidence ?? 0) - Number(a.confidence ?? 0));

        return sorted.map((match) => {
            const person = personById.get(match.candidate_person_id);
            const fullName = person
                ? [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ')
                : `Person #${match.candidate_person_id}`;

            const record = criminalRecords.find((r) => r.person_id === match.candidate_person_id);
            const charges = String(record?.charges_summary ?? '')
                .split(';')
                .map((c) => c.trim())
                .filter(Boolean);

            const confidence = match.confidence != null ? Number(match.confidence) : 0;

            return {
                id: match.id,
                name: fullName,
                dob: person?.date_of_birth ?? '—',
                caseNumber: match.case_id
                    ? (cases.find((c) => c.id === match.case_id)?.case_number ?? `Case #${match.case_id}`)
                    : '—',
                offenseStatus: record?.status ?? 'active',
                charges: charges.length ? charges : ['—'],
                address: person?.address ?? '—',
                faceConfidence: modality === 'face' ? Math.round(confidence) : null,
                fingerConfidence: modality === 'fingerprint' ? Math.round(confidence) : null,
                personId: match.candidate_person_id,
            };
        });
    }, [activeNav, matches, personById, criminalRecords, cases]);

    const topConfidence = useMemo(() => {
        if (!showResults || currentMatches.length === 0) return 0;
        const top = currentMatches[0];
        return activeNav === 'face-recognition'
            ? Number(top.faceConfidence ?? 0)
            : Number(top.fingerConfidence ?? 0);
    }, [activeNav, currentMatches, showResults]);

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedImageFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedImage(event.target?.result ?? null);
            setShowResults(false);
        };
        reader.readAsDataURL(file);
    };

    const handleFingerprintUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedFingerprint(event.target?.result ?? null);
            setShowResults(false);
        };
        reader.readAsDataURL(file);
    };

    const handleScan = () => {
        setIsScanning(true);
        setShowResults(false);

        const run = async () => {
            try {
                if (activeNav === 'face-recognition') {
                    if (!uploadedImageFile) {
                        throw new Error('Please upload a face image first.');
                    }

                    const form = new FormData();
                    form.append('image', uploadedImageFile);
                    form.append('top_k', '10');

                    const resp = await fetch('/api/biometrics/face/match', {
                        method: 'POST',
                        body: form,
                        headers: { Accept: 'application/json' },
                    });

                    if (!resp.ok) {
                        let message = 'Face match failed.';
                        try {
                            const body = await resp.json();
                            if (body?.message) message = body.message;
                            else if (body?.error) message = body.error;
                        } catch {
                            // ignore
                        }
                        throw new Error(message);
                    }
                } else {
                    // Fingerprint matching isn't implemented yet; keep demo behavior.
                    await new Promise((r) => setTimeout(r, 1500));
                }

                await refreshData();
                setShowResults(true);
            } catch (error) {
                setLoadError(error?.message ?? 'Scan failed');
            } finally {
                setIsScanning(false);
            }
        };

        run();
    };

    const handleClearImage = () => {
        setUploadedImage(null);
        setUploadedImageFile(null);
        setShowResults(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCameraToggle = () => {
        setIsCameraActive((v) => !v);
        if (!isCameraActive) {
            setUploadedImage(null);
            setShowResults(false);
        }
    };

    const handleFingerprintScannerToggle = () => {
        setIsFingerprintScannerActive((v) => !v);
        if (!isFingerprintScannerActive) {
            setUploadedFingerprint(null);
            setShowResults(false);
        }
    };

    const handleClearFingerprint = () => {
        setUploadedFingerprint(null);
        setShowResults(false);
        if (fingerprintInputRef.current) fingerprintInputRef.current.value = '';
    };

    const handleFingerprintClick = (id) => {
        setSelectedFingerprints((prev) =>
            prev.includes(id) ? prev.filter((fpId) => fpId !== id) : [...prev, id]
        );
        setShowResults(false);
    };

    const handleViewRecord = (suspect) => {
        setSelectedSuspect(suspect);
        setShowFullRecord(true);
    };

    const handleRefineSearch = () => {
        setShowResults(false);
    };

    const handleDownloadReport = () => {
        alert('Generating identification report...');
    };

    const filteredCases = useMemo(() => {
        if (!searchQuery) return caseView;
        const q = searchQuery.toLowerCase();
        return caseView.filter((c) =>
            c.caseNumber.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q) ||
            c.suspects.some((s) => s.toLowerCase().includes(q))
        );
    }, [caseView, searchQuery]);

    const filteredRecords = useMemo(() => {
        if (!searchQuery) return criminalRecordView;
        const q = searchQuery.toLowerCase();
        return criminalRecordView.filter((r) =>
            r.name.toLowerCase().includes(q) || r.recordNumber.toLowerCase().includes(q)
        );
    }, [criminalRecordView, searchQuery]);

    const filteredIncidents = useMemo(() => {
        if (!searchQuery) return incidentView;
        const q = searchQuery.toLowerCase();
        return incidentView.filter((i) =>
            i.incidentNumber.toLowerCase().includes(q) ||
            i.type.toLowerCase().includes(q) ||
            i.location.toLowerCase().includes(q)
        );
    }, [incidentView, searchQuery]);

    const canScan =
        !isScanning &&
        ((activeNav === 'face-recognition' && (uploadedImage || isCameraActive)) ||
            (activeNav === 'fingerprint' && (uploadedFingerprint || isFingerprintScannerActive)));

    return (
        <div className="size-full flex bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
            <Sidebar
                activeNav={activeNav}
                onNavChange={(id) => {
                    setActiveNav(id);
                    setSearchQuery('');
                }}
                onSettingsClick={() => setShowSettings(true)}
            />

            <div className="flex-1 flex flex-col">
                <StatsBar isScanning={isScanning} topConfidence={topConfidence} />

                <div className="flex-1 flex overflow-hidden">
                    {(activeNav === 'face-recognition' || activeNav === 'fingerprint') && (
                        <div className="w-[450px] bg-gray-900/30 backdrop-blur-xl border-r border-red-900/20 p-6 overflow-y-auto">
                            <div className="mb-6 pb-4 border-b border-red-900/20">
                                <h2 className="text-xl font-bold mb-1 flex items-center gap-3">
                                    {activeNav === 'face-recognition' ? (
                                        <>
                                            <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center border border-red-700/30">
                                                <ScanFace className="text-red-500" size={20} />
                                            </div>
                                            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                                                Face Recognition
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center border border-red-700/30">
                                                <Fingerprint className="text-red-500" size={20} />
                                            </div>
                                            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                                                Fingerprint Matching
                                            </span>
                                        </>
                                    )}
                                </h2>
                                <p className="text-xs text-gray-400 ml-[52px]">Upload biometric data for identification</p>
                            </div>

                            {loadError && (
                                <div className="mb-4 rounded-lg border border-red-900/30 bg-red-950/30 p-3 text-sm text-red-200">
                                    {loadError}
                                </div>
                            )}

                            {activeNav === 'face-recognition' && (
                                <div className="mb-6">
                                    <label className="text-sm font-medium text-gray-300 mb-3 block">Face Image</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => !isCameraActive && fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl text-center transition-all cursor-pointer relative backdrop-blur-sm ${
                                            uploadedImage || isCameraActive
                                                ? 'border-red-500 p-2 shadow-lg shadow-red-900/30'
                                                : 'border-gray-700 hover:border-red-500 p-8 bg-gray-800/30 hover:bg-gray-800/50'
                                        }`}
                                    >
                                        {uploadedImage ? (
                                            <div className="relative">
                                                <img src={uploadedImage} alt="Uploaded" className="w-full h-64 object-cover rounded" />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleClearImage();
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-1 rounded"
                                                    type="button"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : isCameraActive ? (
                                            <div className="h-64 bg-gray-800 rounded flex items-center justify-center">
                                                <div className="text-center">
                                                    <Camera className="mx-auto mb-2 text-red-500 animate-pulse" size={48} />
                                                    <p className="text-sm text-gray-400">Camera Feed Active</p>
                                                    <p className="text-xs text-gray-500">Simulated feed</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="mx-auto mb-3 text-gray-500" size={32} />
                                                <p className="text-sm text-gray-400 mb-1">Drop image or click to upload</p>
                                                <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={handleCameraToggle}
                                            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                                                isCameraActive
                                                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/50'
                                                    : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                                            }`}
                                            type="button"
                                        >
                                            <Camera size={14} />
                                            {isCameraActive ? 'Stop Camera' : 'Live Camera'}
                                        </button>
                                        {uploadedImage && (
                                            <button
                                                onClick={handleClearImage}
                                                className="px-4 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-xs font-medium flex items-center gap-2 transition-all"
                                                type="button"
                                            >
                                                <X size={14} />
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeNav === 'fingerprint' && (
                                <>
                                    <div className="mb-6">
                                        <label className="text-sm font-medium text-gray-300 mb-3 block">Fingerprint Image</label>
                                        <input
                                            type="file"
                                            ref={fingerprintInputRef}
                                            accept="image/*"
                                            onChange={handleFingerprintUpload}
                                            className="hidden"
                                        />
                                        <div
                                            onClick={() => !isFingerprintScannerActive && fingerprintInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer relative ${
                                                uploadedFingerprint || isFingerprintScannerActive
                                                    ? 'border-red-500 p-2'
                                                    : 'border-gray-700 hover:border-red-500 p-8 bg-gray-800/50'
                                            }`}
                                        >
                                            {uploadedFingerprint ? (
                                                <div className="relative">
                                                    <img
                                                        src={uploadedFingerprint}
                                                        alt="Fingerprint"
                                                        className="w-full h-64 object-cover rounded"
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleClearFingerprint();
                                                        }}
                                                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-1 rounded"
                                                        type="button"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : isFingerprintScannerActive ? (
                                                <div className="h-64 bg-gray-800 rounded flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Fingerprint className="mx-auto mb-2 text-red-500 animate-pulse" size={48} />
                                                        <p className="text-sm text-gray-400">Scanner Active</p>
                                                        <p className="text-xs text-gray-500">Place finger on scanner</p>
                                                        <div className="mt-4 grid grid-cols-5 gap-1 max-w-[200px] mx-auto">
                                                            {selectedFingerprints.map((fpId) => (
                                                                <div
                                                                    key={fpId}
                                                                    className="w-8 h-10 bg-red-500/20 border border-red-500 rounded-sm"
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto mb-3 text-gray-500" size={32} />
                                                    <p className="text-sm text-gray-400 mb-1">
                                                        Drop fingerprint image or click to upload
                                                    </p>
                                                    <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={handleFingerprintScannerToggle}
                                                className={`flex-1 px-4 py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors ${
                                                    isFingerprintScannerActive
                                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                                        : 'bg-gray-700 hover:bg-gray-600'
                                                }`}
                                                type="button"
                                            >
                                                <Fingerprint size={14} />
                                                {isFingerprintScannerActive ? 'Stop Scanner' : 'Live Scanner'}
                                            </button>
                                            {uploadedFingerprint && (
                                                <button
                                                    onClick={handleClearFingerprint}
                                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-2"
                                                    type="button"
                                                >
                                                    <X size={14} />
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="text-sm font-medium text-gray-300 mb-3 block">Detected Fingerprints</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[
                                                { id: 1, label: 'L Thumb' },
                                                { id: 2, label: 'L Index' },
                                                { id: 3, label: 'L Middle' },
                                                { id: 4, label: 'L Ring' },
                                                { id: 5, label: 'L Pinky' },
                                                { id: 6, label: 'R Thumb' },
                                                { id: 7, label: 'R Index' },
                                                { id: 8, label: 'R Middle' },
                                                { id: 9, label: 'R Ring' },
                                                { id: 10, label: 'R Pinky' },
                                            ].map((fp) => (
                                                <div
                                                    key={fp.id}
                                                    onClick={() => handleFingerprintClick(fp.id)}
                                                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                                        selectedFingerprints.includes(fp.id)
                                                            ? 'border-red-500 bg-red-500/20'
                                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                                    }`}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    <Fingerprint
                                                        size={20}
                                                        className={
                                                            selectedFingerprints.includes(fp.id)
                                                                ? 'text-red-500'
                                                                : 'text-gray-500'
                                                        }
                                                    />
                                                    <span className="text-[10px] mt-1 text-gray-400">{fp.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedFingerprints.length > 0 && (
                                            <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                                                <ChevronRight size={12} />
                                                {selectedFingerprints.length} fingerprint
                                                {selectedFingerprints.length > 1 ? 's' : ''} detected
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-3 block">Database Scope</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 border border-gray-700/50 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={databases.national}
                                            onChange={(e) =>
                                                setDatabases({ ...databases, national: e.target.checked })
                                            }
                                            className="w-4 h-4 accent-red-600"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm">National Database</p>
                                            <p className="text-xs text-gray-500">DB-backed</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 border border-gray-700/50 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={databases.interpol}
                                            onChange={(e) =>
                                                setDatabases({ ...databases, interpol: e.target.checked })
                                            }
                                            className="w-4 h-4 accent-red-600"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm">Interpol Database</p>
                                            <p className="text-xs text-gray-500">DB-backed</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 border border-gray-700/50 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={databases.missing}
                                            onChange={(e) => setDatabases({ ...databases, missing: e.target.checked })}
                                            className="w-4 h-4 accent-red-600"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm">Missing Persons</p>
                                            <p className="text-xs text-gray-500">DB-backed</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleScan}
                                disabled={!canScan || isLoadingData}
                                className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-red-900/50 hover:scale-[1.02] disabled:hover:scale-100 font-semibold"
                                type="button"
                            >
                                {isScanning ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        Scanning Database...
                                    </>
                                ) : (
                                    <>
                                        <Search size={18} />
                                        Run Identification Scan
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    <div className="flex-1 bg-gradient-to-br from-gray-950/50 to-gray-900/30 p-6 overflow-y-auto">
                        {isLoadingData && (
                            <div className="text-sm text-gray-400">Loading database records…</div>
                        )}

                        {activeNav === 'records' && (
                            <>
                                <div className="mb-6">
                                    <div className="relative mb-4">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or record number..."
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:bg-gray-800 transition-all backdrop-blur-sm"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center border border-red-700/30">
                                                <FolderOpen className="text-red-500" size={20} />
                                            </div>
                                            <span>Criminal Records</span>
                                            <span className="text-sm font-normal text-gray-500">({filteredRecords.length} records)</span>
                                        </h2>
                                        <div className="flex gap-2">
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="text-xs font-medium text-red-500 hover:text-red-400 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                                                    type="button"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                            <button
                                                onClick={handleDownloadReport}
                                                className="text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                                                type="button"
                                            >
                                                <Download size={14} />
                                                Export
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {filteredRecords.map((record) => (
                                        <div
                                            key={record.id}
                                            className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-800/50 rounded-xl p-5 backdrop-blur-sm hover:border-gray-700 transition-all hover:scale-[1.01] shadow-lg"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-20 h-24 bg-gray-800 rounded overflow-hidden shrink-0 border border-gray-700 flex items-center justify-center">
                                                    <User className="text-gray-600" size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="flex items-center gap-2">
                                                                {record.name}
                                                                <span
                                                                    className={`px-2 py-0.5 rounded text-[10px] ${getStatusColor(record.status)}`}
                                                                >
                                                                    {record.status}
                                                                </span>
                                                            </h3>
                                                            <p className="text-xs text-gray-400">
                                                                DOB: {String(record.dob)} • {record.recordNumber}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mb-2">
                                                        <p className="text-xs text-gray-400 mb-1">Charges:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {record.charges.map((charge, i) => (
                                                                <span
                                                                    key={String(i)}
                                                                    className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded"
                                                                >
                                                                    {charge}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="text-xs">
                                                        <p className="text-gray-400 mb-1">Last Known Address:</p>
                                                        <p className="text-gray-300 flex items-start gap-1">
                                                            <MapPin size={12} className="mt-0.5 shrink-0 text-red-500" />
                                                            <span>{record.address}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeNav === 'case-search' && (
                            <>
                                <div className="mb-6">
                                    <div className="relative mb-4">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by case number, title, or suspect..."
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:bg-gray-800 transition-all backdrop-blur-sm"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center border border-red-700/30">
                                                <Search className="text-red-500" size={20} />
                                            </div>
                                            <span>Case Files</span>
                                            <span className="text-sm font-normal text-gray-500">({filteredCases.length} cases)</span>
                                        </h2>
                                        <div className="flex gap-2">
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="text-xs font-medium text-red-500 hover:text-red-400 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                                                    type="button"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                            <button
                                                onClick={handleDownloadReport}
                                                className="text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                                                type="button"
                                            >
                                                <Download size={14} />
                                                Export All
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {filteredCases.map((caseItem) => (
                                        <button
                                            key={caseItem.id}
                                            type="button"
                                            onClick={() => setSelectedCase(caseItem)}
                                            className="text-left w-full bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-800/50 rounded-xl p-5 backdrop-blur-sm hover:border-gray-700 transition-all hover:scale-[1.01] shadow-lg"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <h3 className="text-lg">{caseItem.title}</h3>
                                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(caseItem.status)}`}>
                                                            {caseItem.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400">{caseItem.caseNumber}</p>
                                                </div>
                                                <span className="text-xs text-gray-400">Click to view</span>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-xs text-gray-400 mb-2">Summary</p>
                                                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">
                                                    {caseItem.description || '—'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-gray-800/50 p-3 rounded">
                                                    <p className="text-xs text-gray-400 mb-1">Date Opened</p>
                                                    <p className="text-sm flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {caseItem.dateOpened
                                                            ? new Date(caseItem.dateOpened).toLocaleDateString()
                                                            : '—'}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-800/50 p-3 rounded">
                                                    <p className="text-xs text-gray-400 mb-1">Assigned</p>
                                                    <p className="text-sm">{caseItem.assignedTo}</p>
                                                </div>
                                                <div className="bg-gray-800/50 p-3 rounded">
                                                    <p className="text-xs text-gray-400 mb-1">Suspects</p>
                                                    <p className="text-sm">{caseItem.suspects.length}</p>
                                                </div>
                                                <div className="bg-gray-800/50 p-3 rounded">
                                                    <p className="text-xs text-gray-400 mb-1">Status</p>
                                                    <p className="text-sm">{caseItem.status}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeNav === 'incidents' && (
                            <>
                                <div className="mb-6">
                                    <div className="relative mb-4">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by incident number, severity, or location..."
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:bg-gray-800 transition-all backdrop-blur-sm"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center border border-red-700/30">
                                                <FileText className="text-red-500" size={20} />
                                            </div>
                                            <span>Incident Reports</span>
                                            <span className="text-sm font-normal text-gray-500">({filteredIncidents.length} incidents)</span>
                                        </h2>
                                        <div className="flex gap-2">
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="text-xs font-medium text-red-500 hover:text-red-400 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                                                    type="button"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                            <button
                                                onClick={handleDownloadReport}
                                                className="text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                                                type="button"
                                            >
                                                <Download size={14} />
                                                Export All
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {filteredIncidents.map((incident) => (
                                        <button
                                            key={incident.id}
                                            type="button"
                                            onClick={() => setSelectedIncident(incident)}
                                            className="text-left w-full bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-800/50 rounded-xl p-5 backdrop-blur-sm hover:border-gray-700 transition-all hover:scale-[1.01] shadow-lg"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <AlertTriangle size={18} className="text-red-500" />
                                                        <h3 className="text-lg">{incident.type}</h3>
                                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(incident.severity)}`}>
                                                            {incident.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400">{incident.incidentNumber}</p>
                                                </div>
                                                <span className="text-xs text-gray-400">Click to view</span>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-xs text-gray-400 mb-2">Description</p>
                                                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">
                                                    {incident.description || '—'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-gray-800/50 p-3 rounded">
                                                    <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                                                    <p className="text-sm flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {incident.dateReported
                                                            ? `${new Date(incident.dateReported).toLocaleDateString()} at ${incident.timeReported}`
                                                            : '—'}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-800/50 p-3 rounded">
                                                    <p className="text-xs text-gray-400 mb-1">Reported By</p>
                                                    <p className="text-sm">{incident.reportedBy}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400 mb-2">Location</p>
                                                <div className="bg-gray-800/50 p-3 rounded flex items-start gap-2">
                                                    <MapPin className="text-red-500 mt-0.5" size={16} />
                                                    <span className="text-sm flex-1">{incident.location}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {(activeNav === 'face-recognition' || activeNav === 'fingerprint') && showResults ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center border border-red-700/30">
                                            <AlertTriangle className="text-red-500" size={20} />
                                        </div>
                                        <span>Match Results</span>
                                        <span className="text-sm font-normal text-gray-500">({currentMatches.length} candidates)</span>
                                    </h2>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDownloadReport}
                                            className="text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                                            type="button"
                                        >
                                            <Download size={14} />
                                            Export
                                        </button>
                                        <button
                                            onClick={handleRefineSearch}
                                            className="text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                                            type="button"
                                        >
                                            <Filter size={14} />
                                            Refine
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {currentMatches.map((suspect, index) => (
                                        <div
                                            key={suspect.id}
                                            className={`bg-gradient-to-br from-gray-900/80 to-gray-900/50 rounded-xl p-5 backdrop-blur-sm transition-all hover:scale-[1.01] ${
                                                index === 0
                                                    ? 'border-2 border-red-500 shadow-xl shadow-red-900/30 ring-2 ring-red-500/20'
                                                    : 'border border-gray-800/50 hover:border-gray-700'
                                            }`}
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-24 h-28 bg-gray-800 rounded-lg overflow-hidden shrink-0 border-2 border-gray-700/50 shadow-lg ring-2 ring-gray-700/30 flex items-center justify-center">
                                                    <User className="text-gray-600" size={32} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="flex items-center gap-2">
                                                                {suspect.name}
                                                                {index === 0 && (
                                                                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] rounded">
                                                                        TOP MATCH
                                                                    </span>
                                                                )}
                                                            </h3>
                                                            <p className="text-xs text-gray-400">
                                                                DOB: {suspect.dob} • {suspect.caseNumber}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                                                suspect.offenseStatus
                                                            )}`}
                                                        >
                                                            {suspect.offenseStatus}
                                                        </span>
                                                    </div>

                                                    <div className="mb-3">
                                                        <p className="text-xs text-gray-400 mb-1">Charges:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {suspect.charges.map((charge, i) => (
                                                                <span
                                                                    key={String(i)}
                                                                    className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded"
                                                                >
                                                                    {charge}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div>
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-gray-400">
                                                                    {activeNav === 'face-recognition'
                                                                        ? 'Face Match'
                                                                        : 'Fingerprint Match'}
                                                                </span>
                                                                <span className="text-red-400">
                                                                    {activeNav === 'face-recognition'
                                                                        ? suspect.faceConfidence
                                                                        : suspect.fingerConfidence}
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-red-500 rounded-full"
                                                                    style={{
                                                                        width: `${
                                                                            activeNav === 'face-recognition'
                                                                                ? suspect.faceConfidence
                                                                                : suspect.fingerConfidence
                                                                        }%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 text-xs">
                                                        <p className="text-gray-400 mb-1">Last Known Address:</p>
                                                        <p className="text-gray-300 flex items-start gap-1">
                                                            <MapPin size={12} className="mt-0.5 shrink-0 text-red-500" />
                                                            <span>{suspect.address}</span>
                                                        </p>
                                                    </div>

                                                    {index === 0 && (
                                                        <button
                                                            onClick={() => handleViewRecord(suspect)}
                                                            className="mt-3 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-900/50 hover:scale-[1.02]"
                                                            type="button"
                                                        >
                                                            View Full Record
                                                            <ExternalLink size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : null}

                        {(activeNav === 'face-recognition' || activeNav === 'fingerprint') && !showResults && (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl flex items-center justify-center border border-gray-700/50 shadow-xl">
                                        {activeNav === 'face-recognition' ? (
                                            <ScanFace size={48} className="text-gray-600" />
                                        ) : (
                                            <Fingerprint size={48} className="text-gray-600" />
                                        )}
                                    </div>
                                    <p className="text-xl font-semibold mb-2 text-gray-400">No Results Yet</p>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                        {activeNav === 'face-recognition'
                                            ? 'Upload a face image and run a scan to see DB matches'
                                            : 'Upload a fingerprint image and run a scan to see DB matches'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                employee={employee}
                settings={settings}
                onSettingsChange={setSettings}
                onLogout={() => {
                    setShowSettings(false);
                    onLogout?.();
                }}
            />

            {selectedCase && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
                    <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
                            <h2 className="text-xl">Case Details</h2>
                            <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-gray-800 rounded" type="button">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-2xl">{selectedCase.title}</h3>
                                    <span className={`px-3 py-1 rounded text-xs ${getStatusColor(selectedCase.status)}`}>
                                        {selectedCase.status}
                                    </span>
                                </div>
                                <p className="text-gray-400">{selectedCase.caseNumber}</p>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm text-gray-400 mb-3">Summary</h4>
                                <p className="bg-gray-800 p-4 rounded-lg text-sm">{selectedCase.description || '—'}</p>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm text-gray-400 mb-3">Suspects</h4>
                                <div className="space-y-2">
                                    {selectedCase.suspects.map((suspect, i) => (
                                        <div key={String(i)} className="bg-gray-800 p-3 rounded flex items-center gap-3">
                                            <User size={20} className="text-gray-500" />
                                            <span className="text-sm">{suspect}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDownloadReport}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                                    type="button"
                                >
                                    <Download size={16} />
                                    Download Case File
                                </button>
                                <button
                                    onClick={() => setSelectedCase(null)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                                    type="button"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedIncident && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
                    <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
                            <h2 className="text-xl">Incident Report</h2>
                            <button
                                onClick={() => setSelectedIncident(null)}
                                className="p-2 hover:bg-gray-800 rounded"
                                type="button"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="text-red-500" size={24} />
                                    <h3 className="text-2xl">{selectedIncident.type}</h3>
                                    <span
                                        className={`px-3 py-1 rounded text-xs ${getStatusColor(selectedIncident.severity)}`}
                                    >
                                        {selectedIncident.severity}
                                    </span>
                                </div>
                                <p className="text-gray-400">{selectedIncident.incidentNumber}</p>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm text-gray-400 mb-3">Description</h4>
                                <p className="bg-gray-800 p-4 rounded-lg text-sm">{selectedIncident.description || '—'}</p>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm text-gray-400 mb-3">Location</h4>
                                <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-2">
                                    <MapPin className="text-red-500" size={20} />
                                    <span className="text-sm">{selectedIncident.location}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDownloadReport}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                                    type="button"
                                >
                                    <Download size={16} />
                                    Download Report
                                </button>
                                <button
                                    onClick={() => setSelectedIncident(null)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                                    type="button"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showFullRecord && selectedSuspect && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
                    <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
                            <h2 className="text-xl">Full Criminal Record</h2>
                            <button onClick={() => setShowFullRecord(false)} className="p-2 hover:bg-gray-800 rounded" type="button">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex gap-6 mb-6">
                                <div className="w-32 h-40 bg-gray-800 rounded overflow-hidden shrink-0 border-2 border-gray-700 flex items-center justify-center">
                                    <User className="text-gray-600" size={48} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl mb-2">{selectedSuspect.name}</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-400">Date of Birth</p>
                                            <p>{selectedSuspect.dob}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Case Number</p>
                                            <p>{selectedSuspect.caseNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Status</p>
                                            <span
                                                className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(
                                                    selectedSuspect.offenseStatus
                                                )}`}
                                            >
                                                {selectedSuspect.offenseStatus}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-400">Last Known Address</p>
                                            <p className="flex items-start gap-2 mt-1">
                                                <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
                                                <span>{selectedSuspect.address}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm text-gray-400 mb-3">Charges</h4>
                                <div className="space-y-2">
                                    {selectedSuspect.charges.map((charge, i) => (
                                        <div key={String(i)} className="bg-gray-800 p-3 rounded">
                                            <p className="text-sm">{charge}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDownloadReport}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                                    type="button"
                                >
                                    <Download size={16} />
                                    Download Report
                                </button>
                                <button
                                    onClick={() => setShowFullRecord(false)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                                    type="button"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
