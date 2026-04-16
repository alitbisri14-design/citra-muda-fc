import React from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  Network,
  ClipboardCheck,
  ShieldCheck,
  Menu,
  X,
  Trophy,
} from "lucide-react";
import clubLogo from "../assets/citra-muda-logo.png";
import { cn } from "../lib/utils";

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isAdmin: boolean;
  onAuthButtonClick: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isAdmin,
  onAuthButtonClick,
  isOpen,
  setIsOpen,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dasbor", icon: LayoutDashboard },
    { id: "roster", label: "Pemain", icon: Users },
    { id: "matches", label: "Jadwal", icon: Calendar },
    { id: "scores", label: "Skor Pertandingan", icon: Trophy },
    { id: "finance", label: "Kas", icon: Wallet },
    { id: "org", label: "Organisasi", icon: Network },
    { id: "attendance", label: "Presensi", icon: ClipboardCheck },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 glass z-50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                <img
                  src={clubLogo}
                  alt="Logo Citra Muda FC"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-glow">
                Citra Muda FC
              </h1>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  currentView === item.id
                    ? "bg-electric-green text-black shadow-[0_0_10px_rgba(57,255,20,0.3)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    "transition-colors",
                    currentView === item.id
                      ? "text-black"
                      : "group-hover:text-electric-green",
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <button
              onClick={onAuthButtonClick}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isAdmin
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              <ShieldCheck size={20} />
              <span className="font-medium">
                {isAdmin ? "Logout Admin" : "Login Admin"}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
