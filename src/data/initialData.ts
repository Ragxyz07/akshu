import { UserProfile, RelationshipInfo, ChatMessage, VaultItem, Memory, Letter, Milestone, FutureItem, MovieItem } from '../types';

export const initialUserLeo: UserProfile = {
  id: 'user_leo',
  name: 'Ragul',
  nickname: 'Mama',
  email: 'ragul@akra.love',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  role: 'you',
  city: 'Puducherry',
  country: 'India',
  lat: 11.9416,
  lng: 79.8083,
  isSharingLocation: true,
  lastLocationUpdate: 'Just now',
  isOnline: true,
  lastSeen: 'Active now',
  statusMessage: 'Missing my Akshu every single second ❤️',
  password: 'mama123',
};

export const initialUserMaya: UserProfile = {
  id: 'user_maya',
  name: 'Akshya',
  nickname: 'Akshu',
  email: 'akshya@akra.love',
  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
  role: 'partner',
  city: 'Bangalore',
  country: 'India',
  lat: 12.9716,
  lng: 77.5946,
  isSharingLocation: true,
  lastLocationUpdate: '2 minutes ago',
  isOnline: true,
  lastSeen: 'Active now',
  statusMessage: 'Counting days until I see my Mama ☕',
  password: 'akshu123',
};

// Relationship started 1 Year, 8 Months, 14 Days prior to Sep 3, 2026 -> Dec 20, 2024
export const initialRelationship: RelationshipInfo = {
  anniversaryDate: '2024-12-20T00:00:00.000Z',
  partnerCode: 'AKRA-LOVE-779',
  nextMeetingDate: '2026-09-21T18:00:00.000Z',
  nextMeetingTitle: 'Reunion in Puducherry Promenade Beach',
  nextMeetingLocation: 'Rock Beach Promenade, Puducherry',
  vaultPin: '1122',
};

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    senderId: 'user_maya',
    senderName: 'Akshya',
    text: 'Good morning mama! Did you have your morning tea in Puducherry? ☕❤️',
    timestamp: '08:15 AM',
    type: 'text',
    status: 'read',
    readAt: '08:16 AM',
    reaction: '❤️',
  },
  {
    id: 'msg_2',
    senderId: 'user_leo',
    senderName: 'Ragul',
    text: 'Just finished, akshu! Listening to your voice note from last night made my whole morning peaceful 🥰',
    timestamp: '08:18 AM',
    type: 'text',
    status: 'read',
    readAt: '08:20 AM',
  },
  {
    id: 'msg_3',
    senderId: 'user_maya',
    senderName: 'Akshya',
    text: 'Bangalore weather is so chilly today! Wishing you were right here holding my hands.',
    timestamp: '08:24 AM',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    status: 'read',
    readAt: '08:26 AM',
    reaction: '✨',
  },
  {
    id: 'msg_4',
    senderId: 'user_leo',
    senderName: 'Ragul',
    text: 'Soon akshu! Only a few days left until our weekend reunion. Counting down every hour.',
    timestamp: '08:28 AM',
    type: 'text',
    replyTo: {
      id: 'msg_3',
      text: 'Bangalore weather is so chilly today! Wishing you were right here holding my hands.',
      senderName: 'Akshya',
    },
    status: 'read',
    readAt: '08:30 AM',
  },
  {
    id: 'msg_5',
    senderId: 'user_maya',
    senderName: 'Akshya',
    text: 'Sent you a little whisper audio note for your evening walk 🎧',
    timestamp: '09:05 AM',
    type: 'voice',
    voiceDuration: 18,
    status: 'read',
    readAt: '09:10 AM',
    reaction: '🥺',
  },
  {
    id: 'msg_6',
    senderId: 'user_maya',
    senderName: 'Akshya',
    text: 'Are we having our synchronized Movie Night tonight mama? I am ready with popcorn! 🍿',
    timestamp: '09:18 AM',
    type: 'text',
    status: 'delivered',
  },
];

