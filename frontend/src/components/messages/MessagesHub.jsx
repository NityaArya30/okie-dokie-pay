import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCw, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  Eye, 
  Send, 
  FileSpreadsheet, 
  X,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';

export default function MessagesHub({ selectedInstitution, onOpenChat }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [templateFilter, setTemplateFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewMsg, setPreviewMsg] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  const statusPills = [
    { id: 'All', label: 'All Messages' },
    { id: 'Read', label: 'Read (Blue Ticks)', color: 'blue' },
    { id: 'Delivered', label: 'Delivered', color: 'emerald' },
    { id: 'Sent', label: 'Submitted', color: 'amber' },
    { id: 'Not Sent', label: 'Failed', color: 'red' },
  ];

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getMessages({
        page,
        limit: 50,
        status: statusFilter,
        templateId: templateFilter,
        institution: selectedInstitution,
        search: searchTerm
      });
      if (res.success) {
        setMessages(res.messages);
        setTotalPages(res.totalPages);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [page, statusFilter, templateFilter, selectedInstitution, searchTerm]);

  const handleRetry = async (id) => {
    setRetryingId(id);
    try {
      const res = await api.retryMessage(id);
      if (res.success) {
        loadMessages();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRetryingId(null);
    }
  };

  const handleExportCSV = () => {
    if (messages.length === 0) return;
    const headers = ['MID', 'Sender', 'Recipient', 'Student', 'Institution', 'Status', 'Sent Time', 'Delivered Time', 'Read Time', 'Template', 'Error Description'];
    const rows = messages.map(m => [
      m.mid || '',
      m.sender || '',
      m.recipient || '',
      `"${(m.studentName || '').replace(/"/g, '""')}"`,
      `"${(m.institution || '').replace(/"/g, '""')}"`,
      m.status || '',
      m.sentTime || '',
      m.deliveredTime || '',
      m.readTime || '',
      m.templateId || '',
      `"${(m.errorDescription || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `okiedokie_waba_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 w-full animate-fadeIn pb-16 md:pb-6">
      
      {/* Search & Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by phone, student name, MID or text..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all btn-press cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={loadMessages}
              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all btn-press cursor-pointer"
              title="Refresh messages"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Pill Buttons (UI-Friendly & Animated) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {statusPills.map((pill) => {
            const isActive = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => { setStatusFilter(pill.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all btn-press cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {pill.label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-200 mx-1 shrink-0"></div>

          {/* Template Select */}
          <select
            value={templateFilter}
            onChange={(e) => { setTemplateFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none shrink-0"
          >
            <option value="All">All Templates</option>
            <option value="stud_notice1">Campus Notices</option>
            <option value="stud_attendance_alert2">Absentee Alert</option>
            <option value="stud_due_alert2">Fee Dues</option>
            <option value="fee_receipt2a">Fee Receipts</option>
            <option value="stud_gate_alert3">Gate Passes</option>
          </select>
        </div>

      </div>

      {/* Messages View: Touch Cards on Mobile, Table on Desktop */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Header Summary */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900 font-bold">{messages.length}</strong> of{' '}
            <strong className="text-slate-900 font-bold">{totalCount.toLocaleString()}</strong> messages
          </div>
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Verified WABA Sender: <strong className="text-slate-700">+91 70156 13714</strong>
          </div>
        </div>

        {/* 1. MOBILE CARD VIEW (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No messages match selected filters.</div>
          ) : (
            messages.map((m) => {
              const isRead = m.status === 'Read';
              const isDelivered = m.status === 'Delivered';
              const isFailed = m.status === 'Not Sent' || m.status === 'Dropped' || m.status === 'Failed';

              return (
                <div key={m._id} className="p-4 space-y-2.5 animate-fadeIn">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">+{m.recipient}</div>
                      <div className="text-[11px] font-medium text-slate-700">{m.studentName || 'Student / Parent'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{m.institution}</div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isRead
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : isDelivered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isFailed
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isRead ? 'Read' : isDelivered ? 'Delivered' : isFailed ? 'Failed' : 'Sent'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-700">
                      {m.templateId || 'DIRECT'}
                    </span>
                    <span>{m.sentTime ? m.sentTime.slice(0, 16) : '-'}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setPreviewMsg(m)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all btn-press cursor-pointer"
                    >
                      Preview
                    </button>
                    {isFailed && (
                      <button
                        onClick={() => handleRetry(m._id)}
                        disabled={retryingId === m._id}
                        className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-xl transition-all btn-press cursor-pointer"
                      >
                        {retryingId === m._id ? 'Retrying...' : 'Retry'}
                      </button>
                    )}
                    <button
                      onClick={() => onOpenChat(m.recipient)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-xl transition-all btn-press cursor-pointer"
                    >
                      Chat →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. DESKTOP TABLE VIEW (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Recipient Phone</th>
                <th className="py-3.5 px-4">Student / Ward</th>
                <th className="py-3.5 px-4">Institution</th>
                <th className="py-3.5 px-4">Template</th>
                <th className="py-3.5 px-4">Sent Time</th>
                <th className="py-3.5 px-4">Read Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    Loading messages...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    No messages matched the selected filters.
                  </td>
                </tr>
              ) : (
                messages.map((m) => {
                  const isRead = m.status === 'Read';
                  const isDelivered = m.status === 'Delivered';
                  const isFailed = m.status === 'Not Sent' || m.status === 'Dropped' || m.status === 'Failed';

                  return (
                    <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isRead
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : isDelivered
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isFailed
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isRead ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-blue-600" /> Read
                            </>
                          ) : isDelivered ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Delivered
                            </>
                          ) : isFailed ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Failed
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 text-amber-600" /> Sent
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        +{m.recipient}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {m.studentName || 'Student / Parent'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-[170px] truncate" title={m.institution}>
                        {m.institution || 'Okie Dokie Campus'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                          {m.templateId || 'DIRECT'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {m.sentTime || m.acceptTime || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {m.readTime || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewMsg(m)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-all btn-press cursor-pointer"
                            title="Preview WhatsApp Template"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {isFailed && (
                            <button
                              onClick={() => handleRetry(m._id)}
                              disabled={retryingId === m._id}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-bold rounded-lg transition-all btn-press cursor-pointer"
                            >
                              {retryingId === m._id ? 'Retrying...' : 'Retry'}
                            </button>
                          )}

                          <button
                            onClick={() => onOpenChat(m.recipient)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-all btn-press cursor-pointer"
                            title="Open in 2-Way Chat"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <strong className="text-slate-900 font-bold">{page}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl font-bold transition-all btn-press cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl font-bold transition-all btn-press cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* WhatsApp Message Preview Modal with Scale Up Animation */}
      {previewMsg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-xs shadow-xs">
                  WA
                </div>
                <div>
                  <h3 className="text-xs font-bold">WhatsApp Template Telemetry</h3>
                  <p className="text-[10px] text-slate-300">Recipient: +{previewMsg.recipient}</p>
                </div>
              </div>
              <button onClick={() => setPreviewMsg(null)} className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6 bg-[#EFEAE2] flex justify-center">
              <div className="bg-[#DCF8C6] border border-[#C5E1A5] rounded-2xl rounded-tr-xs p-4 max-w-md shadow-xs text-xs space-y-2 text-slate-900">
                <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1 border-b border-emerald-200/50">
                  <span className="font-bold text-emerald-800">{previewMsg.institution}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded font-bold">
                    {previewMsg.templateId}
                  </span>
                </div>

                <p className="whitespace-pre-line leading-relaxed text-slate-800">{previewMsg.text}</p>

                <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 pt-1">
                  <span>{previewMsg.sentTime ? previewMsg.sentTime.slice(11, 16) : 'Now'}</span>
                  {previewMsg.status === 'Read' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-600 inline" />
                  ) : previewMsg.status === 'Delivered' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-slate-400 inline" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 text-xs space-y-3 text-slate-600">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Status: <strong className="text-slate-900 font-bold">{previewMsg.status}</strong></div>
                <div>Error: <span className="text-slate-700">{previewMsg.errorDescription || 'None'}</span></div>
                <div>Category: <span className="font-bold text-blue-600">Campus Utility WABA</span></div>
                <div>MID: <span className="font-mono text-[10px] text-slate-600">{previewMsg.mid || 'N/A'}</span></div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    const rec = previewMsg.recipient;
                    setPreviewMsg(null);
                    onOpenChat(rec);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all btn-press shadow-xs cursor-pointer"
                >
                  Open in 2-Way Chat →
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
