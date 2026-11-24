import React, { useState } from 'react';
import { 
  Send, 
  CheckCheck, 
  Eye, 
  IndianRupee, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Radio, 
  Activity,
  Layers,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

export default function DashboardView({ analytics, onNavigateTab }) {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview', 'trends', 'health'

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Okie Dokie Telemetry Engine...</p>
        </div>
      </div>
    );
  }

  const {
    totalMessages = 0,
    readCount = 0,
    deliveredCount = 0,
    sentCount = 0,
    failedCount = 0,
    deliveryRate = 0,
    readRate = 0,
    failureRate = 0,
    totalFeeAmount = 0,
    totalReceipts = 0,
    activeConversations = 0,
    templates = {},
    dailyTrends = [],
    hourlyTraffic = [],
    errorDistribution = []
  } = analytics;

  const templateNameMap = {
    stud_notice1: 'Campus Circulars',
    stud_attendance_alert2: 'Daily Absentee',
    stud_due_alert2: 'Fee Due Alerts',
    stud_attendance_alert1: 'Attendance Alerts',
    fee_receipt2a: 'Fee Receipts',
    stud_gate_alert3: 'Gate Security Passes',
    other: 'Direct Messages'
  };

  const templateChartData = Object.entries(templates).map(([key, value]) => ({
    name: templateNameMap[key] || key,
    value
  })).sort((a, b) => b.value - a.value);

  const funnelData = [
    { stage: 'Sent / Dispatched', count: totalMessages, percent: '100%', color: '#3B82F6' },
    { stage: 'Delivered to Phone', count: deliveredCount + readCount, percent: `${deliveryRate}%`, color: '#10B981' },
    { stage: 'Read by Recipient', count: readCount, percent: `${readRate}%`, color: '#6366F1' },
    { stage: 'Failed / Unreachable', count: failedCount, percent: `${failureRate}%`, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 w-full animate-fadeIn pb-16 md:pb-6">
      
      {/* Modern Hero Card with gradient & interactive CTA */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md text-blue-200 text-xs font-bold rounded-full border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
            <span>Okie Dokie Pay • Campus Automation Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Institutional Communication & Collections Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real-time delivery rates, parent 2-way engagement threads, fee reconciliation, and gate exit alerts across partnered campuses.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('chat')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-md transition-all btn-press cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Open 2-Way Inbox ({activeConversations})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl backdrop-blur-sm transition-all btn-press cursor-pointer border border-white/20"
            >
              <Radio className="w-4 h-4 text-blue-300" />
              <span>Launch Broadcast</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 4 Interactive Clickable Hero KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigateTab('messages')}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs card-hover cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Messages</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
            {totalMessages.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Read: <strong className="text-blue-600 font-bold">{readCount.toLocaleString()}</strong></span>
            <span>Delivered: <strong className="text-emerald-600 font-bold">{deliveredCount.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigateTab('messages')}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs card-hover cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Delivery Rate</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-emerald-600">
            {deliveryRate}%
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-2 border-t border-slate-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>High handset delivery success</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigateTab('chat')}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs card-hover cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>User Read Rate</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-indigo-600">
            {readRate}%
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{activeConversations} active chats</span>
            <span className="text-indigo-600 font-bold group-hover:underline">Open Inbox →</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigateTab('fees')}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs card-hover cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Fees Reconciled</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
            ₹{(totalFeeAmount / 10000000).toFixed(2)} Cr
          </div>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{totalReceipts} paid receipts</span>
            <span className="text-amber-600 font-bold group-hover:underline">View ERP →</span>
          </div>
        </div>

      </div>

      {/* Segmented Sub-Tab Switcher for Cleaner UI */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all btn-press cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Traffic & Funnel</span>
          </button>
          <button
            onClick={() => setActiveSubTab('trends')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all btn-press cursor-pointer ${
              activeSubTab === 'trends'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Templates & Density</span>
          </button>
          <button
            onClick={() => setActiveSubTab('health')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all btn-press cursor-pointer ${
              activeSubTab === 'health'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Delivery Diagnostics</span>
          </button>
        </div>
      </div>

      {/* View 1: Traffic & Funnel */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Daily Traffic Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Daily Message Volume & Delivery Trajectory</h2>
                <p className="text-xs text-slate-500">Day-by-day broadcast trends throughout September</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Dispatched
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Read
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => val ? val.slice(8, 10) + ' Sep' : ''} 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px', border: 'none' }}
                    labelFormatter={(lbl) => `Date: ${lbl}`}
                  />
                  <Area type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSent)" name="Sent" />
                  <Area type="monotone" dataKey="read" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRead)" name="Read" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Delivery Funnel Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">WABA Delivery Funnel</h2>
              <p className="text-xs text-slate-500 mb-5">Stage-by-stage message completion metrics</p>
              
              <div className="space-y-4">
                {funnelData.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.stage}</span>
                      <span className="font-bold text-slate-900">
                        {item.count.toLocaleString()} <span className="text-slate-400 font-normal">({item.percent})</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-2.5 rounded-full transition-all duration-700" 
                        style={{ 
                          width: `${Math.min(100, (item.count / totalMessages) * 100)}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Channel Connectivity:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> 100% Operational
              </span>
            </div>
          </div>

        </div>
      )}

      {/* View 2: Templates & Hourly Density */}
      {activeSubTab === 'trends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          
          {/* Template Donut */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Template Categories</h2>
              <p className="text-xs text-slate-500">Distribution of official WhatsApp templates</p>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={templateChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {templateChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [val.toLocaleString() + ' messages', 'Volume']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
              {templateChartData.slice(0, 4).map((entry, index) => (
                <div key={index} className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-slate-600 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Density */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Hourly Broadcast Density</h2>
              <p className="text-xs text-slate-500">Peak message dispatch times across campus hours</p>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyTraffic} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748B' }} interval={3} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }} />
                  <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* View 3: Delivery Diagnostics & Error Causes */}
      {activeSubTab === 'health' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs animate-fadeIn space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-slate-900">Delivery Diagnostics & Telco Failure Analysis</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Detailed failure causes reported by carrier networks and Meta WABA</p>
            </div>
            <button
              onClick={() => onNavigateTab('messages')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all btn-press cursor-pointer self-start sm:self-auto"
            >
              Filter in Messages Hub →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {errorDistribution.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-start justify-between gap-3 card-hover">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{item.reason}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Carrier routing failure / inactive phone number</p>
                </div>
                <span className="px-2.5 py-1 font-black bg-red-100 text-red-700 rounded-lg text-xs shrink-0">
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
