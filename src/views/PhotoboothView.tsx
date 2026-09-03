import React, { useState, useRef, useEffect } from 'react';
import { useAkra } from '../context/AkraContext';
import {
  Camera,
  RotateCw,
  Sparkles,
  Send,
  Heart,
  Image as ImageIcon,
  Check,
  Calendar,
  Layers,
  Upload
} from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
  css: string;
  tagColor: string;
}

export const PhotoboothView: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    sendPhotoForYou,
    addMemory,
    setActiveTab,
  } = useAkra();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('warm-film');
  const [caption, setCaption] = useState<string>('Thinking of you right now ❤️');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const filters: FilterOption[] = [
    { id: 'normal', name: 'Original', css: 'none', tagColor: '#6e5145' },
    { id: 'warm-film', name: 'Warm Film', css: 'sepia(0.25) saturate(1.3) contrast(1.05)', tagColor: '#965a3e' },
    { id: 'soft-lilac', name: 'Soft Lilac', css: 'hue-rotate(280deg) saturate(1.15) brightness(1.05)', tagColor: '#8a4ea8' },
    { id: 'vintage-rose', name: 'Vintage Rose', css: 'sepia(0.35) hue-rotate(320deg) contrast(1.1)', tagColor: '#bf4974' },
    { id: 'noir-brown', name: 'Sepia Noir', css: 'sepia(0.85) contrast(1.2) brightness(0.9)', tagColor: '#4a2c22' },
    { id: 'golden-glow', name: 'Golden Hour', css: 'sepia(0.4) saturate(1.5) brightness(1.08)', tagColor: '#b46e25' },
  ];

  // Start Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.warn('Camera access unavailable or restricted in environment:', err);
      setCameraError('Camera access not supported or granted in this environment. You can upload a picture or use preset booth moments.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraFacing]);

  const toggleCameraFacing = () => {
    setCameraFacing(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture Photo with Countdown Shutter
  const triggerCapture = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          snapPhoto();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const snapPhoto = () => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 300);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Apply filter to canvas
        const currentFilterObj = filters.find(f => f.id === activeFilter);
        ctx.filter = currentFilterObj ? currentFilterObj.css : 'none';

        // Mirror if user-facing
        if (cameraFacing === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Reset transform for watermark
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Watermark: Date and AKRA brand
        const now = new Date();
        const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        ctx.filter = 'none';
        ctx.fillStyle = 'rgba(40, 20, 15, 0.65)';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

        ctx.font = 'bold 16px "Playfair Display", serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`AKRA  •  ${currentUser.name} ♡ ${partnerUser.name}`, 20, canvas.height - 15);

        ctx.font = '13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#eed2dd';
        ctx.textAlign = 'right';
        ctx.fillText(`${dateStr} ${timeStr}`, canvas.width - 20, canvas.height - 15);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
      }
    } else {
      // Fallback preset demo image if video element not ready
      setCapturedImage('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendToPartner = () => {
    if (!capturedImage) return;
    sendPhotoForYou(capturedImage, caption);
    setActiveTab('chat');
  };

  const handleSaveToMemories = () => {
    if (!capturedImage) return;
    const now = new Date();
    addMemory({
      title: caption ? caption.slice(0, 30) : 'Photobooth Snapshot',
      year: now.getFullYear(),
      date: now.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }),
      imageUrl: capturedImage,
      caption: caption || 'Captured in AKRA photobooth.',
      location: `${currentUser.city}`,
    });
    setActiveTab('memories');
  };

  const currentFilterObj = filters.find(f => f.id === activeFilter);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#3E2723]">
          PHOTOBOOTH
        </h1>
        <p className="text-xs text-[#8D6E63] mt-1 font-serif italic">
          "Take a photo & send it straight into your private space."
        </p>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Viewfinder / Captured Preview Frame */}
      <div className="relative rounded-[32px] sm:rounded-[40px] bg-[#2A1E17] overflow-hidden shadow-xs border-4 border-white aspect-4/3 flex items-center justify-center ring-1 ring-[#E8D5C4]">
        {/* Shutter Flash Effect */}
        {flashActive && (
          <div className="absolute inset-0 z-40 bg-white animate-out fade-out duration-300" />
        )}

        {/* 3.. 2.. 1.. Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <span className="text-7xl font-serif font-bold text-white animate-ping">
              {countdown}
            </span>
          </div>
        )}

        {capturedImage ? (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Booth snapshot"
              className="w-full h-full object-cover"
              style={{ filter: currentFilterObj?.css }}
            />
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full text-white text-[11px] font-mono">
              Polaroid Stamped
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-[#2A1E17]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{
                filter: currentFilterObj?.css,
                transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
              }}
            />

            {/* Error fallback overlay if camera blocked */}
            {cameraError && (
              <div className="absolute inset-0 bg-[#2A1E17]/95 p-6 flex flex-col items-center justify-center text-center text-white">
                <Camera className="w-10 h-10 text-[#D7CCC8] mb-3" />
                <p className="text-xs text-[#E8D5C4] max-w-sm mb-4 leading-relaxed">
                  {cameraError}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-full bg-[#6D4C41] text-white text-xs font-medium hover:bg-[#5D4037] transition"
                  >
                    Upload a Photo
                  </button>
                  <button
                    onClick={() => {
                      setCapturedImage('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80');
                    }}
                    className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-medium border border-white/20 hover:bg-white/20"
                  >
                    Use Sample Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input for Manual Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Filter Selection Strip */}
      <div>
        <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A1887F]">
          <Layers className="w-3.5 h-3.5 text-[#6D4C41]" />
          <span>Select Tone Filter</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium shrink-0 transition-all border ${
                activeFilter === filter.id
                  ? 'bg-[#6D4C41] text-white border-[#6D4C41] shadow-2xs'
                  : 'bg-white text-[#3E2723] border-[#E8D5C4] hover:bg-[#F5F1EB]'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Caption Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#8D6E63] mb-1.5">
          Add a Caption ❤️
        </label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a sweet message to stamp on the photo..."
          className="w-full px-4 py-3 rounded-2xl border border-[#E8D5C4] bg-white text-sm text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
        />
      </div>

      {/* Controls & Actions */}
      {capturedImage ? (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSendToPartner}
              id="send-photo-partner-btn"
              className="py-3.5 px-4 rounded-full bg-[#6D4C41] text-white font-medium text-sm hover:bg-[#5D4037] transition flex items-center justify-center gap-2 shadow-xs active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Send to {partnerUser.name} ❤️</span>
            </button>

            <button
              onClick={handleSaveToMemories}
              id="save-photo-memories-btn"
              className="py-3.5 px-4 rounded-full bg-[#8D6E63] text-white font-medium text-sm hover:bg-[#795548] transition flex items-center justify-center gap-2 shadow-xs active:scale-98"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Save to Memories</span>
            </button>
          </div>

          <button
            onClick={() => setCapturedImage(null)}
            className="w-full py-2.5 rounded-full border border-[#E8D5C4] text-xs font-medium text-[#3E2723] hover:bg-[#F5F1EB] transition"
          >
            Retake Photo
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4 pt-2">
          {/* Flip Camera Button */}
          <button
            onClick={toggleCameraFacing}
            className="w-12 h-12 rounded-full bg-white border border-[#E8D5C4] flex items-center justify-center text-[#3E2723] hover:bg-[#F5F1EB] transition shadow-2xs"
            title="Flip camera"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Shutter Button */}
          <button
            onClick={triggerCapture}
            id="photobooth-shutter-btn"
            className="w-20 h-20 rounded-full bg-[#6D4C41] hover:bg-[#5D4037] p-1.5 shadow-sm hover:scale-105 active:scale-95 transition flex items-center justify-center"
            title="Take Photo"
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-2 border-[#6D4C41]">
              <Camera className="w-7 h-7 text-[#6D4C41]" />
            </div>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full bg-white border border-[#E8D5C4] flex items-center justify-center text-[#3E2723] hover:bg-[#F5F1EB] transition shadow-2xs"
            title="Upload from device"
          >
            <Upload className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
