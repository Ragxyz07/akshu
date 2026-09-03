import React from 'react';
import { useAkra } from '../context/AkraContext';
import { PWAInstallButton } from './PWAInstallButton';
import { Heart, Bell, MapPin, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    logout,
    relationship,
    calculateDistanceKm,
    activeTab,
    setActiveTab,
    unreadCount,
    sendVirtualHeart,
  } = useAkra();

  const distanceKm = calculateDistanceKm();

  return (
    <header className="sticky top-0 z-40 bg-[#FFF0F5]/95 backdrop-blur-md border-b border-[#F0C9D8] px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
          id="header-brand"
        >
          <div className="w-10 h-10 bg-[#5D4037] rounded-full flex items-center justify-center text-white font-serif italic text-xl shadow-xs group-hover:scale-105 transition">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl sm:text-3xl tracking-tight font-bold text-[#3E2723]">AKRA</span>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-[#5D4037]">
                LDR
              </span>
            </div>
            <p className="text-[11px] text-[#795548] tracking-wide font-medium hidden sm:block">
              "A little world for two" • Puducherry ♡ Bangalore
            </p>
          </div>
        </div>

        {/* Center Live Distance / Partner Presence */}
        <div className="hidden md:flex items-center gap-3.5 px-4 py-2 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-[#3E2723]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {currentUser.nickname || currentUser.name} is active
            </span>
            <span className="text-[#A1887F] font-bold">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {partnerUser.nickname || partnerUser.name} is active
            </span>
          </div>

          <span className="h-3 w-[1px] bg-[#F0C9D8]" />

          <button
            onClick={sendVirtualHeart}
            title="Send live virtual hug"
            className="flex items-center gap-1 text-xs text-[#5D4037] hover:text-[#3E2723] transition font-semibold"
          >
            <MapPin className="w-3.5 h-3.5 text-[#795548]" />
            <span>{distanceKm} km</span>
            <span className="text-[10px] text-[#795548] font-normal italic">apart</span>
          </button>
        </div>

        {/* Right Actions: Authenticated Profile Badge, Log Out, PWA Install, Unread / Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Virtual Hug Mini Button on Mobile */}
          <button
            onClick={sendVirtualHeart}
            title="Send virtual hug across the miles"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-[#FCEBF2] text-[#5D4037] hover:scale-110 active:scale-95 transition border border-[#F0C9D8]"
          >
            <Heart className="w-4 h-4 fill-[#5D4037]" />
          </button>

          {/* Current Logged-In User Badge (No instant profile switching) */}
          <div
            id="logged-in-profile-badge"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-[#3E2723] shadow-2xs text-xs"
            title={`Logged in as ${currentUser.name}`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover ring-1.5 ring-[#5D4037]"
            />
            <div className="flex flex-col text-left">
              <span className="font-semibold text-[11px] text-[#3E2723] leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[9px] text-[#795548] font-medium leading-tight flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                {currentUser.nickname || 'Active'}
              </span>
            </div>
          </div>

          {/* Individual User Logout Button */}
          <button
            id="header-logout-btn"
            onClick={logout}
            title="Log out of your account"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FCEBF2] hover:bg-[#EFE5E0] border border-[#F0C9D8] text-[#5D4037] hover:text-[#3E2723] transition shadow-2xs text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Unread Chat Ping Button */}
          <button
            id="nav-chat-quick"
            onClick={() => setActiveTab('chat')}
            className="relative p-2 rounded-full hover:bg-[#FCEBF2] text-[#3E2723] transition"
            title="Open Chat"
          >
            <Bell className="w-4 h-4 text-[#5D4037]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#5D4037] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
