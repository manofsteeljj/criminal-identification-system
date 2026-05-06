import { useState, useRef } from 'react';
import {
  ScanFace,
  Fingerprint,
  FolderOpen,
  Search as SearchIcon,
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
  Eye,
  Shield
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import StatsBar from '../components/dashboard/StatsBar';
import SettingsModal from '../components/modals/SettingsModal';
import { mockFaceSuspects, mockFingerprintSuspects, mockCriminalRecords, mockCases, mockIncidents } from '../data/mockData';
import { Suspect, Settings as SettingsType, Databases } from '../types';
import { getStatusColor } from '../utils/helpers';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeNav, setActiveNav] = useState('face-recognition');
  const [databases, setDatabases] = useState<Databases>({
    national: true,
    interpol: true,
    missing: false
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFingerprint, setUploadedFingerprint] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFingerprints, setSelectedFingerprints] = useState<number[]>([6]);
  const [showFullRecord, setShowFullRecord] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFingerprintScannerActive, setIsFingerprintScannerActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsType>({
    notifications: true,
    autoSave: true,
    biometricAuth: false,
    darkMode: true,
    soundAlerts: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fingerprintInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setShowResults(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFingerprintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFingerprint(event.target?.result as string);
        setShowResults(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowResults(true);
    }, 2000);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraToggle = () => {
    setIsCameraActive(!isCameraActive);
    if (!isCameraActive) {
      setUploadedImage(null);
      setShowResults(false);
    }
  };

  const handleFingerprintScannerToggle = () => {
    setIsFingerprintScannerActive(!isFingerprintScannerActive);
    if (!isFingerprintScannerActive) {
      setUploadedFingerprint(null);
      setShowResults(false);
    }
  };

  const handleClearFingerprint = () => {
    setUploadedFingerprint(null);
    setShowResults(false);
    if (fingerprintInputRef.current) {
      fingerprintInputRef.current.value = '';
    }
  };

  const handleFingerprintClick = (id: number) => {
    setSelectedFingerprints(prev =>
      prev.includes(id) ? prev.filter(fpId => fpId !== id) : [...prev, id]
    );
    setShowResults(false);
  };

  const handleViewRecord = (suspect: any) => {
    setSelectedSuspect(suspect);
    setShowFullRecord(true);
  };

  const handleRefineSearch = () => {
    setShowResults(false);
  };

  const handleDownloadReport = () => {
    alert('Generating identification report...');
  };

  const handleLogoutClick = () => {
    setShowSettings(false);
    onLogout();
  };

  const currentSuspects = activeNav === 'face-recognition' ? mockFaceSuspects : mockFingerprintSuspects;
  const topConfidence = activeNav === 'face-recognition'
    ? (showResults && currentSuspects.length > 0 ? currentSuspects[0].faceConfidence : 0)
    : (showResults && currentSuspects.length > 0 ? currentSuspects[0].fingerConfidence : 0);

  const filteredCases = searchQuery
    ? mockCases.filter(c =>
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.suspects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mockCases;

  const filteredRecords = searchQuery
    ? mockCriminalRecords.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.recordNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockCriminalRecords;

  const filteredIncidents = searchQuery
    ? mockIncidents.filter(i =>
        i.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockIncidents;

  return (
    <div className="size-full flex bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Sidebar */}
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
              onClick={() => setActiveNav(item.id)}
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
            onClick={() => setShowSettings(true)}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Stats Bar */}
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

        {/* Main Panels */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Input & Scan (only for face-recognition and fingerprint) */}
          {(activeNav === 'face-recognition' || activeNav === 'fingerprint') && (
            <div className="w-[450px] bg-gray-900/30 backdrop-blur-xl border-r border-red-900/20 p-6 overflow-y-auto">
              <div className="mb-6 pb-4 border-b border-red-900/20">
                <h2 className="text-xl font-bold mb-1 flex items-center gap-3">
                  {activeNav === 'face-recognition' ? (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center border border-red-700/30">
                        <ScanFace className="text-red-500" size={20} />
                      </div>
                      <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Face Recognition</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center border border-red-700/30">
                        <Fingerprint className="text-red-500" size={20} />
                      </div>
                      <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Fingerprint Matching</span>
                    </>
                  )}
                </h2>
                <p className="text-xs text-gray-400 ml-[52px]">Upload biometric data for identification</p>
              </div>

            {activeNav === 'face-recognition' && (
              <>
                {/* Face Upload Area */}
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
                    >
                      <Camera size={14} />
                      {isCameraActive ? 'Stop Camera' : 'Live Camera'}
                    </button>
                    {uploadedImage && (
                      <button
                        onClick={handleClearImage}
                        className="px-4 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-xs font-medium flex items-center gap-2 transition-all"
                      >
                        <X size={14} />
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeNav === 'fingerprint' && (
              <>
                {/* Fingerprint Upload Area */}
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
                        <img src={uploadedFingerprint} alt="Fingerprint" className="w-full h-64 object-cover rounded" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearFingerprint();
                          }}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-1 rounded"
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
                              <div key={fpId} className="w-8 h-10 bg-red-500/20 border border-red-500 rounded-sm"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-3 text-gray-500" size={32} />
                        <p className="text-sm text-gray-400 mb-1">Drop fingerprint image or click to upload</p>
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
                    >
                      <Fingerprint size={14} />
                      {isFingerprintScannerActive ? 'Stop Scanner' : 'Live Scanner'}
                    </button>
                    {uploadedFingerprint && (
                      <button
                        onClick={handleClearFingerprint}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-2"
                      >
                        <X size={14} />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Fingerprint Grid - for reference */}
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
                      >
                        <Fingerprint
                          size={20}
                          className={selectedFingerprints.includes(fp.id) ? 'text-red-500' : 'text-gray-500'}
                        />
                        <span className="text-[10px] mt-1 text-gray-400">{fp.label}</span>
                      </div>
                    ))}
                  </div>
                  {selectedFingerprints.length > 0 && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <ChevronRight size={12} />
                      {selectedFingerprints.length} fingerprint{selectedFingerprints.length > 1 ? 's' : ''} detected
                    </p>
                  )}
                </div>
              </>
            )}

            {(activeNav === 'face-recognition' || activeNav === 'fingerprint') && (
              <>
                {/* Database Scope */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">Database Scope</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 border border-gray-700/50 transition-all">
                      <input
                        type="checkbox"
                        checked={databases.national}
                        onChange={(e) => setDatabases({...databases, national: e.target.checked})}
                        className="w-4 h-4 accent-red-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm">National Database</p>
                        <p className="text-xs text-gray-500">8.2M records</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 border border-gray-700/50 transition-all">
                      <input
                        type="checkbox"
                        checked={databases.interpol}
                        onChange={(e) => setDatabases({...databases, interpol: e.target.checked})}
                        className="w-4 h-4 accent-red-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm">Interpol Database</p>
                        <p className="text-xs text-gray-500">3.1M records</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 border border-gray-700/50 transition-all">
                      <input
                        type="checkbox"
                        checked={databases.missing}
                        onChange={(e) => setDatabases({...databases, missing: e.target.checked})}
                        className="w-4 h-4 accent-red-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm">Missing Persons</p>
                        <p className="text-xs text-gray-500">1.1M records</p>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleScan}
                  disabled={isScanning || (activeNav === 'face-recognition' && !uploadedImage && !isCameraActive) || (activeNav === 'fingerprint' && !uploadedFingerprint && !isFingerprintScannerActive)}
                  className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-red-900/50 hover:scale-[1.02] disabled:hover:scale-100 font-semibold"
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
              </>
            )}
            </div>
          )}

          {/* Right Panel - Results/Data */}
          <div className="flex-1 bg-gradient-to-br from-gray-950/50 to-gray-900/30 p-6 overflow-y-auto">
            {/* Criminal Records View */}
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
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={handleDownloadReport}
                        className="text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                      >
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredRecords.map((record) => (
                    <div key={record.id} className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-800/50 rounded-xl p-5 backdrop-blur-sm hover:border-gray-700 transition-all hover:scale-[1.01] shadow-lg">
                      <div className="flex gap-4">
                        <div className="w-20 h-24 bg-gray-800 rounded overflow-hidden shrink-0 border border-gray-700">
                          {record.image ? (
                            <img src={record.image} alt={record.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="text-gray-600" size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="flex items-center gap-2">
                                {record.name}
                                <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusColor(record.status)}`}>
                                  {record.status}
                                </span>
                              </h3>
                              <p className="text-xs text-gray-400">
                                DOB: {record.dob} • {record.recordNumber}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-400">Arrests</p>
                              <p className="text-sm">{record.arrests}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Convictions</p>
                              <p className="text-sm">{record.convictions}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Last Arrest</p>
                              <p className="text-sm">{new Date(record.lastArrest).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="mb-2">
                            <p className="text-xs text-gray-400 mb-1">Charges:</p>
                            <div className="flex flex-wrap gap-1">
                              {record.charges.map((charge, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded">
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

            {/* Case Search View */}
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
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={handleDownloadReport}
                        className="text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                      >
                        <Download size={14} />
                        Export All
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredCases.map((caseItem) => (
                    <div key={caseItem.id} className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-800/50 rounded-xl p-5 backdrop-blur-sm hover:border-gray-700 transition-all hover:scale-[1.01] shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg">{caseItem.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(caseItem.status)}`}>
                              {caseItem.status}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(caseItem.priority)}`}>
                              {caseItem.priority} Priority
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{caseItem.caseNumber}</p>
                        </div>
                        <button
                          onClick={handleDownloadReport}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs flex items-center gap-1"
                        >
                          <Download size={12} />
                        </button>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">Description</p>
                        <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">{caseItem.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800/50 p-3 rounded">
                          <p className="text-xs text-gray-400 mb-1">Date Opened</p>
                          <p className="text-sm flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(caseItem.dateOpened).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded">
                          <p className="text-xs text-gray-400 mb-1">Assigned Detective</p>
                          <p className="text-sm">{caseItem.assignedTo}</p>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded">
                          <p className="text-xs text-gray-400 mb-1">Location</p>
                          <p className="text-sm flex items-center gap-1">
                            <MapPin size={14} />
                            {caseItem.location}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded">
                          <p className="text-xs text-gray-400 mb-1">Number of Suspects</p>
                          <p className="text-sm">{caseItem.suspects.length} suspect(s)</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-2">Suspects</p>
                        <div className="flex flex-wrap gap-2">
                          {caseItem.suspects.map((suspect: string, i: number) => (
                            <div key={i} className="bg-gray-800 px-3 py-2 rounded flex items-center gap-2">
                              <User size={14} className="text-gray-500" />
                              <span className="text-sm">{suspect}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Incident Reports View */}
            {activeNav === 'incidents' && (
              <>
                <div className="mb-6">
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by incident number, type, or location..."
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
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={handleDownloadReport}
                        className="text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                      >
                        <Download size={14} />
                        Export All
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredIncidents.map((incident) => (
                    <div key={incident.id} className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-800/50 rounded-xl p-5 backdrop-blur-sm hover:border-gray-700 transition-all hover:scale-[1.01] shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={18} className="text-red-500" />
                            <h3 className="text-lg">{incident.type}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(incident.severity)}`}>
                              {incident.severity}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(incident.status)}`}>
                              {incident.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{incident.incidentNumber}</p>
                        </div>
                        <button
                          onClick={handleDownloadReport}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs flex items-center gap-1"
                        >
                          <Download size={12} />
                        </button>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">Description</p>
                        <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">{incident.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800/50 p-3 rounded">
                          <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                          <p className="text-sm flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(incident.dateReported).toLocaleDateString()} at {incident.timeReported}
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
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Face/Fingerprint Match Results */}
            {(activeNav === 'face-recognition' || activeNav === 'fingerprint') && showResults ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center border border-red-700/30">
                      <AlertTriangle className="text-red-500" size={20} />
                    </div>
                    <span>Match Results</span>
                    <span className="text-sm font-normal text-gray-500">({currentSuspects.length} candidates)</span>
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadReport}
                      className="text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                    >
                      <Download size={14} />
                      Export
                    </button>
                    <button
                      onClick={handleRefineSearch}
                      className="text-xs font-medium text-gray-300 hover:text-gray-100 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-all"
                    >
                      <Filter size={14} />
                      Refine
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentSuspects.map((suspect, index) => (
                    <div
                      key={suspect.id}
                      className={`bg-gradient-to-br from-gray-900/80 to-gray-900/50 rounded-xl p-5 backdrop-blur-sm transition-all hover:scale-[1.01] ${
                        index === 0 ? 'border-2 border-red-500 shadow-xl shadow-red-900/30 ring-2 ring-red-500/20' : 'border border-gray-800/50 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Photo */}
                        <div className="w-24 h-28 bg-gray-800 rounded-lg overflow-hidden shrink-0 border-2 border-gray-700/50 shadow-lg ring-2 ring-gray-700/30">
                          {suspect.image ? (
                            <img src={suspect.image} alt={suspect.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                              <User className="text-gray-600" size={32} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
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
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(suspect.offenseStatus)}`}>
                              {suspect.offenseStatus}
                            </span>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-1">Charges:</p>
                            <div className="flex flex-wrap gap-1">
                              {suspect.charges.map((charge, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded">
                                  {charge}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Confidence Bar */}
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">
                                  {activeNav === 'face-recognition' ? 'Face Match' : 'Fingerprint Match'}
                                </span>
                                <span className="text-red-400">
                                  {activeNav === 'face-recognition' ? suspect.faceConfidence : suspect.fingerConfidence}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500 rounded-full"
                                  style={{
                                    width: `${activeNav === 'face-recognition' ? suspect.faceConfidence : suspect.fingerConfidence}%`
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
                      ? 'Upload a face image and run a scan to see matches from the database'
                      : 'Upload a fingerprint image and run a scan to see matches from the database'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
              <h2 className="text-xl">Case Details</h2>
              <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-gray-800 rounded">
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

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Priority Level</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedCase.priority)}`}>
                    {selectedCase.priority}
                  </span>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Date Opened</p>
                  <p className="text-sm">{new Date(selectedCase.dateOpened).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Assigned Detective</p>
                  <p className="text-sm">{selectedCase.assignedTo}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Location</p>
                  <p className="text-sm">{selectedCase.location}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-gray-400 mb-3">Description</h4>
                <p className="bg-gray-800 p-4 rounded-lg text-sm">{selectedCase.description}</p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-gray-400 mb-3">Suspects</h4>
                <div className="space-y-2">
                  {selectedCase.suspects.map((suspect: string, i: number) => (
                    <div key={i} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User size={20} className="text-gray-500" />
                        <span className="text-sm">{suspect}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadReport}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download Case File
                </button>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incident Details Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
              <h2 className="text-xl">Incident Report</h2>
              <button onClick={() => setSelectedIncident(null)} className="p-2 hover:bg-gray-800 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-red-500" size={24} />
                  <h3 className="text-2xl">{selectedIncident.type}</h3>
                  <span className={`px-3 py-1 rounded text-xs ${getStatusColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
                <p className="text-gray-400">{selectedIncident.incidentNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedIncident.status)}`}>
                    {selectedIncident.status}
                  </span>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Severity</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                  <p className="text-sm">{new Date(selectedIncident.dateReported).toLocaleDateString()} at {selectedIncident.timeReported}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Reported By</p>
                  <p className="text-sm">{selectedIncident.reportedBy}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-gray-400 mb-3">Location</h4>
                <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-2">
                  <MapPin className="text-red-500" size={20} />
                  <span className="text-sm">{selectedIncident.location}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-gray-400 mb-3">Description</h4>
                <p className="bg-gray-800 p-4 rounded-lg text-sm">{selectedIncident.description}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadReport}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download Report
                </button>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
              <div className="flex items-center gap-3">
                <Settings className="text-red-500" size={24} />
                <h2 className="text-xl">System Settings</h2>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-800 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Account Information */}
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

              {/* System Preferences */}
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
                      onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
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
                      onChange={(e) => setSettings({...settings, autoSave: e.target.checked})}
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
                      onChange={(e) => setSettings({...settings, soundAlerts: e.target.checked})}
                      className="w-5 h-5 accent-red-600"
                    />
                  </label>
                </div>
              </div>

              {/* Security Settings */}
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
                      onChange={(e) => setSettings({...settings, biometricAuth: e.target.checked})}
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

              {/* Database Settings */}
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

              {/* Logout */}
              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut size={18} />
                  Logout from System
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Record Modal */}
      {showFullRecord && selectedSuspect && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
              <h2 className="text-xl">Full Criminal Record</h2>
              <button
                onClick={() => setShowFullRecord(false)}
                className="p-2 hover:bg-gray-800 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-6 mb-6">
                <div className="w-32 h-40 bg-gray-800 rounded overflow-hidden shrink-0 border-2 border-gray-700">
                  {selectedSuspect.image ? (
                    <img src={selectedSuspect.image} alt={selectedSuspect.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="text-gray-600" size={48} />
                    </div>
                  )}
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
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(selectedSuspect.offenseStatus)}`}>
                        {selectedSuspect.offenseStatus}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Last Known Address</p>
                      <p className="flex items-start gap-2 mt-1">
                        <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
                        <span>{selectedSuspect.address || selectedSuspect.lastKnown}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-gray-400 mb-3">Charges</h4>
                <div className="space-y-2">
                  {selectedSuspect.charges.map((charge: string, i: number) => (
                    <div key={i} className="bg-gray-800 p-3 rounded">
                      <p className="text-sm">{charge}</p>
                      <p className="text-xs text-gray-500 mt-1">Case filed: {new Date(2024, i, 15).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-gray-400 mb-3">Biometric Match Confidence</h4>
                <div className="space-y-3">
                  {selectedSuspect.faceConfidence && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Face Recognition</span>
                        <span className="text-red-400">{selectedSuspect.faceConfidence}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${selectedSuspect.faceConfidence}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {selectedSuspect.fingerConfidence && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Fingerprint Match</span>
                        <span className="text-red-400">{selectedSuspect.fingerConfidence}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${selectedSuspect.fingerConfidence}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadReport}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download Report
                </button>
                <button
                  onClick={() => setShowFullRecord(false)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
}
