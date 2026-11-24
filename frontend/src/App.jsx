import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/layout/Navbar';
import DashboardView from './components/dashboard/DashboardView';
import TwoWayChatInbox from './components/chat/TwoWayChatInbox';
import MessagesHub from './components/messages/MessagesHub';
import FeesView from './components/fees/FeesView';
import GatePassView from './components/gatepass/GatePassView';
import CampaignView from './components/campaigns/CampaignView';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInstitution, setSelectedInstitution] = useState('All');
  const [institutions, setInstitutions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [unreadCount, setUnreadCount] = useState(12);

  // Load institutions list
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await api.getInstitutions();
        if (res.success) {
          setInstitutions(res.data);
        }
      } catch (err) {
        console.error('Error fetching institutions:', err);
      }
    };
    fetchInstitutions();
  }, []);

  // Load analytics whenever selected institution changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getAnalytics(selectedInstitution);
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
    };
    fetchAnalytics();
  }, [selectedInstitution]);

  const handleOpenChat = (recipient) => {
    setActiveTab('chat');
  };

  return (
    <SocketProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedInstitution={selectedInstitution}
          setSelectedInstitution={setSelectedInstitution}
          institutions={institutions}
          unreadCount={unreadCount}
        />

        {/* Main Content View with expanded width and minimal side gutters */}
        <main className="flex-1 w-full px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4">
          {activeTab === 'dashboard' && (
            <DashboardView
              analytics={analytics}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'chat' && (
            <TwoWayChatInbox
              selectedInstitution={selectedInstitution}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesHub
              selectedInstitution={selectedInstitution}
              onOpenChat={handleOpenChat}
            />
          )}

          {activeTab === 'fees' && (
            <FeesView
              selectedInstitution={selectedInstitution}
              onOpenChat={handleOpenChat}
            />
          )}

          {activeTab === 'gatepass' && (
            <GatePassView
              selectedInstitution={selectedInstitution}
              onOpenChat={handleOpenChat}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignView
              selectedInstitution={selectedInstitution}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 text-center text-xs text-slate-500">
          <div className="w-full px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong className="text-slate-800 font-bold">Okie Dokie Pay (Okie Dokie Solutions LLP)</strong> • Enterprise Campus Management Platform
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>Sender: +91 70156 13714</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">Gateway Active</span>
            </div>
          </div>
        </footer>

      </div>
    </SocketProvider>
  );
}