export const initialVaultItems: VaultItem[] = [
  {
    id: 'vault_1',
    title: 'The Hand-Written Promise We Signed',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80',
    createdAt: '2025-06-14',
    permission: 'both',
    createdBy: 'user_leo',
    createdByName: 'Ragul',
  },
  {
    id: 'vault_2',
    title: 'Our Puducherry to Bangalore Journey Notes',
    type: 'note',
    noteContent: 'Bus & train route from Puducherry to Bangalore Majestic.\nRemember to bring the special French bakery cookies for akshu and her favorite book!',
    createdAt: '2026-02-10',
    permission: 'both',
    createdBy: 'user_leo',
    createdByName: 'Ragul',
  },
  {
    id: 'vault_3',
    title: 'Late Night Video Call Screenshot',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-04-18',
    permission: 'both',
    createdBy: 'user_maya',
    createdByName: 'Akshya',
  },
  {
    id: 'vault_4',
    title: 'A note just for my eyes: Surprise Gift Ideas for Akshu',
    type: 'note',
    noteContent: '1. Custom silver pendant engraved with "Puducherry ♡ Bangalore".\n2. Handwritten booklet of our 365 favorite moments.\n3. Cozy oversized hoodie sprayed with my favorite scent.',
    createdAt: '2026-07-02',
    permission: 'only_me',
    createdBy: 'user_leo',
    createdByName: 'Ragul',
  },
];

export const initialMemories: Memory[] = [
  {
    id: 'mem_1',
    title: 'Our First Walk on French Quarter Boulevard',
    year: 2026,
    date: 'April 14, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    caption: 'Yellow mustard colonial walls, gentle sea breeze, and you holding my hand like time had stopped completely.',
    location: 'White Town, Pondicherry',
    uploadedBy: 'user_maya',
    uploadedByName: 'Maya',
    likes: 12,
    likedByYou: true,
    comments: [
      {
        id: 'c1',
        authorId: 'user_leo',
        authorName: 'Leo',
        text: 'I will never forget the way your eyes sparkled under the bougainvillea blooms.',
        timestamp: 'Apr 14, 8:40 PM',
      },
    ],
  },
  {
    id: 'mem_2',
    title: 'That Rainy Evening at the Cafe',
    year: 2026,
    date: 'January 22, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    caption: 'Two warm hot chocolates, steam fogging up the glass window, neither of us wanting to check the train departure time.',
    location: 'Amethyst Cafe, Chennai',
    uploadedBy: 'user_leo',
    uploadedByName: 'Leo',
    likes: 8,
    likedByYou: true,
    comments: [
      {
        id: 'c2',
        authorId: 'user_maya',
        authorName: 'Maya',
        text: 'The best hot chocolate in the world because you were across the table ❤️',
        timestamp: 'Jan 22, 10:15 PM',
      },
    ],
  },
  {
    id: 'mem_3',
    title: 'Airport Farewell (Until Next Time)',
    year: 2025,
    date: 'November 18, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80',
    caption: 'The hardest goodbye, but kissing your forehead before security gave me enough strength for the next two months.',
    location: 'Chennai Airport',
    uploadedBy: 'user_maya',
    uploadedByName: 'Maya',
    likes: 19,
    likedByYou: true,
    comments: [
      {
        id: 'c3',
        authorId: 'user_leo',
        authorName: 'Leo',
        text: 'Distance means so little when someone means so much.',
        timestamp: 'Nov 19, 9:02 AM',
      },
    ],
  },
  {
    id: 'mem_4',
    title: 'The Starlit Rooftop Dinner',
    year: 2025,
    date: 'July 9, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=80',
    caption: 'Fairy lights, jazz playing from a small speaker, and pizza on paper plates.',
    location: 'Rooftop Terrace',
    uploadedBy: 'user_leo',
    uploadedByName: 'Leo',
    likes: 15,
    likedByYou: false,
    comments: [],
  },
];

