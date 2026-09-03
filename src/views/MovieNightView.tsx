import React, { useState, useRef, useEffect } from 'react';
import { useAkra } from '../context/AkraContext';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Heart,
  Send,
  Sparkles,
  Link as LinkIcon,
  Upload,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Video,
  Eye,
  AlertCircle,
  ExternalLink,
  Tv
} from 'lucide-react';

interface ParsedVideoSource {
  type: 'youtube' | 'vimeo' | 'drive' | 'direct';
  embedUrl: string;
  directUrl?: string;
  id?: string;
}

const parseVideoUrl = (rawUrl: string): ParsedVideoSource => {
  const url = (rawUrl || '').trim();
  if (!url) {
    return { type: 'direct', embedUrl: '', directUrl: '' };
  }

  // 1. YouTube Detection (watch?v=, youtu.be/, shorts/, embed/)
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0`,
      id,
    };
  }

  // 2. Vimeo Detection
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`,
      id: vimeoMatch[3],
    };
  }

  // 3. Google Drive Detection
  if (url.includes('drive.google.com/file/d/')) {
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return {
        type: 'drive',
        embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
        id: driveMatch[1],
      };
    }
  }

  // 4. Default to direct video file / stream
  return {
    type: 'direct',
    embedUrl: url,
    directUrl: url,
  };
};

