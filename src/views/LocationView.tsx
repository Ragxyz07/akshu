import React, { useState } from 'react';
import { useAkra } from '../context/AkraContext';
import { Globe3D } from '../components/3d/Globe3D';
import {
  MapPin,
  Compass,
  Navigation,
  Shield,
  Heart,
  Send,
  RefreshCw,
  EyeOff,
  AlertTriangle,
  LocateFixed,
  Globe
} from 'lucide-react';

export const LocationView: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    toggleLocationSharing,
    calculateDistanceKm,
    sendVirtualHeart,
    updateMyLocation,
  } = useAkra();

  const [isSendingHug, setIsSendingHug] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customCity, setCustomCity] = useState(currentUser.city);
  const [showEditCity, setShowEditCity] = useState(false);

  const distanceKm = calculateDistanceKm();
  const canSeePartner = partnerUser.isSharingLocation;

  const handleSendHug = () => {
    setIsSendingHug(true);
    sendVirtualHeart();
    setTimeout(() => setIsSendingHug(false), 2000);
  };

  const handleUpdateDeviceGPS = () => {
    setIsRefreshing(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateMyLocation(pos.coords.latitude, pos.coords.longitude, 'Live GPS Position');
          setIsRefreshing(false);
        },
        () => {
          setTimeout(() => setIsRefreshing(false), 800);
        }
      );
    } else {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const handleSaveCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCity.trim()) {
      updateMyLocation(currentUser.lat, currentUser.lng, customCity.trim());
      setShowEditCity(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-in fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#3E2723]">
          LIVE DISTANCE
        </h1>
        <p className="text-xs text-[#795548] font-serif italic">
          "Bridging the miles between Puducherry & Bangalore"
        </p>
      </div>

      {/* Privacy Consent Box */}
      <div className="p-4 rounded-2xl bg-[#FFF0F5] border border-[#F0C9D8] shadow-xs flex items-start gap-3 text-xs text-[#5D4037]">
        <Shield className="w-5 h-5 text-[#5D4037] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#3E2723]">Mutual Consent Privacy Protocol:</span>{' '}
          Neither partner tracks the other without permission. When you turn off sharing, your live coordinates become instantly hidden.
        </div>
      </div>

      {/* Main Distance Board */}
      <div className="bg-[#FFF0F5] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-xs border border-[#F0C9D8] text-center relative overflow-hidden">
        {/* Animated Flying Heart across Distance */}
        {isSendingHug && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
            <Heart className="w-16 h-16 text-[#5D4037] fill-[#5D4037] animate-ping" />
          </div>
        )}

        <div className="flex items-center justify-around mb-6">
          {/* YOU */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#795548] mb-2">
              YOU ({currentUser.name})
            </span>
            <div className="relative mb-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-[#F0C9D8] shadow-xs"
              />
              <span
                className={`w-4 h-4 rounded-full border-2 border-[#FFF0F5] absolute bottom-0 right-0 ${
                  currentUser.isSharingLocation ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
                title={currentUser.isSharingLocation ? 'Location sharing active' : 'Location hidden'}
              />
            </div>
            <span className="font-serif font-bold text-sm sm:text-base text-[#3E2723]">
              {currentUser.city}
            </span>
            <span className="text-[11px] text-[#795548]">
              {currentUser.nickname || 'You'} • {currentUser.lastLocationUpdate}
            </span>
          </div>

          {/* DISTANCE CENTER DISPLAY */}
          <div className="flex flex-col items-center px-4">
            <div className="w-10 h-10 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-[#5D4037] flex items-center justify-center mb-2 shadow-xs">
              <Navigation className="w-4 h-4 rotate-45" />
            </div>
            <div className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#3E2723]">
              {distanceKm}
              <span className="text-sm font-sans font-normal text-[#795548] ml-1">km</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#795548] mt-1">
              Linear Distance
            </span>

            <button
              onClick={handleSendHug}
              className="mt-3 px-4 py-1.5 rounded-full bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Send Hug</span>
            </button>
          </div>

          {/* PARTNER */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#795548] mb-2">
              {partnerUser.name} ({partnerUser.nickname || 'Akshu'})
            </span>
            <div className="relative mb-2">
              <img
                src={partnerUser.avatar}
                alt={partnerUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-[#F0C9D8] shadow-xs"
              />
              <span
                className={`w-4 h-4 rounded-full border-2 border-[#FFF0F5] absolute bottom-0 right-0 ${
                  canSeePartner ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
                title={canSeePartner ? 'Location sharing active' : 'Partner location private'}
              />
            </div>
            <span className="font-serif font-bold text-sm sm:text-base text-[#3E2723]">
              {canSeePartner ? partnerUser.city : 'Private'}
            </span>
            <span className="text-[11px] text-[#795548]">
              {canSeePartner ? partnerUser.lastLocationUpdate : 'Location paused'}
            </span>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="pt-4 border-t border-[#F0C9D8] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLocationSharing}
              className={`px-4 py-2 rounded-full font-semibold transition cursor-pointer ${
                currentUser.isSharingLocation
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {currentUser.isSharingLocation ? '✓ Sharing Your Location' : '✕ Location Sharing Off'}
            </button>

            <button
              onClick={() => setShowEditCity(!showEditCity)}
              className="px-3 py-2 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-[#5D4037] hover:bg-[#F8E0E9] font-medium transition cursor-pointer"
            >
              Change City
            </button>
          </div>

          <span className="text-[11px] text-[#795548]">
            {canSeePartner ? 'Both locations synced' : 'Partner location private'}
          </span>
        </div>

        {showEditCity && (
          <form onSubmit={handleSaveCity} className="mt-4 p-3 rounded-2xl bg-[#FCEBF2] border border-[#F0C9D8] flex gap-2">
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="Enter your current city (e.g. Puducherry)"
              className="flex-1 px-3 py-1.5 rounded-xl border border-[#F0C9D8] bg-[#FFF0F5] text-xs text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E]"
            >
              Save
            </button>
          </form>
        )}
      </div>

      {/* Realistic 3D Earth Section */}
      <div className="bg-[#FFF0F5] rounded-[32px] p-6 border border-[#F0C9D8] shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#5D4037]" />
            <h3 className="font-serif font-bold text-sm text-[#3E2723]">
              3D Planetary View • Puducherry ↔ Bangalore
            </h3>
          </div>
          <span className="text-[11px] text-[#795548]">
            Interactive 3D Sphere
          </span>
        </div>

        <Globe3D
          userLocationName={currentUser.city}
          partnerLocationName={partnerUser.city}
          distanceKm={distanceKm}
          isPartnerSharing={canSeePartner}
        />
      </div>

      {/* Radar Card */}
      <div className="bg-[#FFF0F5] rounded-[32px] p-6 border border-[#F0C9D8] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#5D4037]" />
            <h3 className="font-serif font-bold text-sm text-[#3E2723]">Connection Path</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdateDeviceGPS}
              className="text-xs text-[#795548] hover:text-[#3E2723] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Coordinates</span>
            </button>
          </div>
        </div>

        {/* Map SVG Canvas */}
        <div className="w-full h-56 bg-[#FCEBF2] rounded-2xl relative border border-[#F0C9D8] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#5D4037_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* SVG Connection Curve */}
          <svg className="absolute inset-0 w-full h-full">
            <path
              d="M 120,110 Q 250,40 380,110"
              fill="none"
              stroke="#5D4037"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              className="animate-pulse"
            />
          </svg>

          {/* Point A: Puducherry */}
          <div className="absolute left-12 sm:left-24 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative">
              <span className="w-8 h-8 rounded-full bg-[#5D4037]/20 absolute -top-1 -left-1 animate-ping" />
              <div className="w-7 h-7 rounded-full bg-[#5D4037] text-white flex items-center justify-center shadow-xs">
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="mt-2 text-xs font-bold text-[#3E2723] bg-[#FFF0F5] px-3 py-0.5 rounded-full shadow-xs border border-[#F0C9D8]">
              {currentUser.city}
            </span>
            <span className="text-[10px] text-[#795548]">Ragul (Mama)</span>
          </div>

          {/* Point B: Bangalore */}
          <div className="absolute right-12 sm:right-24 top-1/2 -translate-y-1/2 flex flex-col items-center">
            {canSeePartner ? (
              <>
                <div className="relative">
                  <span className="w-8 h-8 rounded-full bg-[#795548]/20 absolute -top-1 -left-1 animate-ping" />
                  <div className="w-7 h-7 rounded-full bg-[#5D4037] text-white flex items-center justify-center shadow-xs">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span className="mt-2 text-xs font-bold text-[#3E2723] bg-[#FFF0F5] px-3 py-0.5 rounded-full shadow-xs border border-[#F0C9D8]">
                  {partnerUser.city}
                </span>
                <span className="text-[10px] text-[#795548]">Akshya (Akshu)</span>
              </>
            ) : (
              <div className="flex flex-col items-center text-[#795548]">
                <div className="w-8 h-8 rounded-full bg-[#FFF0F5] flex items-center justify-center border border-[#F0C9D8]">
                  <EyeOff className="w-4 h-4 text-[#795548]" />
                </div>
                <span className="text-xs font-medium mt-1">Location Private</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