export const initialLetters: Letter[] = [
  {
    id: 'let_1',
    title: 'Open When You Miss Me Most',
    category: 'miss_you',
    content: `My dearest akshu,

If you are opening this, the night feels a little too quiet in Bangalore and the distance from Puducherry feels long. Take a deep breath right now. Close your eyes for five seconds. 

Remember: every kilometer between us is temporary, but what we have built is permanent. I am right here with you in every quiet thought, in every star we both look up at tonight. 

Whenever you miss me, remember our Promenade beach walks and the promises we made. You are the easiest person I have ever loved, and I would wait a thousand lifetimes for you.

Sleep peacefully tonight, my sweet akshu. Tomorrow is one day closer to us.

Forever and always,
Your mama (Ragul)`,
    authorId: 'user_leo',
    authorName: 'Ragul',
    createdAt: '2026-05-10T14:20:00.000Z',
    waxSealColor: '#5D4037',
    isRead: true,
  },
  {
    id: 'let_2',
    title: 'Open When You Are Sad or Overwhelmed',
    category: 'sad',
    content: `Hey my dear akshu,

You don't have to be strong today. It's okay to feel tired, and it's okay to feel heavy. 

I wish I could wrap my arms around you right this second, pull you into my chest, and let you just rest until the world softens. Even though I'm in Puducherry and you're in Bangalore right now, please know you are so deeply cherished.

Drink a warm cup of coffee, put on your favorite cozy hoodie, and let today pass gently. You don't have to carry anything alone anymore. Your mama is right beside you.

Sending you the warmest, tightest hug across the miles.`,
    authorId: 'user_leo',
    authorName: 'Ragul',
    createdAt: '2026-06-18T10:00:00.000Z',
    waxSealColor: '#6D4C41',
    isRead: false,
  },
  {
    id: 'let_3',
    title: 'Our 2nd Anniversary Letter (Locked)',
    category: 'scheduled',
    content: `Happy 2nd Anniversary, mama! 

Two full years of love, late night video calls that lasted till 4 AM, bus trips between Bangalore and Puducherry booked with beating hearts, and building our future together. Looking at who we are today, I am so proud of our patience, our love, and our bond. 

Here is to closing the distance once and for all very soon. I love you so much mama.`,
    authorId: 'user_maya',
    authorName: 'Akshya',
    createdAt: '2026-08-01T12:00:00.000Z',
    unlockDate: '2026-12-20T00:00:00.000Z', // Anniversary lock!
    waxSealColor: '#5D4037',
    isRead: false,
  },
  {
    id: 'let_4',
    title: 'Our Next Reunion Sealed Letter',
    category: 'scheduled',
    content: `If you are reading this, our countdown reached zero! Meet me at the Promenade beach gazebo with your eyes closed akshu. Your mama has a sweet surprise waiting for you.`,
    authorId: 'user_leo',
    authorName: 'Ragul',
    createdAt: '2026-08-20T09:00:00.000Z',
    unlockDate: '2026-09-14T00:00:00.000Z',
    waxSealColor: '#4E342E',
    isRead: false,
  },
];

