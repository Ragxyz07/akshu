import React, { useState, useEffect, useRef } from 'react';
import { useAkra } from '../context/AkraContext';
import { NavigationTab } from '../types';
import confetti from 'canvas-confetti';
import {
  Heart,
  MessageCircle,
  Camera,
  Lock,
  MapPin,
  Film,
  Image as ImageIcon,
  Mail,
  Sparkles,
  ArrowRight,
  Compass,
  Calendar,
  Clock,
  Send,
  Plane
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    currentUser,
    partnerUser,
    relationship,
    setActiveTab,
    unreadCount,
    calculateDistanceKm,
    sendVirtualHeart,
    memories,
    letters,
    futureItems,
    milestones,
    showToast,
  } = useAkra();

  // Mouse Parallax for subtle cinematic depth
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  // Dynamic time-based greeting
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting('Good night');
    else if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Live "Together for X years, months, days, hours, minutes, seconds"
  const [timeTogether, setTimeTogether] = useState({
    years: 1,
    months: 8,
    days: 14,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(relationship.anniversaryDate).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);

      const totalSeconds = Math.floor(diffMs / 1000);
      const totalDays = Math.floor(totalSeconds / 86400);

      const years = Math.floor(totalDays / 365.25);
      const remainingDaysAfterYears = totalDays - Math.floor(years * 365.25);
      const months = Math.floor(remainingDaysAfterYears / 30.44);
      const days = Math.floor(remainingDaysAfterYears - Math.floor(months * 30.44));

      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeTogether({ years, months, days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [relationship.anniversaryDate]);

  // Next meeting countdown
  const [daysUntilNextMeeting, setDaysUntilNextMeeting] = useState(18);
  useEffect(() => {
    const target = new Date(relationship.nextMeetingDate).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
    setDaysUntilNextMeeting(diff);
  }, [relationship.nextMeetingDate]);

  const distanceKm = calculateDistanceKm();

  const handleSendHug = (e: React.MouseEvent<HTMLButtonElement>) => {
    sendVirtualHeart();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#F4C7D3', '#E8C4D0', '#5D4037', '#D4AF37'],
      scalar: 0.8,
      ticks: 60,
    });
  };

  // Luxury Portals
  const portals = [
    {
      id: 'chat' as NavigationTab,
      title: 'Our Chat',
      subtitle: unreadCount > 0 ? `${unreadCount} new messages` : 'Private 1-on-1 space',
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      icon: MessageCircle,
    },
    {
      id: 'memories' as NavigationTab,
      title: 'Memories',
      subtitle: `${memories.length} preserved moments`,
      icon: ImageIcon,
    },
    {
      id: 'vault' as NavigationTab,
      title: 'Secret Vault',
      subtitle: 'Device upload & confidential notes',
      icon: Lock,
    },
    {
      id: 'movie-night' as NavigationTab,
      title: 'Cinema for Two',
      subtitle: 'Synchronized screen & camera portal',
      icon: Film,
    },
    {
      id: 'location' as NavigationTab,
      title: 'Live Distance',
      subtitle: `${distanceKm} km • Puducherry ↔ Bangalore`,
      icon: MapPin,
    },
    {
      id: 'letters' as NavigationTab,
      title: 'Love Letters',
      subtitle: `${letters.length} heartfelt letters exchanged`,
      icon: Mail,
    },
    {
      id: 'photobooth' as NavigationTab,
      title: 'Photobooth',
      subtitle: 'Snap a live dual strip together',
      icon: Camera,
    },
    {
      id: 'timeline' as NavigationTab,
      title: 'Our Story',
      subtitle: `${milestones.length} relationship milestones`,
      icon: Sparkles,
    },
    {
      id: 'future' as NavigationTab,
      title: 'Future Dreams',
      subtitle: `${futureItems.length} shared bucket list goals`,
      icon: Compass,
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[calc(100vh-80px)] px-4 sm:px-6 py-8 sm:py-14 max-w-5xl mx-auto space-y-12 select-none overflow-hidden"
    >
      {/* Cinematic Ethereal Background: Moving Ambient Light & Floating Memory Orbs */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#FCEBF2] via-[#FFF0F5]/60 to-transparent rounded-full blur-3xl pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`,
        }}
      />
      <div
        className="absolute top-1/3 -right-24 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px)`,
        }}
      />
      <div
        className="absolute bottom-10 -left-20 w-80 h-80 bg-[#FCEBF2] rounded-full blur-3xl pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`,
        }}
      />

      {/* Subtle Floating Memories in Background (Slow drift with parallax) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        {memories.slice(0, 4).map((memory, i) => {
          const positions = [
            { top: '10%', left: '4%', rot: '-4deg' },
            { top: '18%', right: '5%', rot: '5deg' },
            { bottom: '22%', left: '6%', rot: '3deg' },
            { bottom: '15%', right: '8%', rot: '-6deg' },
          ];
          const pos = positions[i % positions.length];
          return (
            <div
              key={memory.id}
              className="absolute hidden md:block w-36 lg:w-44 aspect-4/3 rounded-2xl overflow-hidden border border-[#F0C9D8] shadow-md transition-transform duration-1000 ease-out bg-white/70 backdrop-blur-xs p-1"
              style={{
                ...pos,
                transform: `translate(${mousePos.x * (i % 2 === 0 ? 30 : -30)}px, ${
                  mousePos.y * (i % 2 === 0 ? 30 : -30)
                }px) rotate(${pos.rot})`,
              }}
            >
              <img
                src={memory.imageUrl}
                alt={memory.title}
                className="w-full h-full object-cover rounded-xl filter brightness-95 contrast-95"
              />
            </div>
          );
        })}
      </div>

      {/* Minimal Cinematic Landing Centerpiece */}
      <section className="relative z-10 text-center space-y-5 pt-4 sm:pt-8">
        {/* Monogram Crest with soft rose-gold ring */}
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-[#FFF0F5] to-[#FCEBF2] border border-[#F0C9D8] shadow-md p-1.5 transition-transform hover:scale-105">
          <div className="w-full h-full rounded-full bg-[#5D4037] flex items-center justify-center text-white font-serif italic text-2xl sm:text-3xl font-bold shadow-inner">
            A
          </div>
        </div>

        {/* Centerpiece Titles */}
        <div className="space-y-2">
          {/* Main Couple Names */}
          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-[#3E2723]">
            Ragul & Akshya
          </h1>

          {/* Intimate Nicknames */}
          <p className="text-base sm:text-xl font-serif italic text-[#795548] tracking-wide">
            Mama & Akshu
          </p>

          {/* Subtle City & Distance Pill */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FCEBF2] border border-[#F0C9D8] text-xs font-semibold text-[#5D4037] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Puducherry ↔ Bangalore</span>
              <span className="text-[#A1887F] font-bold">•</span>
              <span>{distanceKm} km apart</span>
            </div>
          </div>

          {/* Poetic Tagline */}
          <p className="text-xs sm:text-sm font-sans tracking-[0.25em] uppercase text-[#8D6E63] pt-2 font-medium">
            Our little world.
          </p>
        </div>

        {/* Personalized Welcome Badge */}
        <div className="pt-1">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFF0F5] border border-[#F0C9D8] text-xs font-medium text-[#3E2723]">
            {greeting}, <strong className="font-semibold text-[#5D4037]">{currentUser.nickname || currentUser.name}</strong> ❤️
          </span>
        </div>
      </section>

      {/* Relationship Metrics: Live Time & Reunion Countdown */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Together Live Counter */}
        <div className="bg-[#FFF0F5] border border-[#F0C9D8] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#795548] mb-2 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#5D4037]" />
              Together In Love
            </span>
            <span className="text-[10px] text-[#8D6E63]">Since Dec 20, 2024</span>
          </div>
          <div>
            <p className="font-serif font-bold text-xl text-[#3E2723]">
              {timeTogether.years}y {timeTogether.months}m {timeTogether.days}d
            </p>
            <p className="font-mono text-[11px] text-[#795548] mt-0.5">
              {timeTogether.hours.toString().padStart(2, '0')}:
              {timeTogether.minutes.toString().padStart(2, '0')}:
              {timeTogether.seconds.toString().padStart(2, '0')} elapsed
            </p>
          </div>
        </div>

        {/* Next Meeting in Puducherry */}
        <div className="bg-[#FFF0F5] border border-[#F0C9D8] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#795548] mb-2 font-medium">
            <span className="flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-[#5D4037]" />
              Next Reunion
            </span>
            <span className="text-[10px] text-[#8D6E63]">Promenade Beach</span>
          </div>
          <div>
            <p className="font-serif font-bold text-xl text-[#3E2723]">
              {daysUntilNextMeeting} Days Remaining
            </p>
            <p className="text-[11px] text-[#795548] mt-0.5">
              September 21, 2026 • Puducherry
            </p>
          </div>
        </div>

        {/* Send Virtual Hug Button */}
        <div className="bg-[#FFF0F5] border border-[#F0C9D8] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#795548] mb-2 font-medium">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#5D4037]" />
              Virtual Hug
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Online now</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[#5D4037] leading-relaxed">
              Send warmth to {partnerUser.nickname || partnerUser.name}
            </p>
            <button
              onClick={handleSendHug}
              className="px-4 py-2 rounded-full bg-[#5D4037] text-white text-xs font-semibold hover:bg-[#4E342E] transition active:scale-95 shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Hug</span>
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Luxury Navigation Portals */}
      <section className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-[#3E2723]">
            Our Spaces
          </h2>
          <span className="text-xs text-[#795548]">
            Click any space to enter
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                onClick={() => setActiveTab(portal.id)}
                className="bg-[#FFF0F5] hover:bg-[#FCEBF2] border border-[#F0C9D8] hover:border-[#5D4037] rounded-3xl p-4.5 shadow-xs transition-all duration-300 cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FCEBF2] group-hover:bg-[#5D4037] text-[#5D4037] group-hover:text-white border border-[#F0C9D8] flex items-center justify-center transition shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#3E2723] group-hover:text-[#5D4037] transition">
                        {portal.title}
                      </h3>
                      {portal.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#5D4037] text-white text-[9px] font-bold animate-pulse">
                          {portal.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#795548] mt-0.5 line-clamp-1">
                      {portal.subtitle}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-[#A1887F] group-hover:text-[#5D4037] group-hover:translate-x-1 transition shrink-0 mt-2" />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
