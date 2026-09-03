import React, { useState } from 'react';
import { useAkra } from '../context/AkraContext';
import { Milestone } from '../types';
import {
  Milestone as MilestoneIcon,
  Heart,
  Plus,
  Calendar,
  Sparkles,
  Music,
  MapPin,
  X,
  PhoneCall,
  Plane,
  Gift
} from 'lucide-react';

export const TimelineView: React.FC = () => {
  const {
    milestones,
    addMilestone,
    currentUser,
    partnerUser,
  } = useAkra();

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('2026-06-15');
  const [desc, setDesc] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [song, setSong] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMilestone({
      title: title.trim(),
      date: dateStr.trim(),
      description: desc.trim(),
      photoUrl: photoUrl.trim() || undefined,
      song: song.trim() || undefined,
      iconType: 'heart',
    });

    setTitle('');
    setDesc('');
    setPhotoUrl('');
    setSong('');
    setShowAddModal(false);
  };

  const getMilestoneIcon = (type?: string) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="w-4 h-4 text-white" />;
      case 'flight':
        return <Plane className="w-4 h-4 text-white" />;
      case 'gift':
        return <Gift className="w-4 h-4 text-white" />;
      default:
        return <Heart className="w-4 h-4 fill-white text-white" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8D5C4]">
        <div>
          <div className="flex items-center gap-2">
            <MilestoneIcon className="w-5 h-5 text-[#6D4C41]" />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#3E2723]">OUR STORY TIMELINE</h1>
          </div>
          <p className="text-xs text-[#8D6E63] font-serif italic">
            "Every step that turned strangers into our whole world."
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          id="add-milestone-btn"
          className="px-5 py-2.5 rounded-full bg-[#6D4C41] text-white text-xs font-semibold hover:bg-[#5D4037] transition flex items-center gap-2 shadow-xs self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Vertical Connected Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-[#E8D5C4] space-y-8 ml-3 sm:ml-4">
        {milestones.map((m) => (
          <div key={m.id} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-full bg-[#6D4C41] flex items-center justify-center shadow-xs ring-4 ring-[#FAF7F2]">
              {getMilestoneIcon(m.iconType)}
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[32px] p-6 border border-[#E8D5C4] shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-[#6D4C41] uppercase tracking-wider">
                  {m.date}
                </span>
                {m.song && (
                  <span className="text-[11px] text-[#8D6E63] flex items-center gap-1 bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#E8D5C4]">
                    <Music className="w-3 h-3 text-[#6D4C41]" />
                    <span>{m.song}</span>
                  </span>
                )}
              </div>

              <h3 className="font-serif font-bold text-base sm:text-lg text-[#3E2723] mb-2">
                {m.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed mb-4">
                {m.description}
              </p>

              {m.photoUrl && (
                <div className="rounded-2xl overflow-hidden aspect-16/9 bg-[#FAF7F2] max-w-md border border-[#E8D5C4]">
                  <img
                    src={m.photoUrl}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#FAF7F2] rounded-[32px] p-6 sm:p-8 shadow-2xl border border-[#E8D5C4]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8D5C4] mb-4">
              <h3 className="font-serif font-bold text-base text-[#3E2723]">Add Milestone</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full text-[#8D6E63] hover:bg-[#E8D5C4]/40">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#8D6E63] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. First Time We Held Hands"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D5C4] bg-white text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#8D6E63] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D5C4] bg-white text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#8D6E63] mb-1">Special Song (Optional)</label>
                  <input
                    type="text"
                    value={song}
                    onChange={(e) => setSong(e.target.value)}
                    placeholder="e.g. Yellow - Coldplay"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D5C4] bg-white text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#8D6E63] mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="How did you feel that day?"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D5C4] bg-white text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#8D6E63] mb-1">Photo URL (Optional)</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D5C4] bg-white text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D5C4]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-full border border-[#E8D5C4] text-xs text-[#3E2723] hover:bg-[#F5F1EB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#6D4C41] text-white text-xs font-semibold hover:bg-[#5D4037] transition shadow-xs"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
