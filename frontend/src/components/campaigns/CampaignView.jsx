import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export default function CampaignView({ selectedInstitution }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    templateId: 'stud_notice1',
    institution: 'All Institutions',
    targetAudience: 'All Registered Parents',
    totalRecipients: 2500
  });
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.getCampaigns();
      if (res.success) {
        setCampaigns(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleLaunchCampaign = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsLaunching(true);

    try {
      const res = await api.createCampaign(formData);
      if (res.success) {
        setIsLaunching(false);
        setLaunchSuccess(true);
        loadCampaigns();
        setTimeout(() => {
          setLaunchSuccess(false);
          setShowModal(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setIsLaunching(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-extrabold rounded-md border border-blue-100">
            <Radio className="w-3.5 h-3.5" />
            <span>Campus Broadcast Channel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Institutional Broadcasts</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Automated WhatsApp blasts for circulars, exam notices, fee dues, and emergency campus updates.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Broadcast</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {loading ? (
          <div className="col-span-full text-center py-16 text-slate-400 text-xs">Loading campaigns...</div>
        ) : (
          campaigns.map((camp) => {
            const delivPct = Math.round((camp.deliveredCount / camp.totalRecipients) * 100);
            const readPct = Math.round((camp.readCount / camp.deliveredCount) * 100);

            return (
              <div key={camp._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-md">
                      {camp.templateId}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{camp.name}</h3>
                    <p className="text-xs text-slate-400">{camp.institution}</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full shrink-0">
                    {camp.status}
                  </span>
                </div>

                {/* Progress / Stats bar */}
                <div className="grid grid-cols-4 gap-2 text-center py-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-sm font-black text-slate-800">{camp.totalRecipients.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">Target</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-blue-600">{camp.sentCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">Sent</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-emerald-600">{delivPct}%</div>
                    <div className="text-[10px] text-slate-400">Delivered</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-indigo-600">{readPct}%</div>
                    <div className="text-[10px] text-slate-400">Read</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                  <span>Target: <strong className="text-slate-700 font-semibold">{camp.targetAudience}</strong></span>
                  <span>{camp.createdAt ? camp.createdAt.slice(0, 16) : 'September 2026'}</span>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Launch New Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Launch Official WhatsApp Broadcast</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {launchSuccess ? (
              <div className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-900">Broadcast Dispatched Successfully!</h4>
                <p className="text-xs text-slate-500">Messages queued on official campus WhatsApp channel.</p>
              </div>
            ) : (
              <form onSubmit={handleLaunchCampaign} className="space-y-4 text-xs">
                
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October Fee Notice / Annual Sports Day Circular"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Template</label>
                    <select
                      value={formData.templateId}
                      onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="stud_notice1">stud_notice1 (Circular)</option>
                      <option value="stud_due_alert2">stud_due_alert2 (Fee Due)</option>
                      <option value="stud_attendance_alert2">stud_attendance_alert2 (Absence)</option>
                      <option value="stud_gate_alert3">stud_gate_alert3 (Gate Pass)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Campus</label>
                    <select
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="All Institutions">All Institutions</option>
                      <option value="Aggarwal College Ballabgarh">Aggarwal College</option>
                      <option value="Gita Niketan Awasiya Vidyalaya">Gita Niketan</option>
                      <option value="The Milestone Sr. Sec. School">The Milestone</option>
                      <option value="The Genesis School">The Genesis School</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Recipients Count</label>
                    <input
                      type="number"
                      value={formData.totalRecipients}
                      onChange={(e) => setFormData({ ...formData, totalRecipients: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-[11px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>✅ Verified Campus Sender (+91 70156 13714) • Instant Dispatch</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLaunching}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition cursor-pointer"
                  >
                    {isLaunching ? 'Dispatching...' : 'Dispatch Broadcast Now'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
