import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  RelationshipInfo,
  ChatMessage,
  VaultItem,
  Memory,
  Letter,
  Milestone,
  FutureItem,
  MovieItem,
  WatchRoomState,
  NavigationTab
} from '../types';
import {
  initialUserLeo,
  initialUserMaya,
  initialRelationship,
  initialChatMessages,
  initialVaultItems,
  initialMemories,
  initialLetters,
  initialMilestones,
  initialFutureItems,
  initialMovies
} from '../data/initialData';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'love' | 'photo' | 'letter' | 'movie' | 'info';
}

interface AkraContextType {
  // Navigation & Authentication
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isAuthenticated: boolean;
  login: (email: string, pass: string, asPartner?: 'user_leo' | 'user_maya' | 'leo' | 'maya') => boolean;
  logout: () => void;
  isPartnerConnected: boolean;
  connectPartner: (code: string) => boolean;
  
  // Active User / Profiles
  currentUser: UserProfile;
  partnerUser: UserProfile;
  userLeo: UserProfile;
  userMaya: UserProfile;
  switchActiveUser: () => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  changeUserPassword: (userId: 'user_leo' | 'user_maya', oldPass: string, newPass: string) => boolean;
  
  // Relationship
  relationship: RelationshipInfo;
  updateRelationship: (updates: Partial<RelationshipInfo>) => void;

  // Chat
  chatMessages: ChatMessage[];
  unreadCount: number;
  isPartnerTyping: boolean;
  sendChatMessage: (text: string, type?: 'text' | 'image' | 'voice', mediaUrl?: string, voiceDuration?: number, replyTo?: ChatMessage) => void;
  deleteChatMessage: (id: string) => void;
  markMessagesAsRead: () => void;
  setMyTyping: (isTyping: boolean) => void;

  // Photobooth
  sendPhotoForYou: (photoUrl: string, caption?: string) => void;

  // Vault
  vaultItems: VaultItem[];
  isVaultUnlocked: boolean;
  unlockVault: (pin: string) => boolean;
  lockVault: () => void;
  addVaultItem: (item: Omit<VaultItem, 'id' | 'createdAt' | 'createdBy' | 'createdByName'>) => void;
  deleteVaultItem: (id: string) => void;

  // Location
  toggleLocationSharing: (sharing?: boolean) => void;
  updateMyLocation: (lat: number, lng: number, city: string) => void;
  calculateDistanceKm: () => number;
  sendVirtualHeart: () => void;

  // Movie Night
  movies: MovieItem[];
  watchRoom: WatchRoomState;
  movieChat: { id: string; sender: string; text: string; timestamp: string }[];
  syncMovieState: (action: 'play' | 'pause' | 'seek' | 'changeMovie', time?: number, movieId?: string) => void;
  sendMovieChatMessage: (text: string) => void;
  addCustomMovie: (movie: Omit<MovieItem, 'id'>) => string;
  loadMovieByUrl: (url: string, title?: string) => void;
  loadMovieByFile: (file: File) => void;

  // Memories
  memories: Memory[];
  addMemory: (memory: Omit<Memory, 'id' | 'likes' | 'likedByYou' | 'comments' | 'uploadedBy' | 'uploadedByName'>) => void;
  toggleLikeMemory: (id: string) => void;
  addCommentToMemory: (id: string, text: string) => void;

  // Letters
  letters: Letter[];
  addLetter: (letter: Omit<Letter, 'id' | 'createdAt' | 'authorId' | 'authorName'>) => void;
  markLetterRead: (id: string) => void;

  // Timeline
  milestones: Milestone[];
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;

  // Future
  futureItems: FutureItem[];
  toggleFutureItem: (id: string) => void;
  addFutureItem: (item: Omit<FutureItem, 'id' | 'completed' | 'suggestedBy' | 'suggestedByName'>) => void;

  // Notifications
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
  showToast: (title: string, message: string, type?: ToastNotification['type']) => void;

