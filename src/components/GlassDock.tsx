import React from 'react';
import { useAkra } from '../context/AkraContext';
import { NavigationTab } from '../types';
import confetti from 'canvas-confetti';
import {
  Home,
  MessageCircle,
  Camera,
  Lock,
  MapPin,
  Film,
  Image,
  Mail,
  Sparkles,
  Compass,
  Settings,
} from 'lucide-react';

interface DockItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const GlassDock: React.FC = () => {
  const { activeTab, setActiveTab, unreadCount } = useAkra();

  const dockItems: DockItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle, badge: unreadCount },
    { id: 'memories', label: 'Memories', icon: Image },
    { id: 'vault', label: 'Vault', icon: Lock },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'movie-night', label: 'Movie Night', icon: Film },
    { id: 'letters', label: 'Letters', icon: Mail },
    { id: 'photobooth', label: 'Photobooth', icon: Camera },
    { id: 'timeline', label: 'Our Story', icon: Sparkles },
    { id: 'future', label: 'Dreams', icon: Compass },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId: NavigationTab, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tabId);

    // Subtle gentle particle burst from button position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 12,
      spread: 45,
      origin: { x, y },
      colors: ['#F4C7D3', '#DCCCE8', '#A85D76', '#D4AF37'],
      scalar: 0.6,
      ticks: 40,
      disableForReducedMotion: true,
    });
  };

  return (
    <nav
      id="floating-glass-dock"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] px-2 sm:px-3 py-1.5 rounded-full bg-[#FFF0F5]/90 backdrop-blur-2xl border border-[#F4C7D3] shadow-xl transition-all duration-300 pointer-events-auto select-none"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`dock-item-${item.id}`}
              onClick={(e) => handleTabClick(item.id, e)}
              className={`group relative flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#6B4636] text-[#FFF7F2] shadow-md scale-105'
                  : 'text-[#6B4636] hover:text-[#241916] hover:bg-[#FCEBF2] hover:-translate-y-1 hover:shadow-xs'
              }`}
              title={item.label}
            >
              {/* Active glow backing */}
              {isActive && (
                <span className="absolute -inset-0.5 rounded-full bg-[#F4C7D3]/40 blur-xs pointer-events-none" />
              )}

              <Icon
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 relative z-10 transition-transform ${
                  isActive ? 'scale-110 text-[#FFF7F2]' : 'group-hover:scale-110 text-[#6B4636]'
                }`}
              />

              {/* Text label on desktop for active or hover */}
              <span
                className={`text-[9px] font-sans font-semibold tracking-tight mt-0.5 hidden md:block whitespace-nowrap relative z-10 ${
                  isActive ? 'text-[#FFF7F2]' : 'text-[#6B4636]'
                }`}
              >
                {item.label}
              </span>

              {/* Unread badge */}
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A85D76] text-[#FFF7F2] text-[9px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                  {item.badge}
                </span>
              ) : null}

              {/* Floating Tooltip for mobile / compact */}
              <span className="absolute -top-9 px-2 py-0.5 rounded-md bg-[#241916] text-[#FFF7F2] text-[10px] font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity md:hidden whitespace-nowrap shadow-md">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
