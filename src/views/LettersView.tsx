import React, { useState } from 'react';
import { useAkra } from '../context/AkraContext';
import { Letter } from '../types';
import {
  Mail,
  Lock,
  Unlock,
  Plus,
  Heart,
  Calendar,
  Sparkles,
  X,
  Scroll,
  Send,
  AlertCircle
} from 'lucide-react';

export const LettersView: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    letters,
    markLetterRead,
    addLetter,
  } = useAkra();

  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Compose State
  const [title, setTitle] = useState('Open when you miss me');
  const [category, setCategory] = useState<Letter['category']>('miss_you');
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState('');

  const handleOpenLetter = (letter: Letter) => {
    // Check condition if scheduled date
    if (letter.unlockDate) {
      const targetDate = new Date(letter.unlockDate);
      if (targetDate > new Date()) {
        alert(`This envelope is sealed until ${letter.unlockDate}. Please wait for that day! ❤️`);
        return;
      }
    }

    markLetterRead(letter.id);
    setSelectedLetter({ ...letter, isRead: true });
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addLetter({
      title: title.trim(),
      category,
      content: content.trim(),
      unlockDate: unlockDate.trim() || undefined,
      waxSealColor: '#bf4974',
    });

    setTitle('');
    setContent('');
    setUnlockDate('');
    setShowComposeModal(false);
  };

  const presets = [
    { title: 'Open when you miss me most', cat: 'miss_you' as const },
    { title: 'Open when you cannot sleep', cat: 'sad' as const },
    { title: 'Open when we have a fight', cat: 'sad' as const },
    { title: 'Open on our anniversary', cat: 'anniversary' as const },
    { title: 'Open on your birthday', cat: 'birthday' as const },
  ];

  const getCategoryLabel = (cat: Letter['category']) => {
    switch (cat) {
      case 'miss_you':
        return 'When You Miss Me';
      case 'sad':
        return 'Comfort & Hugs';
      case 'anniversary':
        return 'Anniversary Special';
      case 'birthday':
        return 'Birthday Surprise';
      case 'scheduled':
        return 'Future Capsule';
      default:
        return 'Love Letter';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8D5C4]">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#6D4C41]" />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#3E2723]">LOVE LETTERS</h1>
          </div>
          <p className="text-xs text-[#8D6E63] font-serif italic">
            "Sealed envelopes for every mood, distance, and midnight longing."
          </p>
        </div>

        <button
          onClick={() => setShowComposeModal(true)}
          id="compose-letter-btn"
          className="px-5 py-2.5 rounded-full bg-[#6D4C41] text-white text-xs font-semibold hover:bg-[#5D4037] transition flex items-center gap-2 shadow-xs self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Sealed Letter</span>
        </button>
      </div>

      {/* Grid of Envelopes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {letters.map((letter) => {
          return (
            <div
              key={letter.id}
              onClick={() => {
                if (letter.isRead) {
                  setSelectedLetter(letter);
                } else {
                  handleOpenLetter(letter);
                }
              }}
              className={`rounded-[32px] p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs group ${
                letter.isRead
                  ? 'bg-white border-[#E8D5C4]'
                  : 'bg-[#FAF7F2] border-[#E8D5C4]'
              }`}
            >
              <div>
                {/* Envelope Seal Icon */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white border border-[#E8D5C4] text-[#6D4C41]">
                    {getCategoryLabel(letter.category)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {letter.isRead ? (
                      <span className="text-[10px] text-[#53a876] font-semibold flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        Opened
                      </span>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#6D4C41] text-white flex items-center justify-center shadow-xs">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-serif font-bold text-base text-[#3E2723] mb-2 group-hover:text-[#6D4C41] transition">
                  {letter.title}
                </h3>

                <p className="text-xs text-[#5D4037] line-clamp-2 italic font-serif leading-relaxed">
                  {letter.isRead ? letter.content : 'Sealed with wax and warmth. Tap to unseal.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E8D5C4] flex items-center justify-between text-[11px] text-[#8D6E63]">
                <span>From {letter.authorName}</span>
                <span>{letter.unlockDate ? `Open on: ${letter.unlockDate}` : 'Unseal anytime'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Letter Reading Modal (Warm Parchment Aesthetic) */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-[#FAF7F2] rounded-[32px] p-6 sm:p-8 shadow-2xl border border-[#E8D5C4] relative max-h-[88vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8D6E63] hover:bg-[#E8D5C4]/40"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Wax Seal Stamp */}
            <div className="w-12 h-12 mx-auto rounded-full bg-[#6D4C41] text-white flex items-center justify-center shadow-md mb-4 ring-4 ring-[#E8D5C4]">
              <Heart className="w-6 h-6 fill-white" />
            </div>

            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#8D6E63] block mb-1">
                {getCategoryLabel(selectedLetter.category)}
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#3E2723]">
                {selectedLetter.title}
              </h2>
              <p className="text-xs text-[#8D6E63] mt-1">
                Penned by {selectedLetter.authorName}
              </p>
            </div>

            {/* Letter Content Styled as Warm Stationery */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8D5C4] text-sm text-[#3E2723] font-serif leading-loose whitespace-pre-wrap shadow-2xs">
              {selectedLetter.content}
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-[#8D6E63]">
              <span>AKRA • Forever & Always</span>
              <button
                onClick={() => setSelectedLetter(null)}
                className="px-5 py-2 rounded-full bg-[#6D4C41] text-white text-xs font-medium hover:bg-[#5D4037] transition shadow-xs"
              >
                Close Envelope
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Letter Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[#FAF7F2] rounded-[32px] p-6 sm:p-8 shadow-2xl border border-[#E8D5C4]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8D5C4] mb-4">
              <h3 className="font-serif font-bold text-base text-[#3E2723]">Write a Sealed Love Letter</h3>
              <button onClick={() => setShowComposeModal(false)} className="p-1 rounded-full text-[#8D6E63] hover:bg-[#E8D5C4]/40">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleComposeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#8D6E63] mb-1">Envelope Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Open when you miss my laugh"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D5C4] bg-white text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => {
                      setTitle(p.title);
                      setCategory(p.cat);
                    }}
                    className="text-[11px] px-3 py-1 rounded-full bg-white border border-[#E8D5C4] text-[#6D4C41] hover:bg-[#FAF7F2] transition"
                  >
                    {p.title}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#8D6E63] mb-1">Letter Content</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write from your heart. They will unseal it when they need it most..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D5C4] bg-white text-xs font-serif leading-relaxed text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#8D6E63] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D5C4] bg-white text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
                  >
                    <option value="miss_you">When You Miss Me</option>
                    <option value="sad">Comfort & Hugs</option>
                    <option value="anniversary">Anniversary Special</option>
                    <option value="birthday">Birthday Surprise</option>
                    <option value="scheduled">Scheduled Date</option>
                    <option value="normal">Standard Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#8D6E63] mb-1">Optional Unlock Date</label>
                  <input
                    type="date"
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D5C4] bg-white text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D5C4]">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2.5 rounded-full border border-[#E8D5C4] text-xs text-[#3E2723] hover:bg-[#F5F1EB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#6D4C41] text-white text-xs font-semibold hover:bg-[#5D4037] transition shadow-xs"
                >
                  Seal with Wax & Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