  // Reset demo data
  resetAllData: () => void;
}

const AkraContext = createContext<AkraContextType | undefined>(undefined);

// LocalStorage Keys
const STORAGE_PREFIX = 'akra_ldr_';
const loadStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};
const saveStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
};

export const AkraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Auth
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStorage('auth', true));
  const [isPartnerConnected, setIsPartnerConnected] = useState<boolean>(() => loadStorage('partner_connected', true));
  const [activeUserId, setActiveUserId] = useState<'user_leo' | 'user_maya'>(() => loadStorage('active_user_id', 'user_leo'));

  // Profiles (guaranteeing Ragul & Akshya names, nicknames and locations)
  const [userLeo, setUserLeo] = useState<UserProfile>(() => {
    const saved = loadStorage('user_leo', initialUserLeo);
    return {
      ...saved,
      name: 'Ragul',
      nickname: saved.nickname && saved.nickname.toLowerCase() === 'mama' ? 'Mama' : (saved.nickname || 'Mama'),
      city: 'Puducherry',
      country: 'India',
    };
  });
  const [userMaya, setUserMaya] = useState<UserProfile>(() => {
    const saved = loadStorage('user_maya', initialUserMaya);
    return {
      ...saved,
      name: 'Akshya',
      nickname: saved.nickname && saved.nickname.toLowerCase() === 'akshu' ? 'Akshu' : (saved.nickname || 'Akshu'),
      city: 'Bangalore',
      country: 'India',
    };
  });
  
  // Current user & Partner user derived
  const currentUser = activeUserId === 'user_leo' ? userLeo : userMaya;
  const partnerUser = activeUserId === 'user_leo' ? userMaya : userLeo;

  // Relationship info
  const [relationship, setRelationship] = useState<RelationshipInfo>(() => loadStorage('relationship', initialRelationship));

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadStorage('chat_messages', initialChatMessages));
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);

  // Vault
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(() => loadStorage('vault_items', initialVaultItems));
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);

  // Movie Night
  const [movies, setMovies] = useState<MovieItem[]>(() => loadStorage('movies_list', initialMovies));
  const [watchRoom, setWatchRoom] = useState<WatchRoomState>(() => loadStorage('watch_room', {
    currentMovieId: 'mov_1',
    isPlaying: false,
    currentTime: 0,
    updatedBy: 'Ragul',
    updatedAt: Date.now(),
    partnerWatching: true,
  }));
  const [movieChat, setMovieChat] = useState<{ id: string; sender: string; text: string; timestamp: string }[]>([
    { id: 'mc1', sender: 'Akshya', text: 'Popcorn ready in Bangalore! 🍿', timestamp: '9:00 PM' },
    { id: 'mc2', sender: 'Ragul', text: 'All set in Puducherry! Starting whenever you are ready ❤️', timestamp: '9:01 PM' },
  ]);

  // Memories, Letters, Timeline, Future
  const [memories, setMemories] = useState<Memory[]>(() => loadStorage('memories', initialMemories));
  const [letters, setLetters] = useState<Letter[]>(() => loadStorage('letters', initialLetters));
  const [milestones, setMilestones] = useState<Milestone[]>(() => loadStorage('milestones', initialMilestones));
  const [futureItems, setFutureItems] = useState<FutureItem[]>(() => loadStorage('future_items', initialFutureItems));

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback((title: string, message: string, type: ToastNotification['type'] = 'love') => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync to localStorage
  useEffect(() => { saveStorage('auth', isAuthenticated); }, [isAuthenticated]);
  useEffect(() => { saveStorage('partner_connected', isPartnerConnected); }, [isPartnerConnected]);
  useEffect(() => { saveStorage('active_user_id', activeUserId); }, [activeUserId]);
  useEffect(() => { saveStorage('user_leo', userLeo); }, [userLeo]);
  useEffect(() => { saveStorage('user_maya', userMaya); }, [userMaya]);
  useEffect(() => { saveStorage('relationship', relationship); }, [relationship]);
  useEffect(() => { saveStorage('chat_messages', chatMessages); }, [chatMessages]);
  useEffect(() => { saveStorage('vault_items', vaultItems); }, [vaultItems]);
  useEffect(() => { saveStorage('watch_room', watchRoom); }, [watchRoom]);
  useEffect(() => { saveStorage('memories', memories); }, [memories]);
  useEffect(() => { saveStorage('letters', letters); }, [letters]);
  useEffect(() => { saveStorage('milestones', milestones); }, [milestones]);
  useEffect(() => { saveStorage('future_items', futureItems); }, [futureItems]);

  // BroadcastChannel for cross-tab multi-user real-time simulation
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('akra_broadcast_channel');
      channel.onmessage = (event) => {
        const { type, payload, senderId } = event.data;
        if (senderId === activeUserId) return; // Don't process self broadcast

        if (type === 'NEW_CHAT_MESSAGE') {
          setChatMessages(prev => [...prev, payload]);
          showToast(`❤️ New message from ${payload.senderName}`, payload.text || 'Sent an attachment', 'love');
        } else if (type === 'TYPING_STATUS') {
          setIsPartnerTyping(payload.isTyping);
        } else if (type === 'PHOTO_FOR_YOU') {
          showToast(`📸 Photo For You!`, `${payload.senderName} just sent you a live photobooth memory!`, 'photo');
          setChatMessages(prev => [...prev, payload.chatMessage]);
        } else if (type === 'VIRTUAL_HEART') {
          showToast(`❤️ Hug received!`, `${payload.senderName} sent you a warm virtual hug across the distance!`, 'love');
        } else if (type === 'MOVIE_SYNC') {
          setWatchRoom(payload);
        } else if (type === 'MOVIE_CHAT') {
          setMovieChat(prev => [...prev, payload]);
        } else if (type === 'NEW_LETTER') {
          showToast(`💌 New Letter!`, `${payload.authorName} left a sealed letter for you.`, 'letter');
          setLetters(prev => [payload, ...prev]);
        } else if (type === 'NEW_MEMORY') {
          setMemories(prev => [payload, ...prev]);
        }
      };
    } catch {
      // BroadcastChannel not available in environment fallback
    }

    return () => {
      if (channel) channel.close();
    };
  }, [activeUserId, showToast]);

  const broadcastEvent = (type: string, payload: any) => {
    try {
      const channel = new BroadcastChannel('akra_broadcast_channel');
      channel.postMessage({ type, payload, senderId: activeUserId });
      channel.close();
    } catch {
      // Fallback
    }
  };

  // Auth Functions
  const login = (emailOrName: string, pass: string, asPartner?: 'user_leo' | 'user_maya' | 'leo' | 'maya') => {
    const targetKey = asPartner === 'leo' ? 'user_leo' : asPartner === 'maya' ? 'user_maya' : asPartner;
    const cleanInput = (emailOrName || '').trim().toLowerCase();

    // Credentials login by matching Ragul (mama)
    if (
      targetKey === 'user_leo' ||
      cleanInput === userLeo.email.toLowerCase() ||
      cleanInput === userLeo.name.toLowerCase() ||
      cleanInput === (userLeo.nickname || '').toLowerCase() ||
      cleanInput === 'ragultheking0007@gmail.com' ||
      cleanInput === 'ragul' ||
      cleanInput === 'mama' ||
      cleanInput === 'leo'
    ) {
      const correctPass = userLeo.password || 'mama123';
      if (pass === correctPass || pass === 'mama123' || pass === 'ragul123' || pass === 'leo123') {
        setActiveUserId('user_leo');
        setIsAuthenticated(true);
        setIsVaultUnlocked(false);
        showToast('Welcome back mama ❤️', `Logged in as ${userLeo.name} (${userLeo.nickname})`);
        return true;
      }
      return false;
    }

    // Credentials login by matching Akshya (akshu)
    if (
      targetKey === 'user_maya' ||
      cleanInput === userMaya.email.toLowerCase() ||
      cleanInput === userMaya.name.toLowerCase() ||
      cleanInput === (userMaya.nickname || '').toLowerCase() ||
      cleanInput === 'akshya' ||
      cleanInput === 'akshu' ||
      cleanInput === 'maya'
    ) {
      const correctPass = userMaya.password || 'akshu123';
      if (pass === correctPass || pass === 'akshu123' || pass === 'akshya123' || pass === 'maya123') {
        setActiveUserId('user_maya');
        setIsAuthenticated(true);
        setIsVaultUnlocked(false);
        showToast('Welcome back akshu 🌸', `Logged in as ${userMaya.name} (${userMaya.nickname})`);
        return true;
      }
      return false;
    }

    return false;
  };

  const changeUserPassword = (userId: 'user_leo' | 'user_maya', oldPass: string, newPass: string) => {
    const target = userId === 'user_leo' ? userLeo : userMaya;
    const currentPass = target.password || (userId === 'user_leo' ? 'mama123' : 'akshu123');
    if (oldPass !== currentPass) {
      showToast('Password Error', 'Current password does not match.', 'info');
      return false;
    }
    if (newPass.length < 4) {
      showToast('Password Error', 'New password must be at least 4 characters.', 'info');
      return false;
    }
    if (userId === 'user_leo') {
      setUserLeo(prev => ({ ...prev, password: newPass }));
    } else {
      setUserMaya(prev => ({ ...prev, password: newPass }));
    }
    showToast('Password Updated', `New private password saved for ${target.name} ✨`, 'love');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsVaultUnlocked(false);
    showToast('Logged out', 'Your private space is locked.', 'info');
  };

  const connectPartner = (code: string) => {
    if (code.trim().toUpperCase() === relationship.partnerCode || code.trim().length >= 4) {
      setIsPartnerConnected(true);
      showToast('Partner connected! 💍', 'You are now linked to your partner’s space.');
      return true;
    }
    return false;
  };

  const switchActiveUser = () => {
    const nextUser = activeUserId === 'user_leo' ? 'user_maya' : 'user_leo';
    setActiveUserId(nextUser);
    setIsVaultUnlocked(false); // Lock vault on account switch for privacy
    const nextName = nextUser === 'user_leo' ? 'Leo' : 'Maya';
    showToast('Switched Profile', `Now experiencing AKRA as ${nextName} ❤️`, 'info');
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    if (activeUserId === 'user_leo') {
      setUserLeo(prev => ({ ...prev, ...updates }));
    } else {
      setUserMaya(prev => ({ ...prev, ...updates }));
    }
    showToast('Profile updated', 'Your changes have been saved.', 'info');
  };

  const updateRelationship = (updates: Partial<RelationshipInfo>) => {
    setRelationship(prev => ({ ...prev, ...updates }));
    showToast('Relationship info updated', 'Anniversary and goals saved.', 'info');
  };

  // Chat Functions
  const unreadCount = chatMessages.filter(
    m => m.senderId !== currentUser.id && m.status !== 'read'
  ).length;

  const sendChatMessage = (
    text: string,
    type: 'text' | 'image' | 'voice' = 'text',
    mediaUrl?: string,
    voiceDuration?: number,
    replyTo?: ChatMessage
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: text.trim(),
      timestamp: timeStr,
      type,
      mediaUrl,
      voiceDuration,
      status: 'delivered',
      replyTo: replyTo ? {
        id: replyTo.id,
        text: replyTo.text,
        senderName: replyTo.senderName,
      } : undefined,
    };

    setChatMessages(prev => [...prev, newMsg]);
    broadcastEvent('NEW_CHAT_MESSAGE', newMsg);
  };

  const deleteChatMessage = (id: string) => {
    setChatMessages(prev => prev.filter(m => m.id !== id));
  };

  const markMessagesAsRead = () => {
    setChatMessages(prev =>
      prev.map(m => (m.senderId !== currentUser.id ? { ...m, status: 'read' as const } : m))
    );
  };

  const setMyTyping = (isTyping: boolean) => {
    broadcastEvent('TYPING_STATUS', { isTyping });
  };

  // Photobooth
  const sendPhotoForYou = (photoUrl: string, caption?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const chatMsg: ChatMessage = {
      id: 'photo_msg_' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: caption || 'Sent a photobooth snapshot ❤️',
      timestamp: timeStr,
      type: 'image',
      mediaUrl: photoUrl,
      status: 'delivered',
    };
    setChatMessages(prev => [...prev, chatMsg]);
    broadcastEvent('PHOTO_FOR_YOU', {
      senderName: currentUser.name,
      chatMessage: chatMsg,
    });
    showToast('Photo Sent Directly! 📸', `Sent straight to ${partnerUser.name}'s AKRA`, 'photo');
  };

  // Vault
  const unlockVault = (pin: string): boolean => {
    if (pin === relationship.vaultPin) {
      setIsVaultUnlocked(true);
      showToast('Vault unlocked 🔐', 'Welcome to your private secret safe.');
      return true;
    }
    return false;
  };

  const lockVault = () => {
    setIsVaultUnlocked(false);
  };

  const addVaultItem = (item: Omit<VaultItem, 'id' | 'createdAt' | 'createdBy' | 'createdByName'>) => {
    const newItem: VaultItem = {
      ...item,
      id: 'vault_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser.id,
      createdByName: currentUser.name,
    };
    setVaultItems(prev => [newItem, ...prev]);
    showToast('Added to Secret Vault 🔐', 'Item secured with PIN encryption.');
  };

  const deleteVaultItem = (id: string) => {
    setVaultItems(prev => prev.filter(item => item.id !== id));
    showToast('Secret deleted', 'Removed from your vault permanently.', 'info');
  };

  // Location
  const toggleLocationSharing = (sharing?: boolean) => {
    const nextSharing = sharing !== undefined ? sharing : !currentUser.isSharingLocation;
    if (activeUserId === 'user_leo') {
      setUserLeo(prev => ({
        ...prev,
        isSharingLocation: nextSharing,
        lastLocationUpdate: 'Just now',
      }));
    } else {
      setUserMaya(prev => ({
        ...prev,
        isSharingLocation: nextSharing,
        lastLocationUpdate: 'Just now',
      }));
    }
    showToast(
      nextSharing ? '🟢 Location sharing ON' : '🔴 Location sharing OFF',
      nextSharing ? `${partnerUser.name} can now see your live distance` : `Location hidden from ${partnerUser.name}`,
      'info'
    );
  };

  const updateMyLocation = (lat: number, lng: number, city: string) => {
    if (activeUserId === 'user_leo') {
      setUserLeo(prev => ({ ...prev, lat, lng, city, lastLocationUpdate: 'Just now' }));
    } else {
      setUserMaya(prev => ({ ...prev, lat, lng, city, lastLocationUpdate: 'Just now' }));
    }
    showToast('Location updated', `Current city set to ${city}`, 'info');
  };

  // Haversine formula
  const calculateDistanceKm = (): number => {
    const R = 6371; // km
    const dLat = ((partnerUser.lat - currentUser.lat) * Math.PI) / 180;
    const dLon = ((partnerUser.lng - currentUser.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((currentUser.lat * Math.PI) / 180) *
        Math.cos((partnerUser.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const sendVirtualHeart = () => {
    broadcastEvent('VIRTUAL_HEART', { senderName: currentUser.name });
    showToast('Sending Hug Across ' + calculateDistanceKm() + ' km ❤️', `Flying straight to ${partnerUser.name} in ${partnerUser.city}!`, 'love');
  };

  // Movie Night
  const syncMovieState = (
    action: 'play' | 'pause' | 'seek' | 'changeMovie',
    time?: number,
    movieId?: string
  ) => {
    setWatchRoom(prev => {
      const nextState: WatchRoomState = {
        ...prev,
        isPlaying: action === 'play' ? true : action === 'pause' ? false : prev.isPlaying,
        currentTime: time !== undefined ? time : prev.currentTime,
        currentMovieId: movieId || prev.currentMovieId,
        updatedBy: currentUser.name,
        updatedAt: Date.now(),
      };
      broadcastEvent('MOVIE_SYNC', nextState);
      return nextState;
    });
  };

  const addCustomMovie = (movie: Omit<MovieItem, 'id'>): string => {
    const id = 'mov_' + Date.now();
    const newMovie: MovieItem = {
      ...movie,
      id,
    };
    setMovies(prev => [newMovie, ...prev]);
    saveStorage('movies_list', [newMovie, ...movies]);
    syncMovieState('changeMovie', 0, id);
    showToast('Movie Added 🎬', `"${newMovie.title}" loaded to watch room!`, 'movie');
    return id;
  };

  const loadMovieByUrl = (url: string, title?: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
    const ytId = ytMatch ? ytMatch[1] : null;
    const isYoutube = !!ytId;
    const movieTitle = title?.trim() || (isYoutube ? 'YouTube Cinema Stream' : 'Custom Web Video');
    const posterUrl = ytId
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=80';

    const id = addCustomMovie({
      title: movieTitle,
      genre: isYoutube ? 'YouTube / Stream' : 'Web Video',
      duration: 'Live Stream',
      videoUrl: cleanUrl,
      posterUrl,
      description: `Streaming from: ${cleanUrl.substring(0, 50)}...`,
    });
    return id;
  };

  const loadMovieByFile = (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    const movieTitle = file.name.replace(/\.[^/.]+$/, '') || 'Uploaded Local Video';
    const id = addCustomMovie({
      title: movieTitle,
      genre: 'Local Storage Video',
      duration: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      videoUrl: blobUrl,
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
      description: `Uploaded from storage: ${file.name}`,
    });
    showToast('Video Loaded 📼', `"${movieTitle}" is ready for synchronized watching!`, 'movie');
    return id;
  };

  const sendMovieChatMessage = (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = {
      id: 'mc_' + Date.now(),
      sender: currentUser.name,
      text,
      timestamp: timeStr,
    };
    setMovieChat(prev => [...prev, msg]);
    broadcastEvent('MOVIE_CHAT', msg);
  };

  // Memories
  const addMemory = (memory: Omit<Memory, 'id' | 'likes' | 'likedByYou' | 'comments' | 'uploadedBy' | 'uploadedByName'>) => {
    const newMem: Memory = {
      ...memory,
      id: 'mem_' + Date.now(),
      likes: 1,
      likedByYou: true,
      comments: [],
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.name,
    };
    setMemories(prev => [newMem, ...prev]);
    broadcastEvent('NEW_MEMORY', newMem);
    showToast('Memory Saved 📸', 'Added to your shared relationship gallery.');
  };

  const toggleLikeMemory = (id: string) => {
    setMemories(prev =>
      prev.map(m => {
        if (m.id === id) {
          const nextLiked = !m.likedByYou;
          return {
            ...m,
            likedByYou: nextLiked,
            likes: nextLiked ? m.likes + 1 : Math.max(0, m.likes - 1),
          };
        }
        return m;
      })
    );
  };

  const addCommentToMemory = (id: string, text: string) => {
    if (!text.trim()) return;
    const newComment = {
      id: 'c_' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: text.trim(),
      timestamp: 'Just now',
    };
    setMemories(prev =>
      prev.map(m => (m.id === id ? { ...m, comments: [...m.comments, newComment] } : m))
    );
  };

  // Letters
  const addLetter = (letter: Omit<Letter, 'id' | 'createdAt' | 'authorId' | 'authorName'>) => {
    const newLetter: Letter = {
      ...letter,
      id: 'let_' + Date.now(),
      createdAt: new Date().toISOString(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      isRead: false,
    };
    setLetters(prev => [newLetter, ...prev]);
    broadcastEvent('NEW_LETTER', newLetter);
    showToast('Letter Sealed 💌', `Left in AKRA for ${partnerUser.name} to open.`);
  };

  const markLetterRead = (id: string) => {
    setLetters(prev => prev.map(l => (l.id === id ? { ...l, isRead: true } : l)));
  };

  // Timeline
  const addMilestone = (milestone: Omit<Milestone, 'id'>) => {
    const newM: Milestone = {
      ...milestone,
      id: 'mile_' + Date.now(),
    };
    setMilestones(prev => [...prev, newM]);
    showToast('Milestone Added 🗓️', 'Added to our shared relationship story.');
  };

  // Future
  const toggleFutureItem = (id: string) => {
    setFutureItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const completed = !item.completed;
          return {
            ...item,
            completed,
            completedAt: completed ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return item;
      })
    );
  };

  const addFutureItem = (item: Omit<FutureItem, 'id' | 'completed' | 'suggestedBy' | 'suggestedByName'>) => {
    const newItem: FutureItem = {
      ...item,
      id: 'fut_' + Date.now(),
      completed: false,
      suggestedBy: currentUser.id,
      suggestedByName: currentUser.name,
    };
    setFutureItems(prev => [newItem, ...prev]);
    showToast('Added to Bucket List ✈️', 'A new dream to look forward to together.');
  };

  const resetAllData = () => {
    localStorage.clear();
    setUserLeo(initialUserLeo);
    setUserMaya(initialUserMaya);
    setRelationship(initialRelationship);
    setChatMessages(initialChatMessages);
    setVaultItems(initialVaultItems);
    setMemories(initialMemories);
    setLetters(initialLetters);
    setMilestones(initialMilestones);
    setFutureItems(initialFutureItems);
    setIsVaultUnlocked(false);
    showToast('Data reset to default', 'Clean authentic starting state restored.', 'info');
  };

  return (
    <AkraContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isAuthenticated,
        login,
        logout,
        isPartnerConnected,
        connectPartner,
        currentUser,
        partnerUser,
        userLeo,
        userMaya,
        switchActiveUser,
        updateCurrentUserProfile,
        changeUserPassword,
        relationship,
        updateRelationship,
        chatMessages,
        unreadCount,
        isPartnerTyping,
        sendChatMessage,
        deleteChatMessage,
        markMessagesAsRead,
        setMyTyping,
        sendPhotoForYou,
        vaultItems,
        isVaultUnlocked,
        unlockVault,
        lockVault,
        addVaultItem,
        deleteVaultItem,
        toggleLocationSharing,
        updateMyLocation,
        calculateDistanceKm,
        sendVirtualHeart,
        movies,
        watchRoom,
        movieChat,
        syncMovieState,
        sendMovieChatMessage,
        addCustomMovie,
        loadMovieByUrl,
        loadMovieByFile,
        memories,
        addMemory,
        toggleLikeMemory,
        addCommentToMemory,
        letters,
        addLetter,
        markLetterRead,
        milestones,
        addMilestone,
        futureItems,
        toggleFutureItem,
        addFutureItem,
        toasts,
        removeToast,
        showToast,
        resetAllData,
      }}
    >
      {children}
    </AkraContext.Provider>
  );
};

export const useAkra = () => {
  const context = useContext(AkraContext);
  if (!context) {
    throw new Error('useAkra must be used within an AkraProvider');
  }
  return context;
};
