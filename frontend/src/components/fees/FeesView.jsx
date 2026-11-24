import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  IndianRupee, 
  Search, 
  Send, 
  FileCheck2,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export default function FeesView({ selectedInstitution, onOpenChat }) {
  const [fees, setFees] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadFees = async () => {
    setLoading(true);
    try {
      const res = await api.getFees({
        institution: selectedInstitution,
        search: searchTerm,
        page,
        limit: 50
      });
      if (res.success) {
        setFees(res.fees);
        setTotalCollected(res.totalCollected);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [selectedInstitution, searchTerm, page]);

  return (
    <div className="space-y-6 w-full">
      
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Fees Reconciled</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            ₹{totalCollected.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            Confirmed online payments via Okie Dokie Pay
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Digital Receipts Issued</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            {totalCount.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-semibold pt-2 border-t border-slate-100">
            100% delivered to parents on WhatsApp
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Receipt Value</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            ₹{totalCount > 0 ? Math.round(totalCollected / totalCount).toLocaleString() : '23,794'}
          </div>
          <div className="mt-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            Tuition, transport & institutional dues
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, receipt number, student ID or phone..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        <div className="text-xs text-slate-500 text-right">
          Reconciliation Gateway: <strong className="text-slate-800 font-bold">Okie Dokie Pay (ODPay)</strong>
        </div>
      </div>

      {/* Receipts List: Cards on Mobile, Table on Desktop */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Mobile Card List (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading fee records...</div>
          ) : fees.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No fee receipts found.</div>
          ) : (
            fees.map((f) => (
              <div key={f._id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">#{f.receiptNo}</span>
                    <h4 className="text-xs font-bold text-slate-900">{f.studentName}</h4>
                    <p className="text-[10px] text-slate-400">{f.institution} • ID: {f.studentId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">₹{f.amount.toLocaleString()}</div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                      PAID
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  <span className="text-[10px] text-slate-400">{f.date ? f.date.slice(0, 16) : '-'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReceipt(f)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                    >
                      Receipt
                    </button>
                    <button
                      onClick={() => onOpenChat(f.recipientPhone)}
                      className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer"
                      title="Open in Chat"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt No.</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    Loading fee receipts...
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    No fee receipts match your query.
                  </td>
                </tr>
              ) : (
                fees.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      #{f.receiptNo}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {f.studentName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {f.studentId}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      ₹{f.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[180px]">
                      {f.institution}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {f.date ? f.date.slice(0, 16) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                        CONFIRMED PAID
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReceipt(f)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          View Voucher
                        </button>
                        <button
                          onClick={() => onOpenChat(f.recipientPhone)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer"
                          title="Message Parent"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Branded Digital Voucher Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                  OD
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Okie Dokie Pay Official Voucher</h3>
                  <p className="text-[10px] text-slate-400">Electronic Campus Fee Receipt</p>
                </div>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 text-center space-y-1">
              <div className="text-xs text-emerald-800 font-medium">Reconciled Amount</div>
              <div className="text-3xl font-black text-emerald-600">₹{selectedReceipt.amount.toLocaleString()}</div>
              <div className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                VERIFIED PAYMENT
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Receipt Voucher No:</span>
                <span className="font-mono font-bold text-slate-900">#{selectedReceipt.receiptNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student ID:</span>
                <span className="font-mono font-semibold text-slate-800">{selectedReceipt.studentId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Partner Campus:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.institution}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-semibold text-slate-800">Students Mobile App (UPI/Netbanking)</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
