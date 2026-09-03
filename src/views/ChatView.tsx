import React, { useState, useRef, useEffect } from 'react';
import { useAkra } from '../context/AkraContext';
import { ChatMessage } from '../types';
import {
  Send,
  Image as ImageIcon,
  Mic,
  Smile,
  Check,
  CheckCheck,
  Camera,
  Trash2,
  Reply,
  X,
  Play,
  Pause,
  Volume2,
  Paperclip,
  Search,
  MoreVertical,
  Heart
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    chatMessages,
    sendChatMessage,
    deleteChatMessage,
    markMessagesAsRead,
    isPartnerTyping,
    setMyTyping,
    setActiveTab,
  } = useAkra();

  const [inputVal, setInputVal] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [activeVoicePlayingId, setActiveVoicePlayingId] = useState<string | null>(null);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState(0);
  const [imageUploadUrl, setImageUploadUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Mark messages as read when entering ChatView
  useEffect(() => {
    markMessagesAsRead();
  }, [chatMessages, markMessagesAsRead]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isPartnerTyping]);

  // Voice recording timer
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setVoiceSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Simulated Voice Note Playback
  useEffect(() => {
    let interval: any;
    if (activeVoicePlayingId) {
      interval = setInterval(() => {
        setVoicePlaybackProgress((prev) => {
          if (prev >= 100) {
            setActiveVoicePlayingId(null);
            return 0;
          }
          return prev + 10;
        });
      }, 500);
    } else {
      setVoicePlaybackProgress(0);
    }
    return () => clearInterval(interval);
  }, [activeVoicePlayingId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    setMyTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setMyTyping(false);
    }, 1500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    sendChatMessage(inputVal, 'text', undefined, undefined, replyingTo || undefined);
    setInputVal('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setMyTyping(false);
  };

  const handleFinishVoiceRecord = () => {
    setIsRecordingVoice(false);
    const duration = Math.max(2, voiceSeconds);
    sendChatMessage(
      `Voice note (${duration}s)`,
      'voice',
      undefined,
      duration,
      replyingTo || undefined
    );
    setReplyingTo(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      sendChatMessage('Sent a photo ❤️', 'image', result, undefined, replyingTo || undefined);
      setReplyingTo(null);
    };
    reader.readAsDataURL(file);
  };

  const romanticEmojis = ['❤️', '🥺', '🥰', '🫂', '✨', '☕', '🌙', '💍', '💌', '🌸', '💋', '🥂'];

  const filteredMessages = searchQuery
    ? chatMessages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : chatMessages;

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-[#FAF7F2] rounded-[32px] sm:rounded-[40px] border border-[#E8D5C4] shadow-xs overflow-hidden my-2 sm:my-4">
      {/* Chat Header */}
      <div className="px-5 py-3.5 bg-[#F5F1EB] border-b border-[#E8D5C4] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={partnerUser.avatar}
              alt={partnerUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E8D5C4]"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                partnerUser.isOnline ? 'bg-emerald-500' : 'bg-[#A1887F]'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-base text-[#3E2723]">{partnerUser.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8D5C4] text-[#6D4C41]">
                {partnerUser.nickname}
              </span>
            </div>
            <p className="text-[11px] text-[#8D6E63]">
              {isPartnerTyping ? (
                <span className="text-[#6D4C41] font-semibold animate-pulse">Typing a message... ❤️</span>
              ) : (
                partnerUser.lastSeen
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(prev => !prev)}
            className="p-2 rounded-full text-[#8D6E63] hover:bg-[#E8D5C4]/40 hover:text-[#3E2723] transition"
            title="Search messages"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('photobooth')}
            className="p-2 rounded-full text-[#6D4C41] hover:bg-[#E8D5C4]/40 transition"
            title="Open Photobooth to take photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar (Conditional) */}
      {showSearch && (
        <div className="px-4 py-2 bg-[#F5F1EB] border-b border-[#E8D5C4] flex items-center gap-2">
          <Search className="w-4 h-4 text-[#A1887F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search our memories and texts..."
            className="w-full bg-transparent text-xs text-[#3E2723] focus:outline-none placeholder-[#A1887F]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#A1887F]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF7F2]/60">
        <div className="text-center my-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1887F] px-4 py-1.5 bg-white border border-[#E8D5C4] rounded-full shadow-2xs">
            Private 1-on-1 End-to-End Space
          </span>
        </div>

        {filteredMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Reply Quote Header */}
              {msg.replyTo && (
                <div
                  className={`text-[10px] text-[#8D6E63] bg-white px-3 py-1 rounded-t-lg max-w-[75%] border-l-2 border-[#6D4C41] mb-0.5 truncate border border-b-0 border-[#E8D5C4] ${
                    isMe ? 'mr-1' : 'ml-1'
                  }`}
                >
                  <span className="font-semibold text-[#3E2723]">{msg.replyTo.senderName}:</span>{' '}
                  {msg.replyTo.text}
                </div>
              )}

              <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%]">
                {/* Actions for Partner Messages (Reply) */}
                {!isMe && (
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#A1887F] hover:text-[#3E2723] transition rounded-full hover:bg-[#E8D5C4]/40"
                    title="Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-2.5 shadow-2xs relative ${
                    isMe
                      ? 'bg-[#6D4C41] text-white rounded-br-xs'
                      : 'bg-white text-[#3E2723] border border-[#E8D5C4] rounded-bl-xs'
                  }`}
                >
                  {/* Content: Text, Image, Voice */}
                  {msg.type === 'text' && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
                      {msg.text}
                    </p>
                  )}

                  {msg.type === 'image' && (
                    <div className="space-y-1.5">
                      <img
                        src={msg.mediaUrl}
                        alt="Shared memory"
                        className="rounded-xl max-h-60 w-full object-cover cursor-pointer hover:opacity-95 transition"
                        onClick={() => window.open(msg.mediaUrl, '_blank')}
                      />
                      {msg.text && <p className="text-xs mt-1">{msg.text}</p>}
                    </div>
                  )}

                  {msg.type === 'voice' && (
                    <div className="flex items-center gap-3 py-1">
                      <button
                        onClick={() => {
                          if (activeVoicePlayingId === msg.id) {
                            setActiveVoicePlayingId(null);
                          } else {
                            setActiveVoicePlayingId(msg.id);
                          }
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          isMe ? 'bg-white text-[#6D4C41]' : 'bg-[#FAF7F2] text-[#6D4C41] border border-[#E8D5C4]'
                        }`}
                      >
                        {activeVoicePlayingId === msg.id ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 h-4">
                          {[40, 70, 30, 85, 55, 90, 45, 65, 80, 50, 75, 40].map((height, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all ${
                                isMe
                                  ? activeVoicePlayingId === msg.id && i * 8 <= voicePlaybackProgress
                                    ? 'bg-[#E8D5C4]'
                                    : 'bg-[#A1887F]'
                                  : activeVoicePlayingId === msg.id && i * 8 <= voicePlaybackProgress
                                  ? 'bg-[#6D4C41]'
                                  : 'bg-[#D7CCC8]'
                              }`}
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] opacity-80 mt-0.5 block ${isMe ? 'text-white/80' : 'text-[#8D6E63]'}`}>
                          {activeVoicePlayingId === msg.id ? 'Playing audio...' : `${msg.voiceDuration || 12}s whisper`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bubble Footer: Timestamp & Read Status */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? 'text-white/70' : 'text-[#A1887F]'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isMe && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#E8D5C4]" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-white/50" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-white/50" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions for My Messages (Delete, Reply) */}
                {isMe && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="p-1 text-[#A1887F] hover:text-[#3E2723] transition rounded-full hover:bg-[#E8D5C4]/40"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteChatMessage(msg.id)}
                      className="p-1 text-[#A1887F] hover:text-rose-600 transition rounded-full hover:bg-[#E8D5C4]/40"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Partner Typing Indicator Bubble */}
        {isPartnerTyping && (
          <div className="flex items-center gap-2 text-xs text-[#8D6E63] bg-white border border-[#E8D5C4] px-3.5 py-2 rounded-2xl w-fit shadow-2xs animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-[#6D4C41] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#6D4C41] animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-[#6D4C41] animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1 font-serif italic text-[#6D4C41]">{partnerUser.name} is writing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Quote Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-[#F5F1EB] border-t border-[#E8D5C4] flex items-center justify-between">
          <div className="text-xs text-[#5D4037] truncate">
            <span className="font-semibold text-[#6D4C41]">Replying to {replyingTo.senderName}:</span>{' '}
            <span className="italic">{replyingTo.text}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-[#8D6E63] hover:bg-[#E8D5C4]/40 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Emoji Quick Drawer */}
      {showEmojiPicker && (
        <div className="p-2.5 bg-[#FAF7F2] border-t border-[#E8D5C4] flex items-center justify-between gap-1 overflow-x-auto">
          {romanticEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputVal((prev) => prev + emoji);
              }}
              className="text-xl p-1.5 hover:scale-125 transition active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Voice Recording Banner */}
      {isRecordingVoice && (
        <div className="px-4 py-3 bg-[#FCE4EC] border-t border-[#F8BBD0] flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold text-[#880E4F]">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>Recording voice whisper... {voiceSeconds}s</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecordingVoice(false)}
              className="text-xs text-[#8D6E63] hover:underline px-2 py-1"
            >
              Cancel
            </button>
            <button
              onClick={handleFinishVoiceRecord}
              className="px-4 py-1.5 rounded-full bg-[#6D4C41] text-white text-xs font-semibold shadow-xs hover:bg-[#5D4037]"
            >
              Send Voice Note
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#F5F1EB] border-t border-[#E8D5C4] flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`p-2 rounded-full transition ${
            showEmojiPicker ? 'bg-[#6D4C41] text-white' : 'text-[#8D6E63] hover:bg-[#E8D5C4]/40 hover:text-[#3E2723]'
          }`}
          title="Romantic Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full text-[#8D6E63] hover:bg-[#E8D5C4]/40 hover:text-[#3E2723] transition"
          title="Upload photo"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setIsRecordingVoice(true)}
          className="p-2 rounded-full text-[#8D6E63] hover:bg-[#E8D5C4]/40 hover:text-[#3E2723] transition"
          title="Record voice whisper"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          id="chat-input"
          value={inputVal}
          onChange={handleInputChange}
          placeholder={`Message ${partnerUser.name}... ❤️`}
          className="flex-1 px-4 py-2.5 rounded-full border border-[#E8D5C4] bg-white text-sm text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#6D4C41] transition"
        />

        {/* Send Button */}
        <button
          type="submit"
          id="chat-send-btn"
          disabled={!inputVal.trim()}
          className={`p-2.5 rounded-full text-white transition shadow-xs ${
            inputVal.trim()
              ? 'bg-[#6D4C41] hover:bg-[#5D4037] active:scale-95'
              : 'bg-[#D7CCC8] cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
