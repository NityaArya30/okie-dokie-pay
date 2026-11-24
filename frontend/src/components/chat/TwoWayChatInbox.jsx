import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Check, 
  CheckCheck, 
  Sparkles, 
  User, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle, 
  Bot, 
  RefreshCw, 
  ArrowLeft,
  Info,
  X,
  MessageCircle,
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

export default function TwoWayChatInbox({ selectedInstitution }) {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [activeThread, setActiveThread] = useState({ conversation: null, messages: [] });
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [mobileView, setMobileView] = useState('list');

  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    try {
      const res = await api.getConversations({
        institution: selectedInstitution,
        search: searchTerm,
      });
      if (res.success) {
        setConversations(res.data);
        if (!selectedRecipient && res.data.length > 0 && window.innerWidth >= 768) {
          setSelectedRecipient(res.data[0].recipient);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [selectedInstitution, searchTerm]);

  const loadThread = async (recipient) => {
    if (!recipient) return;
    try {
      const res = await api.getThread(recipient);
      if (res.success) {
        setActiveThread({ conversation: res.conversation, messages: res.messages });
        fetchAiSuggestions(res.conversation, res.messages);
      }
    } catch (err) {
      console.error('Error loading thread:', err);
    }
  };

  useEffect(() => {
    if (selectedRecipient) {
      loadThread(selectedRecipient);
    }
  }, [selectedRecipient]);

  // Real-time Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.recipient === selectedRecipient || msg.sender === selectedRecipient) {
        setActiveThread((prev) => ({
          ...prev,
          messages: [...prev.messages, msg]
        }));
      }
      loadConversations();
    };

    const handleParentReply = ({ recipient, message }) => {
      if (recipient === selectedRecipient) {
        setActiveThread((prev) => ({
          ...prev,
          messages: [...prev.messages, message]
        }));
      }
      loadConversations();
    };

    socket.on('chat_message', handleNewMessage);
    socket.on('parent_incoming_reply', handleParentReply);
    socket.on('new_agent_reply', handleParentReply);

    return () => {
      socket.off('chat_message', handleNewMessage);
      socket.off('parent_incoming_reply', handleParentReply);
      socket.off('new_agent_reply', handleParentReply);
    };
  }, [socket, selectedRecipient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread.messages]);

  const fetchAiSuggestions = async (conv, msgs) => {
    if (!conv) return;
    try {
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : '';
      const res = await api.getAiSuggestions({
        lastMessage: lastMsg,
        studentName: conv.studentName,
        institution: conv.institution,
        templateId: msgs.length > 0 ? msgs[msgs.length - 1].templateId : ''
      });
      if (res.success) {
        setAiSuggestions(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || !selectedRecipient) return;

    setSending(true);
    try {
      const res = await api.sendAgentReply(selectedRecipient, text, 'Campus Support');
      if (res.success) {
        setInputText('');
        loadThread(selectedRecipient);
        loadConversations();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSimulateParentReply = async (customText) => {
    if (!selectedRecipient) return;
    setShowSimulateMenu(false);
    try {
      await api.simulateParentReply(selectedRecipient, customText);
      loadThread(selectedRecipient);
      loadConversations();
    } catch (err) {
      console.error('Error simulating parent reply:', err);
    }
  };

  const handleSelectConversation = (recipient) => {
    setSelectedRecipient(recipient);
    setMobileView('chat');
  };

  const filteredConversations = conversations.filter((c) => {
    if (filterType === 'unread') return c.unreadCount > 0;
    return true;
  });

  const activeConv = activeThread.conversation;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden h-[calc(100vh-125px)] min-h-[600px] flex flex-col animate-fadeIn pb-14 md:pb-0 w-full">
      
      <div className="flex-1 flex overflow-hidden relative w-full">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Conversation List */}
        {/* ========================================================= */}
        <div 
          className={`w-full md:w-84 lg:w-[340px] xl:w-[380px] border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Parent Conversations</h2>
                <span className="px-2 py-0.5 text-[11px] font-black bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                  {conversations.length}
                </span>
              </div>
              <button 
                onClick={loadConversations} 
                title="Refresh conversations list" 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition btn-press cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search phone, student or query..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 text-xs rounded-xl border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg transition-all btn-press cursor-pointer ${
                  filterType === 'all' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Chats
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-3 py-1 rounded-lg transition-all btn-press cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'unread' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Pending Reply</span>
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading parent threads...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No conversations found.</div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.recipient === selectedRecipient;
                const initials = (conv.studentName || 'SP')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <div
                    key={conv.recipient}
                    onClick={() => handleSelectConversation(conv.recipient)}
                    className={`p-3.5 cursor-pointer transition-all duration-200 flex items-start gap-3 border-l-4 ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-blue-600'
                        : 'hover:bg-slate-100/70 border-l-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {conv.studentName || 'Parent / Student'}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {conv.lastMessageTime ? conv.lastMessageTime.slice(11, 16) : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <span className="truncate">{conv.institution}</span>
                      </div>

                      <p className={`text-xs mt-0.5 truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                        {conv.lastDirection === 'incoming' && <span className="text-emerald-600 font-semibold mr-1">Parent:</span>}
                        {conv.lastMessage || 'Notification dispatched'}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: WhatsApp Web 2-Way Chat Stream */}
        {/* ========================================================= */}
        <div 
          className={`flex-1 flex flex-col bg-[#F1F5F9]/60 min-w-0 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Chat Header */}
          {activeConv ? (
            <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5 truncate">
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg btn-press cursor-pointer"
                  title="Back to list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  {(activeConv.studentName || 'SP').charAt(0)}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{activeConv.studentName}</h3>
                    <span className="hidden sm:inline-block px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100">
                      Parent Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <span>+{activeConv.recipient}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-medium truncate">{activeConv.institution}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Simulator & Profile */}
              <div className="flex items-center gap-2 shrink-0 relative">
                
                {/* Glowing Simulator Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSimulateMenu(!showSimulateMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all btn-press cursor-pointer whitespace-nowrap animate-pulseGlow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simulate Reply</span>
                  </button>

                  {/* Dropdown Menu of Parent Scenarios */}
                  {showSimulateMenu && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-scaleUp">
                      <div className="font-bold text-slate-800 px-2 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                        <span>Simulate Parent Incoming Message:</span>
                        <span className="text-[10px] text-emerald-600 font-bold">1-Click Demo</span>
                      </div>
                      <button
                        onClick={() => handleSimulateParentReply("I have paid Rs. 16,300 via UPI ref #938102. Please confirm and update receipt in student app.")}
                        className="w-full text-left p-2.5 hover:bg-emerald-50 rounded-xl text-slate-700 transition-colors cursor-pointer"
                      >
                        💳 <strong>Fee Payment Confirmation:</strong> "I have paid via UPI. Please confirm..."
                      </button>
                      <button
                        onClick={() => handleSimulateParentReply("Sir, my child had high fever yesterday. Doctor note is attached. Kindly mark medical leave in ERP.")}
                        className="w-full text-left p-2.5 hover:bg-emerald-50 rounded-xl text-slate-700 transition-colors cursor-pointer"
                      >
                        🩺 <strong>Attendance Medical Leave:</strong> "Child was sick with fever..."
                      </button>
                      <button
                        onClick={() => handleSimulateParentReply("Yes, I have authorized Mr. Gurpej Singh for today's pickup early exit pass. Thank you.")}
                        className="w-full text-left p-2.5 hover:bg-emerald-50 rounded-xl text-slate-700 transition-colors cursor-pointer"
                      >
                        🛡️ <strong>Gate Pass Authorization:</strong> "Authorized pickup person..."
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowMobileProfile(!showMobileProfile)}
                  className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition btn-press cursor-pointer"
                  title="View Student Profile"
                >
                  <Info className="w-4 h-4" />
                </button>

              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              Select a conversation to start reading messages
            </div>
          )}

          {/* Chat Messages Stream with Staggered Slide In */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {activeThread.messages.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-xs">
                No messages in this thread yet.
              </div>
            ) : (
              activeThread.messages.map((msg, idx) => {
                const isIncoming = msg.direction === 'incoming';

                return (
                  <div
                    key={msg._id || idx}
                    className={`flex flex-col ${isIncoming ? 'items-start animate-slideInLeft' : 'items-end animate-slideInRight'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs relative shadow-xs transition-transform ${
                        isIncoming
                          ? 'bg-white text-slate-900 rounded-tl-xs border border-slate-200/90'
                          : 'bg-[#DCF8C6] text-slate-900 rounded-tr-xs border border-[#C5E1A5]'
                      }`}
                    >
                      {/* Outgoing Template Badge */}
                      {!isIncoming && msg.templateId && msg.templateId !== 'agent_reply' && (
                        <div className="mb-1 flex items-center gap-1.5 text-[10px]">
                          <span className="font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                            {msg.templateId.replace('stud_', '').replace('fee_', 'FEE ')}
                          </span>
                          <span className="text-slate-500 font-medium">Campus Broadcast</span>
                        </div>
                      )}

                      {/* Incoming Sender Label */}
                      {isIncoming && (
                        <div className="font-bold text-[11px] text-emerald-700 mb-0.5 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{msg.senderName || 'Parent / Guardian'}</span>
                        </div>
                      )}

                      {/* Message Content */}
                      <p className="whitespace-pre-line leading-relaxed text-slate-800 font-normal">
                        {msg.text}
                      </p>

                      {/* Timestamp & Ticks */}
                      <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-slate-500">
                        <span>{msg.sentTime ? msg.sentTime.slice(11, 16) : 'Now'}</span>
                        {!isIncoming && (
                          <span>
                            {msg.status === 'Read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-600 inline" />
                            ) : msg.status === 'Delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-400 inline" />
                            ) : msg.status === 'Sent' ? (
                              <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Smart Reply Suggestions Bar */}
          {aiSuggestions.length > 0 && (
            <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 shrink-0">
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Quick Reply:</span>
              </div>
              {aiSuggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(sug)}
                  className="px-3 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 text-[11px] font-medium rounded-full border border-slate-200/90 whitespace-nowrap transition-all btn-press cursor-pointer shadow-2xs hover:border-indigo-300"
                >
                  "{sug.slice(0, 42)}..."
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar with Quick Action Pills */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type an official WhatsApp reply to parent..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-100 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
              <button
                onClick={() => handleSendReply()}
                disabled={sending || !inputText.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all btn-press cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Student ERP Profile Drawer */}
        {/* ========================================================= */}
        <div 
          className={`w-72 xl:w-80 border-l border-slate-200 bg-white p-5 lg:flex flex-col justify-between overflow-y-auto shrink-0 ${
            showMobileProfile ? 'fixed inset-y-0 right-0 z-50 shadow-2xl flex w-80 animate-slideInRight' : 'hidden lg:flex'
          }`}
        >
          {activeConv ? (
            <div className="space-y-5">
              
              <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-700">Student Profile</span>
                <button onClick={() => setShowMobileProfile(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar & Name */}
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md mb-2">
                  {(activeConv.studentName || 'S').charAt(0)}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{activeConv.studentName}</h3>
                <p className="text-xs text-slate-500 font-medium">{activeConv.institution}</p>
                {activeConv.studentClass && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                    {activeConv.studentClass}
                  </span>
                )}
              </div>

              {/* Profile Details */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parent Phone</label>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    +{activeConv.recipient}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student ID</label>
                  <div className="font-mono font-semibold text-slate-800 mt-0.5">
                    {activeConv.studentId || 'STU-14000'}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee Collection Status</label>
                  <div className="mt-1 flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Receipt Verified</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">PAID</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Gate Clearance</label>
                  <div className="mt-1 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Early Exit Authorized</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Guardian verification confirmed via SMS/OTP</div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-8">Select a conversation</div>
          )}

          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            Okie Dokie Pay WABA Gateway
          </div>
        </div>

      </div>

    </div>
  );
}