export const MovieNightView: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    movies,
    watchRoom,
    syncMovieState,
    movieChat,
    sendMovieChatMessage,
    addCustomMovie,
    loadMovieByUrl,
    loadMovieByFile,
    showToast,
  } = useAkra();

  const videoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Video Inputs
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [customTitleInput, setCustomTitleInput] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);

  // Player State
  const [chatInput, setChatInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [flyingHearts, setFlyingHearts] = useState<{ id: number; emoji: string; x: number }[]>([]);

  // Camera Portal State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [cameraViewMode, setCameraViewMode] = useState<'split' | 'pip'>('split');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const currentMovie = movies.find(m => m.id === watchRoom.currentMovieId) || movies[0];
  const parsedSource = parseVideoUrl(currentMovie?.videoUrl || '');

  // Reset error when movie changes
  useEffect(() => {
    setVideoLoadError(false);
  }, [currentMovie?.id, currentMovie?.videoUrl]);

  // Synchronize HTML5 Video element with global watchRoom state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || parsedSource.type !== 'direct') return;

    if (watchRoom.isPlaying && video.paused) {
      video.play().catch(() => {
        // Handled silently
      });
    } else if (!watchRoom.isPlaying && !video.paused) {
      video.pause();
    }

    if (Math.abs(video.currentTime - watchRoom.currentTime) > 1.5) {
      video.currentTime = watchRoom.currentTime;
    }
  }, [watchRoom.isPlaying, watchRoom.currentTime, watchRoom.currentMovieId, parsedSource.type]);

  // Video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || 0);
    }
  };

  // Co-Control Actions
  const handleTogglePlay = () => {
    const nextIsPlaying = !watchRoom.isPlaying;
    const currentVideoTime = videoRef.current?.currentTime || currentTime;
    syncMovieState(nextIsPlaying ? 'play' : 'pause', currentVideoTime);

    if (videoRef.current) {
      if (nextIsPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
    syncMovieState('seek', target);
  };

  const handleJump = (deltaSeconds: number) => {
    const currentT = videoRef.current?.currentTime || currentTime;
    const target = Math.max(0, Math.min(currentT + deltaSeconds, videoDuration || 9999));
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
    syncMovieState('seek', target);
  };

  const handleSelectMovie = (id: string) => {
    syncMovieState('changeMovie', 0, id);
    setVideoLoadError(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Handle URL Link Submission
  const handleLoadUrlMovie = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = videoUrlInput.trim();
    if (!cleanUrl) return;

    loadMovieByUrl(cleanUrl, customTitleInput || undefined);
    setVideoUrlInput('');
    setCustomTitleInput('');
    setIsAddingUrl(false);
    setVideoLoadError(false);
  };

  // Preset sample videos to test
  const handleLoadPreset = (url: string, title: string) => {
    loadMovieByUrl(url, title);
    setIsAddingUrl(false);
    setVideoLoadError(false);
  };

  // Handle Local Video Storage File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadMovieByFile(file);
      setVideoLoadError(false);
      showToast('Video Loaded from Storage 🍿', `"${file.name}" ready to watch!`, 'movie');
    }
  };

  // Camera Management
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (selfVideoRef.current) {
        selfVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraError('Could not connect camera/mic. Check browser permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    if (selfVideoRef.current) {
      selfVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isCameraActive && selfVideoRef.current && cameraStream) {
      selfVideoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream, cameraViewMode]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle Chat and Emoji Reactions
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMovieChatMessage(chatInput);
    setChatInput('');
  };

  const handleSendReaction = (emoji: string) => {
    sendMovieChatMessage(emoji);
    const newHeart = {
      id: Date.now() + Math.random(),
      emoji,
      x: 20 + Math.random() * 60,
    };
    setFlyingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFlyingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-6 animate-in fade-in">
      {/* Top Banner: Co-Control & Distance Header */}
      <div className="bg-[#FFF0F5] border border-[#F0C9D8] rounded-[28px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#5D4037] text-white flex items-center justify-center shadow-xs shrink-0">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#3E2723]">
                Cinema for Two
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-[#5D4037] text-xs font-semibold">
                Ragul & Akshya
              </span>
            </div>
            <p className="text-xs text-[#795548] mt-0.5">
              Synchronized streaming between <strong className="text-[#3E2723]">Puducherry</strong> & <strong className="text-[#3E2723]">Bangalore</strong> • Full playback co-control
            </p>
          </div>
        </div>

        {/* Co-Control Sync Status Tag */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-xs text-[#5D4037]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium">
            Co-Control: {watchRoom.updatedBy ? `Last synced by ${watchRoom.updatedBy}` : 'Ready for both'}
          </span>
        </div>
      </div>

      {/* Video Source Controls: Paste URL or Upload from Local Storage */}
      <div className="bg-[#FFF0F5] border border-[#F0C9D8] rounded-[28px] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#795548]">
            <Sparkles className="w-4 h-4 text-[#5D4037]" />
            <span>Add Video or Stream</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Paste Video Link Button */}
            <button
              onClick={() => setIsAddingUrl(prev => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition ${
                isAddingUrl
                  ? 'bg-[#5D4037] text-white shadow-xs'
                  : 'bg-[#FCEBF2] text-[#5D4037] hover:bg-[#F8E0E9] border border-[#F0C9D8]'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paste Video Link</span>
            </button>

            {/* Upload Video From Storage Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#5D4037] text-white hover:bg-[#4E342E] text-xs font-semibold transition shadow-xs active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload from Storage</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="video/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Paste Link Dropdown Form */}
        {isAddingUrl && (
          <form onSubmit={handleLoadUrlMovie} className="p-4 rounded-2xl bg-[#FCEBF2] border border-[#F0C9D8] space-y-3 animate-in fade-in">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#5D4037] flex items-center gap-1">
                <span>Video Link (YouTube, Vimeo, Google Drive, MP4 or Web Stream)</span>
              </label>
              <input
                type="url"
                required
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="Paste YouTube link (https://www.youtube.com/watch?v=...) or video URL"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F0C9D8] bg-[#FFF0F5] text-xs text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={customTitleInput}
                onChange={(e) => setCustomTitleInput(e.target.value)}
                placeholder="Custom movie title (optional)"
                className="w-full px-4 py-2 rounded-xl border border-[#F0C9D8] bg-[#FFF0F5] text-xs text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-[#5D4037] text-white font-semibold text-xs hover:bg-[#4E342E] transition shadow-xs"
                >
                  Load & Play in Cinema
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingUrl(false)}
                  className="px-3 py-2 rounded-xl bg-[#FFF0F5] border border-[#F0C9D8] text-xs text-[#795548] hover:bg-[#F8E0E9]"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Quick Presets for Instant Testing */}
            <div className="pt-2 border-t border-[#F0C9D8]/60 flex items-center gap-2 flex-wrap text-[11px] text-[#795548]">
              <span className="font-semibold">Quick test streams:</span>
              <button
                type="button"
                onClick={() => handleLoadPreset('https://www.youtube.com/watch?v=jfKfPfyJRdk', 'Lofi Girl — Beats to Relax / Study')}
                className="px-2.5 py-1 rounded-full bg-[#FFF0F5] border border-[#F0C9D8] hover:bg-white text-[#5D4037] transition"
              >
                ☕ Lo-Fi Cafe Stream
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('https://www.youtube.com/watch?v=1la41n1nQvA', 'Romantic Fireplace & Soft Piano')}
                className="px-2.5 py-1 rounded-full bg-[#FFF0F5] border border-[#F0C9D8] hover:bg-white text-[#5D4037] transition"
              >
                🔥 Cozy Fireplace
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Big Buck Bunny (Direct HD)')}
                className="px-2.5 py-1 rounded-full bg-[#FFF0F5] border border-[#F0C9D8] hover:bg-white text-[#5D4037] transition"
              >
                🎬 Direct MP4 Test
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Cinema Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cinematic Screen & Two Seats */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cinema Theater Container */}
          <div className="relative rounded-[32px] overflow-hidden shadow-xl border border-[#F0C9D8] bg-[#120E0D] p-3 sm:p-5 flex flex-col items-center">
            {/* Ambient Projector Light Cone Shining on the screen */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-amber-100/10 via-[#FCEBF2]/5 to-transparent blur-xl pointer-events-none" />

            {/* Flying Hearts / Popcorn Overlay */}
            {flyingHearts.map(heart => (
              <div
                key={heart.id}
                className="absolute bottom-28 text-3xl pointer-events-none animate-bounce z-40"
                style={{ left: `${heart.x}%`, animationDuration: '1.5s' }}
              >
                {heart.emoji}
              </div>
            ))}

            {/* The Main Screen Frame */}
            <div className="relative w-full aspect-video bg-black rounded-[22px] overflow-hidden shadow-2xl border border-zinc-800 flex items-center justify-center group">
              {/* YouTube / Vimeo / Drive Iframe Embed */}
              {parsedSource.type === 'youtube' || parsedSource.type === 'vimeo' || parsedSource.type === 'drive' ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={parsedSource.embedUrl}
                    title={currentMovie.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  {/* Sync Notice Pill */}
                  <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-[10px] text-amber-200 border border-amber-400/30 flex items-center gap-1.5 pointer-events-none">
                    <Tv className="w-3 h-3 text-amber-300" />
                    <span>Streaming via Web Player • Mama & Akshu</span>
                  </div>
                </div>
              ) : (
                /* Direct HTML5 Video Player */
                <>
                  <video
                    ref={videoRef}
                    src={currentMovie.videoUrl}
                    poster={currentMovie.posterUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onError={() => setVideoLoadError(true)}
                    className="w-full h-full object-contain"
                    playsInline
                    muted={isMuted}
                  />

                  {/* Toggle Play overlay */}
                  <div
                    onClick={handleTogglePlay}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/25 transition"
                  >
                    {!watchRoom.isPlaying && (
                      <div className="w-16 h-16 rounded-full bg-[#5D4037]/90 text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                        <Play className="w-8 h-8 ml-1 fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Video Decode Error Fallback Banner */}
                  {videoLoadError && (
                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 text-white">
                      <AlertCircle className="w-10 h-10 text-amber-400" />
                      <p className="text-sm font-semibold">Video format could not be decoded directly</p>
                      <p className="text-xs text-zinc-300 max-w-md">
                        This link might require an embedded player, or use CORS restrictions. If it is a YouTube link, click below to load as embed.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setVideoLoadError(false);
                            loadMovieByUrl(currentMovie.videoUrl, currentMovie.title);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#6D4C41]"
                        >
                          Reload as Stream
                        </button>
                        <a
                          href={currentMovie.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-200 hover:bg-zinc-700 flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Source</span>
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Floating PIP Camera Preview */}
              {isCameraActive && cameraViewMode === 'pip' && (
                <div className="absolute top-4 right-4 z-30 w-36 sm:w-44 aspect-video rounded-2xl overflow-hidden border-2 border-[#5D4037] shadow-xl bg-black/80">
                  <video
                    ref={selfVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  <div className="absolute bottom-1 left-2 text-[10px] text-white font-medium bg-black/60 px-1.5 py-0.5 rounded">
                    {currentUser.nickname || currentUser.name} (Live)
                  </div>
                </div>
              )}

              {/* Player Control Bar (For Direct Videos) */}
              {parsedSource.type === 'direct' && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 text-white z-20">
                  {/* Scrubbing Progress Bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono text-zinc-300">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={videoDuration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-1.5 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[#F0C9D8]"
                    />
                    <span className="text-[11px] font-mono text-zinc-300">
                      {formatTime(videoDuration)}
                    </span>
                  </div>

                  {/* Bottom Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleTogglePlay}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer"
                        title={watchRoom.isPlaying ? "Pause for both" : "Play for both"}
                      >
                        {watchRoom.isPlaying ? (
                          <Pause className="w-5 h-5 fill-white" />
                        ) : (
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleJump(-10)}
                        className="p-2 rounded-full hover:bg-white/20 text-white transition text-xs flex items-center gap-0.5 cursor-pointer"
                        title="Rewind 10 seconds"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-[10px]">10s</span>
                      </button>

                      <button
                        onClick={() => handleJump(10)}
                        className="p-2 rounded-full hover:bg-white/20 text-white transition text-xs flex items-center gap-0.5 cursor-pointer"
                        title="Skip 10 seconds"
                      >
                        <RotateCcw className="w-4 h-4 transform -scale-x-100" />
                        <span className="text-[10px]">10s</span>
                      </button>

                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-300 truncate max-w-[150px] sm:max-w-[200px]">
                        {currentMovie.title}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Subtle Cinema Seats marked Mama and Akshu */}
            <div className="w-full max-w-sm mx-auto mt-4 pt-3 border-t border-white/10 flex items-center justify-around text-center">
              {/* Left Seat: Mama */}
              <div className="flex flex-col items-center gap-1 group">
                <div className="w-16 h-10 rounded-t-xl bg-[#2A1D1A] border border-[#5D4037]/60 group-hover:border-[#E8C4D0] transition shadow-inner flex items-center justify-center">
                  <span className="text-[10px] font-serif tracking-wider text-amber-200/90 font-medium">
                    Mama
                  </span>
                </div>
                <div className="w-18 h-3 rounded-b-lg bg-[#1E1412] border-t border-black/40" />
                <span className="text-[9px] text-zinc-400">Ragul • Puducherry</span>
              </div>

              {/* Center Heart Glow */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-[#E8C4D0] animate-pulse">❤️</span>
                <span className="text-[8px] tracking-widest uppercase text-zinc-500 mt-1">Our Cinema</span>
              </div>

              {/* Right Seat: Akshu */}
              <div className="flex flex-col items-center gap-1 group">
                <div className="w-16 h-10 rounded-t-xl bg-[#2A1D1A] border border-[#5D4037]/60 group-hover:border-[#E8C4D0] transition shadow-inner flex items-center justify-center">
                  <span className="text-[10px] font-serif tracking-wider text-[#FCEBF2] font-medium">
                    Akshu
                  </span>
                </div>
                <div className="w-18 h-3 rounded-b-lg bg-[#1E1412] border-t border-black/40" />
                <span className="text-[9px] text-zinc-400">Akshya • Bangalore</span>
              </div>
            </div>
          </div>

          {/* Camera Portal Card */}
          <div className="bg-[#FFF0F5] border border-[#F0C9D8] rounded-[28px] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#5D4037]" />
                <h3 className="font-serif font-bold text-sm text-[#3E2723]">
                  Live Video Portal
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    isCameraActive
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-[#5D4037] text-white hover:bg-[#4E342E]'
                  }`}
                >
                  {isCameraActive ? (
                    <>
                      <CameraOff className="w-3.5 h-3.5" />
                      <span>Stop Camera</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>Turn On Camera</span>
                    </>
                  )}
                </button>

                {isCameraActive && (
                  <>
                    <button
                      onClick={() => setIsMicMuted(!isMicMuted)}
                      className={`p-2 rounded-full border transition cursor-pointer ${
                        isMicMuted
                          ? 'bg-rose-100 border-rose-300 text-rose-700'
                          : 'bg-[#FCEBF2] border-[#F0C9D8] text-[#5D4037]'
                      }`}
                      title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                    >
                      {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setCameraViewMode(cameraViewMode === 'split' ? 'pip' : 'split')}
                      className="px-2.5 py-1 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-[#5D4037] text-[11px] font-semibold hover:bg-[#F8E0E9] transition cursor-pointer"
                    >
                      {cameraViewMode === 'split' ? 'PIP Float' : 'Side View'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Camera Feeds Layout */}
            {isCameraActive && cameraViewMode === 'split' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-[#F0C9D8] shadow-inner">
                  <video
                    ref={selfVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{currentUser.name} ({currentUser.nickname || 'You'})</span>
                  </div>
                </div>

                <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-[#F0C9D8] shadow-inner flex items-center justify-center">
                  <img
                    src={partnerUser.avatar}
                    alt={partnerUser.name}
                    className="w-full h-full object-cover opacity-90 filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{partnerUser.name} ({partnerUser.nickname || 'Partner'}) • {partnerUser.city}</span>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#5D4037]/80 text-[10px] text-white font-medium">
                    Live Portal Connected
                  </div>
                </div>
              </div>
            ) : !isCameraActive ? (
              <div className="p-4 rounded-2xl bg-[#FCEBF2] border border-[#F0C9D8] text-center space-y-1">
                <p className="text-xs text-[#3E2723] font-medium">
                  Camera portal is off. Turn on camera anytime to see each other's smiles during the movie!
                </p>
                <p className="text-[11px] text-[#795548]">
                  Both can turn on webcams or mobile cameras to watch together face-to-face.
                </p>
              </div>
            ) : null}

            {cameraError && (
              <p className="text-xs text-rose-700 bg-rose-100/70 p-2 rounded-xl border border-rose-300 text-center">
                {cameraError}
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Shared Playlist & Whispers Chat */}
        <div className="space-y-4">
          {/* Playlist & Movie Switcher */}
          <div className="bg-[#FFF0F5] border border-[#F0C9D8] rounded-[28px] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-[#3E2723]">
                Watch List
              </h3>
              <span className="text-[11px] text-[#795548]">
                {movies.length} available
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {movies.map(movie => {
                const isCurrent = movie.id === watchRoom.currentMovieId;
                return (
                  <div
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie.id)}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-center gap-2.5 ${
                      isCurrent
                        ? 'bg-[#FCEBF2] border-[#5D4037] ring-1 ring-[#5D4037]/30 shadow-xs'
                        : 'bg-[#FFF0F5] border-[#F0C9D8] hover:bg-[#FCEBF2]'
                    }`}
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#3E2723] truncate">
                        {movie.title}
                      </p>
                      <p className="text-[10px] text-[#795548] truncate">
                        {movie.genre} • {movie.duration}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-[#5D4037] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Movie Night Whispers & Chat */}
          <div className="bg-[#FFF0F5] border border-[#F0C9D8] rounded-[28px] overflow-hidden shadow-xs flex flex-col h-[380px]">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-[#F0C9D8] bg-[#FCEBF2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#5D4037]" />
                <span className="font-serif font-bold text-xs text-[#3E2723]">
                  Whispers & Reactions
                </span>
              </div>
              <span className="text-[10px] text-[#795548]">
                {currentUser.nickname || currentUser.name} & {partnerUser.nickname || partnerUser.name}
              </span>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#FFF0F5]">
              {movieChat.map(msg => {
                const isMe = msg.sender === currentUser.name;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-[#5D4037] text-white rounded-br-xs'
                          : 'bg-[#FCEBF2] text-[#3E2723] border border-[#F0C9D8] rounded-bl-xs'
                      }`}
                    >
                      <span className="text-[9px] block opacity-75 mb-0.5 font-bold">
                        {msg.sender}
                      </span>
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className="text-[8px] block opacity-60 text-right mt-0.5">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Reactions Bar */}
            <div className="px-3 py-1.5 bg-[#FCEBF2] border-t border-[#F0C9D8] flex items-center justify-around">
              {['🍿', '❤️', '🥺', '😂', '💋', '🥂', '🛋️'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleSendReaction(emoji)}
                  className="text-lg hover:scale-125 transition active:scale-95 cursor-pointer"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendChat} className="p-2.5 bg-[#FFF0F5] border-t border-[#F0C9D8] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Whisper while watching..."
                className="flex-1 px-3.5 py-2 rounded-full border border-[#F0C9D8] bg-[#FCEBF2] text-xs text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 rounded-full bg-[#5D4037] text-white hover:bg-[#4E342E] disabled:opacity-40 transition shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
