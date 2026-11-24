import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Send, 
  CreditCard, 
  ShieldCheck, 
  Radio, 
  Building2, 
  Volume2, 
  VolumeX, 
  X
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  selectedInstitution, 
  setSelectedInstitution, 
  institutions = [],
  unreadCount = 0
}) {
  const { connected, incomingAlert, clearAlert, soundEnabled, setSoundEnabled } = useSocket();

  const navItems = [
    { id: 'dashboard', label: 'Analytics', shortLabel: 'Overview', icon: LayoutDashboard },
    { id: 'chat', label: '2-Way Inbox', shortLabel: 'Inbox', icon: MessageSquare, badge: unreadCount },
    { id: 'messages', label: 'Messages Hub', shortLabel: 'Messages', icon: Send },
    { id: 'fees', label: 'Fee Payments', shortLabel: 'Fees', icon: CreditCard },
    { id: 'gatepass', label: 'Gate Security', shortLabel: 'Security', icon: ShieldCheck },
    { id: 'campaigns', label: 'Broadcasts', shortLabel: 'Campaigns', icon: Radio },
  ];

  return (
    <>
      {/* Real-time Alert Toast Banner with Slide Down Animation */}
      {incomingAlert && (
        <aside aria-label="Incoming message alert" className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm animate-slideInUp sticky top-0 z-50">
          <div className="flex items-center gap-2.5 truncate mr-2">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
            </span>
            <div className="truncate">
              <strong className="font-bold">{incomingAlert.title}:</strong>{" "}
              <span className="opacity-95 italic">"{incomingAlert.text}"</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('chat');
                clearAlert();
              }}
              className="px-3 py-1 bg-white text-emerald-800 font-bold rounded-lg text-[11px] hover:bg-emerald-50 transition-all btn-press shadow-xs cursor-pointer whitespace-nowrap"
            >
              Open Chat →
            </button>
            <button onClick={clearAlert} className="p-1 hover:bg-emerald-800/80 rounded-lg text-emerald-100 hover:text-white cursor-pointer transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Main Top Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
        <div className="w-full px-3 sm:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Title with gentle hover */}
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
                OD
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    Okie<span className="text-blue-600">Dokie</span> Pay
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                    Campus ERP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Communication & Payments Gateway</p>
              </div>
            </div>

            {/* Right Controls: Campus Switcher & Sound */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Institution Switcher with interactive focus glow */}
              <div className="relative flex items-center bg-slate-100/90 hover:bg-slate-100 border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all max-w-[170px] sm:max-w-[260px]">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer truncate w-full text-xs"
                >
                  <option value="All">All Campuses (Aggregated)</option>
                  {institutions.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Pill (Desktop only) */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-xs">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-semibold text-slate-700">+91 70156 13714</span>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">VERIFIED</span>
              </div>

              {/* Sound Audio Toggle with press animation */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute audio' : 'Enable audio'}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition btn-press cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600 animate-fadeIn" /> : <VolumeX className="w-4 h-4 text-slate-400 animate-fadeIn" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs (with active underline and pill transition) */}
          <nav className="hidden md:flex space-x-1.5 border-t border-slate-100 py-1.5 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all btn-press cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs scale-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-white scale-110' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full transition-transform ${
                        isActive ? 'bg-white text-blue-700' : 'bg-red-500 text-white animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly like WhatsApp) */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1 flex items-center justify-around safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all btn-press cursor-pointer relative ${
                isActive ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-115 text-blue-600' : 'text-slate-400'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-blue-600' : 'text-slate-500'}`}>
                {item.shortLabel}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-0.5 animate-scaleUp"></span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
