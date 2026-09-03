import React, { useState, useRef } from 'react';
import { useAkra } from '../context/AkraContext';
import { VaultItem } from '../types';
import {
  Lock,
  Unlock,
  Plus,
  Shield,
  Eye,
  Trash2,
  Download,
  Image as ImageIcon,
  Film,
  FileText,
  KeyRound,
  X,
  AlertCircle,
  Upload,
  Sparkles,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export const VaultView: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    vaultItems,
    isVaultUnlocked,
    unlockVault,
    lockVault,
    addVaultItem,
    deleteVaultItem,
    relationship,
    showToast,
  } = useAkra();

  // PIN Keypad State
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [pinError, setPinError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab: 'photos' | 'videos' | 'notes'
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'notes'>('photos');

  // Add Secret Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'photo' | 'video' | 'note'>('photo');
  const [newUrl, setNewUrl] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newPermission, setNewPermission] = useState<'only_me' | 'only_partner' | 'both'>('both');
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);

  // View Secret Modal
  const [viewingItem, setViewingItem] = useState<VaultItem | null>(null);

  const handleKeyPress = (num: string) => {
    if (pinDigits.length < 4) {
      const next = [...pinDigits, num];
      setPinDigits(next);

      if (next.length === 4) {
        const fullPin = next.join('');
        const success = unlockVault(fullPin);
        if (!success) {
          setPinError(true);
          setTimeout(() => {
            setPinDigits([]);
            setPinError(false);
          }, 800);
        } else {
          setPinDigits([]);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinDigits(prev => prev.slice(0, -1));
    setPinError(false);
  };

  // Direct Upload From Device Storage
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      alert('Please upload an image or video file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '');

      addVaultItem({
        title: cleanFileName || (isVideo ? 'Private Video' : 'Private Memory'),
        type: isVideo ? 'video' : 'photo',
        url: result,
        permission: 'both',
      });

      showToast(
        'Vault Item Added 🔒',
        `"${file.name}" saved securely from device storage!`,
        'system'
      );
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Modal file picker preview
  const handleModalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    if (isVideo) {
      setNewType('video');
    } else {
      setNewType('photo');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedFilePreview(result);
      setNewUrl(result);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addVaultItem({
      title: newTitle.trim(),
      type: newType,
      url: newType !== 'note' ? (newUrl.trim() || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80') : undefined,
      noteContent: newType === 'note' ? newNoteContent.trim() : undefined,
      permission: newPermission,
    });

    setNewTitle('');
    setNewUrl('');
    setNewNoteContent('');
    setUploadedFilePreview(null);
    setShowAddModal(false);
  };

  // Authorization filter:
  const authorizedVaultItems = vaultItems.filter((item) => {
    if (item.permission === 'both') return true;
    if (item.permission === 'only_me' && item.uploadedBy === currentUser.id) return true;
    if (item.permission === 'only_partner' && item.uploadedBy !== currentUser.id) return true;
    return false;
  });

  const filteredItems = authorizedVaultItems.filter((item) => {
    if (activeTab === 'photos') return item.type === 'photo';
    if (activeTab === 'videos') return item.type === 'video';
    if (activeTab === 'notes') return item.type === 'note';
    return true;
  });

  // LOCKED STATE: Minimal Luxury Vault Interface (Dark, AKRA Monogram, Circular Lock Ring)
  if (!isVaultUnlocked) {
    return (
      <div className="min-h-[78vh] flex items-center justify-center px-4 py-8 bg-[#FFF0F5]">
        {/* Dark Luxury Glass Card */}
        <div className="w-full max-w-md bg-[#18110F] text-[#FDF8F5] rounded-[36px] p-8 sm:p-10 border border-[#442E28] shadow-2xl relative overflow-hidden text-center animate-in fade-in">
          {/* Subtle moving ambient rose-gold light aura */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#E8C4D0]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Minimal Circular Lock Animation */}
          <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
            {/* Outer rotating dial ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#8D6E63]/40 animate-[spin_24s_linear_infinite]" />

            {/* Middle glowing metallic ring */}
            <div className="absolute inset-2 rounded-full border border-[#D4AF37]/40 shadow-[0_0_20px_rgba(212,175,55,0.15)] flex items-center justify-center">
              {/* Radial tick marks */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-2 bg-[#A1887F]/40"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-28px)`,
                  }}
                />
              ))}
            </div>

            {/* Inner Core: AKRA Crest Monogram */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-b from-[#2B1B17] to-[#160D0B] border border-[#5D4037] shadow-inner flex flex-col items-center justify-center">
              <span className="font-serif italic text-2xl font-bold text-[#E8C4D0] tracking-wider">
                A
              </span>
              <Lock className="w-3 h-3 text-[#D4AF37] mt-0.5" />
            </div>
          </div>

          {/* Header Typography */}
          <div className="space-y-1 mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-[0.2em] uppercase text-[#FDF8F5]">
              PRIVATE
            </h2>
            <p className="text-xs font-serif italic text-[#E8C4D0] tracking-wide">
              Only for Mama & Akshu
            </p>
            <p className="text-[10px] text-[#A1887F] tracking-tight pt-1">
              End-to-end private encrypted vault • Enter 4-digit code
            </p>
          </div>

          {/* PIN Indicator Dots */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pinDigits.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    pinError
                      ? 'bg-rose-500 scale-125'
                      : isFilled
                      ? 'bg-[#E8C4D0] scale-125 shadow-[0_0_10px_#E8C4D0]'
                      : 'bg-[#3A2722] border border-[#5D4037]'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <p className="text-xs text-rose-400 mb-4 animate-shake font-medium">
              Incorrect Passcode • Default is {relationship.vaultPin}
            </p>
          )}

          {/* Luxury Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="w-15 h-15 rounded-2xl bg-[#241916] border border-[#3E2723] hover:border-[#D4AF37]/50 text-base font-medium text-[#FDF8F5] hover:bg-[#32231F] active:scale-95 transition cursor-pointer"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleKeyPress('0')}
              className="w-15 h-15 rounded-2xl bg-[#241916] border border-[#3E2723] hover:border-[#D4AF37]/50 text-base font-medium text-[#FDF8F5] hover:bg-[#32231F] active:scale-95 transition cursor-pointer"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="w-15 h-15 rounded-2xl bg-[#241916] border border-[#3E2723] hover:border-rose-400/40 text-xs font-semibold text-[#A1887F] hover:text-rose-300 hover:bg-[#32231F] active:scale-95 transition flex items-center justify-center cursor-pointer"
            >
              DEL
            </button>
          </div>

          {/* Quick PIN helper */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#34221D] text-[11px] text-[#8D6E63]">
            <span>Passcode:</span>
            <button
              onClick={() => {
                const code = (relationship.vaultPin || '1122').split('');
                code.forEach((c) => handleKeyPress(c));
              }}
              className="text-[#E8C4D0] underline hover:text-white transition"
            >
              Autofill {relationship.vaultPin || '1122'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED STATE: Sophisticated Gallery
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-in fade-in">
      {/* Hidden file input for device storage upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDeviceFileUpload}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Top Header */}
      <div className="bg-[#FFF0F5] border border-[#F0C9D8] rounded-[28px] p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#5D4037] text-white flex items-center justify-center shadow-xs">
              <Unlock className="w-5 h-5 text-[#E8C4D0]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#3E2723]">
                SECRET VAULT
              </h1>
              <p className="text-xs text-[#795548] mt-0.5">
                Private space for <strong className="text-[#3E2723]">Ragul (Mama)</strong> & <strong className="text-[#3E2723]">Akshya (Akshu)</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* UPLOAD FROM DEVICE STORAGE BUTTON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-full bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition flex items-center gap-2 shadow-xs active:scale-95 cursor-pointer"
            title="Upload photo or video directly from phone / computer storage"
          >
            <Upload className="w-4 h-4" />
            <span>Upload from Storage</span>
          </button>

          {/* Add Secret Modal Trigger */}
          <button
            onClick={() => setShowAddModal(true)}
            id="add-secret-btn"
            className="px-4 py-2.5 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-[#5D4037] text-xs font-semibold hover:bg-[#F8E0E9] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>

          {/* Lock Button */}
          <button
            onClick={lockVault}
            className="px-3.5 py-2.5 rounded-full border border-[#F0C9D8] bg-[#FFF0F5] text-xs font-medium text-[#795548] hover:text-[#3E2723] hover:bg-[#FCEBF2] transition flex items-center gap-1.5 cursor-pointer"
            title="Lock vault immediately"
          >
            <Lock className="w-3.5 h-3.5 text-[#5D4037]" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Media Type Tabs: Photos, Videos, Notes */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
            activeTab === 'photos'
              ? 'bg-[#5D4037] text-white shadow-xs'
              : 'bg-[#FFF0F5] text-[#5D4037] border border-[#F0C9D8] hover:bg-[#FCEBF2]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Photos ({authorizedVaultItems.filter(i => i.type === 'photo').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-[#5D4037] text-white shadow-xs'
              : 'bg-[#FFF0F5] text-[#5D4037] border border-[#F0C9D8] hover:bg-[#FCEBF2]'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Videos ({authorizedVaultItems.filter(i => i.type === 'video').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-[#5D4037] text-white shadow-xs'
              : 'bg-[#FFF0F5] text-[#5D4037] border border-[#F0C9D8] hover:bg-[#FCEBF2]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Private Notes ({authorizedVaultItems.filter(i => i.type === 'note').length})</span>
        </button>
      </div>

      {/* Device Storage Upload Quick Dropzone Banner */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#F0C9D8] hover:border-[#5D4037] bg-[#FFF0F5] hover:bg-[#FCEBF2] rounded-3xl p-6 text-center cursor-pointer transition group"
      >
        <div className="w-12 h-12 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-[#5D4037] group-hover:scale-110 flex items-center justify-center mx-auto mb-2 transition">
          <HardDrive className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-[#3E2723]">
          Click here to select and upload photos or videos from your device storage
        </p>
        <p className="text-[11px] text-[#795548] mt-0.5">
          Files stay private to Mama & Akshu with client encryption
        </p>
      </div>

      {/* Gallery Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-[#FFF0F5] rounded-3xl border border-[#F0C9D8] p-8 space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#FCEBF2] text-[#5D4037] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-serif font-bold text-[#3E2723]">No Secrets In This Category</h3>
          <p className="text-xs text-[#795548] max-w-sm mx-auto">
            Upload from device storage or add a secret note to keep memories safe.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-full bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition"
          >
            Upload from Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isCreator = item.uploadedBy === currentUser.id;
            return (
              <div
                key={item.id}
                className="bg-[#FFF0F5] rounded-3xl border border-[#F0C9D8] overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col justify-between"
              >
                {/* Media Preview */}
                <div
                  onClick={() => setViewingItem(item)}
                  className="cursor-pointer relative aspect-4/3 bg-[#FCEBF2] overflow-hidden flex items-center justify-center"
                >
                  {item.type === 'photo' && item.url && (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  )}

                  {item.type === 'video' && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A110F] text-white p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                        <Film className="w-6 h-6 text-[#E8C4D0]" />
                      </div>
                      <span className="text-xs font-medium truncate max-w-[80%]">{item.title}</span>
                    </div>
                  )}

                  {item.type === 'note' && (
                    <div className="p-5 text-left w-full h-full flex flex-col justify-between bg-[#FCEBF2]">
                      <p className="text-xs text-[#3E2723] font-serif italic line-clamp-4 leading-relaxed">
                        "{item.noteContent}"
                      </p>
                      <span className="text-[10px] text-[#795548] font-mono">
                        Sealed Note
                      </span>
                    </div>
                  )}

                  {/* Permission badge */}
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium">
                    {item.permission === 'both' ? 'Both' : item.permission === 'only_me' ? 'Only You' : 'Partner Only'}
                  </span>
                </div>

                {/* Footer Info */}
                <div className="p-3.5 flex items-center justify-between gap-2 border-t border-[#F0C9D8] bg-[#FFF0F5]">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#3E2723] truncate">{item.title}</p>
                    <p className="text-[10px] text-[#795548]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="p-1.5 rounded-full hover:bg-[#FCEBF2] text-[#5D4037] transition cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {isCreator && (
                      <button
                        onClick={() => deleteVaultItem(item.id)}
                        className="p-1.5 rounded-full hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                        title="Delete from Vault"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Secret Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FFF0F5] border border-[#F0C9D8] rounded-[32px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0C9D8] pb-3">
              <h3 className="font-serif font-bold text-base text-[#3E2723]">Add Secret Entry</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-[#FCEBF2] text-[#795548]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSecret} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#5D4037]">Secret Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Midnight Beach Walks"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#F0C9D8] bg-[#FCEBF2] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>

              {/* Media Type Selector */}
              <div>
                <label className="text-xs font-semibold text-[#5D4037]">Type</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['photo', 'video', 'note'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize border transition cursor-pointer ${
                        newType === t
                          ? 'bg-[#5D4037] text-white border-[#5D4037]'
                          : 'bg-[#FCEBF2] text-[#5D4037] border-[#F0C9D8] hover:bg-[#F8E0E9]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload or Link for Photo/Video */}
              {newType !== 'note' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#5D4037]">
                    Choose from Device Storage or Paste URL
                  </label>
                  <div className="flex gap-2 items-center">
                    <label className="flex-1 px-4 py-2.5 rounded-xl border border-dashed border-[#5D4037] bg-[#FCEBF2] hover:bg-[#F8E0E9] text-xs text-[#5D4037] font-semibold text-center cursor-pointer transition flex items-center justify-center gap-2">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadedFilePreview ? 'File Selected' : 'Select from Device'}</span>
                      <input
                        type="file"
                        accept={newType === 'video' ? 'video/*' : 'image/*'}
                        onChange={handleModalFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Or paste direct image / video URL"
                    className="w-full px-4 py-2 rounded-xl border border-[#F0C9D8] bg-[#FCEBF2] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                  />
                </div>
              )}

              {/* Note Content */}
              {newType === 'note' && (
                <div>
                  <label className="text-xs font-semibold text-[#5D4037]">Note Text</label>
                  <textarea
                    rows={4}
                    required
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Write your secret words..."
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#F0C9D8] bg-[#FCEBF2] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                  />
                </div>
              )}

              {/* Permission Settings */}
              <div>
                <label className="text-xs font-semibold text-[#5D4037]">Who Can View This?</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: 'both', label: 'Both of Us' },
                    { id: 'only_me', label: 'Only Me' },
                    { id: 'only_partner', label: 'Only Partner' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setNewPermission(p.id as any)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        newPermission === p.id
                          ? 'bg-[#5D4037] text-white border-[#5D4037]'
                          : 'bg-[#FCEBF2] text-[#5D4037] border-[#F0C9D8] hover:bg-[#F8E0E9]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#F0C9D8]">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition shadow-xs cursor-pointer"
                >
                  Save Secret
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#FCEBF2] text-xs text-[#795548] hover:bg-[#F8E0E9] transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / View Secret Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#FFF0F5] border border-[#F0C9D8] rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#F0C9D8] bg-[#FCEBF2] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#3E2723]">{viewingItem.title}</h3>
                <p className="text-[10px] text-[#795548]">
                  Uploaded by {viewingItem.uploadedBy === currentUser.id ? 'You' : partnerUser.name}
                </p>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-1.5 rounded-full hover:bg-[#FFF0F5] text-[#795548] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-[#FFF0F5]">
              {viewingItem.type === 'photo' && viewingItem.url && (
                <img
                  src={viewingItem.url}
                  alt={viewingItem.title}
                  className="max-h-[60vh] w-auto rounded-2xl object-contain shadow-md"
                />
              )}

              {viewingItem.type === 'video' && viewingItem.url && (
                <video
                  src={viewingItem.url}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-full rounded-2xl shadow-md"
                />
              )}

              {viewingItem.type === 'note' && (
                <div className="p-6 rounded-2xl bg-[#FCEBF2] border border-[#F0C9D8] text-center max-w-lg space-y-2">
                  <p className="font-serif italic text-base sm:text-lg text-[#3E2723] leading-relaxed">
                    "{viewingItem.noteContent}"
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#F0C9D8] bg-[#FCEBF2] flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 rounded-full bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
