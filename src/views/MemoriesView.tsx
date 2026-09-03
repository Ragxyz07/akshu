import React, { useState, useRef } from 'react';
import { useAkra } from '../context/AkraContext';
import { Memory } from '../types';
import {
  Image as ImageIcon,
  Plus,
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  X,
  Send,
  Sparkles,
  Camera,
  Upload
} from 'lucide-react';

export const MemoriesView: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    memories,
    addMemory,
    toggleLikeMemory,
    addCommentToMemory,
    showToast,
  } = useAkra();

  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('April 20, 2026');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('Promenade Beach, Puducherry');

  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const parsedDate = new Date(dateStr);
    const year = isNaN(parsedDate.getFullYear()) ? 2026 : parsedDate.getFullYear();

    addMemory({
      title: title.trim(),
      year,
      date: dateStr.trim(),
      imageUrl: imageUrl.trim(),
      caption: caption.trim(),
      location: location.trim() || undefined,
    });

    showToast('Memory Preserved 📸', `"${title}" has been saved to your story.`, 'system');

    setTitle('');
    setImageUrl('');
    setCaption('');
    setShowAddModal(false);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemory || !commentInput.trim()) return;
    addCommentToMemory(selectedMemory.id, commentInput);
    setCommentInput('');

    // Update locally in modal
    setSelectedMemory(prev => prev ? {
      ...prev,
      comments: [
        ...prev.comments,
        {
          id: 'c_' + Date.now(),
          authorId: currentUser.id,
          authorName: currentUser.name,
          text: commentInput.trim(),
          timestamp: 'Just now',
        },
      ],
    } : null);
  };

  // Group memories by Year descending
  const years = Array.from(new Set<number>(memories.map(m => m.year))).sort((a, b) => b - a);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-in fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0C9D8]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#5D4037]" />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#3E2723]">OUR MEMORIES</h1>
          </div>
          <p className="text-xs text-[#795548] font-serif italic">
            "A visual journal of every moment Ragul & Akshya have stolen from the distance."
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          id="add-memory-btn"
          className="px-5 py-2.5 rounded-full bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition flex items-center gap-2 shadow-xs self-start sm:self-auto active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Memory</span>
        </button>
      </div>

      {/* Yearly Sections */}
      {years.map((year) => {
        const yearMemories = memories.filter(m => m.year === year);
        return (
          <section key={year} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-2xl text-[#3E2723]">{year}</span>
              <div className="flex-1 h-[1px] bg-[#F0C9D8]" />
              <span className="text-xs text-[#795548] font-medium">
                {yearMemories.length} moment{yearMemories.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {yearMemories.map((mem) => (
                <div
                  key={mem.id}
                  onClick={() => setSelectedMemory(mem)}
                  className="bg-[#FFF0F5] rounded-[32px] p-4 border border-[#F0C9D8] shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  {/* Photo Frame */}
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#FCEBF2] mb-3 border border-[#F0C9D8]">
                    <img
                      src={mem.imageUrl}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    {mem.location && (
                      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-[#E8C4D0]" />
                        <span>{mem.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Caption & Info */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-serif font-bold text-sm text-[#3E2723] group-hover:text-[#5D4037] transition">
                        {mem.title}
                      </h3>
                      <span className="text-[10px] text-[#795548] whitespace-nowrap">{mem.date}</span>
                    </div>

                    <p className="text-xs text-[#5D4037] line-clamp-2 leading-relaxed mb-3">
                      {mem.caption}
                    </p>
                  </div>

                  {/* Bottom Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F0C9D8] text-[11px] text-[#795548]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeMemory(mem.id);
                      }}
                      className="flex items-center gap-1 hover:text-[#5D4037] transition cursor-pointer"
                    >
                      <Heart className={`w-3.5 h-3.5 ${mem.likedByYou ? 'fill-[#5D4037] text-[#5D4037]' : ''}`} />
                      <span>{mem.likes}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{mem.comments.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Memory Details Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-[#FFF0F5] rounded-[36px] overflow-hidden shadow-2xl border border-[#F0C9D8] max-h-[90vh] flex flex-col">
            <div className="relative aspect-16/10 bg-black flex items-center justify-center">
              <img
                src={selectedMemory.imageUrl}
                alt={selectedMemory.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-[#F0C9D8] pb-3">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#3E2723]">{selectedMemory.title}</h3>
                  <p className="text-xs text-[#795548] flex items-center gap-2 mt-1">
                    <span>{selectedMemory.date}</span>
                    {selectedMemory.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-[#5D4037]" />
                          {selectedMemory.location}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => toggleLikeMemory(selectedMemory.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-[#5D4037] font-semibold text-xs shadow-xs cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${selectedMemory.likedByYou ? 'fill-current' : ''}`} />
                  <span>{selectedMemory.likes}</span>
                </button>
              </div>

              <p className="text-sm text-[#3E2723] leading-relaxed font-serif italic bg-[#FCEBF2] p-4 rounded-2xl border border-[#F0C9D8]">
                "{selectedMemory.caption}"
              </p>

              {/* Comments Thread */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#795548]">
                  Private Notes & Whispers ({selectedMemory.comments.length})
                </h4>

                <div className="space-y-2">
                  {selectedMemory.comments.map((comm) => (
                    <div key={comm.id} className="p-3 rounded-2xl bg-[#FCEBF2] border border-[#F0C9D8] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#3E2723]">{comm.authorName}</span>
                        <span className="text-[10px] text-[#795548]">{comm.timestamp}</span>
                      </div>
                      <p className="text-[#5D4037]">{comm.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Leave a sweet note on this memory..."
                    className="flex-1 px-4 py-2.5 rounded-full border border-[#F0C9D8] bg-[#FCEBF2] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                  />
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    className="p-2.5 rounded-full bg-[#5D4037] text-white hover:bg-[#4E342E] disabled:opacity-40 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#FFF0F5] rounded-[32px] p-6 sm:p-8 shadow-2xl border border-[#F0C9D8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0C9D8] mb-4">
              <h3 className="font-serif font-bold text-base text-[#3E2723]">Save a New Memory</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full text-[#795548] hover:bg-[#FCEBF2]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemorySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">Memory Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Walking together at Promenade Beach"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] bg-[#FCEBF2] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">Photo Image</label>
                <div className="flex gap-2 mb-2">
                  <label className="flex-1 py-2 rounded-xl border border-dashed border-[#5D4037] bg-[#FCEBF2] hover:bg-[#F8E0E9] text-xs text-[#5D4037] font-semibold text-center cursor-pointer flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleDeviceUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste image URL"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] bg-[#FCEBF2] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">Date</label>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    placeholder="April 20, 2026"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] bg-[#FCEBF2] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Puducherry, India"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] bg-[#FCEBF2] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#795548] mb-1">Heartfelt Caption</label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What made this moment unforgettable?"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#F0C9D8] bg-[#FCEBF2] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0C9D8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-full border border-[#F0C9D8] text-xs text-[#3E2723] hover:bg-[#FCEBF2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition shadow-xs cursor-pointer"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
