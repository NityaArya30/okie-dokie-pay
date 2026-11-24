import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Send
} from 'lucide-react';
import { api } from '../../services/api';

export default function GatePassView({ selectedInstitution, onOpenChat }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadGatePasses = async () => {
    setLoading(true);
    try {
      const res = await api.getGatePasses({
        institution: selectedInstitution,
        search: searchTerm,
        limit: 100
      });
      if (res.success) {
        setPasses(res.data);
      }
    } catch (err) {
      console.error('Error fetching gate passes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGatePasses();
  }, [selectedInstitution, searchTerm]);

  return (
    <div className="space-y-6 w-full">
      
      {/* Security Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-extrabold border border-blue-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus Security Telemetry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Early Exit & Gate Pass Log</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Real-time biometric and OTP-verified guardian exit alerts dispatched to parents via WhatsApp (`stud_gate_alert3`).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
            <div className="text-2xl sm:text-3xl font-black text-blue-600">{passes.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passes Issued</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, pickup guardian, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition"
          />
        </div>
        <div className="text-xs text-slate-400">
          Template: <strong className="text-slate-700 font-bold">stud_gate_alert3</strong>
        </div>
      </div>

      {/* Gate Pass Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          <div className="col-span-full text-center py-16 text-slate-400 text-xs">
            Loading gate security passes...
          </div>
        ) : passes.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400 text-xs">
            No gate passes recorded matching filters.
          </div>
        ) : (
          passes.map((pass) => (
            <div key={pass._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition space-y-4">
              
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-md">
                    EARLY EXIT
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{pass.studentName}</h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{pass.institution}</p>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full shrink-0">
                  CLEARED
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Authorized Pickup:</span>
                  <span className="font-bold text-slate-800">{pass.pickupPerson}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Guardian Phone:</span>
                  <span className="font-mono font-semibold text-slate-800">+{pass.pickupPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Exit Timestamp:</span>
                  <span className="text-slate-700">{pass.issuedAt ? pass.issuedAt.slice(0, 16) : '30-09-2026'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[10px] text-slate-400">Parent Notified</span>
                <button
                  onClick={() => onOpenChat(pass.recipientPhone)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Message Parent</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
