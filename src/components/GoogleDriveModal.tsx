import React, { useState, useEffect, useCallback } from 'react';
import {
  signInWithGoogle,
  getGoogleAccessToken,
  setGoogleAccessToken,
  listGoogleDriveFiles,
  createGoogleDriveFolder,
  uploadGoogleDriveFile,
  deleteGoogleDriveFile,
  fetchGoogleDriveFileContent,
  findGoogleDriveBackupFile,
  GoogleDriveFileItem,
} from '../utils/firebase';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  // App State & Backup Controls
  autoBackupEnabled: boolean;
  onToggleAutoBackup: (enabled: boolean) => void;
  backupStatus: 'idle' | 'pending' | 'backing_up' | 'success' | 'error' | 'offline';
  lastBackupTime: string | null;
  onBackupNow: () => Promise<void>;
  onRestoreFromDrive: (backupData: any) => void;
  appDataToExport?: {
    config?: any;
    quickTasks?: any[];
    dailyRegister?: any[];
    scratchpadNotes?: string;
    favouriteQuotes?: any[];
    savedPresets?: any[];
  };
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

export default function GoogleDriveModal({
  isOpen,
  onClose,
  autoBackupEnabled,
  onToggleAutoBackup,
  backupStatus,
  lastBackupTime,
  onBackupNow,
  onRestoreFromDrive,
  appDataToExport,
}: GoogleDriveModalProps) {
  const [accessToken, setAccessToken] = useState<string | null>(getGoogleAccessToken());
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Navigation tab inside modal: 'cloud_backup' or 'file_browser'
  const [activeTab, setActiveTab] = useState<'cloud_backup' | 'file_browser'>('cloud_backup');

  // File Browser State
  const [files, setFiles] = useState<GoogleDriveFileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'My Drive' },
  ]);

  // Create Folder / File Modals
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState<boolean>(false);
  const [creatingFolder, setCreatingFolder] = useState<boolean>(false);

  const [newFileName, setNewFileName] = useState<string>('APES_AI_Study_Notes.txt');
  const [newFileContent, setNewFileContent] = useState<string>('');
  const [showCreateFileModal, setShowCreateFileModal] = useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  // Destructive Action Confirmation Modal State
  const [fileToDelete, setFileToDelete] = useState<GoogleDriveFileItem | null>(null);
  const [deletingFile, setDeletingFile] = useState<boolean>(false);

  // View File Content Modal State
  const [viewingFile, setViewingFile] = useState<{ file: GoogleDriveFileItem; content: string } | null>(null);

  // Restore Checkpoint Preview Modal State
  const [previewBackupData, setPreviewBackupData] = useState<any | null>(null);
  const [fetchingBackupPreview, setFetchingBackupPreview] = useState<boolean>(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // General Status Banner
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [manualBackupInProgress, setManualBackupInProgress] = useState<boolean>(false);

  // Sync token on open
  useEffect(() => {
    if (isOpen) {
      const token = getGoogleAccessToken();
      setAccessToken(token);
      if (token && activeTab === 'file_browser') {
        loadFiles(token, currentFolderId, searchQuery);
      }
    }
  }, [isOpen, currentFolderId, activeTab]);

  const loadFiles = useCallback(async (token: string, folderId?: string, query?: string) => {
    setLoadingFiles(true);
    setFileError(null);
    try {
      const res = await listGoogleDriveFiles(token, folderId === 'root' ? undefined : folderId, query);
      setFiles(res.files || []);
    } catch (err: any) {
      console.error('Failed to load Google Drive files:', err);
      setFileError(err.message || 'Failed to fetch files from Google Drive');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogle();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        setStatusMessage('Successfully connected to Google Drive!');
        setTimeout(() => setStatusMessage(null), 3500);
        if (activeTab === 'file_browser') {
          loadFiles(res.accessToken, currentFolderId, searchQuery);
        }
      } else {
        setAuthError('Sign in completed, but access token was not returned.');
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDisconnect = () => {
    setGoogleAccessToken(null);
    setAccessToken(null);
    setStatusMessage('Google Drive disconnected.');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleManualBackup = async () => {
    if (!accessToken) {
      setAuthError('Please connect your Google Drive account first before backing up.');
      return;
    }
    setManualBackupInProgress(true);
    try {
      await onBackupNow();
      setStatusMessage('Manual backup completed successfully! Stored in APES_AI_Master_Backup.json on Google Drive.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Manual backup error:', err);
      alert(`Backup failed: ${err.message || 'Unable to store backup in Google Drive'}`);
    } finally {
      setManualBackupInProgress(false);
    }
  };

  const handleFetchRestorePreview = async () => {
    if (!accessToken) return;
    setFetchingBackupPreview(true);
    setRestoreError(null);
    try {
      const backupFile = await findGoogleDriveBackupFile(accessToken, 'APES_AI_Master_Backup.json');
      if (!backupFile) {
        setRestoreError('No existing backup file "APES_AI_Master_Backup.json" found in your Google Drive.');
        setFetchingBackupPreview(false);
        return;
      }

      const content = await fetchGoogleDriveFileContent(accessToken, backupFile.id);
      const parsed = JSON.parse(content);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid backup file format.');
      }

      setPreviewBackupData(parsed);
    } catch (err: any) {
      console.error('Restore preview error:', err);
      setRestoreError(err.message || 'Failed to read backup from Google Drive.');
    } finally {
      setFetchingBackupPreview(false);
    }
  };

  const confirmRestoreAction = () => {
    if (!previewBackupData) return;
    onRestoreFromDrive(previewBackupData);
    setPreviewBackupData(null);
    setStatusMessage('Dashboard and configuration successfully restored from Google Drive!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      const parentId = currentFolderId === 'root' ? undefined : currentFolderId;
      await createGoogleDriveFolder(accessToken, newFolderName.trim(), parentId);
      setNewFolderName('');
      setShowCreateFolderModal(false);
      setStatusMessage('Folder created in Google Drive!');
      setTimeout(() => setStatusMessage(null), 3500);
      loadFiles(accessToken, currentFolderId, searchQuery);
    } catch (err: any) {
      alert(`Folder creation failed: ${err.message}`);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleCreateTextFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFileName.trim()) return;

    setUploadingFile(true);
    try {
      const parentId = currentFolderId === 'root' ? undefined : currentFolderId;
      await uploadGoogleDriveFile(
        accessToken,
        newFileName.trim(),
        newFileContent,
        'text/plain',
        parentId
      );
      setNewFileName('APES_AI_Study_Notes.txt');
      setNewFileContent('');
      setShowCreateFileModal(false);
      setStatusMessage('File saved to Google Drive!');
      setTimeout(() => setStatusMessage(null), 3500);
      loadFiles(accessToken, currentFolderId, searchQuery);
    } catch (err: any) {
      alert(`File save failed: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  // MANDATORY: Explicit User Confirmation before deleting files from Google Drive
  const confirmDeleteFile = async () => {
    if (!accessToken || !fileToDelete) return;

    setDeletingFile(true);
    try {
      await deleteGoogleDriveFile(accessToken, fileToDelete.id);
      setStatusMessage(`Deleted "${fileToDelete.name}" from Google Drive.`);
      setTimeout(() => setStatusMessage(null), 3500);
      setFileToDelete(null);
      if (activeTab === 'file_browser') {
        loadFiles(accessToken, currentFolderId, searchQuery);
      }
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeletingFile(false);
    }
  };

  const formatBytes = (bytes?: string) => {
    if (!bytes) return '--';
    const b = parseInt(bytes, 10);
    if (isNaN(b)) return '--';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = () => {
    switch (backupStatus) {
      case 'success':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Backed Up & Synced
          </span>
        );
      case 'backing_up':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
            <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Backing Up to Drive...
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Backup Pending
          </span>
        );
      case 'offline':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <span>⚠️</span> Offline
          </span>
        );
      case 'error':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
            <span>❌</span> Backup Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Idle / Ready
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30 flex items-center justify-center text-xl shrink-0">
              📂
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Cloud Backup & Recovery
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  Google Drive API
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Independent automatic backup, cross-device recovery & Google Drive file workspace.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Header */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-950/40 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('cloud_backup')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-t border-x ${
              activeTab === 'cloud_backup'
                ? 'bg-slate-900 border-slate-700 text-cyan-300 border-b-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ Cloud Backup & Recovery Settings
          </button>
          <button
            onClick={() => {
              setActiveTab('file_browser');
              if (accessToken) loadFiles(accessToken, currentFolderId, searchQuery);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-t border-x ${
              activeTab === 'file_browser'
                ? 'bg-slate-900 border-slate-700 text-cyan-300 border-b-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📁 Drive File Explorer
          </button>
        </div>

        {/* Banner notification */}
        {statusMessage && (
          <div className="px-6 py-2.5 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in slide-in-from-top duration-150">
            <span>✅</span> {statusMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900">
          
          {/* TAB 1: CLOUD BACKUP & RECOVERY SETTINGS */}
          {activeTab === 'cloud_backup' && (
            <div className="space-y-6">
              
              {/* 1. Connection Status Card */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      1. Google Drive Connection
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Authenticates directly with Google OAuth. No passwords stored in APES AI.
                    </p>
                  </div>
                  {accessToken ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <span>✓</span> Connected
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Disconnected
                    </span>
                  )}
                </div>

                {!accessToken ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <p className="text-xs text-slate-300">
                      Connect your Google Drive account to enable automatic cloud backups, layout snapshots, and cross-device recovery.
                    </p>
                    {/* Official Google Material Sign-In Button */}
                    <button
                      onClick={handleSignIn}
                      disabled={isSigningIn}
                      className="inline-flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl shadow-lg transition-all border border-slate-200 active:scale-98 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span>{isSigningIn ? 'Connecting...' : 'Connect Google Drive'}</span>
                    </button>
                    {authError && (
                      <div className="text-rose-400 text-xs">{authError}</div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-emerald-400">🛡️</span>
                      <span>Connected for <strong className="text-white">BK NITHILESHVAR</strong></span>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="px-3 py-1 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700 transition-colors"
                    >
                      Disconnect Google Drive
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Automatic Backup Controls */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      2. Automatic Backup Behaviour
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Saves layout changes after edits and runs a periodic 60s background check.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoBackupEnabled}
                      onChange={(e) => onToggleAutoBackup(e.target.checked)}
                      disabled={!accessToken}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 peer-disabled:opacity-40"></div>
                    <span className="ml-2 text-xs font-bold text-slate-200">
                      {autoBackupEnabled ? 'ON' : 'OFF'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Backup Status</div>
                    <div>{getStatusBadge()}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Last Backup Time</div>
                    <div className="text-xs font-mono font-bold text-slate-200">
                      {lastBackupTime || 'No backup performed in this session'}
                    </div>
                  </div>
                </div>

                {/* Backup Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleManualBackup}
                    disabled={!accessToken || manualBackupInProgress}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <span>⚡</span>
                    <span>{manualBackupInProgress ? 'Backing Up...' : 'Backup Now to Drive'}</span>
                  </button>

                  <button
                    onClick={handleFetchRestorePreview}
                    disabled={!accessToken || fetchingBackupPreview}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <span>🔄</span>
                    <span>{fetchingBackupPreview ? 'Reading Drive Backup...' : 'Restore from Drive'}</span>
                  </button>
                </div>

                {restoreError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                    {restoreError}
                  </div>
                )}
              </div>

              {/* 3. Designated Backup File Info */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs space-y-2">
                <div className="font-semibold text-slate-300 flex items-center gap-2">
                  <span>ℹ️</span> Single Designated Backup Standard
                </div>
                <p className="text-slate-400 leading-relaxed">
                  APES AI maintains a single designated backup file named <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">APES_AI_Master_Backup.json</code> in your Google Drive. On every backup, this exact file is updated via Drive multipart update rather than cluttering your storage with unlimited duplicates.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: DRIVE FILE EXPLORER */}
          {activeTab === 'file_browser' && (
            <div className="space-y-4">
              {!accessToken ? (
                <div className="py-12 text-center text-slate-400 text-sm space-y-3">
                  <p>Please connect Google Drive under the Settings tab first to explore files.</p>
                  <button
                    onClick={() => setActiveTab('cloud_backup')}
                    className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl"
                  >
                    Go to Settings
                  </button>
                </div>
              ) : (
                <>
                  {/* Explorer Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 overflow-x-auto py-1">
                      {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={crumb.id + idx}>
                          {idx > 0 && <span className="text-slate-600">/</span>}
                          <button
                            onClick={() => {
                              const target = breadcrumbs[idx];
                              setBreadcrumbs((prev) => prev.slice(0, idx + 1));
                              setCurrentFolderId(target.id === 'root' ? undefined : target.id);
                              setSearchQuery('');
                            }}
                            className={`hover:text-cyan-400 transition-colors font-medium px-1.5 py-0.5 rounded ${
                              idx === breadcrumbs.length - 1 ? 'text-white bg-slate-800' : 'text-slate-400'
                            }`}
                          >
                            {crumb.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowCreateFolderModal(true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
                      >
                        📁+ Folder
                      </button>
                      <button
                        onClick={() => setShowCreateFileModal(true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
                      >
                        📝+ Note
                      </button>
                    </div>
                  </div>

                  {/* File List */}
                  <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                    {loadingFiles ? (
                      <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        <span>Loading Google Drive...</span>
                      </div>
                    ) : fileError ? (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                        {fileError}
                      </div>
                    ) : files.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No files or folders found here.
                      </div>
                    ) : (
                      files.map((file) => {
                        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                        return (
                          <div
                            key={file.id}
                            className="py-2.5 px-3 rounded-xl hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 group border border-transparent hover:border-slate-800"
                          >
                            <div
                              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                              onClick={() => {
                                if (isFolder) {
                                  setCurrentFolderId(file.id);
                                  setBreadcrumbs((prev) => [...prev, { id: file.id, name: file.name }]);
                                }
                              }}
                            >
                              <span className="text-lg">{isFolder ? '📁' : '📄'}</span>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 truncate">
                                  {file.name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {isFolder ? 'Folder' : formatBytes(file.size)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-slate-400 hover:text-cyan-300 text-xs"
                                  title="Open in Drive"
                                >
                                  🔗
                                </a>
                              )}
                              {/* MANDATORY Confirmation Dialog for Deletion */}
                              <button
                                onClick={() => setFileToDelete(file)}
                                className="p-1 text-slate-400 hover:text-rose-400 text-xs"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            APES AI Cloud Backup Engine • <span className="text-slate-300">Single User Master Mode</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700"
          >
            Close
          </button>
        </div>

      </div>

      {/* RESTORE PREVIEW & SAFETY CONFIRMATION DIALOG */}
      {previewBackupData && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xl shrink-0">
                🔄
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Restore Dashboard from Google Drive?</h3>
                <p className="text-xs text-slate-400">Safety Checkpoint Preview</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Backup Timestamp:</span>
                <span className="text-cyan-300 font-bold">
                  {previewBackupData.backupTimestamp
                    ? new Date(previewBackupData.backupTimestamp).toLocaleString()
                    : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Schema Version:</span>
                <span className="text-slate-200">{previewBackupData.schemaVersion || '1.0'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">User UID:</span>
                <span className="text-slate-200 truncate max-w-[200px]">{previewBackupData.userUid || 'Master'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>• Tasks: <strong>{previewBackupData.tasks?.length || 0}</strong></div>
                <div>• Register Log: <strong>{previewBackupData.dailyRegister?.length || 0}</strong></div>
                <div>• Presets: <strong>{previewBackupData.presets?.length || 0}</strong></div>
                <div>• Focus Streak: <strong>{previewBackupData.studyStreak || 0}</strong></div>
              </div>
            </div>

            <p className="text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-relaxed">
              <strong>Confirm Restoration:</strong> Restoring will update your current dashboard layout, widget positions, and custom settings to match this Google Drive checkpoint. Existing historical records will remain safe.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewBackupData(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRestoreAction}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg"
              >
                Confirm & Restore Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG FOR DESTRUCTIVE FILE DELETION */}
      {fileToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete File from Google Drive?</h3>
                <p className="text-xs text-slate-400">Confirmation required before permanent deletion.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="text-slate-300 font-semibold truncate">
                {fileToDelete.name}
              </div>
              <div className="text-slate-500 text-[11px]">
                ID: {fileToDelete.id} | Size: {formatBytes(fileToDelete.size)}
              </div>
            </div>

            <p className="text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              Are you sure you want to permanently delete this item from Google Drive? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={deletingFile}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={deletingFile}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
              >
                {deletingFile ? 'Deleting...' : 'Yes, Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📁</span> Create Folder in Drive
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Folder Name</label>
              <input
                type="text"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. APES AI Study Notes"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateFolderModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingFolder}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl"
              >
                {creatingFolder ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE NOTE / FILE MODAL */}
      {showCreateFileModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateTextFile}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📝</span> Save Note to Drive
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">File Name</label>
              <input
                type="text"
                required
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="APES_AI_Study_Notes.txt"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Note Content</label>
              <textarea
                rows={5}
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                placeholder="Type your notes here..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateFileModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingFile}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl"
              >
                {uploadingFile ? 'Uploading...' : 'Save to Drive'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
