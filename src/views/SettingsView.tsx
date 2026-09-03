import React, { useState } from 'react';
import { useAkra } from '../context/AkraContext';
import { PWAInstallButton } from '../components/PWAInstallButton';
import {
  Settings,
  User,
  Heart,
  Bell,
  Lock,
  Palette,
  Download,
  Trash2,
  KeyRound,
  Shield,
  Smartphone,
  Check,
  AlertTriangle,
  LogOut,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    relationship,
    updateRelationship,
    updateCurrentUserProfile,
    changeUserPassword,
    showToast,
    chatMessages,
    memories,
    letters,
    futureItems,
    milestones,
    logout,
  } = useAkra();

  // Profile Edit State
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [anniversary, setAnniversary] = useState(relationship.anniversaryDate);
  const [nextMeeting, setNextMeeting] = useState(relationship.nextMeetingDate);
  const [nextMeetingTitle, setNextMeetingTitle] = useState(relationship.nextMeetingTitle);
  const [nextMeetingLocation, setNextMeetingLocation] = useState(relationship.nextMeetingLocation);

  // Private Password Update State
  const [oldPassInput, setOldPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState(false);
  const [passChangeError, setPassChangeError] = useState('');

  // Vault PIN Reset State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [pinChangeError, setPinChangeError] = useState('');

  // Notification Toggles
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifPhotos, setNotifPhotos] = useState(true);
  const [notifLetters, setNotifLetters] = useState(true);
  const [notifMovie, setNotifMovie] = useState(true);

  // Sound effects toggle
  const [soundEffects, setSoundEffects] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({ nickname });
    updateRelationship({
      anniversaryDate: anniversary,
      nextMeetingDate: nextMeeting,
      nextMeetingTitle,
      nextMeetingLocation,
    });
    showToast('Profile Updated', 'Profile and relationship dates updated successfully ❤️', 'info');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError('');
    setPassChangeSuccess(false);

    if (!oldPassInput) {
      setPassChangeError('Please enter your current password');
      return;
    }
    if (!newPassInput || newPassInput.length < 4) {
      setPassChangeError('New password must be at least 4 characters');
      return;
    }

    const success = changeUserPassword(currentUser.id, oldPassInput, newPassInput);
    if (!success) {
      setPassChangeError('Current password is incorrect');
      return;
    }

    setPassChangeSuccess(true);
    setOldPassInput('');
    setNewPassInput('');
  };

  const handlePinReset = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess(false);

    if (oldPin !== relationship.vaultPin) {
      setPinChangeError('Current vault PIN does not match.');
      return;
    }
    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      setPinChangeError('New PIN must be 4 digits.');
      return;
    }

    updateRelationship({ vaultPin: newPin });
    setPinChangeSuccess(true);
    setOldPin('');
    setNewPin('');
    showToast('Vault PIN Updated', 'Master PIN reset successfully.', 'info');
  };

  const handleExportData = () => {
    const exportData = {
      spaceId: relationship.id,
      exportedAt: new Date().toISOString(),
      members: [currentUser.name, partnerUser.name],
      anniversary: relationship.anniversaryDate,
      messagesCount: chatMessages.length,
      memoriesCount: memories.length,
      lettersCount: letters.length,
      futureDreamsCount: futureItems.length,
      milestonesCount: milestones.length,
      chatMessages,
      memories,
      letters,
      futureItems,
      milestones,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AKRA-backup-${currentUser.name}-${partnerUser.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export Complete', 'Full AKRA relationship archive exported successfully.', 'info');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-[#F0C9D8]">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#5D4037]" />
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#3E2723]">SETTINGS</h1>
        </div>
        <p className="text-xs text-[#795548] font-serif italic">
          "Configure your private sanctuary, individual security, and memories."
        </p>
      </div>

      {/* Relationship Space Card */}
      <div className="bg-[#FFF0F5] rounded-[32px] p-6 sm:p-8 border border-[#F0C9D8] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5D4037] text-white flex items-center justify-center font-serif font-bold text-lg shadow-2xs">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-[#3E2723]">AKRA Private Space</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-[#5D4037]">
                ID: {relationship.id}
              </span>
            </div>
            <p className="text-xs text-[#795548] mt-0.5">
              Exclusive 2-person cryptographic pairing • {currentUser.name} ({currentUser.nickname}) ♡ {partnerUser.name} ({partnerUser.nickname})
            </p>
          </div>
        </div>

        <PWAInstallButton />
      </div>

      {/* Individual Security & Private Password Card */}
      <div className="bg-[#FFF0F5] rounded-[32px] p-6 sm:p-8 border border-[#F0C9D8] shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0C9D8]">
          <ShieldCheck className="w-4 h-4 text-[#5D4037]" />
          <h2 className="font-serif font-bold text-base text-[#3E2723]">
            {currentUser.name}'s Private Login Password
          </h2>
        </div>

        <p className="text-xs text-[#795548] leading-relaxed">
          Each partner has their own separate login to prevent accidental profile switching and keep personal spaces private. You can change your personal password below:
        </p>

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassInput}
              onChange={(e) => setOldPassInput(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] bg-[#FFF8FA] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassInput}
              onChange={(e) => setNewPassInput(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] bg-[#FFF8FA] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition shadow-xs"
          >
            Update Password
          </button>
        </form>

        {passChangeError && <p className="text-xs text-rose-700 bg-rose-100/70 p-2 rounded-xl border border-rose-300 font-medium">{passChangeError}</p>}
        {passChangeSuccess && <p className="text-xs text-emerald-800 bg-emerald-100/70 p-2 rounded-xl border border-emerald-300 font-medium">Your password was successfully updated!</p>}
      </div>

      {/* Profile & Relationship Dates */}
      <div className="bg-[#FFF0F5] rounded-[32px] p-6 sm:p-8 border border-[#F0C9D8] shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0C9D8]">
          <User className="w-4 h-4 text-[#5D4037]" />
          <h2 className="font-serif font-bold text-base text-[#3E2723]">Partner & Profile Info</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">
                Your Sweet Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. mama or akshu"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] text-xs text-[#3E2723] bg-[#FFF8FA] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">
                Official Anniversary Date
              </label>
              <input
                type="date"
                value={anniversary}
                onChange={(e) => setAnniversary(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] text-xs text-[#3E2723] bg-[#FFF8FA] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0C9D8]">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#795548] block mb-2">Next Reunion Countdown</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#795548] mb-1">Target Date</label>
                <input
                  type="date"
                  value={nextMeeting}
                  onChange={(e) => setNextMeeting(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F0C9D8] text-xs text-[#3E2723] bg-[#FFF8FA] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#795548] mb-1">Trip Name</label>
                <input
                  type="text"
                  value={nextMeetingTitle}
                  onChange={(e) => setNextMeetingTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F0C9D8] text-xs text-[#3E2723] bg-[#FFF8FA] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#795548] mb-1">City / Airport</label>
                <input
                  type="text"
                  value={nextMeetingLocation}
                  onChange={(e) => setNextMeetingLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#F0C9D8] text-xs text-[#3E2723] bg-[#FFF8FA] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Secret Vault Security PIN */}
      <div className="bg-[#FFF0F5] rounded-[32px] p-6 sm:p-8 border border-[#F0C9D8] shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0C9D8]">
          <KeyRound className="w-4 h-4 text-[#5D4037]" />
          <h2 className="font-serif font-bold text-base text-[#3E2723]">Secret Vault PIN Code</h2>
        </div>

        <p className="text-xs text-[#795548]">
          Default master PIN is <span className="font-mono font-bold text-[#5D4037]">{relationship.vaultPin}</span>. You can reset it below:
        </p>

        <form onSubmit={handlePinReset} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">Current PIN</label>
            <input
              type="password"
              maxLength={4}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] bg-[#FFF8FA] text-center font-mono text-sm text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">New 4-Digit PIN</label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] bg-[#FFF8FA] text-center font-mono text-sm text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition shadow-xs"
          >
            Update Vault PIN
          </button>
        </form>

        {pinChangeError && <p className="text-xs text-rose-700 font-medium">{pinChangeError}</p>}
        {pinChangeSuccess && <p className="text-xs text-emerald-800 font-semibold">PIN updated successfully!</p>}
      </div>

      {/* Notifications & Sounds */}
      <div className="bg-[#FFF0F5] rounded-[32px] p-6 sm:p-8 border border-[#F0C9D8] shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0C9D8]">
          <Bell className="w-4 h-4 text-[#5D4037]" />
          <h2 className="font-serif font-bold text-base text-[#3E2723]">Notifications & Audio</h2>
        </div>

        <div className="space-y-3 text-xs">
          {[
            { label: 'Instant message alerts', val: notifMessages, set: setNotifMessages },
            { label: 'Photobooth direct snapshot alerts', val: notifPhotos, set: setNotifPhotos },
            { label: 'New sealed love letter notifications', val: notifLetters, set: setNotifLetters },
            { label: 'Movie night sync room invitations', val: notifMovie, set: setNotifMovie },
            { label: 'Romantic soft chime sounds on tap', val: soundEffects, set: setSoundEffects },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5">
              <span className="text-[#3E2723] font-medium">{item.label}</span>
              <button
                type="button"
                onClick={() => item.set(!item.val)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  item.val ? 'bg-[#5D4037]' : 'bg-[#F0C9D8]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white block transition-transform shadow-xs ${
                    item.val ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Archive Export & Account Space */}
      <div className="bg-[#FFF0F5] rounded-[32px] p-6 sm:p-8 border border-[#F0C9D8] shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0C9D8]">
          <Download className="w-4 h-4 text-[#5D4037]" />
          <h2 className="font-serif font-bold text-base text-[#3E2723]">Export Archive & Space Data</h2>
        </div>

        <p className="text-xs text-[#795548] leading-relaxed">
          Download a complete, offline JSON archive of all your private chats, memories, photo references, love letters, and bucket lists.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            id="export-archive-btn"
            className="px-5 py-2.5 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-xs font-semibold text-[#3E2723] hover:bg-[#EFE5E0] transition flex items-center gap-2 shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#5D4037]" />
            <span>Export AKRA Archive</span>
          </button>

          <button
            onClick={logout}
            className="px-5 py-2.5 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-xs font-semibold text-[#5D4037] hover:bg-[#EFE5E0] hover:text-[#3E2723] transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out of Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
