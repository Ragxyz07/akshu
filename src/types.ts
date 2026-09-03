export type NavigationTab = 
  | 'home' 
  | 'chat' 
  | 'photobooth' 
  | 'vault' 
  | 'location' 
  | 'movie-night' 
  | 'memories' 
  | 'letters' 
  | 'timeline' 
  | 'future' 
  | 'settings';

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  avatar: string;
  role: 'you' | 'partner';
  city: string;
  country: string;
  lat: number;
  lng: number;
  isSharingLocation: boolean;
  lastLocationUpdate: string;
  isOnline: boolean;
  lastSeen: string;
  statusMessage?: string;
  password?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  voiceDuration?: number;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  status: 'sent' | 'delivered' | 'read';
  readAt?: string;
  reaction?: string;
}

export interface VaultItem {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'note';
  url?: string;
  noteContent?: string;
  createdAt: string;
  permission: 'only_me' | 'only_partner' | 'both';
  createdBy: string;
  createdByName: string;
}

export interface MemoryComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface Memory {
  id: string;
  title: string;
  year: number;
  date: string;
  imageUrl: string;
  caption: string;
  location?: string;
  uploadedBy: string;
  uploadedByName: string;
  likes: number;
  likedByYou: boolean;
  comments: MemoryComment[];
}

export interface Letter {
  id: string;
  title: string;
  content: string;
  category: 'normal' | 'miss_you' | 'sad' | 'anniversary' | 'birthday' | 'scheduled';
  authorId: string;
  authorName: string;
  createdAt: string;
  unlockDate?: string; // ISO date string if scheduled
  waxSealColor?: string;
  isRead?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description: string;
  icon: string;
  photoUrl?: string;
  addedBy: string;
}

export interface FutureItem {
  id: string;
  title: string;
  category: 'places' | 'experiences' | 'movies' | 'restaurants' | 'dreams';
  completed: boolean;
  completedAt?: string;
  suggestedBy: string;
  suggestedByName: string;
  notes?: string;
}

export interface MovieItem {
  id: string;
  title: string;
  genre: string;
  duration: string;
  videoUrl: string;
  posterUrl: string;
  description: string;
}

export interface WatchRoomState {
  currentMovieId: string;
  isPlaying: boolean;
  currentTime: number;
  updatedBy: string;
  updatedAt: number;
  partnerWatching: boolean;
}

export interface RelationshipInfo {
  anniversaryDate: string; // ISO date string
  partnerCode: string;
  nextMeetingDate: string;
  nextMeetingTitle: string;
  nextMeetingLocation: string;
  vaultPin: string;
}