export const initialMilestones: Milestone[] = [
  {
    id: 'mile_1',
    title: 'The First Spark: We Met',
    date: 'Dec 20, 2024',
    description: 'A cozy evening coffee shop reading corner in Pondicherry. One exchanged smile that completely rewrote our lives.',
    icon: 'heart',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    addedBy: 'Both',
  },
  {
    id: 'mile_2',
    title: 'First 6-Hour Late Night Conversation',
    date: 'Jan 05, 2025',
    description: 'Neither of us wanted to hang up the phone. We talked about childhood dreams, favorite books, and fears until 4:30 AM.',
    icon: 'phone',
    addedBy: 'Maya',
  },
  {
    id: 'mile_3',
    title: 'The First Airport Hug',
    date: 'Feb 14, 2025',
    description: 'Running through Terminal 2 arrivals and crashing into each other’s arms. The moment we realized distance couldn’t stop us.',
    icon: 'sparkles',
    photoUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80',
    addedBy: 'Leo',
  },
  {
    id: 'mile_4',
    title: 'Exchanging Promise Rings',
    date: 'Jun 22, 2025',
    description: 'Under the starlight on Paradise Beach, promising that no distance is greater than our shared commitment.',
    icon: 'ring',
    photoUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80',
    addedBy: 'Maya',
  },
  {
    id: 'mile_5',
    title: 'Our 1-Year Anniversary Milestone',
    date: 'Dec 20, 2025',
    description: '365 days of choosing each other across the miles. We cooked dinner over FaceTime and danced in our living rooms.',
    icon: 'calendar',
    addedBy: 'Both',
  },
  {
    id: 'mile_6',
    title: 'Today & Forever ❤️',
    date: 'Today',
    description: 'Still laughing, still sending random photos, and counting every hour until we permanently close the distance.',
    icon: 'infinity',
    addedBy: 'Both',
  },
];

export const initialFutureItems: FutureItem[] = [
  {
    id: 'fut_1',
    title: 'Watch the Autumn leaves turn red in Kyoto, Japan',
    category: 'places',
    completed: false,
    suggestedBy: 'user_maya',
    suggestedByName: 'Maya',
    notes: 'Rent traditional bikes and find a hidden tea house in Arashiyama.',
  },
  {
    id: 'fut_2',
    title: 'Cook homemade pasta together from scratch on a rainy Sunday',
    category: 'experiences',
    completed: true,
    completedAt: '2026-03-12',
    suggestedBy: 'user_leo',
    suggestedByName: 'Leo',
    notes: 'We made fettuccine and flour was everywhere! One of our happiest days.',
  },
  {
    id: 'fut_3',
    title: 'Watch Before Sunrise trilogy in one cozy weekend marathon',
    category: 'movies',
    completed: false,
    suggestedBy: 'user_maya',
    suggestedByName: 'Maya',
    notes: 'With hot cocoa and lavender candle burning.',
  },
  {
    id: 'fut_4',
    title: 'Try the authentic seafood thali at Villa Shanti terrace',
    category: 'restaurants',
    completed: false,
    suggestedBy: 'user_leo',
    suggestedByName: 'Leo',
    notes: 'Reserved for our reunion dinner!',
  },
  {
    id: 'fut_5',
    title: 'Permanently close the distance and get our keys to our shared home',
    category: 'dreams',
    completed: false,
    suggestedBy: 'user_leo',
    suggestedByName: 'Leo',
    notes: 'The ultimate dream that drives everything we do.',
  },
  {
    id: 'fut_6',
    title: 'Adopt a golden retriever puppy named Mochi',
    category: 'dreams',
    completed: false,
    suggestedBy: 'user_maya',
    suggestedByName: 'Maya',
    notes: 'He will have a little heart tag.',
  },
];

export const initialMovies: MovieItem[] = [
  {
    id: 'mov_1',
    title: 'Sunset over the Seine & Starlit Bridges',
    genre: 'Romantic Journey',
    duration: '14:20',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
    description: 'A soothing evening cruise down the glowing waters of Paris under romantic amber streetlamps.',
  },
  {
    id: 'mov_2',
    title: 'Cozy Rain & Fireplace in the Highlands',
    genre: 'Ambient Atmosphere',
    duration: '22:45',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
    description: 'Gentle raindrops tapping against window panes with soft crackling wood and warm golden light.',
  },
  {
    id: 'mov_3',
    title: 'Stargazing across the Ocean Horizon',
    genre: 'Cosmic Romance',
    duration: '18:10',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    description: 'Watching shooting stars dance across the coastal night sky while waves gently lap the shore.',
  },
];
